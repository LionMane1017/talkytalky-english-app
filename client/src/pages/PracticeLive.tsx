import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { GoogleGenAI, LiveServerMessage, Blob as GenAIBlob } from '@google/genai';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { vocabularyData, type VocabularyWord } from "@/data/vocabulary";
import { ArrowRight, RotateCcw, Trophy, Mic as MicrophoneIcon, Square as StopIcon } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import TalkyLogo from "@/components/TalkyLogo";
import { VoiceWaveform } from "@/components/VoiceWaveform";
import { decode, encode, decodeAudioData } from '../utils/audio';
import { AppStatus } from "@/types";
import type { Message } from "@/types";

export default function PracticeLive() {
  // Practice state
  const [currentWord, setCurrentWord] = useState<VocabularyWord | null>(null);
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced" | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [sessionScore, setSessionScore] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [usedWordIds, setUsedWordIds] = useState<Set<string>>(new Set());
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  // Gemini Live state
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [transcripts, setTranscripts] = useState<Message[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const instructionsShownRef = useRef(false);
  
  // Background images for animated cycling
  const backgroundImages = [
    'https://images.unsplash.com/photo--1499002238440-d264edd596ec?w=1920&q=80', // Lavender fields
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80', // Mountain lake
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80', // Ocean sunset
    'https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?w=1920&q=80', // Cherry blossoms
    'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=80', // Wildflower meadow
  ];

  
  // Refs
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioProcessorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');
  const nextAudioStartTimeRef = useRef(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  
  const { data: user } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    throwOnError: false,
  });
  
  // Get Smart Context (RAG) for current word
  const { data: smartContextData } = trpc.rag.getSmartContext.useQuery(
    { currentTopic: currentWord ? `Pronunciation practice: ${currentWord.word} (${difficulty} level)` : "IELTS Pronunciation Practice" },
    { enabled: !!currentWord, refetchOnWindowFocus: false, staleTime: 300000 }
  );
  const smartContext = smartContextData?.context || null;
  
  const saveSessionMutation = trpc.practice.saveSession.useMutation({
    onSuccess: () => {
      toast.success("Practice session saved!");
    },
  });
  
  // Available words
  const availableWords = useMemo(() => {
    if (!difficulty) return [];
    return vocabularyData.filter(
      word => word.difficulty === difficulty && !usedWordIds.has(word.id)
    );
  }, [difficulty, usedWordIds]);
  
  const wordsRemaining = availableWords.length;
  const totalWords = vocabularyData.filter(w => w.difficulty === difficulty).length;
  
  // Cleanup audio
  const cleanUpAudio = useCallback(() => {
    if (mediaStreamSourceRef.current) {
      mediaStreamSourceRef.current.disconnect();
      mediaStreamSourceRef.current = null;
    }
    if (audioProcessorNodeRef.current) {
      audioProcessorNodeRef.current.disconnect();
      audioProcessorNodeRef.current = null;
    }
    if (analyserNodeRef.current) {
      analyserNodeRef.current.disconnect();
      analyserNodeRef.current = null;
    }
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;
    
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    
    audioSourcesRef.current.forEach(source => source.stop());
    audioSourcesRef.current.clear();
    nextAudioStartTimeRef.current = 0;
    setAudioLevel(0);
  }, []);
  
  // Stop session
  const stopSession = useCallback(async () => {
    setStatus(AppStatus.IDLE);
    
    if (sessionPromiseRef.current) {
      const session = await sessionPromiseRef.current;
      session.close();
      sessionPromiseRef.current = null;
    }
    
    cleanUpAudio();
    console.log('Session stopped and resources cleaned up.');
  }, [cleanUpAudio]);
  
  // Start Gemini Live session
  const startSession = useCallback(async () => {
    if (!currentWord) {
      toast.error("Please select a difficulty level first");
      return;
    }
    

    
    setStatus(AppStatus.CONNECTING);
    setTranscripts([]);
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        console.error('Gemini API key not found');
        throw new Error('Gemini API key not found');
      }
      
      const ai = new GoogleGenAI({ apiKey });
      
      // Initialize audio contexts
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // 🔊 CRITICAL: Resume audio context if suspended (browsers auto-suspend)
      if (outputAudioContextRef.current.state === 'suspended') {
        await outputAudioContextRef.current.resume();
        console.log("🔊 AudioContext Resumed");
      }
      
      // Create system prompt with full context
      // Get all words for this difficulty level (sorted alphabetically)
      const allWordsInLevel = vocabularyData
        .filter(w => w.difficulty === difficulty)
        .sort((a, b) => a.word.localeCompare(b.word));
      const vocabularyList = allWordsInLevel.map(w => `- ${w.word}: ${w.meaning}`).join('\n');
      
      // Create system prompt
      const systemPrompt = `You are TalkyTalky, an enthusiastic IELTS pronunciation coach. 

**Current Practice Session:**
- Word/Phrase: "${currentWord.word}"
- Difficulty Level: ${difficulty}
- Meaning: ${currentWord.meaning}
- Example: ${currentWord.example}

**Available Vocabulary (${difficulty} level):**
${vocabularyList}

**Your Role:**
1. When the session starts, introduce the word enthusiastically and explain how to pronounce it
2. Give specific pronunciation tips (stress, sounds, common mistakes)
3. When the user records, listen carefully to their pronunciation
4. After they finish, congratulate them warmly and provide specific feedback
5. Suggest what to improve and encourage them to try again or move to the next word

**Knowledge Base Context:**
${smartContext || 'No additional context available'}

**Guidelines:**
- Be encouraging and positive
- Give specific, actionable feedback
- Reference IELTS pronunciation criteria when relevant
- Keep responses concise (2-3 sentences)
- Use a warm, friendly tone

Start by introducing the word "${currentWord.word}" and explaining how to pronounce it!`;
      
      // CRITICAL FIX: Await connection instead of storing promise

      const session = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: async () => {
            console.log('✅ Gemini Live session opened');
            setStatus(AppStatus.CONNECTED);
            
            // Trigger mascot: Practice started
            window.dispatchEvent(new CustomEvent('talky:practice-start'));
            
            // Start streaming microphone audio
            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamSourceRef.current = inputAudioContextRef.current!.createMediaStreamSource(mediaStreamRef.current);
            
            analyserNodeRef.current = inputAudioContextRef.current!.createAnalyser();
            analyserNodeRef.current.fftSize = 256;
            
            audioProcessorNodeRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            audioProcessorNodeRef.current.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob: GenAIBlob = {
                data: encode(new Uint8Array(new Int16Array(inputData.map(f => f * 32768)).buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              }
              
              // Add null check for analyserNode
              if (analyserNodeRef.current) {
                const dataArray = new Uint8Array(analyserNodeRef.current.frequencyBinCount);
                analyserNodeRef.current.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                setAudioLevel(average / 255);
              }
            };
            
            mediaStreamSourceRef.current.connect(analyserNodeRef.current);
            mediaStreamSourceRef.current.connect(audioProcessorNodeRef.current);
            audioProcessorNodeRef.current.connect(inputAudioContextRef.current!.destination);
            
            // 4. TRIGGER GREETING (Explicitly send a message to force AI to speak)
            // We await a small delay to ensure socket is ready for data frames
            setTimeout(() => {
              console.log("📨 Sending Greeting Trigger");
              sessionPromiseRef.current!.then((sess) => {
                sess.send({ 
                  text: `Please introduce the word "${currentWord.word}" now.`,
                  endOfTurn: true 
                });
              });
            }, 500);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
            } else if (message.serverContent?.inputTranscription) {
              currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
            }
            
            if (message.serverContent?.turnComplete) {
              const userInput = currentInputTranscriptionRef.current.trim();
              const modelOutput = currentOutputTranscriptionRef.current.trim();
              
              // Auto-advance keywords (used for both user and model)
              const advanceKeywords = [
                // Direct questions/statements about moving on
                'ready for', 'move on', 'try another', 'next word',
                "let's practice", "let's try", "next word is", 
                "move on to", "shall we", "want to try", "should we move",
                "would you like to", "how about we"
              ];
              
              // User confirmation keywords (when user says yes to moving on)
              const userConfirmKeywords = [
                'yes', 'yeah', 'sure', 'okay', 'ok', 'next', 'ready', 'go ahead'
              ];
              
              if (userInput) {
                setTranscripts(prev => [...prev, { role: 'user', text: userInput }]);
                
                // Check if USER is confirming they want to move on
                const lowerUserInput = userInput.toLowerCase();
                const userWantsNext = userConfirmKeywords.some(keyword => lowerUserInput.includes(keyword));
                
                if (userWantsNext && wordsRemaining > 0 && status === AppStatus.CONNECTED) {
                  console.log('🎯 User confirmed next word:', userInput);
                  setTimeout(() => {
                    nextWord();
                  }, 500); // Quick response to user confirmation
                }
              }
              
              if (modelOutput) {
                setTranscripts(prev => [...prev, { role: 'model', text: modelOutput }]);
                
                const lowerOutput = modelOutput.toLowerCase();
                
                // INTELLIGENT WORD DETECTION: Check if Gemini mentioned a different vocabulary word
                const availableWords = vocabularyData.filter(
                  word => word.difficulty === difficulty && !usedWordIds.has(word.id)
                );
                
                // Find if Gemini mentioned any vocabulary word (excluding current word)
                const mentionedWord = availableWords.find(word => {
                  const wordLower = word.word.toLowerCase();
                  // Check if the word appears in the output (with word boundaries)
                  const regex = new RegExp(`\\b${wordLower}\\b`, 'i');
                  return regex.test(modelOutput) && wordLower !== currentWord?.word.toLowerCase();
                });
                
                if (mentionedWord && status === AppStatus.CONNECTED) {
                  console.log('🎯 Gemini mentioned new word:', mentionedWord.word);
                  // Switch to the mentioned word immediately
                  setTimeout(() => {
                    setCurrentWord(mentionedWord);
                    setUsedWordIds(prev => new Set(Array.from(prev).concat(mentionedWord.id)));
                    setScore(null);
                  }, 800);
                } else {
                  // Fallback: Check if GEMINI is suggesting to move on with keywords
                  const shouldAdvance = advanceKeywords.some(keyword => lowerOutput.includes(keyword));
                  
                  if (shouldAdvance && wordsRemaining > 0 && status === AppStatus.CONNECTED) {
                    console.log('🎯 Gemini triggering auto-advance based on phrase:', modelOutput);
                    setTimeout(() => {
                      nextWord();
                    }, 1000);
                  }
                }
              }
              
              currentInputTranscriptionRef.current = '';
              currentOutputTranscriptionRef.current = '';
              setIsSpeaking(false);
            }
            
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              setIsSpeaking(true);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
              const source = outputAudioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContextRef.current.destination);
              
              const currentTime = outputAudioContextRef.current.currentTime;
              const startTime = Math.max(currentTime, nextAudioStartTimeRef.current);
              
              source.start(startTime);
              nextAudioStartTimeRef.current = startTime + audioBuffer.duration;
              
              audioSourcesRef.current.add(source);
              source.onended = () => {
                audioSourcesRef.current.delete(source);
                if (audioSourcesRef.current.size === 0) {
                  setIsSpeaking(false);
                }
              };
            }
            
            if (message.serverContent?.interrupted) {
              audioSourcesRef.current.forEach(source => source.stop());
              audioSourcesRef.current.clear();
              nextAudioStartTimeRef.current = 0;
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Gemini Live error:', e);
            toast.error('Connection error. Please try again.');
            stopSession();
          },
          onclose: (e: CloseEvent) => {
            console.log('Session closed.');
            if (status !== AppStatus.IDLE) {
              setStatus(AppStatus.IDLE);
              stopSession();
            }
          },
        },
        config: {
          responseModalities: ['audio' as any],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: { 
            parts: [{ text: systemPrompt }] 
          },
        },
      });
      
      // Store session promise in ref for other functions
      sessionPromiseRef.current = Promise.resolve(session);
      
    } catch (err: any) {
      console.error('Failed to start session:', err);
      toast.error(err.message || 'Failed to start practice session');
      setStatus(AppStatus.IDLE);
    }
  }, [currentWord, difficulty, smartContext, stopSession]);
  

  
  // Get button state (like AI Coach)
  const getButtonState = () => {
    switch (status) {
      case AppStatus.IDLE:
        return { text: 'Waiting...', action: () => {}, icon: <MicrophoneIcon />, disabled: true, animate: false };
      case AppStatus.CONNECTING:
        return { text: 'Connecting...', action: () => {}, icon: <MicrophoneIcon />, disabled: true, animate: true };
      case AppStatus.CONNECTED:
        return { text: 'Listening...', action: stopSession, icon: <StopIcon />, disabled: false, animate: true };
      default:
        return { text: 'Offline', action: () => {}, icon: <MicrophoneIcon />, disabled: true, animate: false };
    }
  };

  const { text, action, icon, disabled, animate } = getButtonState();

  // Determine global status
  const globalStatus = status === AppStatus.IDLE ? 'idle' : 
                       isSpeaking ? 'speaking' : 
                       audioLevel > 0.1 ? 'listening' : 'thinking';
  
  // Auto-start session when difficulty changes
  useEffect(() => {
    if (difficulty && currentWord && status === AppStatus.IDLE) {
      console.log('Auto-starting Gemini Live session...');
      startSession();
    }
  }, [difficulty, currentWord, status, startSession]);
  
  // Show instructions when session connects (only once per difficulty selection)
  useEffect(() => {
    if (status === AppStatus.CONNECTED && !instructionsShownRef.current) {
      instructionsShownRef.current = true;
      setShowInstructions(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => setShowInstructions(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);
  
  // Reset instructions shown flag when difficulty changes
  useEffect(() => {
    instructionsShownRef.current = false;
  }, [difficulty]);
  
  // Start practice
  const startPractice = (level: "beginner" | "intermediate" | "advanced") => {
    setDifficulty(level);
    setUsedWordIds(new Set());
    setCurrentWordIndex(0);
    
    // Get words sorted alphabetically for deterministic order
    const words = vocabularyData
      .filter(w => w.difficulty === level)
      .sort((a, b) => a.word.localeCompare(b.word));
    
    if (words.length > 0) {
      const firstWord = words[0];
      console.log(`🎯 Starting ${level} practice with word 1/${words.length}: "${firstWord.word}"`);
      setCurrentWord(firstWord);
      setUsedWordIds(new Set([firstWord.id]));
    }
    setScore(null);
    setSessionScore([]);
    setAttempts(0);
  };
  
  // Next word
  const nextWord = () => {
    if (!difficulty) return;
    
    // Get all words for this difficulty sorted alphabetically
    const allWords = vocabularyData
      .filter(w => w.difficulty === difficulty)
      .sort((a, b) => a.word.localeCompare(b.word));
    
    // Move to next index
    const nextIndex = currentWordIndex + 1;
    
    if (nextIndex >= allWords.length) {
      toast.success("You've completed all words in this level!");
      console.log(`✅ Completed all ${allWords.length} words in ${difficulty} level`);
      return;
    }
    
    const nextWordData = allWords[nextIndex];
    console.log(`🎯 Moving to word ${nextIndex + 1}/${allWords.length}: "${nextWordData.word}"`);
    
    setCurrentWordIndex(nextIndex);
    setCurrentWord(nextWordData);
    setUsedWordIds(prev => new Set(Array.from(prev).concat(nextWordData.id)));
    setScore(null);
    
    // Send new word context to existing session (FIX: avoid race condition)
    if (status === AppStatus.CONNECTED && sessionPromiseRef.current) {
      const newWordContext = `
**NEW WORD SELECTED:**
- Word/Phrase: "${nextWordData.word}"
- Difficulty: ${difficulty}
- Meaning: ${nextWordData.meaning}
- Example: ${nextWordData.example}

Please introduce this new word enthusiastically and explain how to pronounce it. Focus on pronunciation tips and encourage the user to practice it!`;
      
      sessionPromiseRef.current.then(session => {
        session.send({ text: newWordContext, endOfTurn: true });
      });
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);
  
  // Cycle background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 8000); // Change every 8 seconds
    return () => clearInterval(interval);
  }, [backgroundImages.length]);
  
  if (!difficulty) {
    return (
      <div className="min-h-screen relative overflow-hidden p-8">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10">
          {backgroundImages.map((img, idx) => (
            <div
              key={img}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-2000 ${
                idx === currentBgIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${img})`,
                filter: 'blur(40px)', // Heavy blur for legibility
              }}
            />
          ))}
          {/* Gradient overlay for better contrast */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-indigo-900/40 to-pink-900/40" />
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <TalkyLogo />
            <div>
              <h1 className="text-4xl font-bold text-white">Practice Speaking</h1>
              <p className="text-purple-200">Choose a difficulty level to start practicing pronunciation</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { level: "beginner" as const, title: "Beginner", subtitle: "Basic Words", description: "Start with simple, everyday vocabulary" },
              { level: "intermediate" as const, title: "Intermediate", subtitle: "Common Words", description: "Practice frequently used vocabulary" },
              { level: "advanced" as const, title: "Advanced", subtitle: "IELTS Words", description: "Master academic and complex vocabulary" },
            ].map(({ level, title, subtitle, description }) => (
              <Card key={level} className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all cursor-pointer" onClick={() => startPractice(level)}>
                <CardHeader>
                  <Badge className="w-fit mb-2">{title}</Badge>
                  <CardTitle className="text-white">{subtitle}</CardTitle>
                  <CardDescription className="text-purple-200">{description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Start Practice</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen relative overflow-hidden p-4 sm:p-8">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        {backgroundImages.map((img, idx) => (
          <div
            key={img}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-2000 ${
              idx === currentBgIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${img})`,
              filter: 'blur(60px)', // Extra heavy blur for word card legibility
            }}
          />
        ))}
        {/* Gradient overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-indigo-900/50 to-pink-900/50" />
      </div>
      <div className="max-w-4xl mx-auto">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-base sm:text-lg font-bold text-white capitalize">{difficulty} Level</h1>
          <Button variant="outline" size="sm" onClick={() => { stopSession(); setDifficulty(null); }} className="text-xs h-7">
            Change
          </Button>
        </div>
        
        {/* Progress */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-2 mb-2">
          <div className="flex justify-between text-white text-xs mb-1">
            <span>Progress</span>
            <span>{totalWords - wordsRemaining}/{totalWords}</span>
          </div>
          <Progress value={((totalWords - wordsRemaining) / totalWords) * 100} className="h-1" />
        </div>
        
        {/* Current Word - Compact */}
        {currentWord && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-3 mb-2">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">{currentWord.word}</h2>
              <Badge variant="secondary" className="text-xs">{currentWord.difficulty}</Badge>
            </div>
            <p className="text-purple-200 text-sm mb-1">{currentWord.meaning}</p>
            <p className="text-white/70 italic text-xs line-clamp-1">"{currentWord.example}"</p>
          </div>
        )}
        
        {/* Record Button - Above the Fold */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-3 mb-2">
          {/* Voice Waveform */}
          {status === AppStatus.CONNECTED && (
            <div className="mb-2">
              <VoiceWaveform 
                audioLevel={audioLevel} 
                isActive={status === AppStatus.CONNECTED}
                isSpeaking={isSpeaking}
              />
            </div>
          )}
          
          {/* Single Toggle Button - UX FIX */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center">
                {animate && (
                  <div 
                    className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-purple-500/50 transition-transform duration-300" 
                    style={{ transform: `scale(${0.5 + audioLevel * 1.5})` }}
                  />
                )}
                <button
                  onClick={action}
                  disabled={disabled}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                    status === AppStatus.CONNECTED ? 'bg-red-600 hover:bg-red-700 shadow-xl shadow-red-200' : 'bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-200'
                  } ${animate ? 'animate-pulse' : ''}`}
                >
                  {icon}
                </button>
              </div>
              <p className="text-xs sm:text-sm text-gray-300 mt-2 font-medium">
                {status === AppStatus.CONNECTED ? 'Tap to Stop Session' : text}
              </p>
            </div>
            
            {/* Next Word Button - Manual Control */}
            {status === AppStatus.CONNECTED && wordsRemaining > 0 && (
              <button
                onClick={() => nextWord()}
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                Next Word →
                <span className="text-xs opacity-75">({wordsRemaining} left)</span>
              </button>
            )}
        </div>
        
        {/* Conversation History - Below Record Button */}
        {transcripts.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-2 mb-2">
            <p className="text-white text-xs font-semibold mb-1">Conversation</p>
            <div className="max-h-24 overflow-y-auto space-y-1">
              {transcripts.map((msg, idx) => (
                <div key={idx} className={`text-xs ${msg.role === 'user' ? 'text-blue-300' : 'text-purple-300'}`}>
                  <strong>{msg.role === 'user' ? 'You' : 'TalkyTalky'}:</strong> {msg.text}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-2 sm:gap-4">
          <Button onClick={nextWord} disabled={wordsRemaining === 0} className="flex-1 text-xs sm:text-sm h-9 sm:h-10">
            <ArrowRight className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Next Word
          </Button>
          <Button variant="outline" onClick={() => startPractice(difficulty)} className="text-xs sm:text-sm h-9 sm:h-10">
            <RotateCcw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Restart
          </Button>
        </div>
      </div>
      
      {/* Instruction Dialog */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="bg-white/95 backdrop-blur-xl border-2 border-purple-500/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-900 flex items-center gap-2">
              <MicrophoneIcon className="h-6 w-6 text-purple-600" />
              Welcome to TalkyTalky!
            </DialogTitle>
            <DialogDescription className="text-base text-gray-700 space-y-3 pt-2">
              <div className="font-semibold text-purple-800">
                👋 Say "Hello" to start your pronunciation practice!
              </div>
              <div>
                TalkyTalky is listening and ready to coach you. Just speak naturally and she'll guide you through each word.
              </div>
              <div className="text-sm text-gray-600 italic">
                Tip: You can say "next word" anytime to move forward, or practice the same word multiple times.
              </div>
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowInstructions(false)} className="w-full bg-purple-600 hover:bg-purple-700">
            Got it! Let's Practice
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

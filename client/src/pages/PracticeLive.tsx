import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { GoogleGenAI, LiveServerMessage, Blob as GenAIBlob } from '@google/genai';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  
  // Gemini Live state
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [transcripts, setTranscripts] = useState<Message[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  
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
        throw new Error('Gemini API key not found');
      }
      
      const ai = new GoogleGenAI({ apiKey });
      
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      // Create system prompt with full context
      const systemPrompt = `You are TalkyTalky, an enthusiastic IELTS pronunciation coach. 

**Current Practice Session:**
- Word/Phrase: "${currentWord.word}"
- Difficulty Level: ${difficulty}
- Meaning: ${currentWord.meaning}
- Example: ${currentWord.example}

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
      
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: async () => {
            console.log('✅ Gemini Live session opened');
            setStatus(AppStatus.CONNECTED);
            
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
            
            // Trigger immediate introduction
            setTimeout(async () => {
              const session = await sessionPromiseRef.current;
              if (session) {
                console.log('🚀 Triggering word introduction...');
                session.send({ 
                  text: `Please introduce the word "${currentWord.word}" now. Explain how to pronounce it, break down the sounds, and give helpful tips for common mistakes.`,
                  endOfTurn: true 
                });
              }
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
              
              if (userInput) setTranscripts(prev => [...prev, { role: 'user', text: userInput }]);
              if (modelOutput) {
                setTranscripts(prev => [...prev, { role: 'model', text: modelOutput }]);
                
                // UX FIX: Expanded auto-advance detection
                const lowerOutput = modelOutput.toLowerCase();
                const advanceKeywords = [
                  // Questions asking if user is ready
                  'ready for', 'move on', 'try another', 'next word',
                  // Statements confirming the move (CRITICAL ADDITION)
                  "let's practice", "let's try", "next word is", 
                  "move on to", "okay,", "alright,", "how about"
                ];
                
                const shouldAdvance = advanceKeywords.some(keyword => lowerOutput.includes(keyword));
                
                // Prevent auto-advance if we just started or no words remaining
                if (shouldAdvance && wordsRemaining > 0 && status === AppStatus.CONNECTED) {
                  console.log('🎯 Gemini triggering auto-advance based on phrase:', modelOutput);
                  // Shorter delay since AI is introducing the word
                  setTimeout(() => {
                    nextWord();
                  }, 1000);
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
  
  // Start practice
  const startPractice = (level: "beginner" | "intermediate" | "advanced") => {
    setDifficulty(level);
    setUsedWordIds(new Set());
    const words = vocabularyData.filter(w => w.difficulty === level);
    if (words.length > 0) {
      const randomWord = words[Math.floor(Math.random() * words.length)];
      setCurrentWord(randomWord);
      setUsedWordIds(new Set([randomWord.id]));
    }
    setScore(null);
    setSessionScore([]);
    setAttempts(0);
  };
  
  // Next word
  const nextWord = () => {
    if (!difficulty) return;
    
    const available = vocabularyData.filter(
      word => word.difficulty === difficulty && !usedWordIds.has(word.id)
    );
    
    if (available.length === 0) {
      toast.success("You've completed all words in this level!");
      return;
    }
    
    const randomWord = available[Math.floor(Math.random() * available.length)];
    setCurrentWord(randomWord);
      setUsedWordIds(prev => new Set(Array.from(prev).concat(randomWord.id)));
    setScore(null);
    
    // Restart session with new word
    if (status === AppStatus.CONNECTED) {
      stopSession().then(() => startSession());
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);
  
  if (!difficulty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 p-8">
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 p-4 sm:p-8">
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
    </div>
  );
}

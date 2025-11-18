import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, MessageCircle, Sparkles, User, ChevronDown, ChevronUp, Pause, Play, Zap } from "lucide-react";
import { toast } from "sonner";
import TalkyLogo from "@/components/TalkyLogo";
import { Link } from "wouter";
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAIBlob } from '@google/genai';

// TalkyTalky System Prompt
const TALKYTALKY_SYSTEM_PROMPT = `
You are TalkyTalky, an enthusiastic and supportive English pronunciation coach specializing in IELTS preparation. Your mission is to help learners improve their English speaking skills through encouraging, personalized feedback.

PERSONALITY & TONE:
- Warm, friendly, and motivating - like a patient teacher who genuinely celebrates student progress.
- Upbeat and energetic, but never overwhelming.
- Use conversational language, not overly formal.
- Sprinkle in light encouragement phrases: "Great job!", "You're improving!", "Let's try this together!".
- Balance honesty with kindness - point out errors gently while highlighting strengths.

TEACHING APPROACH:
- Focus on pronunciation accuracy, fluency, vocabulary range, and grammatical accuracy (the 4 IELTS criteria).
- Break down complex words into syllables and phonemes.
- Provide specific, actionable feedback (e.g., "Try rounding your lips more for the 'oo' sound").
- Use the user's transcript to provide targeted feedback on what they actually said.
- If pronunciation is unclear, ask them to repeat rather than guessing.

INTERACTION STYLE:
- Keep responses concise (2-3 sentences for feedback).
- Listen actively and respond naturally to what the user says.
- If they ask a question about English, answer it clearly and concisely.
- If they want to practice a specific word, guide them through it.
- If they're struggling, offer hints or break the word down step-by-step.
- Keep the conversation flowing - don't just wait for commands.

FEEDBACK STRUCTURE:
1. Acknowledge their attempt positively.
2. Provide a score or assessment (e.g., "Your pronunciation was 85% accurate!").
3. Highlight what they did well.
4. Give 1-2 specific improvements.
5. End with encouragement or next steps.

BOUNDARIES:
- Stay focused on English learning and IELTS preparation.
- If asked off-topic questions, politely redirect: "I'm here to help with your English! Let's get back to practice."
- Don't provide medical, legal, or financial advice.
`;

// Audio utility functions
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

enum AppStatus {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  LISTENING = 'listening',
  SPEAKING = 'speaking',
  STOPPING = 'stopping',
  ERROR = 'error',
}

interface ConversationTurn {
  speaker: 'user' | 'model';
  text: string;
}

interface CurrentTranscription {
  user: string;
  model: string;
}

export default function AICoach() {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [currentTranscription, setCurrentTranscription] = useState<CurrentTranscription>({ user: '', model: '' });
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [bgAnimationPaused, setBgAnimationPaused] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Background images
  const backgroundImages = [
    '/bg1.jpg',
    '/bg2.jpg',
    '/bg3.jpg',
    '/bg4.jpg',
    '/bg5.jpg',
    '/bg6.jpg',
    '/bg7.jpg',
    '/bg8.jpg',
    '/bg9.jpg',
    '/bg10.jpg',
  ];

  // Background animation
  useEffect(() => {
    if (bgAnimationPaused) return;
    
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [bgAnimationPaused, backgroundImages.length]);

  const resetState = () => {
    setStatus(AppStatus.IDLE);
    setConversation([]);
    setCurrentTranscription({ user: '', model: '' });
    sessionPromiseRef.current = null;
    nextStartTimeRef.current = 0;
  };

  const stopSession = useCallback(async () => {
    console.log('Attempting to stop session...');
    setStatus(AppStatus.STOPPING);

    if (sessionPromiseRef.current) {
      const session = await sessionPromiseRef.current;
      session.close();
      sessionPromiseRef.current = null;
    }

    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      microphoneStreamRef.current = null;
    }

    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      await audioContextRef.current.close();
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      await outputAudioContextRef.current.close();
    }

    audioSourcesRef.current.forEach(source => source.stop());
    audioSourcesRef.current.clear();

    resetState();
    console.log('Session stopped and resources cleaned up.');
    toast.success("Chat ended");
  }, []);

  const startSession = useCallback(async () => {
    setStatus(AppStatus.CONNECTING);
    toast.info("Connecting to TalkyTalky...");
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key not found");
      }

      const ai = new GoogleGenAI({ apiKey });
      let tempUserInput = '';
      let tempModelOutput = '';

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
      nextStartTimeRef.current = 0;

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: TALKYTALKY_SYSTEM_PROMPT,
        },
        callbacks: {
          onopen: async () => {
            console.log('Session opened.');
            setStatus(AppStatus.LISTENING);
            toast.success("Connected! Start speaking...");
            
            microphoneStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = audioContextRef.current!.createMediaStreamSource(microphoneStreamRef.current);
            scriptProcessorRef.current = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: GenAIBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromiseRef.current!.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (status === AppStatus.STOPPING) return;

            // Handle transcription
            if (message.serverContent?.inputTranscription) {
              tempUserInput += message.serverContent.inputTranscription.text;
              setCurrentTranscription(prev => ({ ...prev, user: tempUserInput }));
            }
            if (message.serverContent?.outputTranscription) {
              tempModelOutput += message.serverContent.outputTranscription.text;
              setCurrentTranscription(prev => ({ ...prev, model: tempModelOutput }));
            }

            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              setStatus(AppStatus.SPEAKING);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
              
              const source = outputAudioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContextRef.current.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              
              audioSourcesRef.current.add(source);
              source.onended = () => {
                const wasDeleted = audioSourcesRef.current.delete(source);
                if (wasDeleted && audioSourcesRef.current.size === 0) {
                  setStatus(AppStatus.LISTENING);
                }
              };
            }

            // Handle interruption
            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              audioSourcesRef.current.forEach(source => source.stop());
              audioSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setStatus(AppStatus.LISTENING);
            }

            // Finalize turn
            if (message.serverContent?.turnComplete) {
              setConversation(prev => [
                ...prev,
                { speaker: 'user', text: tempUserInput },
                { speaker: 'model', text: tempModelOutput },
              ]);
              tempUserInput = '';
              tempModelOutput = '';
              setCurrentTranscription({ user: '', model: '' });
            }
          },
          onclose: () => {
            console.log('Session closed.');
            if (status !== AppStatus.STOPPING) {
              stopSession();
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Session error:', e);
            setStatus(AppStatus.ERROR);
            toast.error("Connection error");
            stopSession();
          },
        },
      });
    } catch (error) {
      console.error('Failed to start session:', error);
      setStatus(AppStatus.ERROR);
      toast.error("Failed to connect");
    }
  }, [stopSession, status]);

  const isSpeaking = status === AppStatus.SPEAKING;
  const isListening = status === AppStatus.LISTENING;
  const isActive = status === AppStatus.LISTENING || status === AppStatus.SPEAKING;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        {backgroundImages.map((img, index) => (
          <div
            key={img}
            className={`absolute inset-0 transition-opacity duration-2000 ${
              index === currentBgIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(20px)',
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          headerCollapsed ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="backdrop-blur-xl bg-white/20 border-b border-white/30 py-3 px-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className={`flex items-center gap-3 ${
              isSpeaking ? 'animate-[glow-pulse_1.5s_ease-in-out_infinite]' : ''
            }`}>
              <TalkyLogo />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBgAnimationPaused(!bgAnimationPaused)}
                className="backdrop-blur-xl bg-white/20 hover:bg-white/30 text-purple-900 border border-white/30 rounded-full"
                title={bgAnimationPaused ? "Resume background animation" : "Pause background animation"}
              >
                {bgAnimationPaused ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </Button>
              <Link href="/profile">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="backdrop-blur-xl bg-white/20 hover:bg-white/30 text-purple-900 border border-white/30 rounded-full"
                >
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-300 animate-pulse drop-shadow-lg" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-900 drop-shadow-lg">
                AI Coach
              </h1>
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-300 animate-pulse drop-shadow-lg" />
            </div>
            <p className="text-purple-800 text-sm sm:text-base font-medium drop-shadow">
              Live conversation with your personal English coach
            </p>
          </div>
        </div>
      </div>

      {/* Collapse/Expand Button */}
      <button
        onClick={() => setHeaderCollapsed(!headerCollapsed)}
        className="fixed top-2 right-2 z-[60] backdrop-blur-xl bg-white/30 hover:bg-white/40 text-purple-900 border border-white/40 rounded-full p-2 transition-all"
      >
        {headerCollapsed ? (
          <ChevronDown className="h-5 w-5" />
        ) : (
          <ChevronUp className="h-5 w-5" />
        )}
      </button>

      {/* Main Content */}
      <div className={`container mx-auto px-4 ${headerCollapsed ? 'pt-16' : 'pt-32'} pb-24 transition-all duration-300`}>
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Live Conversation Card */}
          <Card className={`backdrop-blur-3xl bg-white/15 border-white/30 shadow-2xl transition-all duration-500 ${
            isSpeaking ? 'animate-[glow-pulse_1.5s_ease-in-out_infinite]' : ''
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-purple-700" />
                  <CardTitle className="text-purple-900">Live Conversation</CardTitle>
                </div>
                <Badge variant="secondary" className={`${
                  isActive ? 'bg-green-500/80 text-white' : 'bg-gray-400/80 text-white'
                }`}>
                  {isActive ? 'Online' : 'Offline'}
                </Badge>
              </div>
              <CardDescription className="text-purple-800">
                {isActive ? 'Chat with TalkyTalky in real-time' : 'Start a live chat with TalkyTalky'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isActive && (
                <div className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-lg p-4 text-purple-900">
                  <p className="text-sm sm:text-base">
                    Hi there! I'm TalkyTalky, your personal English pronunciation coach! ✨🎤 Click 'Start Live Chat' and we can have a real conversation. I'll listen and respond to you naturally!
                  </p>
                </div>
              )}

              {/* Conversation History */}
              {conversation.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {conversation.map((turn, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        turn.speaker === 'user'
                          ? 'bg-purple-500/20 ml-8'
                          : 'bg-pink-500/20 mr-8'
                      }`}
                    >
                      <p className="text-sm font-semibold text-purple-900">
                        {turn.speaker === 'user' ? 'You' : 'TalkyTalky'}
                      </p>
                      <p className="text-sm text-purple-800">{turn.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Current Transcription */}
              {isActive && (currentTranscription.user || currentTranscription.model) && (
                <div className="space-y-2">
                  {currentTranscription.user && (
                    <div className="p-3 rounded-lg bg-purple-500/20 ml-8">
                      <p className="text-sm font-semibold text-purple-900">You (live)</p>
                      <p className="text-sm text-purple-800">{currentTranscription.user}</p>
                    </div>
                  )}
                  {currentTranscription.model && (
                    <div className="p-3 rounded-lg bg-pink-500/20 mr-8">
                      <p className="text-sm font-semibold text-purple-900">TalkyTalky (live)</p>
                      <p className="text-sm text-purple-800">{currentTranscription.model}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Status Indicator */}
              {isActive && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/30 border border-white/40">
                    {isSpeaking ? (
                      <>
                        <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                        <span className="text-sm font-medium text-purple-900">TalkyTalky is speaking...</span>
                      </>
                    ) : isListening ? (
                      <>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium text-purple-900">Listening...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        <span className="text-sm font-medium text-purple-900">Processing...</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Start/Stop Button */}
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={isActive ? stopSession : startSession}
                  disabled={status === AppStatus.CONNECTING || status === AppStatus.STOPPING}
                  className={`relative group transition-all duration-300 outline-none focus:outline-none focus-visible:outline-none border-0 ring-0 focus:ring-0 focus-visible:ring-0 overflow-hidden ${
                    !isActive ? 'animate-[button-glow_2s_ease-in-out_infinite]' : ''
                  }`}
                  style={{ outline: 'none', boxShadow: 'none' }}
                >
                  <div className={`w-28 h-28 sm:w-40 sm:h-40 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 group-hover:scale-110'
                  } shadow-2xl`}>
                    {isActive ? (
                      <MicOff className="h-12 w-12 sm:h-16 sm:w-16 text-white drop-shadow-lg" />
                    ) : (
                      <Mic className="h-12 w-12 sm:h-16 sm:w-16 text-white drop-shadow-lg" />
                    )}
                  </div>
                </button>
                
                <div className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-full px-6 py-3 text-center max-w-md">
                  <p className="text-purple-900 text-sm sm:text-base font-medium">
                    {isActive
                      ? 'Click to stop the conversation. TalkyTalky will say goodbye!'
                      : status === AppStatus.CONNECTING
                      ? 'Connecting to TalkyTalky...'
                      : status === AppStatus.STOPPING
                      ? 'Ending conversation...'
                      : 'Click to start a live conversation. TalkyTalky will listen and respond in real-time!'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className={`backdrop-blur-3xl bg-white/15 border-white/30 shadow-xl transition-all duration-500 ${
              isSpeaking ? 'animate-[glow-pulse_1.5s_ease-in-out_infinite]' : ''
            }`}>
              <CardHeader className="text-center pb-2">
                <Sparkles className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <CardTitle className="text-base text-purple-900">Live Conversation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-center text-purple-800">
                  Real-time voice chat with instant AI responses
                </p>
              </CardContent>
            </Card>

            <Card className={`backdrop-blur-3xl bg-white/15 border-white/30 shadow-xl transition-all duration-500 ${
              isSpeaking ? 'animate-[glow-pulse_1.5s_ease-in-out_infinite]' : ''
            }`}>
              <CardHeader className="text-center pb-2">
                <Zap className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <CardTitle className="text-base text-purple-900">Auto-Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-center text-purple-800">
                  Automatic voice activity detection and turn-taking
                </p>
              </CardContent>
            </Card>

            <Card className={`backdrop-blur-3xl bg-white/15 border-white/30 shadow-xl transition-all duration-500 ${
              isSpeaking ? 'animate-[glow-pulse_1.5s_ease-in-out_infinite]' : ''
            }`}>
              <CardHeader className="text-center pb-2">
                <MessageCircle className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <CardTitle className="text-base text-purple-900">Natural Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-center text-purple-800">
                  Conversational AI that responds naturally to your speech
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

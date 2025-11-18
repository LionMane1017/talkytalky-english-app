import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, MessageCircle, Sparkles, Zap, User } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import TalkyLogo from "@/components/TalkyLogo";
import { Link } from "wouter";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const backgroundImages = [
  '/bg1.webp',
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

export default function AICoach() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi there! I'm TalkyTalky, your personal English pronunciation coach! 🎤✨ Click 'Start Live Chat' and we can have a real conversation. I'll listen and respond to you naturally!",
      timestamp: new Date(),
    },
  ]);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const transcribeAudio = trpc.practice.transcribeAudio.useMutation();
  const generateSpeech = trpc.practice.generateSpeech.useMutation();
  const getAIResponse = trpc.aiCoach.getResponse.useMutation();

  // Rotate background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLiveMode();
    };
  }, []);

  // Helper function to create WAV file from PCM data
  const createWavBlob = (pcmData: Uint8Array, sampleRate: number, numChannels: number, bitsPerSample: number): Blob => {
    const dataLength = pcmData.length;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
    view.setUint16(32, numChannels * (bitsPerSample / 8), true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    for (let i = 0; i < dataLength; i++) {
      view.setUint8(44 + i, pcmData[i]);
    }

    return new Blob([buffer], { type: 'audio/wav' });
  };

  // Visualize audio level
  const visualizeAudio = () => {
    if (!analyzerRef.current) return;

    const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
    analyzerRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const level = Math.min(100, (average / 128) * 100);
    setAudioLevel(level);

    // Detect silence (auto-stop after 2 seconds of silence)
    if (level < 5 && isListening && !isSpeaking) {
      if (!silenceTimeoutRef.current) {
        silenceTimeoutRef.current = setTimeout(() => {
          stopListening();
        }, 2000);
      }
    } else {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
    }

    animationFrameRef.current = requestAnimationFrame(visualizeAudio);
  };

  // Start live mode
  const startLiveMode = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio context for visualization
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 256;
      source.connect(analyzerRef.current);

      setIsLiveMode(true);
      toast.success("Live chat started! Start speaking naturally.");
      
      // Auto-start listening
      startListening();

    } catch (error) {
      console.error('Error starting live mode:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  // Stop live mode
  const stopLiveMode = () => {
    stopListening();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    setIsLiveMode(false);
    setIsListening(false);
    setIsSpeaking(false);
    setAudioLevel(0);
  };

  // Start listening
  const startListening = () => {
    if (!streamRef.current || isSpeaking) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        await processRecording();
      };

      mediaRecorder.start();
      setIsListening(true);
      visualizeAudio();

    } catch (error) {
      console.error('Error starting listening:', error);
    }
  };

  // Stop listening
  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
    setAudioLevel(0);

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  };

  // Process recording
  const processRecording = async () => {
    if (chunksRef.current.length === 0) return;

    try {
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();

      const base64Audio = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      // Transcribe audio
      const transcript = await transcribeAudio.mutateAsync({
        audioBase64: base64Audio,
        mimeType: 'audio/webm',
      });

      if (transcript && transcript.trim()) {
        // Add user message
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: transcript,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);

        // Get AI response
        await handleAIResponse(transcript);
      } else {
        // No speech detected, restart listening
        if (isLiveMode) {
          setTimeout(() => startListening(), 500);
        }
      }

    } catch (error) {
      console.error('Error processing recording:', error);
      // Restart listening on error
      if (isLiveMode) {
        setTimeout(() => startListening(), 500);
      }
    }
  };

  // Get AI response and speak it
  const handleAIResponse = async (userInput: string) => {
    try {
      // Add "thinking" message immediately for better UX
      const thinkingMessage: Message = {
        id: `thinking-${Date.now()}`,
        role: "assistant",
        content: "💭 Thinking...",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, thinkingMessage]);
      setIsSpeaking(true);

      // Get conversational response from TalkyTalky
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Start both API calls in parallel for faster response
      const aiResponsePromise = getAIResponse.mutateAsync({
        userMessage: userInput,
        conversationHistory,
      });

      const aiResponse = await aiResponsePromise;
      const responseText = aiResponse.response;

      // Remove thinking message and add real response
      setMessages(prev => prev.filter(m => m.id !== thinkingMessage.id));

      // Generate speech while user reads the text response
      const audioDataPromise = generateSpeech.mutateAsync({
        text: responseText,
        accent: 'US',
      });

      const audioData = await audioDataPromise;

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      if (audioData) {
        const binaryString = atob(audioData);
        const pcmData = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          pcmData[i] = binaryString.charCodeAt(i);
        }

        const wavBlob = createWavBlob(pcmData, 24000, 1, 16);
        const audioUrl = URL.createObjectURL(wavBlob);
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setIsSpeaking(false);
          currentAudioRef.current = null;
          
          // Auto-restart listening after AI finishes speaking
          if (isLiveMode) {
            setTimeout(() => startListening(), 500);
          }
        };

        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          URL.revokeObjectURL(audioUrl);
          setIsSpeaking(false);
          currentAudioRef.current = null;
          
          // Restart listening even on error
          if (isLiveMode) {
            setTimeout(() => startListening(), 500);
          }
        };

        await audio.play();
      } else {
        setIsSpeaking(false);
        // Restart listening if no audio
        if (isLiveMode) {
          setTimeout(() => startListening(), 500);
        }
      }

    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get AI response. Please try again.');
      setIsSpeaking(false);
      
      // Restart listening on error
      if (isLiveMode) {
        setTimeout(() => startListening(), 500);
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden pb-20">
      {/* Animated Background with Heavy Blur */}
      <div className="fixed inset-0 z-0">
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
              filter: 'blur(20px) brightness(1.05)',
            }}
          />
        ))}
        {/* Gradient Overlay - Removed for better background visibility */}
      </div>

      {/* Content with Glassmorphism */}
      <div className="relative z-10">
        {/* Header with Heavy Glass Effect */}
        <div className="backdrop-blur-3xl bg-white/10 border-b border-white/20 shadow-2xl py-6 px-4">
          <div className="container max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <div className={`backdrop-blur-xl bg-white/20 rounded-2xl px-4 py-2 border border-white/30 transition-all duration-300 ${
              isSpeaking ? 'animate-[glow-pulse_1.5s_ease-in-out_infinite]' : ''
            }`}>
                <TalkyLogo />
              </div>
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
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse drop-shadow-lg" />
                <h1 className="text-3xl sm:text-4xl font-bold text-purple-900 drop-shadow-md">
                  AI Coach
                </h1>
                <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse drop-shadow-lg" />
              </div>
              <p className="text-purple-800 text-sm sm:text-base font-medium drop-shadow">
                Live conversation with your personal English coach
              </p>
            </div>
          </div>
        </div>

        {/* Chat Container with Frosted Glass */}
        <div className="container max-w-4xl px-4 py-6">
          <Card className={`backdrop-blur-3xl bg-white/15 border-white/30 shadow-2xl border-2 transition-all duration-300 ${
            isSpeaking ? 'animate-[border-glow_1.5s_ease-in-out_infinite]' : ''
          }`}>
            <CardHeader className="border-b border-white/20 backdrop-blur-xl bg-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-purple-900 flex items-center gap-2 font-bold">
                    <MessageCircle className="h-5 w-5 text-purple-700" />
                    Live Conversation
                  </CardTitle>
                  <CardDescription className="text-purple-800 font-medium">
                    {isLiveMode 
                      ? isSpeaking 
                        ? "TalkyTalky is speaking..."
                        : isListening
                        ? "Listening to you..."
                        : "Processing..."
                      : "Start a live chat with TalkyTalky"
                    }
                  </CardDescription>
                </div>
                <Badge 
                  variant="secondary" 
                  className={`${
                    isLiveMode 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-400' 
                      : 'bg-gradient-to-r from-purple-400 to-pink-400'
                  } text-white border-0 shadow-lg backdrop-blur-xl`}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  {isLiveMode ? 'Live' : 'Offline'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              {/* Messages */}
              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-lg ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                          : "backdrop-blur-2xl bg-white/25 text-purple-900 border-2 border-white/40"
                      }`}
                    >
                      <p className="text-sm sm:text-base font-medium">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Live Mode Controls */}
              <div className="flex flex-col items-center gap-4">
                {/* Audio Level Visualizer */}
                {isLiveMode && (
                  <div className={`w-full backdrop-blur-xl bg-white/20 rounded-2xl p-4 border border-white/30 transition-all duration-300 ${
                    isSpeaking ? 'animate-[glow-pulse-pink_1.5s_ease-in-out_infinite]' : ''
                  }`}>
                    <div className="h-4 bg-white/30 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full transition-all duration-100 shadow-lg ${
                          isSpeaking 
                            ? 'bg-gradient-to-r from-green-400 to-emerald-400'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500'
                        }`}
                        style={{ width: `${audioLevel}%` }}
                      />
                    </div>
                    <p className="text-center text-purple-900 text-sm mt-3 font-bold drop-shadow">
                      {isSpeaking ? '🔊 TalkyTalky is speaking...' : isListening ? '🎤 Listening... (pauses auto-detect)' : '⏸️ Processing...'}
                    </p>
                  </div>
                )}

                {/* Start/Stop Button - Big Sexy Glowing Circle */}
                <button
                  onClick={isLiveMode ? stopLiveMode : startLiveMode}
                  className={`relative group transition-all duration-300 ${
                    isLiveMode ? '' : 'animate-[button-glow_2s_ease-in-out_infinite]'
                  }`}
                >
                  <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isLiveMode
                      ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:scale-105"
                      : "bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 hover:scale-110"
                  } border-4 border-white/50 shadow-2xl group-hover:border-white/70`}
                  >
                    {isLiveMode ? (
                      <MicOff className="h-12 w-12 sm:h-16 sm:w-16 text-white drop-shadow-lg" />
                    ) : (
                      <Mic className="h-12 w-12 sm:h-16 sm:w-16 text-white drop-shadow-lg animate-pulse" />
                    )}
                  </div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <span className="text-purple-900 font-bold text-sm drop-shadow backdrop-blur-xl bg-white/30 px-4 py-1 rounded-full border border-white/40">
                      {isLiveMode ? 'End Chat' : 'Start Chat'}
                    </span>
                  </div>
                </button>

                <p className="text-purple-900 text-sm text-center max-w-md font-medium drop-shadow backdrop-blur-xl bg-white/20 rounded-full px-6 py-2 border border-white/30">
                  {isLiveMode 
                    ? "Speak naturally! TalkyTalky will detect when you pause and respond automatically."
                    : "Click to start a live conversation. TalkyTalky will listen and respond in real-time!"
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features Grid with Glass Effect */}
          <div className="grid sm:grid-cols-3 gap-4 mt-6">
            <Card className={`backdrop-blur-2xl bg-white/15 border-white/30 border-2 text-center p-4 shadow-xl hover:bg-white/20 transition-all ${
              isSpeaking ? 'animate-[glow-pulse_2s_ease-in-out_infinite]' : ''
            }`}>
              <Sparkles className="h-8 w-8 text-yellow-400 mx-auto mb-2 drop-shadow-lg" />
              <h3 className="text-purple-900 font-bold mb-1">Live Conversation</h3>
              <p className="text-purple-800 text-sm font-medium">Real-time back-and-forth chat</p>
            </Card>

            <Card className={`backdrop-blur-2xl bg-white/15 border-white/30 border-2 text-center p-4 shadow-xl hover:bg-white/20 transition-all ${
              isSpeaking ? 'animate-[glow-pulse_2s_ease-in-out_infinite]' : ''
            }`}>
              <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2 drop-shadow-lg" />
              <h3 className="text-purple-900 font-bold mb-1">Auto-Detection</h3>
              <p className="text-purple-800 text-sm font-medium">Pauses trigger responses</p>
            </Card>

            <Card className={`backdrop-blur-2xl bg-white/15 border-white/30 border-2 text-center p-4 shadow-xl hover:bg-white/20 transition-all ${
              isSpeaking ? 'animate-[glow-pulse_2s_ease-in-out_infinite]' : ''
            }`}>
              <MessageCircle className="h-8 w-8 text-pink-600 mx-auto mb-2 drop-shadow-lg" />
              <h3 className="text-purple-900 font-bold mb-1">Natural Flow</h3>
              <p className="text-purple-800 text-sm font-medium">Just like talking to a friend</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

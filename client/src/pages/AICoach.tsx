import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Send, Sparkles, Volume2, MessageCircle, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import TalkyLogo from "@/components/TalkyLogo";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

export default function AICoach() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi there! I'm TalkyTalky, your personal English pronunciation coach! 🎤✨ I'm here to help you master English speaking and ace your IELTS exam. What would you like to practice today?",
      timestamp: new Date(),
    },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const transcribeAudio = trpc.practice.transcribeAudio.useMutation();
  const generateSpeech = trpc.practice.generateSpeech.useMutation();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
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
    setAudioLevel(Math.min(100, (average / 128) * 100));

    animationFrameRef.current = requestAnimationFrame(visualizeAudio);
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio context for visualization
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 256;
      source.connect(analyzerRef.current);
      visualizeAudio();

      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream);
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
      setIsRecording(true);

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          stopRecording();
        }
      }, 10000);

    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }

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

    setIsRecording(false);
    setAudioLevel(0);
  };

  // Process recording
  const processRecording = async () => {
    setIsProcessing(true);

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

      if (transcript) {
        // Add user message
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: transcript,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);

        // Get AI response
        await getAIResponse(transcript);
      }

    } catch (error) {
      console.error('Error processing recording:', error);
      toast.error('Failed to process your recording. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Get AI response
  const getAIResponse = async (userInput: string) => {
    try {
      // Generate conversational response
      const responseText = `Great! I heard you say "${userInput}". Let me help you with that! Keep practicing and you'll master it in no time! 🌟`;

      // Generate speech
      const audioData = await generateSpeech.mutateAsync({
        text: responseText,
        accent: 'US',
      });

      let audioUrl: string | undefined;
      if (audioData) {
        const binaryString = atob(audioData);
        const pcmData = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          pcmData[i] = binaryString.charCodeAt(i);
        }

        const wavBlob = createWavBlob(pcmData, 24000, 1, 16);
        audioUrl = URL.createObjectURL(wavBlob);

        // Play audio
        const audio = new Audio(audioUrl);
        audio.play();
        audio.onended = () => URL.revokeObjectURL(audioUrl!);
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
        audioUrl,
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get AI response. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border-b border-white/10 py-6 px-4">
        <div className="container max-w-4xl">
          <div className="flex items-center justify-center mb-4">
            <TalkyLogo />
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                AI Coach
              </h1>
              <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
            </div>
            <p className="text-purple-200 text-sm sm:text-base">
              Your personal English pronunciation coach powered by Gemini AI
            </p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="container max-w-4xl px-4 py-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader className="border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-purple-300" />
                  Conversation
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Chat with TalkyTalky using your voice
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                <Zap className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            {/* Messages */}
            <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto pr-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "bg-white/20 backdrop-blur-sm text-white border border-white/20"
                    }`}
                  >
                    <p className="text-sm sm:text-base">{message.content}</p>
                    {message.audioUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-purple-200 hover:text-white hover:bg-white/10"
                        onClick={() => {
                          const audio = new Audio(message.audioUrl);
                          audio.play();
                        }}
                      >
                        <Volume2 className="h-4 w-4 mr-1" />
                        Play Audio
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Recording Controls */}
            <div className="flex flex-col items-center gap-4">
              {/* Audio Level Visualizer */}
              {isRecording && (
                <div className="w-full">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-100"
                      style={{ width: `${audioLevel}%` }}
                    />
                  </div>
                  <p className="text-center text-white/60 text-sm mt-2">
                    Listening... (auto-stops after 10s)
                  </p>
                </div>
              )}

              {/* Record Button */}
              <Button
                size="lg"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`w-full sm:w-auto px-8 py-6 text-lg font-semibold rounded-full transition-all ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600 animate-pulse"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                } text-white shadow-lg`}
              >
                {isProcessing ? (
                  <>
                    <Send className="h-6 w-6 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : isRecording ? (
                  <>
                    <Mic className="h-6 w-6 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-6 w-6 mr-2" />
                    Start Speaking
                  </>
                )}
              </Button>

              <p className="text-white/60 text-sm text-center">
                Click the button and speak naturally. TalkyTalky will listen and respond!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-center p-4">
            <Sparkles className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <h3 className="text-white font-semibold mb-1">Real-time Feedback</h3>
            <p className="text-purple-200 text-sm">Instant pronunciation analysis</p>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-center p-4">
            <Zap className="h-8 w-8 text-purple-300 mx-auto mb-2" />
            <h3 className="text-white font-semibold mb-1">Personalized Learning</h3>
            <p className="text-purple-200 text-sm">Adapts to your skill level</p>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-center p-4">
            <MessageCircle className="h-8 w-8 text-pink-300 mx-auto mb-2" />
            <h3 className="text-white font-semibold mb-1">Natural Conversations</h3>
            <p className="text-purple-200 text-sm">Practice like a real dialogue</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

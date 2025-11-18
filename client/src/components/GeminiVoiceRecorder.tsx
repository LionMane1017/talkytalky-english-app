import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Volume2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface GeminiVoiceRecorderProps {
  targetWord: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  onResult: (result: PronunciationResult) => void;
  previousScore?: number;
}

interface PronunciationResult {
  success: boolean;
  transcript: string;
  scores: {
    accuracy: number;
    fluency: number;
    completeness: number;
    overall: number;
  };
  phonemeAnalysis: Array<{
    phoneme: string;
    accuracy: number;
  }>;
  feedback: string;
  suggestions: string[];
  motivationalMessage?: string;
  streakBonus?: boolean;
}

export default function GeminiVoiceRecorder({
  targetWord,
  difficulty = "beginner",
  onResult,
  previousScore,
}: GeminiVoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const streamRef = useRef<MediaStream | null>(null);

  // tRPC mutations
  const analyzePronunciation = trpc.practice.analyzePronunciation.useMutation({});
  const generateSpeech = trpc.practice.generateSpeech.useMutation({});
  const transcribeAudio = trpc.practice.transcribeAudio.useMutation({});

  // Audio level visualization
  const updateAudioLevel = () => {
    if (!analyzerRef.current) return;

    const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
    analyzerRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(average / 255); // Normalize to 0-1

    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Set up audio visualization
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 256;
      source.connect(analyzerRef.current);
      updateAudioLevel();

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Process the recorded audio
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info("🎤 Listening... Say the word clearly!");

      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          stopRecording();
        }
      }, 5000);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Microphone access denied. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setIsRecording(false);
    setAudioLevel(0);
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    toast.info("🔄 Transcribing your speech...");

    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(",")[1];
        
        try {
          // Transcribe audio using Gemini
          const userTranscript = await transcribeAudio.mutateAsync({
            audioBase64: base64Audio,
            mimeType: audioBlob.type,
          });

          setTranscript(userTranscript);
          
          if (!userTranscript || userTranscript.trim().length === 0) {
            toast.error("No speech detected. Please try again.");
            setIsAnalyzing(false);
            return;
          }

          // Analyze pronunciation
          toast.info("📊 Analyzing your pronunciation...");
          const result = await analyzePronunciation.mutateAsync({
            targetText: targetWord,
            userTranscript,
            difficulty,
            previousScore,
          });

          onResult(result as PronunciationResult);

          // Show feedback toast
          if (result.scores.overall >= 90) {
            toast.success(result.feedback, { duration: 5000 });
          } else if (result.scores.overall >= 70) {
            toast.success(result.feedback, { duration: 4000 });
          } else {
            toast.info(result.feedback, { duration: 4000 });
          }

          // Show motivational message
          if (result.motivationalMessage) {
            setTimeout(() => {
              toast(result.motivationalMessage, { duration: 3000 });
            }, 1000);
          }

          // Streak bonus celebration
          if (result.streakBonus) {
            setTimeout(() => {
              toast.success("🔥 STREAK BONUS! You're on fire!", { duration: 3000 });
            }, 2000);
          }
        } catch (error) {
          console.error("Error processing audio:", error);
          toast.error("Failed to process audio. Please try again.");
        } finally {
          setIsAnalyzing(false);
          setTranscript("");
        }
      };
    } catch (error) {
      console.error("Error reading audio blob:", error);
      toast.error("Failed to process recording. Please try again.");
      setIsAnalyzing(false);
    }
  };

  const playNativeAudio = async () => {
    toast.info("🔊 Playing native pronunciation...");
    
    try {
      const result = await generateSpeech.mutateAsync({
        text: targetWord,
        accent: "US",
      });

      // Play the base64 audio
      const audio = new Audio(`data:audio/mp3;base64,${result}`);
      audio.play();
    } catch (error) {
      console.error("Error generating speech:", error);
      toast.error("Failed to generate audio. Please try again.");
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Audio Level Visualizer */}
      {isRecording && (
        <div className="flex items-center gap-2 mb-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="w-2 bg-primary rounded-full transition-all duration-100"
              style={{
                height: `${Math.max(8, audioLevel * 60 * (1 + Math.sin(i * 0.5)))}px`,
                opacity: audioLevel > 0.1 ? 1 : 0.3,
              }}
            />
          ))}
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-4">
        {/* Record Button */}
        <Button
          size="lg"
          variant={isRecording ? "destructive" : "default"}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isAnalyzing}
          className="relative w-20 h-20 rounded-full"
        >
          {isAnalyzing ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
          {isRecording && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
            </span>
          )}
        </Button>

        {/* Play Native Audio Button */}
        <Button
          size="lg"
          variant="outline"
          onClick={playNativeAudio}
          disabled={isRecording || isAnalyzing || generateSpeech.isPending}
          className="w-20 h-20 rounded-full"
        >
          {generateSpeech.isPending ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <Volume2 className="w-8 h-8" />
          )}
        </Button>
      </div>

      {/* Status Text */}
      <p className="text-sm text-muted-foreground text-center">
        {isRecording
          ? "🎤 Recording... (auto-stops in 5s)"
          : isAnalyzing
          ? "📊 Analyzing pronunciation..."
          : "Click microphone to record, speaker to hear native pronunciation"}
      </p>

      {/* Transcript Display */}
      {transcript && (
        <div className="mt-2 p-3 bg-muted rounded-lg">
          <p className="text-sm">
            <span className="font-semibold">You said:</span> "{transcript}"
          </p>
        </div>
      )}
    </div>
  );
}

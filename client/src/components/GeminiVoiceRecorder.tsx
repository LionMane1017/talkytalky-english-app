import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { VoiceWaveform } from "@/components/VoiceWaveform";

interface GeminiVoiceRecorderProps {
  word: string;
  onAnalysisComplete: (result: any) => void;
}

export default function GeminiVoiceRecorder({ word, onAnalysisComplete }: GeminiVoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const analyzeMutation = trpc.practice.analyzePronunciation.useMutation();

  // Audio level monitoring
  useEffect(() => {
    if (isRecording && analyserRef.current) {
      const updateAudioLevel = () => {
        const dataArray = new Uint8Array(analyserRef.current!.frequencyBinCount);
        analyserRef.current!.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording]);

  // Countdown timer
  useEffect(() => {
    if (isRecording) {
      setCountdown(5);
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup audio analysis
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await handleAnalysis(blob);
        stream.getTracks().forEach(t => t.stop());
        
        // Cleanup audio context
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        setAudioLevel(0);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      setError("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAnalysis = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // Convert Blob to Base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64 = base64String.split(',')[1]; // Strip "data:audio/webm;base64,"

        const result = await analyzeMutation.mutateAsync({
          word,
          audioBase64: base64
        });

        onAnalysisComplete(result);
        setIsProcessing(false);
      };
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {error && <div className="text-red-500 text-sm flex gap-2 items-center"><AlertCircle size={16}/> {error}</div>}
      
      {/* Waveform Animation */}
      {isRecording && (
        <div className="w-full max-w-md">
          <VoiceWaveform audioLevel={audioLevel} isActive={isRecording} />
        </div>
      )}
      
      {/* Recording Button with Countdown */}
      <div className="relative">
        <Button
          variant={isRecording ? "destructive" : "default"}
          size="lg"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className="w-32 h-32 rounded-full relative"
        >
          {isProcessing ? (
            <Loader2 className="animate-spin" size={48} />
          ) : isRecording ? (
            <div className="flex flex-col items-center">
              <Square size={32} />
              <span className="text-3xl font-bold mt-2">{countdown}</span>
            </div>
          ) : (
            <Mic size={48} />
          )}
        </Button>
        
        {/* Countdown Ring Animation */}
        {isRecording && (
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r="60"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-white/30"
            />
            <circle
              cx="64"
              cy="64"
              r="60"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-white"
              strokeDasharray={`${2 * Math.PI * 60}`}
              strokeDashoffset={`${2 * Math.PI * 60 * (1 - countdown / 5)}`}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {isProcessing ? "Analyzing your pronunciation..." : isRecording ? `Recording... ${countdown}s remaining` : "Click to record your pronunciation"}
      </p>
    </div>
  );
}

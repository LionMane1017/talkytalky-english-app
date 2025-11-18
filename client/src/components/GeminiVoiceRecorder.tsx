import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface GeminiVoiceRecorderProps {
  word: string;
  onAnalysisComplete: (result: any) => void;
}

export default function GeminiVoiceRecorder({ word, onAnalysisComplete }: GeminiVoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const analyzeMutation = trpc.practice.analyzePronunciation.useMutation();

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await handleAnalysis(blob);
        stream.getTracks().forEach(t => t.stop());
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
    <div className="flex flex-col items-center gap-4">
      {error && <div className="text-red-500 text-sm flex gap-2 items-center"><AlertCircle size={16}/> {error}</div>}
      
      <Button
        variant={isRecording ? "destructive" : "default"}
        size="lg"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className="w-32 h-32 rounded-full"
      >
        {isProcessing ? (
          <Loader2 className="animate-spin" size={48} />
        ) : isRecording ? (
          <Square size={48} />
        ) : (
          <Mic size={48} />
        )}
      </Button>

      <p className="text-sm text-muted-foreground">
        {isProcessing ? "Analyzing..." : isRecording ? "Recording... Click to stop" : "Click to record"}
      </p>
    </div>
  );
}

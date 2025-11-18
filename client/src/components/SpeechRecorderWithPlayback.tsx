import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Square, Play, Pause, Volume2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SpeechRecorderWithPlaybackProps {
  targetWord: string;
  onTranscript: (transcript: string, score: number, detailed?: any) => void;
}

interface Recording {
  blob: Blob;
  url: string;
  timestamp: Date;
  transcript: string;
  score: number;
}

export default function SpeechRecorderWithPlayback({
  targetWord,
  onTranscript,
}: SpeechRecorderWithPlaybackProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isPlayingNative, setIsPlayingNative] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const nativeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";
        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Calculate pronunciation score using Levenshtein distance
  const calculateScore = (transcript: string, target: string): number => {
    const t = transcript.toLowerCase().trim();
    const tg = target.toLowerCase().trim();

    if (t === tg) return 100;

    const distance = levenshteinDistance(t, tg);
    const maxLength = Math.max(t.length, tg.length);
    const similarity = 1 - distance / maxLength;
    return Math.max(0, Math.min(100, Math.round(similarity * 100)));
  };

  const levenshteinDistance = (a: string, b: string): number => {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        setIsProcessing(false);
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          const score = calculateScore(transcript, targetWord);
          
          // Auto-stop recording when speech is detected
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
          }
          
          // Create recording entry
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          const newRecording: Recording = {
            blob: audioBlob,
            url: audioUrl,
            timestamp: new Date(),
            transcript,
            score,
          };

          setRecordings(prev => [newRecording, ...prev].slice(0, 5)); // Keep last 5 recordings
          onTranscript(transcript, score);
          
          setIsRecording(false);
          setIsProcessing(false);
          
          // Stop all audio tracks
          stream.getTracks().forEach(track => track.stop());
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          toast.error("Could not recognize speech. Please try again.");
          setIsRecording(false);
          setIsProcessing(false);
          stream.getTracks().forEach(track => track.stop());
        };
        
        recognitionRef.current.onend = () => {
          // If recognition ends without result, stop recording
          if (isRecording && mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsProcessing(false);
            stream.getTracks().forEach(track => track.stop());
          }
        };

        recognitionRef.current.start();
      }

      toast.success("Recording started!");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Could not access microphone");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  const playRecording = (index: number) => {
    const recording = recordings[index];
    if (!recording) return;

    if (playingIndex === index) {
      // Pause current playback
      audioPlayerRef.current?.pause();
      setPlayingIndex(null);
    } else {
      // Stop any current playback
      audioPlayerRef.current?.pause();
      
      // Play new recording
      const audio = new Audio(recording.url);
      audioPlayerRef.current = audio;
      
      audio.onended = () => {
        setPlayingIndex(null);
      };

      audio.play();
      setPlayingIndex(index);
    }
  };

  const playNativeAudio = () => {
    if (isPlayingNative) {
      nativeAudioRef.current?.pause();
      setIsPlayingNative(false);
    } else {
      // Use Web Speech API for native pronunciation
      const utterance = new SpeechSynthesisUtterance(targetWord);
      utterance.lang = "en-US";
      utterance.rate = 0.8; // Slightly slower for clarity
      
      utterance.onend = () => {
        setIsPlayingNative(false);
      };

      speechSynthesis.speak(utterance);
      setIsPlayingNative(true);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-4">
              <Button
                size="lg"
                onClick={startRecording}
                disabled={isProcessing || isRecording}
                className={`rounded-full h-16 w-16 p-0 ${isRecording ? 'animate-pulse bg-red-500 hover:bg-red-600' : ''}`}
                variant={isRecording ? "destructive" : "default"}
              >
                {isProcessing ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={playNativeAudio}
                disabled={isRecording || isProcessing}
                className="rounded-full h-16 w-16 p-0"
              >
                <Volume2 className={`h-6 w-6 ${isPlayingNative ? 'text-primary animate-pulse' : ''}`} />
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isRecording
                  ? "🎤 Recording... Speak now, it will auto-stop when you finish"
                  : isProcessing
                  ? "Processing your recording..."
                  : "Click microphone to record (auto-stops when you finish speaking)"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recording History */}
      {recordings.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Play className="h-4 w-4" />
              Your Recordings ({recordings.length})
            </h3>
            <div className="space-y-2">
              {recordings.map((recording, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => playRecording(index)}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    {playingIndex === index ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        "{recording.transcript}"
                      </span>
                      <span className={`text-sm font-bold ${getScoreColor(recording.score)}`}>
                        {recording.score}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {recording.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

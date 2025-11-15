import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { toast } from "sonner";

interface SpeechRecorderProps {
  targetWord: string;
  onTranscript: (transcript: string, score: number) => void;
}

export default function SpeechRecorder({ targetWord, onTranscript }: SpeechRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      toast.error("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
      
      // Calculate pronunciation score
      const score = calculatePronunciationScore(targetWord, speechResult);
      onTranscript(speechResult, score);
      
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      
      if (event.error === "no-speech") {
        toast.error("No speech detected. Please try again.");
      } else if (event.error === "not-allowed") {
        toast.error("Microphone access denied. Please allow microphone access.");
      } else {
        toast.error("Speech recognition error. Please try again.");
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [targetWord, onTranscript]);

  const calculatePronunciationScore = (target: string, spoken: string): number => {
    // Normalize both strings for comparison
    const normalizedTarget = target.toLowerCase().trim();
    const normalizedSpoken = spoken.toLowerCase().trim();

    // Exact match gets 100%
    if (normalizedTarget === normalizedSpoken) {
      return 100;
    }

    // Calculate similarity using Levenshtein distance
    const distance = levenshteinDistance(normalizedTarget, normalizedSpoken);
    const maxLength = Math.max(normalizedTarget.length, normalizedSpoken.length);
    const similarity = 1 - (distance / maxLength);
    
    // Convert to percentage (0-100)
    const score = Math.max(0, Math.round(similarity * 100));
    
    return score;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
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

    return matrix[str2.length][str1.length];
  };

  const startRecording = () => {
    if (!isSupported || !recognitionRef.current) {
      toast.error("Speech recognition is not available.");
      return;
    }

    try {
      setTranscript("");
      recognitionRef.current.start();
      setIsRecording(true);
      toast.info("Listening... Speak now!");
    } catch (error) {
      console.error("Error starting recognition:", error);
      toast.error("Failed to start recording. Please try again.");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    // Use Web Speech API for text-to-speech
    const utterance = new SpeechSynthesisUtterance(targetWord);
    utterance.lang = "en-US";
    utterance.rate = 0.8; // Slightly slower for learning
    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) {
    return (
      <Card className="bg-destructive/10 border-destructive">
        <CardContent className="pt-6">
          <p className="text-sm text-destructive text-center">
            Speech recognition is not supported in your browser. Please use Chrome or Edge.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4">
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              className="h-20 w-20 rounded-full"
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {isRecording ? "Recording... Click to stop" : "Click to start recording"}
              </p>
              
              <Button
                variant="outline"
                size="sm"
                onClick={playAudio}
                className="gap-2"
              >
                <Volume2 className="h-4 w-4" />
                Hear pronunciation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {transcript && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">You said:</p>
            <p className="text-lg font-medium text-foreground">{transcript}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

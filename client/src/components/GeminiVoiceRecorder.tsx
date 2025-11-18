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

// Helper function to create WAV file from PCM data
const createWavBlob = (pcmData: Uint8Array, sampleRate: number, numChannels: number, bitsPerSample: number): Blob => {
  const dataLength = pcmData.length;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // audio format (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true); // byte rate
  view.setUint16(32, numChannels * (bitsPerSample / 8), true); // block align
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  // Copy PCM data
  for (let i = 0; i < dataLength; i++) {
    view.setUint8(44 + i, pcmData[i]);
  }

  return new Blob([buffer], { type: 'audio/wav' });
};

export default function GeminiVoiceRecorder({
  targetWord,
  difficulty = "beginner",
  onResult,
  previousScore,
}: GeminiVoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // tRPC mutations with timeout
  // NOTE: These endpoints were removed in favor of Gemini Live API
  // TODO: Restore or replace with new Gemini-based endpoints
  // const analyzePronunciation = trpc.practice.analyzePronunciation.useMutation(...);
  // const transcribeAudio = trpc.practice.transcribeAudio.useMutation(...);
  // const generateSpeech = trpc.practice.generateSpeech.useMutation(...);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

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
      // Get microphone access
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
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        handleRecordingComplete();
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 0.1;
          // Auto-stop after 5 seconds
          if (newTime >= 5) {
            stopRecording();
          }
          return newTime;
        });
      }, 100);

      toast.info("🎤 Recording... Speak the word clearly!");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Microphone access denied. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    setIsRecording(false);
    setAudioLevel(0);
    setRecordingTime(0);
  };

  const handleRecordingComplete = async () => {
    setIsAnalyzing(true);
    toast.info("📊 Analyzing your pronunciation...");

    // Set a 60-second timeout (G    // Set a 60-second timeout (Gemini can take 30-40 seconds)
    const timeoutId = setTimeout(() => {
      setIsAnalyzing(false);
      toast.error('Analysis timed out. Please try again.');
    }, 60000);
    try {
      // Convert audio chunks to blob
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      
      // Convert blob to base64
      const reader = new FileReader();
      const base64Audio = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          // Remove data:audio/webm;base64, prefix
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      // TODO: Restore Gemini API integration
      toast.error("Pronunciation analysis temporarily unavailable. API endpoints need to be restored.");
      setIsAnalyzing(false);
      return;
      
      // Step 1: Transcribe audio using Gemini (DISABLED)
      // const transcript = await transcribeAudio.mutateAsync({...});

      // Step 2: Analyze pronunciation using Gemini (DISABLED)
      // const result = await analyzePronunciation.mutateAsync({...});
      const result: any = null; // Placeholder

      // Check if result has valid scores
      if (!result || !result.scores || typeof result.scores.overall !== 'number') {
        toast.error("Failed to analyze pronunciation. Please try again.");
        setIsAnalyzing(false);
        return;
      }

      onResult(result as PronunciationResult);

      // Generate AI voice feedback (DISABLED)
      const feedbackText = `Your score is ${result.scores.overall} percent. ${result.feedback}`;
      try {
        // TODO: Restore speech generation
        // const feedbackAudio = await generateSpeech.mutateAsync({...});
        const feedbackAudio: any = null; // Placeholder

        // Play AI teacher voice feedback
        if (feedbackAudio) {
          // Convert base64 to PCM data
          const binaryString = atob(feedbackAudio);
          const pcmData = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            pcmData[i] = binaryString.charCodeAt(i);
          }
          
          // Create WAV file from PCM data (24000 Hz, 16-bit, mono)
          const wavBlob = createWavBlob(pcmData, 24000, 1, 16);
          const audioUrl = URL.createObjectURL(wavBlob);
          const audio = new Audio(audioUrl);
          
          audio.onerror = (e) => {
            console.error('Audio playback error:', e);
            URL.revokeObjectURL(audioUrl);
          };
          
          audio.onended = () => URL.revokeObjectURL(audioUrl);
          
          audio.play();
          toast.success("🎤 Teacher feedback", { duration: 3000 });
        }
      } catch (audioError) {
        console.error('Failed to play teacher feedback audio:', audioError);
        // Continue without audio feedback
      }

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
      console.error("Error analyzing pronunciation:", error);
      toast.error("Failed to analyze pronunciation. Please try again.");
    } finally {
      clearTimeout(timeoutId);
      setIsAnalyzing(false);
      chunksRef.current = [];
    }
  };

  const playNativeAudio = async () => {
    try {
      toast.info("🔊 Generating native pronunciation...");
      
      // TODO: Restore Gemini TTS
      toast.error("Text-to-speech temporarily unavailable. API endpoints need to be restored.");
      return;
      
      // Generate speech using Gemini TTS (DISABLED)
      // const audioBase64 = await generateSpeech.mutateAsync({...});
      const audioBase64: any = null; // Placeholder

      if (!audioBase64) {
        throw new Error('No audio data received');
      }

      // Decode base64 to audio buffer
      const audioContext = new AudioContext({ sampleRate: 24000 });

      // Decode base64 string
      const binaryString = atob(audioBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert PCM to AudioBuffer
      const dataInt16 = new Int16Array(bytes.buffer);
      const frameCount = dataInt16.length;
      const buffer = audioContext.createBuffer(1, frameCount, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }

      // Play audio
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.onended = () => toast.success("✅ Audio playback complete");
      source.start();
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error('Failed to play audio. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Recording Timer */}
      {isRecording && (
        <div className="text-2xl font-bold text-primary">
          {recordingTime.toFixed(1)}s / 5.0s
        </div>
      )}

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
          disabled={isRecording || isAnalyzing}
          className="w-20 h-20 rounded-full"
        >
          <Volume2 className="w-8 h-8" />
        </Button>
      </div>

      {/* Status Text */}
      <p className="text-sm text-muted-foreground text-center">
        {isRecording
          ? "🎤 Recording... Speak clearly! (Auto-stops at 5s)"
          : isAnalyzing
          ? "📊 Analyzing pronunciation..."
          : "Click microphone to record, speaker to hear native pronunciation"}
      </p>


    </div>
  );
}

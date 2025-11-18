import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Volume2, Trophy, Zap } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface EnhancedSpeechRecorderProps {
  targetWord: string;
  onTranscript: (transcript: string, score: number, detailed?: any) => void;
}

export default function EnhancedSpeechRecorder({
  targetWord,
  onTranscript,
}: EnhancedSpeechRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [xpPoints, setXpPoints] = useState(0);
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementText, setAchievementText] = useState("");
  const [isPlayingNative, setIsPlayingNative] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
        recognition.maxAlternatives = 1;
        recognitionRef.current = recognition;
      } else {
        toast.error("Speech recognition not supported in this browser. Please use Chrome.");
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Calculate pronunciation score
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

  // Analyze audio level
  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const normalizedLevel = Math.min(100, (average / 128) * 100);
    setAudioLevel(normalizedLevel);

    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  };

  // Handle gamification
  const handleScore = (score: number) => {
    if (score >= 80) {
      const newCombo = comboCount + 1;
      setComboCount(newCombo);
      
      const xpEarned = score >= 95 ? 50 : 30;
      setXpPoints(prev => prev + xpEarned);

      if (newCombo >= 3) {
        setAchievementText(`🔥 ${newCombo}x Combo!`);
        setShowAchievement(true);
        setTimeout(() => setShowAchievement(false), 2000);
      }

      if (score === 100) {
        setAchievementText("🎯 Perfect!");
        setShowAchievement(true);
        setTimeout(() => setShowAchievement(false), 2000);
      }
    } else {
      setComboCount(0);
    }
  };

  const startRecording = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermissionGranted(true);

      // Set up audio analysis
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      // Start analyzing audio
      analyzeAudio();

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = () => {
        // Audio data handled by speech recognition
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        setAudioLevel(0);
        setRecordingProgress(0);
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingProgress(0);

      // Progress animation
      progressIntervalRef.current = setInterval(() => {
        setRecordingProgress(prev => {
          if (prev >= 100) {
            return 100;
          }
          return prev + 2; // 5 seconds total
        });
      }, 100);

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          const confidence = event.results[0][0].confidence;
          const score = calculateScore(transcript, targetWord);
          
          // Stop recording
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
          }
          
          setIsRecording(false);
          
          // Handle gamification
          handleScore(score);
          
          // Call parent callback
          onTranscript(transcript, score, {
            confidence: Math.round(confidence * 100),
            accuracy: score,
            fluency: Math.min(100, score + 10),
            completeness: transcript.toLowerCase().includes(targetWord.toLowerCase()) ? 100 : 50
          });
          
          toast.success(`You said: "${transcript}"`);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          
          if (event.error === "no-speech") {
            toast.error("No speech detected. Please speak louder and try again.");
          } else if (event.error === "not-allowed") {
            toast.error("Microphone permission denied. Please allow microphone access.");
            setPermissionGranted(false);
          } else {
            toast.error("Could not recognize speech. Please try again.");
          }
          
          setIsRecording(false);
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
          }
        };
        
        recognitionRef.current.onend = () => {
          // Auto-stop if no result after timeout
          if (isRecording) {
            setIsRecording(false);
            if (mediaRecorderRef.current) {
              mediaRecorderRef.current.stop();
            }
          }
        };

        recognitionRef.current.start();
        toast.success("🎤 Listening... Speak now!");
      }
    } catch (error: any) {
      console.error("Error starting recording:", error);
      if (error.name === "NotAllowedError") {
        toast.error("Microphone permission denied. Please allow access in your browser settings.");
        setPermissionGranted(false);
      } else {
        toast.error("Could not access microphone. Please check your device.");
      }
      setIsRecording(false);
    }
  };

  const playNativeAudio = () => {
    if (isPlayingNative) {
      speechSynthesis.cancel();
      setIsPlayingNative(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(targetWord);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      
      utterance.onend = () => {
        setIsPlayingNative(false);
      };

      speechSynthesis.speak(utterance);
      setIsPlayingNative(true);
    }
  };

  const getStatusColor = () => {
    if (!isRecording) return "bg-gray-500";
    if (audioLevel < 20) return "bg-red-500";
    if (audioLevel < 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusText = () => {
    if (!isRecording) return "Ready to record";
    if (audioLevel < 20) return "🔴 Speak louder!";
    if (audioLevel < 50) return "🟡 Good, keep going...";
    return "🟢 Perfect! Keep speaking...";
  };

  return (
    <div className="space-y-4">
      {/* Achievement Popup */}
      {showAchievement && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg text-lg font-bold">
            {achievementText}
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="flex gap-4 justify-center">
        <div className="flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="font-bold text-purple-600 dark:text-purple-400">{comboCount}x Combo</span>
        </div>
        <div className="flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
          <Zap className="h-5 w-5 text-blue-500" />
          <span className="font-bold text-blue-600 dark:text-blue-400">{xpPoints} XP</span>
        </div>
      </div>

      {/* Recording Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-6">
            {/* Voice Visualizer */}
            <div className="relative">
              {/* Circular Progress Ring */}
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - recordingProgress / 100)}`}
                  className={`transition-all duration-300 ${getStatusColor()}`}
                  strokeLinecap="round"
                />
              </svg>

              {/* Microphone Button */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Button
                  size="lg"
                  onClick={startRecording}
                  disabled={isRecording}
                  className={`rounded-full h-24 w-24 p-0 transition-all duration-300 ${
                    isRecording 
                      ? 'animate-pulse scale-110' 
                      : 'hover:scale-110'
                  } ${getStatusColor()}`}
                >
                  <Mic className="h-10 w-10 text-white" />
                </Button>
              </div>

              {/* Waveform Bars */}
              {isRecording && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 rounded-full ${getStatusColor()} transition-all duration-100`}
                      style={{
                        height: `${Math.max(4, (audioLevel / 100) * 24 * (1 + Math.sin(Date.now() / 100 + i) * 0.5))}px`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-4 mt-8">
              <Button
                size="lg"
                variant="outline"
                onClick={playNativeAudio}
                disabled={isRecording}
                className="rounded-full h-16 w-16 p-0"
              >
                <Volume2 className={`h-6 w-6 ${isPlayingNative ? 'text-primary animate-pulse' : ''}`} />
              </Button>
            </div>

            {/* Status Text */}
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">
                {getStatusText()}
              </p>
              {!permissionGranted && !isRecording && (
                <p className="text-xs text-red-500 mt-2">
                  ⚠️ Microphone access required
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

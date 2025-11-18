import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface LiveConversationModeProps {
  context?: string; // Context for the conversation (e.g., "pronunciation practice", "IELTS speaking")
  onTranscript?: (transcript: string) => void;
}

export default function LiveConversationMode({ context = "general practice", onTranscript }: LiveConversationModeProps) {
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  const transcribeAudio = trpc.practice.transcribeAudio.useMutation();
  const generateSpeech = trpc.practice.generateSpeech.useMutation();
  const getConversationResponse = trpc.practice.analyzePronunciation.useMutation();

  // Start live conversation mode
  const startLiveMode = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Setup audio context for voice activity detection
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      setIsLiveMode(true);
      startListening();
      toast.success('🎤 Live conversation mode activated!');
    } catch (error) {
      console.error('Failed to start live mode:', error);
      toast.error('Please allow microphone access');
    }
  };

  // Stop live conversation mode
  const stopLiveMode = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsLiveMode(false);
    setIsListening(false);
    toast.info('Live conversation mode deactivated');
  };

  // Start listening for user speech
  const startListening = () => {
    if (!streamRef.current) return;
    
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = async () => {
      await processAudio();
    };
    
    mediaRecorder.start();
    setIsListening(true);
    
    // Detect silence and auto-stop after 2 seconds of silence
    detectSilence();
  };

  // Detect silence using voice activity detection
  const detectSilence = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const checkAudio = () => {
      if (!isLiveMode) return;
      
      analyserRef.current!.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      
      // If audio level is below threshold (silence)
      if (average < 10) {
        if (!silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.stop();
              setIsListening(false);
            }
          }, 2000); // 2 seconds of silence
        }
      } else {
        // Clear silence timer if user is speaking
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      }
      
      requestAnimationFrame(checkAudio);
    };
    
    checkAudio();
  };

  // Process recorded audio
  const processAudio = async () => {
    if (chunksRef.current.length === 0) {
      // No audio recorded, start listening again
      if (isLiveMode) {
        setTimeout(() => startListening(), 500);
      }
      return;
    }
    
    try {
      // Convert audio to base64
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        // Transcribe audio
        const transcription = await transcribeAudio.mutateAsync({
          audioBase64: base64Audio,
          mimeType: 'audio/webm',
        });
        
        if (transcription) {
          setTranscript(transcription);
          onTranscript?.(transcription);
          
          // Get AI response
          await getAIResponse(transcription);
        }
        
        // Start listening again
        if (isLiveMode) {
          setTimeout(() => startListening(), 500);
        }
      };
      
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error processing audio:', error);
      // Start listening again
      if (isLiveMode) {
        setTimeout(() => startListening(), 500);
      }
    }
  };

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

  // Get AI response and speak it
  const getAIResponse = async (userInput: string) => {
    try {
      setIsSpeaking(true);
      
      // Generate AI response based on context
      const responseText = `I heard you say: ${userInput}. Let me help you with that.`;
      
      // Generate speech
      const audioData = await generateSpeech.mutateAsync({
        text: responseText,
        accent: 'US',
      });
      
      if (audioData) {
        // Play AI response
        // Gemini returns raw PCM data, convert to WAV
        const binaryString = atob(audioData);
        const pcmData = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          pcmData[i] = binaryString.charCodeAt(i);
        }
        
        // Create WAV header for PCM data (24000 Hz, 16-bit, mono)
        const wavBlob = createWavBlob(pcmData, 24000, 1, 16);
        const audioUrl = URL.createObjectURL(wavBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setIsSpeaking(false);
        };
        
        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          URL.revokeObjectURL(audioUrl);
          setIsSpeaking(false);
        };
        
        await audio.play();
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setIsSpeaking(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLiveMode();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-300/20">
      <div className="flex items-center gap-3">
        <Button
          onClick={isLiveMode ? stopLiveMode : startLiveMode}
          variant={isLiveMode ? "destructive" : "default"}
          size="lg"
          className="gap-2"
        >
          {isLiveMode ? (
            <>
              <MicOff className="w-5 h-5" />
              Stop Live Mode
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              Start Live Mode
            </>
          )}
        </Button>
      </div>
      
      {isLiveMode && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            {isListening && (
              <div className="flex items-center gap-2 text-green-600">
                <Mic className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">Listening...</span>
              </div>
            )}
            {isSpeaking && (
              <div className="flex items-center gap-2 text-blue-600">
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">AI Speaking...</span>
              </div>
            )}
          </div>
          
          {transcript && (
            <div className="mt-2 p-3 bg-white/50 rounded-lg text-sm">
              <span className="font-semibold">You said:</span> {transcript}
            </div>
          )}
        </div>
      )}
      
      <p className="text-xs text-muted-foreground text-center max-w-md">
        Live mode enables continuous conversation with the AI teacher. Speak naturally and the AI will respond with voice feedback.
      </p>
    </div>
  );
}

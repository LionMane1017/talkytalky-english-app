import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  
  const generateSpeechMutation = trpc.practice.generateSpeech.useMutation();

  const speak = useCallback(async (text: string) => {
    try {
      // Stop any ongoing speech
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      setIsSpeaking(true);

      try {
        // Try Gemini Live API first
        const result = await generateSpeechMutation.mutateAsync({ text });

        // Try to play audio with standard Audio element first
        const audioDataUrl = `data:audio/pcm;rate=24000;base64,${result.audioBase64}`;
        const audio = new Audio(audioDataUrl);
        setCurrentAudio(audio);

        audio.onended = () => {
          setIsSpeaking(false);
          setCurrentAudio(null);
        };

        audio.onerror = async () => {
          // Fallback to AudioContext for raw PCM 24kHz
          console.log("Audio element failed, trying AudioContext for PCM...");
          try {
            const ctx = new AudioContext();
            const binaryString = atob(result.audioBase64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const audioBuffer = await ctx.decodeAudioData(bytes.buffer);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.onended = () => {
              setIsSpeaking(false);
              setCurrentAudio(null);
            };
            source.start(0);
          } catch (pcmError) {
            console.error("PCM decoding failed:", pcmError);
            setIsSpeaking(false);
            setCurrentAudio(null);
            throw pcmError;
          }
        };

        try {
          await audio.play();
        } catch (playError) {
          // If play() fails, trigger the error handler
          audio.onerror?.(new Event('error'));
        }
      } catch (apiError: any) {
        // Fallback to browser TTS if Gemini API fails (rate limit, etc.)
        console.warn("Gemini TTS failed, falling back to browser TTS:", apiError.message);
        
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          
          utterance.onend = () => {
            setIsSpeaking(false);
          };
          
          utterance.onerror = () => {
            setIsSpeaking(false);
            console.error("Browser TTS also failed");
          };
          
          window.speechSynthesis.speak(utterance);
        } else {
          setIsSpeaking(false);
          throw new Error("No TTS available");
        }
      }
    } catch (error) {
      console.error("Text-to-speech failed:", error);
      setIsSpeaking(false);
    }
  }, [currentAudio, generateSpeechMutation]);

  const stop = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setIsSpeaking(false);
  }, [currentAudio]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported: true, // Gemini API is always supported
  };
}

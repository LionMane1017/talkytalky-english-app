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

        // Create audio element and play
        const audio = new Audio(`data:audio/mp3;base64,${result.audioBase64}`);
        setCurrentAudio(audio);

        audio.onended = () => {
          setIsSpeaking(false);
          setCurrentAudio(null);
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          setCurrentAudio(null);
          console.error("Failed to play audio");
        };

        await audio.play();
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

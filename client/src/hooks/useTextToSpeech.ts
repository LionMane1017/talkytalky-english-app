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

      // Generate speech using Gemini Live API
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

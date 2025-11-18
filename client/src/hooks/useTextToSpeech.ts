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
      
      // Stop any ongoing speech synthesis
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      setIsSpeaking(true);

      // Use high-quality browser TTS as primary
      if ('speechSynthesis' in window) {
        // Get available voices
        let voices = window.speechSynthesis.getVoices();
        
        // If voices aren't loaded yet, wait for them
        if (voices.length === 0) {
          await new Promise<void>((resolve) => {
            window.speechSynthesis.onvoiceschanged = () => {
              voices = window.speechSynthesis.getVoices();
              resolve();
            };
          });
        }

        // Select best quality female voice
        // Priority: Google > Microsoft > Apple > Default
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Google') && 
          voice.lang.startsWith('en') &&
          (voice.name.includes('Female') || voice.name.includes('US'))
        ) || voices.find(voice => 
          voice.name.includes('Microsoft') && 
          voice.lang.startsWith('en') &&
          voice.name.includes('Zira')
        ) || voices.find(voice => 
          voice.name.includes('Samantha') ||
          voice.name.includes('Karen') ||
          voice.name.includes('Victoria')
        ) || voices.find(voice => 
          voice.lang.startsWith('en') &&
          !voice.name.includes('Male')
        ) || voices[0];

        const utterance = new SpeechSynthesisUtterance(text);
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        // Optimize for clarity and naturalness
        utterance.rate = 0.85; // Slightly slower for clarity
        utterance.pitch = 1.05; // Slightly higher for pleasant female voice
        utterance.volume = 1.0;
        
        utterance.onend = () => {
          setIsSpeaking(false);
        };
        
        utterance.onerror = (event) => {
          console.error("Browser TTS error:", event);
          setIsSpeaking(false);
        };
        
        window.speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
        throw new Error("Speech synthesis not supported");
      }
    } catch (error) {
      console.error("Text-to-speech failed:", error);
      setIsSpeaking(false);
    }
  }, [currentAudio]);

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

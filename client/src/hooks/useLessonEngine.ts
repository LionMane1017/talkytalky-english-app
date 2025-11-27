/**
 * Gemini 3 Master Architecture: Lesson Engine Hook
 * 
 * This hook manages word state, navigation, and synchronization with Gemini.
 * It implements debouncing to handle rapid word skipping without confusing the AI.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { GeminiProtocols } from '../lib/gemini/prompts';

export interface VocabularyWord {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  difficulty: string;
}

export interface UseLessonEngineProps {
  initialWords: VocabularyWord[];
  startIndex: number;
  sendToGemini: (msg: string) => void;
}

export const useLessonEngine = ({
  initialWords,
  startIndex,
  sendToGemini
}: UseLessonEngineProps) => {
  const [words, setWords] = useState<VocabularyWord[]>(initialWords);
  const [index, setIndex] = useState(startIndex);
  const [isComplete, setIsComplete] = useState(false);

  // Refs for "Rapid Skip" protection
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastSentIndex = useRef<number>(-1);

  // 1. Navigation Logic
  const nextWord = useCallback(() => {
    if (index < words.length - 1) {
      setIndex(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  }, [index, words.length]);
  
  const prevWord = useCallback(() => {
    if (index > 0) {
      setIndex(prev => prev - 1);
    }
  }, [index]);

  const jumpTo = useCallback((newIndex: number) => {
    if (newIndex >= 0 && newIndex < words.length) {
      setIndex(newIndex);
    }
  }, [words.length]);

  // 2. The Synchronization Engine (Debounced Gemini Updates)
  useEffect(() => {
    // If we haven't loaded words yet, do nothing
    if (!words || words.length === 0) return;

    const currentWord = words[index];
    if (!currentWord) return;

    // Clear previous timer (user is clicking fast)
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer (wait 350ms for user to settle)
    debounceTimer.current = setTimeout(() => {
      // Only send if we haven't already sent this index
      if (lastSentIndex.current !== index) {
        console.log(`📡 Syncing Gemini to Word ${index + 1}/${words.length}: "${currentWord.word}"`);
        
        const payload = GeminiProtocols.createWordPayload(currentWord, index, words.length);
        sendToGemini(JSON.stringify(payload));
        
        lastSentIndex.current = index;
      }
    }, 350); // 350ms debounce

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [index, words, sendToGemini]);

  return {
    // Current state
    currentWord: words[index],
    currentIndex: index,
    totalWords: words.length,
    isComplete,
    
    // Navigation
    nextWord,
    prevWord,
    jumpTo,
    
    // State setters (for external updates)
    setWords,
    setIndex
  };
};

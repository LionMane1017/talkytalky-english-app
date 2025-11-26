import { describe, it, expect } from 'vitest';
import { vocabularyData } from '../client/src/data/vocabulary';

describe('Vocabulary Data Validation', () => {
  describe('Duplicate Detection', () => {
    it('should have no duplicate words within same difficulty level', () => {
      const difficulties = ['beginner', 'intermediate', 'advanced'];
      
      for (const difficulty of difficulties) {
        const words = vocabularyData
          .filter(v => v.difficulty === difficulty)
          .map(v => v.word.toLowerCase());
        
        const uniqueWords = new Set(words);
        expect(uniqueWords.size).toBe(words.length);
      }
    });

    it('should have no duplicate IDs', () => {
      const ids = vocabularyData.map(v => v.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have zero duplicate entries', () => {
      const wordMap = new Map<string, number>();
      let duplicateCount = 0;

      for (const word of vocabularyData) {
        const key = `${word.word.toLowerCase()}-${word.difficulty}`;
        if (wordMap.has(key)) {
          duplicateCount++;
        } else {
          wordMap.set(key, 1);
        }
      }

      expect(duplicateCount).toBe(0);
    });
  });

  describe('Word Distribution', () => {
    it('should have at least 50 beginner words', () => {
      const beginnerCount = vocabularyData.filter(v => v.difficulty === 'beginner').length;
      expect(beginnerCount).toBeGreaterThanOrEqual(50);
    });

    it('should have at least 60 intermediate words', () => {
      const intermediateCount = vocabularyData.filter(v => v.difficulty === 'intermediate').length;
      expect(intermediateCount).toBeGreaterThanOrEqual(60);
    });

    it('should have at least 75 advanced words', () => {
      const advancedCount = vocabularyData.filter(v => v.difficulty === 'advanced').length;
      expect(advancedCount).toBeGreaterThanOrEqual(75);
    });

    it('should have at least 185 total unique words', () => {
      expect(vocabularyData.length).toBeGreaterThanOrEqual(185);
    });
  });

  describe('Data Integrity', () => {
    it('should have all required fields for each word', () => {
      for (const word of vocabularyData) {
        expect(word.id).toBeDefined();
        expect(word.word).toBeDefined();
        expect(word.phonetic).toBeDefined();
        expect(word.meaning).toBeDefined();
        expect(word.example).toBeDefined();
        expect(word.difficulty).toBeDefined();
        expect(word.category).toBeDefined();
      }
    });

    it('should have valid difficulty levels', () => {
      const validDifficulties = ['beginner', 'intermediate', 'advanced'];
      for (const word of vocabularyData) {
        expect(validDifficulties).toContain(word.difficulty);
      }
    });

    it('should have non-empty word strings', () => {
      for (const word of vocabularyData) {
        expect(word.word.trim().length).toBeGreaterThan(0);
        expect(word.meaning.trim().length).toBeGreaterThan(0);
        expect(word.example.trim().length).toBeGreaterThan(0);
      }
    });

    it('should have valid phonetic format', () => {
      for (const word of vocabularyData) {
        // Phonetic should start and end with /
        expect(word.phonetic).toMatch(/^\/.*\/$/);
      }
    });
  });

  describe('Cross-Level Validation', () => {
    it('should not have same words across different difficulty levels', () => {
      const beginnerWords = new Set(
        vocabularyData
          .filter(v => v.difficulty === 'beginner')
          .map(v => v.word.toLowerCase())
      );

      const intermediateWords = vocabularyData
        .filter(v => v.difficulty === 'intermediate')
        .map(v => v.word.toLowerCase());

      const advancedWords = vocabularyData
        .filter(v => v.difficulty === 'advanced')
        .map(v => v.word.toLowerCase());

      // Check no beginner words in intermediate
      for (const word of intermediateWords) {
        expect(beginnerWords.has(word)).toBe(false);
      }

      // Check no beginner words in advanced
      for (const word of advancedWords) {
        expect(beginnerWords.has(word)).toBe(false);
      }
    });
  });

  describe('ID Validation', () => {
    it('should have sequential or properly formatted IDs', () => {
      const ids = vocabularyData.map(v => parseInt(v.id, 10)).sort((a, b) => a - b);
      
      // IDs should be numeric
      for (const id of ids) {
        expect(Number.isInteger(id)).toBe(true);
      }
    });

    it('should have unique numeric IDs', () => {
      const ids = vocabularyData.map(v => v.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Category Validation', () => {
    it('should have valid categories', () => {
      const validCategories = ['Nouns', 'Verbs', 'Adjectives', 'Adverbs', 'Greetings', 'Expressions'];
      
      for (const word of vocabularyData) {
        expect(validCategories).toContain(word.category);
      }
    });

    it('should have consistent category usage', () => {
      const categories = new Set(vocabularyData.map(v => v.category));
      expect(categories.size).toBeGreaterThan(0);
    });
  });

  describe('Remediation Success Metrics', () => {
    it('should have exactly 0 duplicates (remediation success)', () => {
      const wordDifficultyMap = new Map<string, Set<string>>();

      for (const word of vocabularyData) {
        const key = word.word.toLowerCase();
        if (!wordDifficultyMap.has(key)) {
          wordDifficultyMap.set(key, new Set());
        }
        wordDifficultyMap.get(key)!.add(word.difficulty);
      }

      let duplicateCount = 0;
      for (const [word, difficulties] of wordDifficultyMap) {
        if (difficulties.size > 1) {
          duplicateCount++;
        }
      }

      expect(duplicateCount).toBe(0);
    });

    it('should have expanded vocabulary from 134 to 185 words', () => {
      expect(vocabularyData.length).toBe(185);
    });

    it('should maintain proper distribution', () => {
      const beginnerCount = vocabularyData.filter(v => v.difficulty === 'beginner').length;
      const intermediateCount = vocabularyData.filter(v => v.difficulty === 'intermediate').length;
      const advancedCount = vocabularyData.filter(v => v.difficulty === 'advanced').length;

      expect(beginnerCount).toBe(50);
      expect(intermediateCount).toBe(60);
      expect(advancedCount).toBe(75);
    });
  });
});

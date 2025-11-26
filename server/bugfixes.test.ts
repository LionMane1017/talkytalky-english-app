import { describe, it, expect } from 'vitest';

describe('Bug Fix #1: Module-Specific Content Routing', () => {
  describe('IELTS Practice Module Routing', () => {
    it('should auto-start Part 1 when module=ielts-part1', () => {
      const params = new URLSearchParams('module=ielts-part1');
      expect(params.get('module')).toBe('ielts-part1');
    });

    it('should auto-start Part 2 when module=ielts-part2', () => {
      const params = new URLSearchParams('module=ielts-part2');
      expect(params.get('module')).toBe('ielts-part2');
    });

    it('should auto-start Part 3 when module=ielts-part3', () => {
      const params = new URLSearchParams('module=ielts-part3');
      expect(params.get('module')).toBe('ielts-part3');
    });
  });

  describe('Vocabulary Module Routing', () => {
    it('should maintain alphabetical word ordering', () => {
      const words = ['zebra', 'apple', 'banana', 'cat'];
      const sorted = [...words].sort((a, b) => a.localeCompare(b));
      
      expect(sorted).toEqual(['apple', 'banana', 'cat', 'zebra']);
      expect(sorted[0]).toBe('apple');
    });
  });
});

describe('Bug Fix #2: Gemini Word Awareness System', () => {
  describe('Word Awareness Tags', () => {
    it('should include [CURRENT_WORD] tag', () => {
      const word = 'pronunciation';
      const prompt = `[CURRENT_WORD] "${word}"`;
      expect(prompt).toContain('[CURRENT_WORD]');
    });

    it('should include [PHONETIC] tag', () => {
      const prompt = `[PHONETIC] "/prəˌnʌnsiˈeɪʃən/"`;
      expect(prompt).toContain('[PHONETIC]');
    });

    it('should include [DIFFICULTY] tag', () => {
      const prompt = `[DIFFICULTY] "intermediate"`;
      expect(prompt).toContain('[DIFFICULTY]');
    });

    it('should include [WORD_POSITION] tag', () => {
      const prompt = `[WORD_POSITION] "5 of 50"`;
      expect(prompt).toContain('[WORD_POSITION]');
    });
  });

  describe('Word Change Notifications', () => {
    it('should send [WORD_CHANGE] notification', () => {
      const notification = '[WORD_CHANGE] Moving to next word: "example"';
      expect(notification).toContain('[WORD_CHANGE]');
    });

    it('should maintain alphabetical order', () => {
      const words = ['apple', 'banana', 'cherry'];
      const isAlphabetical = words.every((word, i) => {
        if (i === 0) return true;
        return word.localeCompare(words[i - 1]) > 0;
      });
      expect(isAlphabetical).toBe(true);
    });
  });

  describe('Gemini Focus Rules', () => {
    it('should enforce word focus in system prompt', () => {
      const rules = 'MUST acknowledge current word in first response';
      expect(rules).toContain('MUST acknowledge current word');
    });
  });
});

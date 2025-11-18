import { describe, it, expect } from 'vitest';
import * as gemini from './geminiService';

describe('Gemini API Integration', () => {
  it('should generate speech from text', async () => {
    const text = 'hello';
    const audioBase64 = await gemini.generateSpeech(text, 'US');
    
    expect(audioBase64).toBeTruthy();
    expect(typeof audioBase64).toBe('string');
    expect(audioBase64.length).toBeGreaterThan(0);
  }, 30000); // 30 second timeout for API call

  it('should transcribe audio (mock test)', async () => {
    // This is a placeholder - real audio transcription requires actual audio data
    // For now, we'll just verify the function exists and has correct signature
    expect(typeof gemini.transcribeAudio).toBe('function');
  });

  it('should analyze pronunciation', async () => {
    const result = await gemini.getPronunciationAnalysis(
      'hello',
      'hello',
      'beginner'
    );
    
    expect(result).toBeTruthy();
    expect(result.success).toBe(true);
    expect(result.scores).toBeTruthy();
    expect(result.scores.overall).toBeGreaterThanOrEqual(0);
    expect(result.scores.overall).toBeLessThanOrEqual(100);
    expect(result.phonemeAnalysis).toBeInstanceOf(Array);
    expect(result.feedback).toBeTruthy();
    expect(result.suggestions).toBeInstanceOf(Array);
  }, 30000); // 30 second timeout for API call
});

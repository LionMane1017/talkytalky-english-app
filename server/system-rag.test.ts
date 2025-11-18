/**
 * System RAG Integration Tests
 * Tests the Hybrid RAG system (User History + System Knowledge)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { getDb } from '../server/db';
import { systemKnowledge } from '../drizzle/schema';
import { getSmartContext } from '../server/ragService';

describe('System RAG Integration', () => {
  let testUserId: number;

  beforeAll(async () => {
    // Use a test user ID (1 is typically the first user)
    testUserId = 1;
  });

  it('should have knowledge base seeded', async () => {
    const db = await getDb();
    expect(db).toBeDefined();

    const knowledge = await db!.select().from(systemKnowledge);
    
    // Should have at least the 22 entries we seeded
    expect(knowledge.length).toBeGreaterThanOrEqual(22);
    
    // Check for IELTS rubric entries
    const ieltsEntries = knowledge.filter(k => k.category === 'IELTS_RUBRIC');
    expect(ieltsEntries.length).toBeGreaterThanOrEqual(12);
    
    // Check for pronunciation guides
    const pronunciationEntries = knowledge.filter(k => k.category === 'PRONUNCIATION');
    expect(pronunciationEntries.length).toBeGreaterThanOrEqual(4);
    
    // Verify embeddings exist
    const entriesWithEmbeddings = knowledge.filter(k => k.embedding);
    expect(entriesWithEmbeddings.length).toBe(knowledge.length);
  });

  it('should retrieve smart context for IELTS topic', async () => {
    const context = await getSmartContext(testUserId, 'IELTS Speaking Practice');
    
    // Should return a non-empty string
    expect(context).toBeTruthy();
    expect(typeof context).toBe('string');
    
    // Should contain expert knowledge section
    expect(context).toContain('📚 EXPERT KNOWLEDGE BASE');
    
    // Should contain instruction section
    expect(context).toContain('🎯 INSTRUCTION');
    
    // Should mention TalkyTalky
    expect(context).toContain('TalkyTalky');
    
    // Should reference IELTS
    expect(context).toContain('IELTS');
  });

  it('should retrieve smart context for pronunciation topic', async () => {
    const context = await getSmartContext(testUserId, 'TH sound pronunciation');
    
    expect(context).toBeTruthy();
    
    // Should contain relevant pronunciation knowledge
    // The semantic search should find the TH sound entry
    expect(context.toLowerCase()).toContain('pronunciation');
  });

  it('should retrieve smart context for vocabulary topic', async () => {
    const context = await getSmartContext(testUserId, 'Business English vocabulary');
    
    expect(context).toBeTruthy();
    
    // Should contain relevant vocabulary knowledge
    expect(context.toLowerCase()).toContain('vocabulary');
  });

  it('should handle missing GEMINI_API_KEY gracefully', async () => {
    // Temporarily remove the API key
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    
    const context = await getSmartContext(testUserId, 'Test topic');
    
    // Should return empty string or fallback context
    expect(typeof context).toBe('string');
    
    // Restore the API key
    process.env.GEMINI_API_KEY = originalKey;
  });

  it('should combine user history and system knowledge', async () => {
    const context = await getSmartContext(testUserId, 'IELTS fluency improvement');
    
    expect(context).toBeTruthy();
    
    // Should have both sections (if user has history)
    // At minimum, should have expert knowledge
    expect(context).toContain('📚 EXPERT KNOWLEDGE BASE');
    
    // Should have instruction
    expect(context).toContain('🎯 INSTRUCTION');
  });
});

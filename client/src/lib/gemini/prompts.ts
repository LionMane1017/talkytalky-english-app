/**
 * Gemini 3 Master Architecture: AI Coach Prompts & Protocols
 * 
 * This module handles all Gemini Live system prompts and context injection.
 * It ensures the AI always knows the current lesson context and word state.
 */

export interface WordPayload {
  type: "CONTEXT_UPDATE";
  timestamp: number;
  state: {
    index: number;
    total: number;
    currentWord: string;
    phonetic: string;
    definition: string;
    example: string;
  };
  instruction: string;
}

export const GeminiProtocols = {
  /**
   * Constructs the initial "Persona" prompt.
   * Injects the lesson context immediately so AI is never lost.
   */
  buildSystemPrompt: (lessonTitle: string, importance: string, context: string, totalWords: number) => `
You are **TalkyTalky**, an expert IELTS pronunciation coach.

### 🎯 CURRENT LESSON
**Topic:** "${lessonTitle}"
**Goal:** ${importance}
**Context:** ${context}
**Total Words:** ${totalWords}

### ⚡ REAL-TIME PROTOCOL (CRITICAL)
1. **STATE UPDATES:** You will receive JSON messages labeled "CONTEXT_UPDATE". 
   - Always align your topic to the "currentWord" in that JSON.
   - If the user skips words, ABANDON the previous word immediately.
2. **TEACHING STYLE:**
   - Be concise (2 sentences max for intros).
   - Vary your openings ("Next up...", "Let's try...", "Moving on...", "Here's...", "Now practice...").
   - Focus on the *usage* of the word in the context of "${lessonTitle}".
3. **FEEDBACK:**
   - Listen to user audio carefully.
   - Provide a score (0-100) and 1 specific tip for improvement.
   - Be encouraging and positive.

### 📋 YOUR OPERATIONAL RULES
- **NO REPETITION:** Never use the same introduction phrase twice in a row.
- **STAY FOCUSED:** Only discuss the word in the current CONTEXT_UPDATE JSON.
- **HANDLE SKIPS:** If you receive a new word while speaking, stop and switch immediately.
- **BE BRIEF:** Keep responses under 3 sentences unless explaining a complex concept.

Start by introducing the lesson topic and waiting for the first word context update!
`,

  /**
   * Creates the rigid JSON payload for word changes.
   * This replaces "Chatting" with "State Injection".
   */
  createWordPayload: (word: any, index: number, total: number): WordPayload => ({
    type: "CONTEXT_UPDATE",
    timestamp: Date.now(),
    state: {
      index: index + 1,
      total: total,
      currentWord: word.word,
      phonetic: word.phonetic,
      definition: word.meaning,
      example: word.example
    },
    // Hidden instruction to force attention
    instruction: `Focus ONLY on "${word.word}". Introduce it briefly with a fresh delivery style.`
  })
};

/**
 * Gemini Protocols - AI Coach Enhanced (Claude's Architecture)
 * 
 * Versioned JSON protocols for robust Gemini Live integration.
 * Includes lesson-aware prompts and structured word state payloads.
 */

// ========== Protocol V2.0 Types ==========

export interface WordStatePayload {
  protocol: "TALKY_WORD_STATE_V2";
  timestamp: number;

  // Current word context
  currentWord: {
    id: string;
    word: string;
    phonetic: string;
    meaning: string;
    example: string;
    difficulty: "beginner" | "intermediate" | "advanced";
  };

  // Lesson context
  lesson: {
    id: string;
    title: string;
    importance: string;
    topicContext: string;
  };

  // Progress tracking
  progress: {
    currentIndex: number; // 0-based
    totalWords: number;
    completedWords: number;
    isRandomized: boolean;
  };

  // Session metadata
  session: {
    sessionId: number;
    startedAt: number; // Unix timestamp
  };

  // Instruction for AI
  instruction: string;
}

export interface LessonIntroPayload {
  protocol: "TALKY_LESSON_START_V2";
  timestamp: number;

  lesson: {
    id: string;
    title: string;
    importance: string;
    topicContext: string;
    totalWords: number;
    vocabularyPreview: string[]; // First 3-5 words
  };

  sessionConfig: {
    sessionId: number;
    isRandomized: boolean;
    difficulty: "beginner" | "intermediate" | "advanced";
  };

  instruction: string;
}

// ========== Legacy Protocol (for backward compatibility) ==========

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

// ========== Protocol Functions ==========

export const GeminiProtocols = {
  /**
   * Build lesson-aware system prompt with delivery variations
   */
  buildLessonAwarePrompt: (
    lessonTitle: string,
    importance: string,
    context: string,
    totalWords: number,
    variation: number = 0
  ): string => {
    const openings = [
      "Welcome to your lesson on",
      "Let's dive into",
      "Today we're mastering",
      "Get ready to explore",
      "Time to practice"
    ];

    const opener = openings[variation % openings.length];

    return `You are **TalkyTalky**, an expert IELTS pronunciation coach with a warm, encouraging personality.

### 🎓 CURRENT LESSON CONTEXT
${opener} **"${lessonTitle}"**!

**Why This Matters**: ${importance}

**Real-World Application**: ${context}

**Lesson Structure**: You'll guide the user through ${totalWords} essential words for this topic.

### ⚡ YOUR COACHING PROTOCOL

1. **STATE SYNCHRONIZATION (CRITICAL)**
   - You receive structured JSON payloads with protocol identifiers ("TALKY_WORD_STATE_V2" and "TALKY_LESSON_START_V2")
   - ALWAYS use the word from the most recent "TALKY_WORD_STATE_V2" payload
   - The "currentWord" field is your SINGLE SOURCE OF TRUTH
   - If you receive a new word while speaking, ABANDON previous word immediately

2. **LESSON INTRODUCTION (First Interaction)**
   - Greet the user warmly and introduce the lesson topic
   - Explain why "${lessonTitle}" matters for IELTS/real-world communication
   - Preview what they'll learn (keep it brief, 2-3 sentences)
   - Then introduce the first word enthusiastically

3. **WORD COACHING FLOW**
   - **Introduce**: Present each word with context related to "${lessonTitle}"
   - **Demonstrate**: Say the word clearly (your audio will play)
   - **Listen**: Wait for user to practice pronunciation
   - **Feedback**: Give specific, actionable tip + score (0-100)
   - **Encourage**: Ask playfully: "Ready for the next word, or want to practice again?"

4. **DELIVERY VARIATION (CRITICAL FOR ENGAGEMENT)**
   - **NEVER** use the same introduction opening twice in a row
   - Rotate these patterns:
     * "Next up: [word]..."
     * "Let's try [word]..."
     * "Here's an important one: [word]..."
     * "Moving on to [word]..."
     * "Now practice [word]..."
   - Keep introductions to 1-2 sentences max
   
5. **PERSONALITY TRAITS**
   - Warm and encouraging (like a supportive friend)
   - Enthusiastic about progress ("Great job!", "Well done!", "Excellent!")
   - Patient and positive even when pronunciation needs work
   - Contextual (always relate words to "${lessonTitle}")

### 📋 OPERATIONAL RULES
- **BE BRIEF**: Max 3 sentences per response unless explaining complex concept
- **STAY FOCUSED**: Only discuss the current word from the JSON payload
- **BE INTERACTIVE**: Always end with a question or prompt for next action
- **NEVER REPEAT**: Vary your delivery style constantly

Ready to start coaching? Wait for the lesson introduction payload!`;
  },

  /**
   * Create lesson introduction payload (sent once at session start)
   */
  createLessonIntroPayload: (
    lesson: {
      id: string;
      title: string;
      importance: string;
      topicContext: string;
      totalWords: number;
      vocabularyPreview: string[];
    },
    sessionId: number,
    isRandomized: boolean,
    difficulty: "beginner" | "intermediate" | "advanced"
  ): LessonIntroPayload => ({
    protocol: "TALKY_LESSON_START_V2",
    timestamp: Date.now(),
    lesson,
    sessionConfig: {
      sessionId,
      isRandomized,
      difficulty,
    },
    instruction: "Introduce this lesson warmly. Explain its importance and preview the vocabulary we'll practice. Then wait for the first word payload.",
  }),

  /**
   * Create enhanced word payload with full lesson context (V2.0)
   */
  createEnhancedWordPayload: (
    word: any,
    index: number,
    total: number,
    lesson: { id: string; title: string; importance: string; topicContext: string },
    sessionId: number,
    completedWords: number,
    isRandomized: boolean
  ): WordStatePayload => ({
    protocol: "TALKY_WORD_STATE_V2",
    timestamp: Date.now(),
    currentWord: {
      id: word.id,
      word: word.word,
      phonetic: word.phonetic,
      meaning: word.meaning,
      example: word.example,
      difficulty: word.difficulty,
    },
    lesson,
    progress: {
      currentIndex: index,
      totalWords: total,
      completedWords,
      isRandomized,
    },
    session: {
      sessionId,
      startedAt: Date.now(),
    },
    instruction: `Focus on "${word.word}" in the context of ${lesson.title}. Introduce it with a fresh delivery style. Be enthusiastic and encouraging!`,
  }),

  /**
   * Legacy: Original simplified system prompt (for backward compatibility)
   */
  buildSystemPrompt: (lessonTitle: string, importance: string, context: string, totalWords: number) => `
You are **TalkyTalky**, an expert IELTS pronunciation coach with a warm, encouraging personality.

### 🎯 CURRENT LESSON
**Topic:** "${lessonTitle}"
**Goal:** ${importance}
**Context:** ${context}
**Total Words:** ${totalWords}

### ⚡ REAL-TIME PROTOCOL (CRITICAL)
1. **STATE UPDATES:** You will receive JSON messages labeled "CONTEXT_UPDATE". 
   - Always align your topic to the "currentWord" in that JSON.
   - If the user skips words, ABANDON the previous word immediately.

2. **YOUR PERSONALITY:**
   - Be warm, encouraging, and conversational - like a supportive friend!
   - Use encouraging phrases: "Great!", "Well done!", "Excellent!", "Nice try!", "Good effort!"
   - Make learning fun and engaging.
   - Show genuine interest in the user's progress.

3. **TEACHING FLOW:**
   - Introduce each word immediately and enthusiastically.
   - Vary your openings: "Next up...", "Let's try...", "Moving on...", "Here's...", "Now practice..."
   - Focus on the usage of the word in the context of "${lessonTitle}".
   - Be concise (2 sentences max for intros).

4. **FEEDBACK & INTERACTION:**
   - Listen to user audio carefully.
   - Provide a score (0-100) and 1 specific tip for improvement.
   - ALWAYS ask a follow-up question: "Want to practice this word again, or shall we move to the next one?"
   - Be positive and supportive even if the pronunciation needs work.

### 📋 YOUR OPERATIONAL RULES
- **NO REPETITION:** Never use the same introduction phrase twice in a row.
- **STAY FOCUSED:** Only discuss the word in the current CONTEXT_UPDATE JSON.
- **HANDLE SKIPS:** If you receive a new word while speaking, stop and switch immediately.
- **BE BRIEF:** Keep responses under 3 sentences unless explaining a complex concept.
- **ALWAYS INTERACTIVE:** After feedback, always ask if they want to practice again or move on.
- **BE WARM:** Remember, you're a supportive coach, not a cold evaluator!

Start by introducing the lesson topic and the first word! Be enthusiastic and warm!
`,

  /**
   * Legacy: Original simple word payload (for backward compatibility)
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
    instruction: `Focus ONLY on "${word.word}". Introduce it immediately with enthusiasm and warmth. Be encouraging!`
  })
};

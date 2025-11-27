/**
 * Gemini 3 Master Architecture: Lesson Service (tRPC)
 * 
 * Handles session creation, resumption, randomization, and progress tracking.
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export const lessonRouter = router({
  /**
   * Start or resume a lesson session
   * Returns the word order and current progress
   */
  startSession: publicProcedure
    .input(z.object({
      userId: z.string(),
      lessonId: z.string(),
      wantRandomization: z.boolean().default(false),
      forceRestart: z.boolean().default(false)
    }))
    .mutation(async ({ input }: any) => {
      const { userId, lessonId, wantRandomization, forceRestart } = input;

      // A. Check for existing active session
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const existingSessions = await db.execute(sql`
        SELECT * FROM lesson_sessions 
        WHERE user_id = ${userId} 
          AND lesson_id = ${lessonId} 
          AND status = 'IN_PROGRESS' 
        LIMIT 1
      `);

      let session = existingSessions[0] as any;

      // B. Handle Force Restart (Abandon old session)
      if (session && forceRestart) {
        await db!.execute(sql`
          UPDATE lesson_sessions 
          SET status = 'ABANDONED', updated_at = NOW() 
          WHERE id = ${session.id}
        `);
        session = null;
      }

      // C. Create New Session if needed
      if (!session) {
        // Fetch default word IDs for this lesson
        const lessonData = await db!.execute(sql`
          SELECT word_ids FROM learning_path_lessons WHERE id = ${lessonId}
        `);

        if (!lessonData[0]) {
          throw new Error("Lesson not found");
        }

        let wordIds: string[] = JSON.parse((lessonData[0] as any).word_ids || '[]');

        // Randomize if requested (Fisher-Yates shuffle)
        if (wantRandomization && wordIds.length > 0) {
          for (let i = wordIds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [wordIds[i], wordIds[j]] = [wordIds[j], wordIds[i]];
          }
        }

        // Insert new session
        const newSessionResult = await db!.execute(sql`
          INSERT INTO lesson_sessions 
            (user_id, lesson_id, word_order_ids, is_randomized, current_index, status)
          VALUES 
            (${userId}, ${lessonId}, ${JSON.stringify(wordIds)}, ${wantRandomization}, 0, 'IN_PROGRESS')
          RETURNING *
        `);

        session = newSessionResult[0];
      }

      // D. Fetch full word objects in the correct order
      const wordOrderIds = typeof session.word_order_ids === 'string' 
        ? JSON.parse(session.word_order_ids) 
        : session.word_order_ids;

      if (!wordOrderIds || wordOrderIds.length === 0) {
        return {
          sessionId: session.id,
          words: [],
          startIndex: 0,
          isRandomized: session.is_randomized || false
        };
      }

      // Fetch vocabulary words
      const placeholders = wordOrderIds.map((_: any, i: number) => `$${i + 1}`).join(',');
      const wordsResult = await db!.execute(
        sql.raw(`SELECT * FROM vocabulary WHERE id IN (${placeholders})`)
      );

      // Map back to the correct order
      const wordMap = new Map(wordsResult.map((w: any) => [w.id, w]));
      const orderedWords = wordOrderIds.map((id: string) => wordMap.get(id)).filter(Boolean);

      return {
        sessionId: session.id,
        words: orderedWords,
        startIndex: session.current_index || 0,
        isRandomized: session.is_randomized || false
      };
    }),

  /**
   * Record word attempt and update session progress
   * Uses transaction to ensure data consistency
   */
  recordProgress: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      wordId: z.string(),
      wordIndex: z.number(),
      score: z.number().min(0).max(100),
      transcription: z.string(),
      feedback: z.string(),
      audioUrl: z.string().optional()
    }))
    .mutation(async ({ input }: any) => {
      const { sessionId, wordId, wordIndex, score, transcription, feedback, audioUrl } = input;

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // 1. Save the attempt
        await db.execute(sql`
          INSERT INTO lesson_word_attempts 
            (lesson_session_id, word_id, pronunciation_score, transcription, ai_feedback, audio_url)
          VALUES 
            (${sessionId}, ${wordId}, ${score}, ${transcription}, ${feedback}, ${audioUrl || null})
        `);

        // 2. Check if this was the last word
        const sessionResult = await db.execute(sql`
          SELECT word_order_ids FROM lesson_sessions WHERE id = ${sessionId}
        `);

        if (!sessionResult[0]) {
          throw new Error("Session not found");
        }

        const wordOrderIds = JSON.parse((sessionResult[0] as any).word_order_ids || '[]');
        const totalWords = wordOrderIds.length;
        const isComplete = wordIndex >= totalWords - 1;

        // 3. Update session state
        await db.execute(sql`
          UPDATE lesson_sessions 
          SET 
            current_index = ${wordIndex + 1},
            words_completed = words_completed + 1,
            status = ${isComplete ? 'COMPLETED' : 'IN_PROGRESS'},
            completed_at = ${isComplete ? new Date() : null},
            updated_at = NOW()
          WHERE id = ${sessionId}
        `);

        return {
          success: true,
          isComplete,
          nextIndex: wordIndex + 1
        };
      } catch (error) {
        console.error("Failed to record progress:", error);
        throw new Error("Failed to save progress");
      }
    }),

  /**
   * Get session analytics
   */
  getSessionStats: publicProcedure
    .input(z.object({
      sessionId: z.string()
    }))
    .query(async ({ input }: any) => {
      const { sessionId } = input;

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const attempts = await db.execute(sql`
        SELECT * FROM lesson_word_attempts 
        WHERE lesson_session_id = ${sessionId}
        ORDER BY created_at ASC
      `);

      const session = await db.execute(sql`
        SELECT * FROM lesson_sessions WHERE id = ${sessionId}
      `);

      return {
        session: session[0],
        attempts: attempts
      };
    })
});

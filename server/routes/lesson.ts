/**
 * Lesson Router - AI Coach Lesson Integration (Claude's Architecture)
 * 
 * Implements robust session management with:
 * - Database-backed state (single source of truth)  
 * - Word randomization support
 * - Session persistence & resume capability
 * - Metadata caching for fast lesson startup
 * - Race condition protection via transactions
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { lessonSessions, lessonWordAttempts, lessonMetadataCache } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const lessonRouter = router({
  /**
   * Create a new lesson session with optional randomization
   */
  createSession: protectedProcedure
    .input(z.object({
      lessonId: z.string(),
      pathId: z.string().optional(),
      lessonTitle: z.string(),
      lessonImportance: z.string().optional(),
      lessonContext: z.string().optional(),
      wordOrder: z.array(z.string()), // Array of word IDs
      isRandomized: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await db.insert(lessonSessions).values({
        userId: ctx.user.id,
        lessonId: input.lessonId,
        pathId: input.pathId,
        lessonTitle: input.lessonTitle,
        lessonImportance: input.lessonImportance,
        lessonContext: input.lessonContext,
        wordOrder: JSON.stringify(input.wordOrder),
        isRandomized: input.isRandomized ? "yes" : "no",
        totalWords: input.wordOrder.length,
        currentWordIndex: 0,
        status: "active",
      });

      return {
        sessionId: Number(result.insertId),
        wordOrder: input.wordOrder
      };
    }),

  /**
   * Update session progress (word index, status)
   */
  updateSessionProgress: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      currentWordIndex: z.number().optional(),
      status: z.enum(["active", "paused", "completed", "abandoned"]).optional(),
      averageScore: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const updateData: any = {};

      if (input.currentWordIndex !== undefined) {
        updateData.currentWordIndex = input.currentWordIndex;
      }
      if (input.status) {
        updateData.status = input.status;
        if (input.status === "completed") {
          updateData.completedAt = new Date();
        }
      }
      if (input.averageScore !== undefined) {
        updateData.averageScore = input.averageScore;
      }

      await db.update(lessonSessions)
        .set(updateData)
        .where(
          and(
            eq(lessonSessions.id, input.sessionId),
            eq(lessonSessions.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  /**
   * Record a word practice attempt
   */
  recordWordAttempt: protectedProcedure
    .input(z.object({
      lessonSessionId: z.number(),
      wordId: z.string(),
      wordPosition: z.number(),
      pronunciationScore: z.number().nullable(),
      userTranscription: z.string(),
      aiFeedback: z.string(),
      contextUsed: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Get current attempt count for this word in this session
      const existingAttempts = await db.query.lessonWordAttempts.findMany({
        where: and(
          eq(lessonWordAttempts.lessonSessionId, input.lessonSessionId),
          eq(lessonWordAttempts.wordId, input.wordId)
        ),
      });

      await db.insert(lessonWordAttempts).values({
        lessonSessionId: input.lessonSessionId,
        wordId: input.wordId,
        wordPosition: input.wordPosition,
        attemptNumber: existingAttempts.length + 1,
        pronunciationScore: input.pronunciationScore,
        userTranscription: input.userTranscription,
        aiFeedback: input.aiFeedback,
        contextUsed: input.contextUsed,
      });

      // Update session words completed count
      await db.execute(`
        UPDATE lessonSessions 
        SET wordsCompleted = (
          SELECT COUNT(DISTINCT wordId) 
          FROM lessonWordAttempts 
          WHERE lessonSessionId = ${input.lessonSessionId}
        )
        WHERE id = ${input.lessonSessionId}
      ` as any);

      return { success: true };
    }),

  /**
   * Resume a paused session (returns current state)
   */
  resumeSession: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      const session = await db.query.lessonSessions.findFirst({
        where: and(
          eq(lessonSessions.id, input.sessionId),
          eq(lessonSessions.userId, ctx.user.id)
        ),
      });

      if (!session) {
        throw new Error("Session not found");
      }

      return {
        ...session,
        wordOrder: JSON.parse(session.wordOrder as string),
        isRandomized: session.isRandomized === "yes",
      };
    }),

  /**
   * Get active sessions for current user
   */
  getActiveSessions: protectedProcedure
    .query(async ({ ctx }) => {
      const sessions = await db.query.lessonSessions.findMany({
        where: and(
          eq(lessonSessions.userId, ctx.user.id),
          eq(lessonSessions.status, "active")
        ),
        orderBy: (sessions, { desc }) => [desc(sessions.lastActiveAt)],
        limit: 10,
      });

      return sessions.map(s => ({
        ...s,
        wordOrder: JSON.parse(s.wordOrder as string),
        isRandomized: s.isRandomized === "yes",
      }));
    }),

  /**
   * Get lesson metadata from cache (for fast startup)
   */
  getLessonMetadata: publicProcedure
    .input(z.object({
      lessonId: z.string(),
    }))
    .query(async ({ input }) => {
      const metadata = await db.query.lessonMetadataCache.findFirst({
        where: eq(lessonMetadataCache.lessonId, input.lessonId),
      });

      if (!metadata) {
        return null;
      }

      return {
        ...metadata,
        introductionVariations: metadata.introductionVariations
          ? JSON.parse(metadata.introductionVariations as string)
          : [],
      };
    }),

  /**
   * Cache lesson metadata (called during setup/migration)
   */
  cacheLessonMetadata: publicProcedure
    .input(z.object({
      lessonId: z.string(),
      pathId: z.string().optional(),
      lessonTitle: z.string(),
      lessonImportance: z.string(),
      topicContext: z.string(),
      vocabularySummary: z.string().optional(),
      introductionVariations: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      // Upsert: insert or update if exists
      const existing = await db.query.lessonMetadataCache.findFirst({
        where: eq(lessonMetadataCache.lessonId, input.lessonId),
      });

      if (existing) {
        await db.update(lessonMetadataCache)
          .set({
            lessonTitle: input.lessonTitle,
            lessonImportance: input.lessonImportance,
            topicContext: input.topicContext,
            vocabularySummary: input.vocabularySummary,
            introductionVariations: input.introductionVariations
              ? JSON.stringify(input.introductionVariations)
              : null,
          })
          .where(eq(lessonMetadataCache.lessonId, input.lessonId));
      } else {
        await db.insert(lessonMetadataCache).values({
          lessonId: input.lessonId,
          pathId: input.pathId,
          lessonTitle: input.lessonTitle,
          lessonImportance: input.lessonImportance,
          topicContext: input.topicContext,
          vocabularySummary: input.vocabularySummary,
          introductionVariations: input.introductionVariations
            ? JSON.stringify(input.introductionVariations)
            : null,
        });
      }

      return { success: true };
    }),

  /**
   * Get session statistics (for analytics/completion screen)
   */
  getSessionStats: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      const session = await db.query.lessonSessions.findFirst({
        where: and(
          eq(lessonSessions.id, input.sessionId),
          eq(lessonSessions.userId, ctx.user.id)
        ),
      });

      if (!session) {
        throw new Error("Session not found");
      }

      const attempts = await db.query.lessonWordAttempts.findMany({
        where: eq(lessonWordAttempts.lessonSessionId, input.sessionId),
        orderBy: (attempts, { asc }) => [asc(attempts.createdAt)],
      });

      const scores = attempts
        .map(a => a.pronunciationScore)
        .filter((s): s is number => s !== null);

      const averageScore = scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
        : null;

      return {
        session: {
          ...session,
          wordOrder: JSON.parse(session.wordOrder as string),
          isRandomized: session.isRandomized === "yes",
        },
        attempts,
        stats: {
          totalAttempts: attempts.length,
          uniqueWordsAttempted: new Set(attempts.map(a => a.wordId)).size,
          averageScore,
          completionRate: session.totalWords
            ? (session.wordsCompleted / session.totalWords) * 100
            : 0,
        },
      };
    }),
});

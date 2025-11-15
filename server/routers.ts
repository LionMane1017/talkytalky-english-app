import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import * as db from "./db";
import { z } from "zod";
import { achievements } from "@shared/achievements";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  practice: router({
    saveSession: protectedProcedure
      .input(z.object({
        type: z.enum(["pronunciation", "matching", "ielts_part1", "ielts_part2", "ielts_part3", "mock_test"]),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        score: z.number(),
        wordsCompleted: z.number().optional(),
        accuracy: z.number().optional(),
        duration: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createPracticeSession({
          userId: ctx.user.id,
          type: input.type,
          difficulty: input.difficulty,
          score: input.score,
          wordsCompleted: input.wordsCompleted,
          accuracy: input.accuracy,
          duration: input.duration,
        });
      }),

    getSessions: protectedProcedure
      .input(z.object({
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getUserPracticeSessions(ctx.user.id, input?.limit);
      }),
  }),

  progress: router({
    getStats: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserProgress(ctx.user.id);
      }),

    updateVocabulary: protectedProcedure
      .input(z.object({
        wordId: z.string(),
        correct: z.boolean(),
        score: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const existing = await db.getVocabularyProgressByWord(ctx.user.id, input.wordId);
        const attempts = (existing?.attempts || 0) + 1;
        const successCount = (existing?.successCount || 0) + (input.correct ? 1 : 0);
        
        const { calculateNextReview } = await import("@shared/spacedRepetition");
        
        // Calculate spaced repetition schedule
        const currentSchedule = existing && existing.nextReview ? {
          nextReviewDate: existing.nextReview,
          interval: existing.reviewInterval || 1,
          easeFactor: (existing.easeFactor || 250) / 100,
          repetitions: existing.repetitions || 0,
        } : null;
        
        const newSchedule = calculateNextReview(input.score || 0, currentSchedule);
        
        return await db.upsertVocabularyProgress({
          userId: ctx.user.id,
          wordId: input.wordId,
          attempts,
          successCount,
          lastScore: input.score,
          nextReview: newSchedule.nextReviewDate,
          reviewInterval: newSchedule.interval,
          easeFactor: Math.round(newSchedule.easeFactor * 100),
          repetitions: newSchedule.repetitions,
        });
      }),

    getWordsNeedingReview: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getWordsNeedingReview(ctx.user.id);
      }),
  }),

  achievements: router({
    getAll: publicProcedure
      .query(() => {
        return achievements;
      }),

    getUserAchievements: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserAchievements(ctx.user.id);
      }),

    checkAndUnlock: protectedProcedure
      .input(z.object({
        achievementId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.unlockAchievement(ctx.user.id, input.achievementId);
      }),
  }),
});

export type AppRouter = typeof appRouter;

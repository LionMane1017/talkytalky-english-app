import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import * as db from "./db";
import { z } from "zod";
import { achievements } from "@shared/achievements";
import { assessPronunciation } from "./pronunciationAssessment";
import * as gemini from "./geminiService";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { TRPCError } from "@trpc/server";
import { aiCoachRouter } from "./routers/aiCoach";
import { configRouter } from "./routers/config";
import { ragRouter } from "./ragRouter";

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
    saveSession: publicProcedure
      .input(z.object({
        type: z.enum(["pronunciation", "matching", "ielts_part1", "ielts_part2", "ielts_part3", "mock_test"]),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        score: z.number(),
        wordsCompleted: z.number().optional(),
        accuracy: z.number().optional(),
        duration: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) return { success: false, message: "Guest mode - session not saved" };
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

    getSessions: publicProcedure
      .input(z.object({
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (!ctx.user) return [];
        return await db.getUserPracticeSessions(ctx.user.id, input?.limit);
      }),

    assessPronunciation: publicProcedure
      .input(z.object({
        audioData: z.string(), // base64 encoded audio
        referenceText: z.string(),
        duration: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        // Convert base64 to buffer
        const audioBuffer = Buffer.from(input.audioData, "base64");
        
        const result = await assessPronunciation(
          audioBuffer,
          input.referenceText,
          { duration: input.duration || 0 }
        );
        
        return result;
      }),

    // Gemini Live API Endpoints for Pronunciation Practice
    transcribeAudio: publicProcedure
      .input(z.object({
        audioBase64: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
          const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

          const result = await model.generateContent({
            contents: [{
              role: "user",
              parts: [
                { inlineData: { mimeType: "audio/webm", data: input.audioBase64 } },
                { text: "Transcribe this audio exactly as spoken. Return ONLY the text." }
              ]
            }]
          });

          return { transcript: result.response.text() };
        } catch (error) {
          console.error("Transcription failed:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to transcribe audio" });
        }
      }),

    analyzePronunciation: publicProcedure
      .input(z.object({
        word: z.string(),
        audioBase64: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
          const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash-exp",
            generationConfig: { responseMimeType: "application/json" } 
          });

          const result = await model.generateContent({
            contents: [{
              role: "user",
              parts: [
                { inlineData: { mimeType: "audio/webm", data: input.audioBase64 } },
                { text: `Analyze the pronunciation of the word "${input.word}". 
                   Provide: 
                   1) Accuracy score (0-100)
                   2) Specific feedback
                   3) Strengths
                   4) Weaknesses
                   Return JSON: { "score": number, "feedback": string, "strengths": string, "weaknesses": string }` }
              ]
            }]
          });

          return JSON.parse(result.response.text());
        } catch (error) {
          console.error("Analysis failed:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to analyze pronunciation" });
        }
      }),

    generateSpeech: publicProcedure
      .input(z.object({
        text: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
          const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash-exp"
          });

          const result = await model.generateContent({
            contents: [{
              role: "user",
              parts: [{ text: `Say this clearly and naturally: "${input.text}"` }]
            }]
          });

          // Extract audio blob from response
          const audioPart = result.response.candidates?.[0].content.parts.find(p => p.inlineData?.mimeType?.startsWith('audio'));
          
          if (!audioPart || !audioPart.inlineData?.data) {
              throw new Error("No audio generated");
          }

          return { audioBase64: audioPart.inlineData.data };
        } catch (error) {
          console.error("TTS failed:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate speech" });
        }
      }),

    // Get personalized recommendations
    getRecommendations: publicProcedure
      .input(z.object({
        weakPhonemes: z.array(z.string()),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]),
      }))
      .mutation(async ({ input }) => {
        return await gemini.getPersonalizedRecommendations(
          input.weakPhonemes,
          input.difficulty
        );
      }),
  }),

  progress: router({
    getStats: publicProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) return null;
        return await db.getUserProgress(ctx.user.id);
      }),

    updateVocabulary: publicProcedure
      .input(z.object({
        wordId: z.string(),
        correct: z.boolean(),
        score: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) return { success: false, message: "Guest mode - progress not saved" };
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

    getWordsNeedingReview: publicProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) return [];
        return await db.getWordsNeedingReview(ctx.user.id);
      }),
  }),

  aiCoach: aiCoachRouter,
  config: configRouter,
  rag: ragRouter,

  achievements: router({
    getAll: publicProcedure
      .query(() => {
        return achievements;
      }),

    getUserAchievements: publicProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) return [];
        return await db.getUserAchievements(ctx.user.id);
      }),

    checkAndUnlock: publicProcedure
      .input(z.object({
        achievementId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) return { success: false, message: "Guest mode - achievement not saved" };
        return await db.unlockAchievement(ctx.user.id, input.achievementId);
      }),
  }),
});

export type AppRouter = typeof appRouter;

/**
 * tRPC Router for RAG (Retrieval-Augmented Generation) features
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { buildCoachingContext, saveSessionWithEmbedding, getSmartContext } from "./ragService";

export const ragRouter = router({
  /**
   * Get personalized coaching context based on user's practice history
   */
  getCoachingContext: protectedProcedure
    .input(z.object({
      currentActivity: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const context = await buildCoachingContext(ctx.user.id, input.currentActivity);
      return { context };
    }),

  /**
   * Save practice session with RAG embedding
   */
  saveSessionWithRAG: protectedProcedure
    .input(z.object({
      type: z.enum(["pronunciation", "matching", "ielts_part1", "ielts_part2", "ielts_part3", "mock_test"]),
      difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
      score: z.number().optional(),
      duration: z.number().optional(),
      wordsCompleted: z.number().optional(),
      accuracy: z.number().optional(),
      context: z.string().optional(),
      feedback: z.string().optional(),
      userStrengths: z.array(z.string()).optional(),
      userWeaknesses: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await saveSessionWithEmbedding({
        userId: ctx.user.id,
        ...input,
      });
      
      return { success: true };
    }),

  /**
   * Get Smart Context: Hybrid RAG (User History + System Knowledge)
   * This endpoint provides grounded IELTS instruction combined with personalized coaching
   */
  getSmartContext: protectedProcedure
    .input(z.object({
      currentTopic: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const context = await getSmartContext(ctx.user.id, input.currentTopic);
      return { context };
    }),
});

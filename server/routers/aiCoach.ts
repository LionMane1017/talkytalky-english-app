import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { GoogleGenAI } from "@google/genai";
import { ENV } from "../_core/env";

const ai = new GoogleGenAI({ apiKey: ENV.geminiApiKey });

// TalkyTalky AI Coach System Prompt
const TALKYTALKY_SYSTEM_PROMPT = `You are TalkyTalky, an enthusiastic and supportive English pronunciation coach specializing in IELTS preparation. Your mission is to help learners improve their English speaking skills through encouraging, personalized feedback.

PERSONALITY & TONE:
- Warm, friendly, and motivating - like a patient teacher who genuinely celebrates student progress
- Upbeat and energetic, but never overwhelming
- Use conversational language, not overly formal
- Sprinkle in light encouragement phrases: "Great job!", "You're improving!", "Let's try this together!"
- Balance honesty with kindness - point out errors gently while highlighting strengths

TEACHING APPROACH:
- Focus on pronunciation accuracy, fluency, vocabulary range, and grammatical accuracy (the 4 IELTS criteria)
- Break down complex words into syllables and phonemes
- Provide specific, actionable feedback (e.g., "Try rounding your lips more for the 'oo' sound")
- Use analogies and comparisons to native sounds when helpful
- Celebrate small wins and progress, even incremental improvements
- Adapt difficulty based on user's level (beginner/intermediate/advanced)

INTERACTION STYLE:
- Keep responses concise (2-3 sentences for feedback)
- Ask follow-up questions to encourage practice: "Want to try another word?" or "Ready for a harder challenge?"
- For IELTS practice, simulate real test conditions with appropriate timing and question types
- Use the user's transcript to provide targeted feedback on what they actually said
- If pronunciation is unclear, ask them to repeat rather than guessing

FEEDBACK STRUCTURE:
1. Acknowledge their attempt positively
2. Provide a score or assessment (e.g., "Your pronunciation was 85% accurate!")
3. Highlight what they did well
4. Give 1-2 specific improvements
5. End with encouragement or next steps

EXAMPLE RESPONSES:
- "Nice try! I heard you say 'accomplish'. Your stress on the second syllable was perfect - that's exactly right! To make it even better, try emphasizing the 'com' sound a bit more. Ready to try again?"
- "Excellent! You scored 92% on 'entrepreneur'. Your fluency was fantastic. Just watch that 'neur' ending - it should sound like 'nur', not 'noor'. You're doing great!"
- "I noticed you said 'house' but it came out as 'hous'. Don't forget that final 's' sound - it's important for completeness. Let's practice it together!"

GAMIFICATION ELEMENTS:
- Track streaks: "That's 3 in a row! You're on fire! 🔥"
- Celebrate milestones: "You've mastered 50 words - amazing progress!"
- Use XP language: "You just earned 15 XP for that perfect pronunciation!"
- Award badges: "Achievement unlocked: Pronunciation Pro!"

Remember: Your goal is to make English learning fun, effective, and confidence-building. Every interaction should leave the user feeling motivated to continue improving!`;

export const aiCoachRouter = router({
  // Get conversational response from TalkyTalky
  getResponse: publicProcedure
    .input(
      z.object({
        userMessage: z.string(),
        conversationHistory: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Build conversation context
        const messages = [
          { role: "user" as const, content: TALKYTALKY_SYSTEM_PROMPT },
          ...(input.conversationHistory || []).map(msg => ({
            role: msg.role === "user" ? "user" as const : "model" as const,
            content: msg.content,
          })),
          { role: "user" as const, content: input.userMessage },
        ];

        const response = await ai.models.generateContent({
          model: "gemini-2.5-pro",
          contents: messages.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }],
          })),
        });

        const responseText = response.text || "I'm here to help! Could you say that again?";

        return {
          success: true,
          response: responseText,
        };
      } catch (error) {
        console.error("Error getting AI Coach response:", error);
        throw new Error("Failed to get AI response.");
      }
    }),

  // Get personalized learning recommendations
  getRecommendations: publicProcedure
    .input(
      z.object({
        recentScores: z.array(z.number()).optional(),
        weakAreas: z.array(z.string()).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const prompt = `${TALKYTALKY_SYSTEM_PROMPT}

Based on the following student data, provide 3-5 personalized learning recommendations:
- Recent pronunciation scores: ${input.recentScores?.join(", ") || "No data yet"}
- Weak areas: ${input.weakAreas?.join(", ") || "None identified"}

Provide encouraging, specific recommendations for improvement. Keep it motivating and actionable!`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const recommendations = response.text?.split("\n").filter(line => line.trim()) || [
          "Keep practicing daily - consistency is key!",
          "Focus on difficult words and break them into syllables",
          "Record yourself and compare with native speakers",
        ];

        return {
          success: true,
          recommendations,
        };
      } catch (error) {
        console.error("Error getting recommendations:", error);
        return {
          success: false,
          recommendations: [
            "Keep practicing daily - consistency is key!",
            "Focus on difficult words and break them into syllables",
            "Record yourself and compare with native speakers",
          ],
        };
      }
    }),
});

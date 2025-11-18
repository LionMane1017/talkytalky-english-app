import { GoogleGenAI, Type, Modality } from "@google/genai";

// Initialize Gemini AI client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable not set");
  }
  return new GoogleGenAI({ apiKey });
};

export interface PronunciationAnalysis {
  success: boolean;
  transcript: string;
  targetWord: string;
  scores: {
    accuracy: number;
    fluency: number;
    completeness: number;
    overall: number;
  };
  phonemeAnalysis: Array<{
    phoneme: string;
    accuracy: number;
  }>;
  feedback: string;
  suggestions: string[];
  motivationalMessage?: string;
  streakBonus?: boolean;
}

/**
 * Generate native speaker audio for a word/phrase
 * @param text - The text to convert to speech
 * @param accent - US or UK accent
 * @returns Base64 encoded audio data
 */
export async function generateSpeech(
  text: string,
  accent: "US" | "UK" = "US"
): Promise<string> {
  const ai = getGeminiClient();
  
  // Voice selection based on accent
  const voiceName = accent === "US" ? "Kore" : "Puck";

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [
      { parts: [{ text: `Say with a clear, neutral tone: ${text}` }] },
    ],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio =
    response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!base64Audio) {
    throw new Error("Failed to generate audio from text.");
  }

  return base64Audio;
}

/**
 * Analyze user's pronunciation with AI-powered coaching
 * @param targetText - The word/phrase the user should say
 * @param userTranscript - What the user actually said
 * @param difficulty - User's current difficulty level
 * @param previousScore - User's previous score for streak detection
 * @returns Detailed pronunciation analysis with coaching feedback
 */
export async function getPronunciationAnalysis(
  targetText: string,
  userTranscript: string,
  difficulty: "beginner" | "intermediate" | "advanced" = "beginner",
  previousScore?: number
): Promise<PronunciationAnalysis> {
  const ai = getGeminiClient();

  // Enhanced coaching prompt with personality and gamification
  const prompt = `
You are an expert IELTS pronunciation coach with 15 years of experience. You're encouraging, motivational, and provide actionable feedback.

**User Level:** ${difficulty}
**Target Word/Phrase:** "${targetText}"
**User's Pronunciation (transcript):** "${userTranscript}"

**Your Task:**
Analyze the user's pronunciation attempt and provide detailed, encouraging feedback.

**Scoring Guidelines:**
- **Accuracy (0-100):** How closely the pronunciation matches native speakers
- **Fluency (0-100):** Smoothness, rhythm, and natural flow
- **Completeness (0-100):** How much of the target phrase was spoken
- **Overall (0-100):** Weighted average emphasizing accuracy

**Feedback Style by Level:**
- **Beginner:** Very encouraging, celebrate small wins, simple explanations
- **Intermediate:** Balanced feedback, specific tips, challenge them gently
- **Advanced:** Detailed analysis, subtle nuances, high standards

**Phoneme Analysis:**
Break down each phoneme in the target text and score its accuracy. Focus on common problem areas for English learners (th, r, l, v/w, etc.).

**Motivational Messages:**
- Score 90-100: "🔥 Perfect! You're on fire!"
- Score 75-89: "⭐ Great job! Almost there!"
- Score 60-74: "💪 Good effort! Keep practicing!"
- Score 40-59: "📚 You're improving! Try again!"
- Score 0-39: "🎯 Don't give up! Focus on the sounds."

**Actionable Suggestions:**
Provide 2-3 specific, practical tips:
- Mouth/tongue position guidance
- Example words with similar sounds
- Common mistakes to avoid
- Breathing or rhythm tips

${previousScore && previousScore > 0 ? `**Previous Score:** ${previousScore} (compare and acknowledge improvement or consistency)` : ""}

Return a JSON response with detailed analysis.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          success: {
            type: Type.BOOLEAN,
            description: "Always true if analysis is successful.",
          },
          transcript: {
            type: Type.STRING,
            description: "The user's transcribed speech.",
          },
          targetWord: {
            type: Type.STRING,
            description: "The word or phrase the user was attempting to say.",
          },
          scores: {
            type: Type.OBJECT,
            properties: {
              accuracy: {
                type: Type.NUMBER,
                description: "Pronunciation accuracy score (0-100).",
              },
              fluency: {
                type: Type.NUMBER,
                description: "Speech fluency score (0-100).",
              },
              completeness: {
                type: Type.NUMBER,
                description:
                  "How much of the target phrase was spoken (0-100).",
              },
              overall: {
                type: Type.NUMBER,
                description: "An overall weighted score (0-100).",
              },
            },
          },
          phonemeAnalysis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phoneme: {
                  type: Type.STRING,
                  description: "The phoneme being analyzed.",
                },
                accuracy: {
                  type: Type.NUMBER,
                  description:
                    "Accuracy score for this specific phoneme (0-100).",
                },
              },
            },
          },
          feedback: {
            type: Type.STRING,
            description:
              "A concise, encouraging feedback message with emoji.",
          },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Specific, actionable suggestions for improvement.",
          },
          motivationalMessage: {
            type: Type.STRING,
            description:
              "An extra motivational message based on score range.",
          },
        },
      },
    },
  });

  const jsonText = response.text || '{}';
  const analysisResult: PronunciationAnalysis = JSON.parse(jsonText);

  // Ensure target word and transcript are set correctly
  analysisResult.targetWord = targetText;
  analysisResult.transcript = userTranscript;

  // Detect streak bonus (3+ consecutive scores above 80)
  if (
    previousScore &&
    previousScore >= 80 &&
    analysisResult.scores.overall >= 80
  ) {
    analysisResult.streakBonus = true;
  }

  return analysisResult;
}

/**
 * Get personalized practice recommendations based on user's weak areas
 * @param weakPhonemes - Array of phonemes the user struggles with
 * @param difficulty - User's difficulty level
 * @returns Recommended words to practice
 */
export async function getPersonalizedRecommendations(
  weakPhonemes: string[],
  difficulty: "beginner" | "intermediate" | "advanced"
): Promise<string[]> {
  const ai = getGeminiClient();

  const prompt = `
You are an expert English pronunciation coach.

The user is at ${difficulty} level and struggles with these phonemes: ${weakPhonemes.join(", ")}

Recommend 5 words that would help them practice these specific sounds.
Words should be:
- Appropriate for their difficulty level
- Commonly used in everyday English
- Focused on the problem phonemes
- Progressively challenging

Return only a JSON array of 5 words.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
    },
  });

  const recommendations: string[] = JSON.parse(response.text || '[]');
  return recommendations;
}

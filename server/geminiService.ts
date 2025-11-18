import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ENV } from "./_core/env";

const ai = new GoogleGenAI({ apiKey: ENV.geminiApiKey });

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
 * Generates speech from text using Gemini TTS.
 */
export async function generateSpeech(text: string, accent: 'US' | 'UK' = 'US'): Promise<string> {
  try {
    const voice = accent === 'US' ? 'Kore' : 'Puck';

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Speak this word clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) {
      throw new Error("No audio data received from API.");
    }

    return audioData;
  } catch (error) {
    console.error("Error in generateSpeech:", error);
    throw new Error("Failed to generate speech.");
  }
}

/**
 * Transcribes audio to text using Gemini 2.5 Flash multimodal.
 */
export async function transcribeAudio(audioBase64: string, mimeType: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: audioBase64, mimeType } },
          { text: "Transcribe the spoken word in this audio. Provide only the word." }
        ]
      },
    });

    const transcript = response.text?.trim() || '';
    return transcript;
  } catch (error) {
    console.error("Error in transcribeAudio:", error);
    throw new Error("Failed to transcribe audio.");
  }
}

const pronunciationAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    success: { type: Type.BOOLEAN },
    transcript: { type: Type.STRING },
    targetWord: { type: Type.STRING },
    scores: {
      type: Type.OBJECT,
      properties: {
        accuracy: { type: Type.NUMBER },
        fluency: { type: Type.NUMBER },
        completeness: { type: Type.NUMBER },
        overall: { type: Type.NUMBER },
      },
      required: ["accuracy", "fluency", "completeness", "overall"],
    },
    phonemeAnalysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          phoneme: { type: Type.STRING },
          accuracy: { type: Type.NUMBER },
        },
        required: ["phoneme", "accuracy"],
      },
    },
    feedback: { type: Type.STRING },
    suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    motivationalMessage: { type: Type.STRING },
    streakBonus: { type: Type.BOOLEAN },
  },
  required: ["success", "transcript", "targetWord", "scores", "phonemeAnalysis", "feedback", "suggestions"],
};

/**
 * Analyzes pronunciation using Gemini 2.5 Pro.
 */
export async function getPronunciationAnalysis(
  targetText: string,
  userTranscript: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
  previousScore?: number
): Promise<PronunciationAnalysis> {
  const prompt = `
    You are an expert English pronunciation coach. Analyze the user's pronunciation of a target word.
    
    Target Word: "${targetText}"
    User's Transcript: "${userTranscript}"
    Difficulty Level: ${difficulty}
    Previous Overall Score: ${previousScore === undefined ? 'N/A' : previousScore}

    Instructions:
    1.  Compare the user's transcript to the target word phonetically.
    2.  Break down the target word into its International Phonetic Alphabet (IPA) phonemes.
    3.  For each phoneme, assess the accuracy based on the user's transcript. A perfect match in the transcript means 100% accuracy for that phoneme. If a sound is slightly off or missing, reduce the score.
    4.  Calculate the following scores from 0-100:
        *   **Accuracy**: Phonetic similarity. How close was "${userTranscript}" to "${targetText}"?
        *   **Completeness**: Did the user say the whole word? Penalize for missing syllables or final sounds (e.g., "hous" for "house").
        *   **Fluency**: Estimate based on how well-formed the transcript is. A clean, correct transcript implies higher fluency.
        *   **Overall**: Weighted average: (accuracy * 0.5) + (fluency * 0.3) + (completeness * 0.2).
    5.  **Difficulty Adjustment**: 
        *   'beginner': Add a 10-point bonus to each score (max 100).
        *   'intermediate': No adjustment.
        *   'advanced': Subtract 10 points from each score (min 0).
        *   Apply this adjustment BEFORE calculating the final Overall score.
    6.  Provide a short, encouraging, and specific **feedback** message.
    7.  Give 2-3 actionable **suggestions** for improvement.
    8.  Provide a brief, uplifting **motivationalMessage**.
    9.  Set **streakBonus** to true if the new overall score is higher than the previousScore.
    10. If the transcript is empty or nonsensical, assign very low scores and provide feedback to try again.
    
    Return the analysis ONLY in the specified JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: pronunciationAnalysisSchema,
      },
    });

    const jsonText = response.text || '{}';
    const result = JSON.parse(jsonText);
    return result;
  } catch (error) {
    console.error("Error in analyzePronunciation:", error);
    throw new Error("Failed to analyze pronunciation.");
  }
}

/**
 * Get personalized recommendations (MOCK - for future implementation)
 */
export async function getPersonalizedRecommendations(
  weakPhonemes: string[],
  difficulty: "beginner" | "intermediate" | "advanced"
): Promise<any> {
  return {
    success: true,
    recommendations: [
      "Practice words with similar sounds",
      "Focus on mouth position and tongue placement",
      "Record yourself and compare with native speakers"
    ]
  };
}

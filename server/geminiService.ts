/**
 * Clean Skeleton API Service
 * All functions return mock/placeholder responses
 * Ready to plug in real API implementations later
 */

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
 * Generate native speaker audio for a word/phrase (MOCK)
 * Returns empty string - audio generation disabled in skeleton
 */
export async function generateSpeech(
  text: string,
  accent: "US" | "UK" = "US"
): Promise<string> {
  // Mock: Return empty string (no audio generation in skeleton)
  return "";
}

/**
 * Transcribe audio to text (MOCK)
 * Returns the expected text for demo purposes
 */
export async function transcribeAudio(
  audioBase64: string,
  mimeType: string = "audio/webm"
): Promise<string> {
  // Mock: Return placeholder transcription
  return "Mock transcription";
}

/**
 * Analyze user's pronunciation with mock scoring (SKELETON)
 */
export async function getPronunciationAnalysis(
  targetText: string,
  userTranscript: string,
  difficulty: "beginner" | "intermediate" | "advanced" = "beginner",
  previousScore?: number
): Promise<PronunciationAnalysis> {
  
  // Calculate mock score based on similarity (simple string comparison)
  const targetLower = targetText.toLowerCase().trim();
  const userLower = userTranscript.toLowerCase().trim();
  
  let baseScore = 50;
  
  // Exact match = 95-100
  if (targetLower === userLower) {
    baseScore = 95 + Math.floor(Math.random() * 6);
  }
  // Contains target word = 70-85
  else if (userLower.includes(targetLower) || targetLower.includes(userLower)) {
    baseScore = 70 + Math.floor(Math.random() * 16);
  }
  // Similar length = 60-75
  else if (Math.abs(targetLower.length - userLower.length) <= 3) {
    baseScore = 60 + Math.floor(Math.random() * 16);
  }
  // Otherwise 40-60
  else {
    baseScore = 40 + Math.floor(Math.random() * 21);
  }

  const overall = baseScore;
  const accuracy = Math.min(100, overall + Math.floor(Math.random() * 10) - 5);
  const fluency = Math.min(100, overall + Math.floor(Math.random() * 10) - 5);
  const completeness = Math.min(100, overall + Math.floor(Math.random() * 10) - 5);

  // Generate feedback based on score
  let feedback = "";
  let motivationalMessage = "";
  
  if (overall >= 90) {
    feedback = "🎉 Excellent pronunciation! You sound like a native speaker!";
    motivationalMessage = "🔥 You're on fire! Keep up the amazing work!";
  } else if (overall >= 75) {
    feedback = "⭐ Great job! Your pronunciation is very good!";
    motivationalMessage = "💪 You're making excellent progress!";
  } else if (overall >= 60) {
    feedback = "👍 Good effort! Keep practicing to improve.";
    motivationalMessage = "📚 Practice makes perfect!";
  } else if (overall >= 40) {
    feedback = "🎯 Not bad! Focus on the sounds and try again.";
    motivationalMessage = "💡 You're learning! Don't give up!";
  } else {
    feedback = "🌱 Keep trying! Listen carefully and practice more.";
    motivationalMessage = "🚀 Every attempt makes you better!";
  }

  // Mock phoneme analysis
  const phonemes = targetText.split('').slice(0, 5).map((char, i) => ({
    phoneme: char,
    accuracy: Math.min(100, overall + Math.floor(Math.random() * 20) - 10)
  }));

  // Suggestions based on score
  const suggestions = [];
  if (overall < 90) {
    suggestions.push("Listen to the native pronunciation and repeat");
    suggestions.push("Focus on pronouncing each syllable clearly");
  }
  if (overall < 70) {
    suggestions.push("Practice the word slowly, then speed up");
  }

  return {
    success: true,
    transcript: userTranscript,
    targetWord: targetText,
    scores: {
      accuracy,
      fluency,
      completeness,
      overall
    },
    phonemeAnalysis: phonemes,
    feedback,
    suggestions,
    motivationalMessage,
    streakBonus: !!(previousScore && previousScore >= 80 && overall >= 80)
  };
}

/**
 * Get personalized recommendations (MOCK)
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

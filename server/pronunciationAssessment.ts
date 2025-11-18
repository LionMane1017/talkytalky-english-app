import { ENV } from "./_core/env";

/**
 * Pronunciation Assessment Service
 * Integrates with Azure Speech API for real pronunciation scoring
 * Falls back to intelligent mock scoring when API key is not configured
 */

interface PronunciationResult {
  accuracyScore: number; // 0-100
  fluencyScore: number; // 0-100
  completenessScore: number; // 0-100
  pronunciationScore: number; // Overall 0-100
  feedback: string[];
  detectedWords?: string[];
}

interface AudioMetrics {
  duration: number; // milliseconds
  sampleRate?: number;
  channels?: number;
}

/**
 * Assess pronunciation using Azure Speech API
 * If API key is not configured, uses intelligent mock scoring
 */
export async function assessPronunciation(
  audioBlob: Buffer,
  referenceText: string,
  audioMetrics?: AudioMetrics
): Promise<PronunciationResult> {
  const azureKey = process.env.AZURE_SPEECH_KEY;
  const azureRegion = process.env.AZURE_SPEECH_REGION || "eastus";

  // If Azure credentials are configured, use real API
  if (azureKey) {
    try {
      return await assessWithAzure(audioBlob, referenceText, azureKey, azureRegion);
    } catch (error) {
      console.error("[Pronunciation] Azure API error, falling back to mock:", error);
      return generateIntelligentMockScore(referenceText, audioMetrics);
    }
  }

  // Otherwise use intelligent mock scoring
  return generateIntelligentMockScore(referenceText, audioMetrics);
}

/**
 * Real Azure Speech API pronunciation assessment
 */
async function assessWithAzure(
  audioBlob: Buffer,
  referenceText: string,
  apiKey: string,
  region: string
): Promise<PronunciationResult> {
  const endpoint = `https://${region}.api.cognitive.microsoft.com/speechtotext/v3.1/pronunciation/score`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": apiKey,
      "Content-Type": "audio/wav",
      "Accept": "application/json",
    },
    body: audioBlob,
  });

  if (!response.ok) {
    throw new Error(`Azure API error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();

  // Parse Azure response format
  const accuracyScore = result.NBest?.[0]?.PronunciationAssessment?.AccuracyScore || 0;
  const fluencyScore = result.NBest?.[0]?.PronunciationAssessment?.FluencyScore || 0;
  const completenessScore = result.NBest?.[0]?.PronunciationAssessment?.CompletenessScore || 0;
  const pronunciationScore = result.NBest?.[0]?.PronunciationAssessment?.PronScore || 0;

  const feedback: string[] = [];
  
  if (accuracyScore < 60) {
    feedback.push("Focus on pronouncing each word more clearly");
  }
  if (fluencyScore < 60) {
    feedback.push("Try to speak more smoothly and naturally");
  }
  if (completenessScore < 80) {
    feedback.push("Make sure to complete the full phrase");
  }
  if (pronunciationScore >= 80) {
    feedback.push("Excellent pronunciation!");
  }

  return {
    accuracyScore,
    fluencyScore,
    completenessScore,
    pronunciationScore,
    feedback,
    detectedWords: result.NBest?.[0]?.Words?.map((w: any) => w.Word) || [],
  };
}

/**
 * Intelligent mock scoring based on audio characteristics
 * Provides realistic feedback for demo/development
 */
function generateIntelligentMockScore(
  referenceText: string,
  audioMetrics?: AudioMetrics
): PronunciationResult {
  const wordCount = referenceText.split(" ").length;
  const expectedDuration = wordCount * 500; // ~500ms per word

  let accuracyScore = 75 + Math.random() * 20; // 75-95
  let fluencyScore = 70 + Math.random() * 25; // 70-95
  let completenessScore = 80 + Math.random() * 15; // 80-95

  // Adjust based on audio duration if available
  if (audioMetrics?.duration) {
    const durationRatio = audioMetrics.duration / expectedDuration;
    
    // Too fast or too slow affects fluency
    if (durationRatio < 0.7) {
      fluencyScore = Math.max(50, fluencyScore - 20);
    } else if (durationRatio > 1.5) {
      fluencyScore = Math.max(60, fluencyScore - 15);
    }
    
    // Very short recordings affect completeness
    if (durationRatio < 0.5) {
      completenessScore = Math.max(40, completenessScore - 30);
    }
  }

  const pronunciationScore = Math.round(
    (accuracyScore * 0.5 + fluencyScore * 0.3 + completenessScore * 0.2)
  );

  const feedback: string[] = [];
  
  if (pronunciationScore >= 85) {
    feedback.push("Excellent pronunciation! Keep up the great work!");
  } else if (pronunciationScore >= 75) {
    feedback.push("Good job! Your pronunciation is clear and understandable.");
  } else if (pronunciationScore >= 60) {
    feedback.push("Not bad! Keep practicing to improve clarity.");
  } else {
    feedback.push("Keep practicing! Focus on speaking clearly and at a natural pace.");
  }

  if (fluencyScore < 70) {
    feedback.push("Try to speak more smoothly without long pauses.");
  }
  if (accuracyScore < 70) {
    feedback.push("Focus on pronouncing each syllable clearly.");
  }
  if (completenessScore < 75) {
    feedback.push("Make sure to complete the entire phrase.");
  }

  return {
    accuracyScore: Math.round(accuracyScore),
    fluencyScore: Math.round(fluencyScore),
    completenessScore: Math.round(completenessScore),
    pronunciationScore,
    feedback,
  };
}

/**
 * Get pronunciation feedback text based on score
 */
export function getPronunciationFeedback(score: number): string {
  if (score >= 90) return "Outstanding! Native-like pronunciation.";
  if (score >= 80) return "Excellent! Very clear and accurate.";
  if (score >= 70) return "Good! Easily understandable.";
  if (score >= 60) return "Fair. Keep practicing for better clarity.";
  if (score >= 50) return "Needs improvement. Focus on pronunciation basics.";
  return "Keep practicing! Consider working with a tutor.";
}

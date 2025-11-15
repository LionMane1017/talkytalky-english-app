/**
 * Spaced Repetition Algorithm
 * Based on simplified SM-2 algorithm
 */

export interface ReviewSchedule {
  nextReviewDate: Date;
  interval: number; // days
  easeFactor: number;
  repetitions: number;
}

/**
 * Calculate next review schedule based on performance
 * @param score - Performance score (0-100)
 * @param currentSchedule - Current review schedule (null for first review)
 * @returns New review schedule
 */
export function calculateNextReview(
  score: number,
  currentSchedule: ReviewSchedule | null = null
): ReviewSchedule {
  const quality = scoreToQuality(score);
  
  if (!currentSchedule) {
    // First review
    return {
      nextReviewDate: getNextDate(1),
      interval: 1,
      easeFactor: 2.5,
      repetitions: 1,
    };
  }

  let { easeFactor, repetitions, interval } = currentSchedule;

  // Update ease factor
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  if (quality < 3) {
    // Failed - reset repetitions
    repetitions = 0;
    interval = 1;
  } else {
    // Passed - increase interval
    repetitions += 1;
    
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  return {
    nextReviewDate: getNextDate(interval),
    interval,
    easeFactor,
    repetitions,
  };
}

/**
 * Convert percentage score to quality rating (0-5)
 * 5: Perfect (90-100%)
 * 4: Good (70-89%)
 * 3: Pass (50-69%)
 * 2: Fail (30-49%)
 * 1: Poor (10-29%)
 * 0: Very Poor (0-9%)
 */
function scoreToQuality(score: number): number {
  if (score >= 90) return 5;
  if (score >= 70) return 4;
  if (score >= 50) return 3;
  if (score >= 30) return 2;
  if (score >= 10) return 1;
  return 0;
}

/**
 * Get date N days from now
 */
function getNextDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Check if a word is due for review
 */
export function isDueForReview(nextReviewDate: Date): boolean {
  return new Date() >= new Date(nextReviewDate);
}

/**
 * Get words that need review
 */
export function getWordsNeedingReview(
  vocabularyProgress: Array<{
    wordId: string;
    nextReview: Date | null;
    lastScore: number | null;
  }>
): string[] {
  return vocabularyProgress
    .filter(vp => {
      if (!vp.nextReview) return true; // Never reviewed
      return isDueForReview(vp.nextReview);
    })
    .map(vp => vp.wordId);
}

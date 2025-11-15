export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "practice" | "vocabulary" | "streak" | "score";
  requirement: {
    type: "practice_count" | "words_mastered" | "streak_days" | "high_score" | "total_sessions";
    value: number;
  };
}

export const achievements: Achievement[] = [
  // Practice Milestones
  {
    id: "first_practice",
    title: "First Steps",
    description: "Complete your first practice session",
    icon: "🎯",
    category: "practice",
    requirement: {
      type: "total_sessions",
      value: 1,
    },
  },
  {
    id: "practice_10",
    title: "Getting Started",
    description: "Complete 10 practice sessions",
    icon: "🌟",
    category: "practice",
    requirement: {
      type: "total_sessions",
      value: 10,
    },
  },
  {
    id: "practice_50",
    title: "Dedicated Learner",
    description: "Complete 50 practice sessions",
    icon: "💪",
    category: "practice",
    requirement: {
      type: "total_sessions",
      value: 50,
    },
  },
  {
    id: "practice_100",
    title: "Practice Master",
    description: "Complete 100 practice sessions",
    icon: "🏆",
    category: "practice",
    requirement: {
      type: "total_sessions",
      value: 100,
    },
  },
  
  // Vocabulary Milestones
  {
    id: "words_10",
    title: "Word Collector",
    description: "Practice 10 different words",
    icon: "📚",
    category: "vocabulary",
    requirement: {
      type: "words_mastered",
      value: 10,
    },
  },
  {
    id: "words_50",
    title: "Vocabulary Builder",
    description: "Practice 50 different words",
    icon: "📖",
    category: "vocabulary",
    requirement: {
      type: "words_mastered",
      value: 50,
    },
  },
  {
    id: "words_100",
    title: "Word Master",
    description: "Practice 100 different words",
    icon: "🎓",
    category: "vocabulary",
    requirement: {
      type: "words_mastered",
      value: 100,
    },
  },
  
  // Streak Achievements
  {
    id: "streak_3",
    title: "Three Day Streak",
    description: "Practice for 3 consecutive days",
    icon: "🔥",
    category: "streak",
    requirement: {
      type: "streak_days",
      value: 3,
    },
  },
  {
    id: "streak_7",
    title: "Week Warrior",
    description: "Practice for 7 consecutive days",
    icon: "⚡",
    category: "streak",
    requirement: {
      type: "streak_days",
      value: 7,
    },
  },
  {
    id: "streak_30",
    title: "Monthly Champion",
    description: "Practice for 30 consecutive days",
    icon: "👑",
    category: "streak",
    requirement: {
      type: "streak_days",
      value: 30,
    },
  },
  
  // Score Achievements
  {
    id: "perfect_score",
    title: "Perfect Pronunciation",
    description: "Get a 100% score on any word",
    icon: "💯",
    category: "score",
    requirement: {
      type: "high_score",
      value: 100,
    },
  },
  {
    id: "high_scorer",
    title: "High Achiever",
    description: "Get 90% or higher on 10 words",
    icon: "⭐",
    category: "score",
    requirement: {
      type: "high_score",
      value: 90,
    },
  },
];

export function getAchievementById(id: string): Achievement | undefined {
  return achievements.find(a => a.id === id);
}

export function getAchievementsByCategory(category: Achievement["category"]): Achievement[] {
  return achievements.filter(a => a.category === category);
}

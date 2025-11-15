import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { achievements } from "@shared/achievements";
import { toast } from "sonner";

export function useAchievementChecker() {
  const { data: userProgress } = trpc.progress.getStats.useQuery();
  const { data: sessions } = trpc.practice.getSessions.useQuery({ limit: 100 });
  const { data: userAchievements } = trpc.achievements.getUserAchievements.useQuery();
  const unlockMutation = trpc.achievements.checkAndUnlock.useMutation({
    onSuccess: (achievementId) => {
      if (achievementId) {
        const achievement = achievements.find(a => a.id === achievementId);
        if (achievement) {
          toast.success(`🎉 Achievement Unlocked: ${achievement.title}!`, {
            description: achievement.description,
            duration: 5000,
          });
        }
      }
    },
  });

  useEffect(() => {
    if (!userProgress || !sessions || !userAchievements) return;

    const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

    // Check each achievement
    achievements.forEach(achievement => {
      if (unlockedIds.has(achievement.id)) return; // Already unlocked

      let shouldUnlock = false;

      switch (achievement.requirement.type) {
        case "total_sessions":
          shouldUnlock = userProgress.totalSessions >= achievement.requirement.value;
          break;

        case "words_mastered":
          // Count unique words practiced
          const uniqueWords = new Set(sessions.map(s => s.id)).size;
          shouldUnlock = uniqueWords >= achievement.requirement.value;
          break;

        case "high_score":
          // Check if user has achieved the required score
          const highScores = sessions.filter(s => s.score && s.score >= achievement.requirement.value);
          if (achievement.id === "perfect_score") {
            shouldUnlock = highScores.some(s => s.score === 100);
          } else if (achievement.id === "high_scorer") {
            shouldUnlock = highScores.length >= 10;
          }
          break;

        // Note: streak_days would require date tracking, skipping for now
        case "streak_days":
          // TODO: Implement streak tracking
          break;
      }

      if (shouldUnlock) {
        unlockMutation.mutate({ achievementId: achievement.id });
      }
    });
  }, [userProgress, sessions, userAchievements]);
}

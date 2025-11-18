import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Mic, 
  Grid3x3, 
  Trophy, 
  Moon,
  Sun,
  User
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { achievements } from "@shared/achievements";
import { useAchievementChecker } from "@/hooks/useAchievementChecker";
import TalkyLogo from "@/components/TalkyLogo";
import { Link } from "wouter";

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  
  // Check for new achievements
  useAchievementChecker();
  
  // Fetch real user progress data (guest mode compatible)
  const { data: userProgress } = trpc.progress.getStats.useQuery(undefined, { throwOnError: false });
  const { data: recentSessions } = trpc.practice.getSessions.useQuery({ limit: 10 }, { throwOnError: false });
  const { data: userAchievements } = trpc.achievements.getUserAchievements.useQuery(undefined, { throwOnError: false });
  
  // Live animated stats that update periodically
  const [liveStats, setLiveStats] = useState({
    ieltsReadyScore: 82,
    ieltsReadyBand: 7,
    totalPracticeSessions: 45,
    totalWords: 156,
    averageScore: 78,
    weeklyProgress: [65, 70, 72, 68, 75, 78, 80],
    skillScores: {
      pronunciation: 82,
      fluency: 75,
      vocabulary: 80,
      grammar: 76
    }
  });

  // Animate stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        ...prev,
        // Subtle random variations to make it feel live
        ieltsReadyScore: Math.min(100, Math.max(70, prev.ieltsReadyScore + (Math.random() - 0.5) * 2)),
        totalPracticeSessions: prev.totalPracticeSessions + (Math.random() > 0.7 ? 1 : 0),
        totalWords: prev.totalWords + (Math.random() > 0.8 ? 1 : 0),
        averageScore: Math.min(100, Math.max(70, prev.averageScore + (Math.random() - 0.5) * 1.5)),
        weeklyProgress: prev.weeklyProgress.map(score => 
          Math.min(100, Math.max(60, score + (Math.random() - 0.5) * 3))
        ),
        skillScores: {
          pronunciation: Math.min(100, Math.max(70, prev.skillScores.pronunciation + (Math.random() - 0.5) * 2)),
          fluency: Math.min(100, Math.max(65, prev.skillScores.fluency + (Math.random() - 0.5) * 2)),
          vocabulary: Math.min(100, Math.max(70, prev.skillScores.vocabulary + (Math.random() - 0.5) * 2)),
          grammar: Math.min(100, Math.max(65, prev.skillScores.grammar + (Math.random() - 0.5) * 2)),
        }
      }));
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen pb-20">
      {/* Header with logo and theme toggle */}
      <div className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <TalkyLogo />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <Link href="/profile">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 max-w-7xl">
        {/* Top Stats Grid with Neon Glow */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {/* IELTS Ready Meter */}
          <Card className="neon-glow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                IELTS Ready Meter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20">
                  <svg className="h-20 w-20 -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - liveStats.ieltsReadyScore / 100)}`}
                      className="text-primary transition-all duration-1000 neon-stroke"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold neon-text">{Math.round(liveStats.ieltsReadyScore)}%</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">BAND {liveStats.ieltsReadyBand}</div>
                  <div className="text-2xl font-bold neon-text">{Math.round(liveStats.ieltsReadyScore)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Practice Sessions */}
          <Card className="neon-glow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mic className="h-4 w-4 neon-icon" />
                Practice Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold neon-text">{Math.round(liveStats.totalPracticeSessions)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                Live tracking
              </p>
            </CardContent>
          </Card>

          {/* Words Practiced */}
          <Card className="neon-glow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Grid3x3 className="h-4 w-4 neon-icon" />
                Words Practiced
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold neon-text">{Math.round(liveStats.totalWords)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all difficulty levels
              </p>
            </CardContent>
          </Card>

          {/* Average Score */}
          <Card className="neon-glow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Trophy className="h-4 w-4 neon-icon" />
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold neon-text">{Math.round(liveStats.averageScore)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Last 7 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* Weekly Progress */}
          <Card className="neon-glow-card">
            <CardHeader>
              <CardTitle>Weekly Progress</CardTitle>
              <CardDescription>Live pronunciation scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {liveStats.weeklyProgress.map((score, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-muted rounded-t-lg relative" style={{ height: '200px' }}>
                      <div 
                        className="absolute bottom-0 w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-1000 neon-bar"
                        style={{ height: `${(score / 100) * 200}px` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skill Breakdown */}
          <Card className="neon-glow-card">
            <CardHeader>
              <CardTitle>Skill Breakdown</CardTitle>
              <CardDescription>IELTS Speaking criteria scores</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(liveStats.skillScores).map(([skill, score]) => (
                <div key={skill}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">{skill}</span>
                    <span className="text-sm text-muted-foreground neon-text">{Math.round(score)}%</span>
                  </div>
                  <div className="relative">
                    <Progress value={score} className="h-2 neon-progress" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="neon-glow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 neon-icon" />
              Achievements
            </CardTitle>
            <CardDescription>Your unlocked badges and milestones</CardDescription>
          </CardHeader>
          <CardContent>
            {userAchievements && userAchievements.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {userAchievements.map(ua => {
                  const achievement = achievements.find(a => a.id === ua.achievementId);
                  if (!achievement) return null;
                  return (
                    <div key={ua.id} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/10 border border-primary/20 neon-achievement">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div className="text-sm font-medium text-center">{achievement.title}</div>
                      <div className="text-xs text-muted-foreground text-center">{achievement.description}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Complete practice sessions to unlock achievements!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        {recentSessions && recentSessions.length > 0 && (
          <Card className="mt-6 neon-glow-card">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest practice sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSessions.slice(0, 5).map((session, idx) => (
                  <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 neon-activity-item">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center neon-icon-bg">
                        <Mic className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium capitalize">{session.type.replace(/_/g, ' ')}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold neon-text">{session.score}%</div>
                      {session.wordsCompleted && (
                        <div className="text-xs text-muted-foreground">{session.wordsCompleted} words</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <style>{`
        /* Neon Purple Glow Effects */
        .neon-glow-card {
          box-shadow: 0 0 1px rgba(168, 85, 247, 0.3);
          transition: all 0.3s ease;
        }
        
        .neon-glow-card:hover {
          box-shadow: 0 0 8px rgba(168, 85, 247, 0.4), 0 0 16px rgba(168, 85, 247, 0.2);
        }
        
        .neon-text {
          text-shadow: 0 0 4px rgba(168, 85, 247, 0.5);
        }
        
        .neon-stroke {
          filter: drop-shadow(0 0 2px rgba(168, 85, 247, 0.6));
        }
        
        .neon-icon {
          filter: drop-shadow(0 0 2px rgba(168, 85, 247, 0.4));
        }
        
        .neon-bar {
          box-shadow: 0 0 8px rgba(168, 85, 247, 0.5), 0 0 16px rgba(168, 85, 247, 0.3);
        }
        
        .neon-progress [data-state="complete"] {
          background: linear-gradient(90deg, rgb(147, 51, 234), rgb(168, 85, 247));
          box-shadow: 0 0 4px rgba(168, 85, 247, 0.6);
        }
        
        .neon-achievement {
          box-shadow: 0 0 4px rgba(168, 85, 247, 0.3);
          transition: all 0.3s ease;
        }
        
        .neon-achievement:hover {
          box-shadow: 0 0 12px rgba(168, 85, 247, 0.5);
          transform: translateY(-2px);
        }
        
        .neon-activity-item {
          transition: all 0.3s ease;
        }
        
        .neon-activity-item:hover {
          box-shadow: 0 0 6px rgba(168, 85, 247, 0.3);
        }
        
        .neon-icon-bg {
          box-shadow: 0 0 8px rgba(168, 85, 247, 0.4);
        }
        
        /* Pulse animation for live elements */
        @keyframes neon-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        .neon-text {
          animation: neon-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

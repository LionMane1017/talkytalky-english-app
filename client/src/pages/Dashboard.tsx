import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Mic, 
  Grid3x3, 
  Trophy, 
  Calendar,
  X,
  Moon,
  Sun
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { achievements } from "@shared/achievements";
import { useAchievementChecker } from "@/hooks/useAchievementChecker";
import { Badge } from "@/components/ui/badge";
import TalkyLogo from "@/components/TalkyLogo";

export default function Dashboard() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const { theme, toggleTheme } = useTheme();
  
  // Check for new achievements
  useAchievementChecker();
  
  // Fetch real user progress data (guest mode compatible)
  const { data: userProgress, isLoading: progressLoading } = trpc.progress.getStats.useQuery(undefined, { throwOnError: false });
  const { data: recentSessions, isLoading: sessionsLoading } = trpc.practice.getSessions.useQuery({ limit: 10 }, { throwOnError: false });
  const { data: userAchievements } = trpc.achievements.getUserAchievements.useQuery(undefined, { throwOnError: false });
  
  const hasRealData = userProgress && userProgress.totalSessions > 0;

  // Simulated stats
  const simulatedStats = {
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
    },
    recentActivity: [
      { date: "Today", activity: "Pronunciation Practice", score: 85, words: 12 },
      { date: "Yesterday", activity: "Match Cards", score: 90, words: 20 },
      { date: "2 days ago", activity: "IELTS Mock Test", score: 75, words: 15 }
    ],
    monthlyProgress: [
      { month: "Jan", score: 20 },
      { month: "Feb", score: 35 },
      { month: "Mar", score: 45 },
      { month: "Apr", score: 60 },
      { month: "May", score: 78 }
    ]
  };

  const handleClearData = () => {
    setShowDisclaimer(false);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header with logo and theme toggle */}
      <div className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <TalkyLogo />
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
          </div>
        </div>
      </div>

      <div className="container py-6 max-w-7xl">
        {/* Disclaimer Banner */}
        {showDisclaimer && !hasRealData && (
          <Alert className="mb-6 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900">
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm">
                ⚠️ These stats are simulated and do not reflect actual data.
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClearData}
                  className="text-xs"
                >
                  Clear & Start Tracking
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowDisclaimer(false)}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {!hasRealData ? (
          <>
            {/* Top Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
              {/* IELTS Ready Meter */}
              <Card>
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
                          strokeDashoffset={`${2 * Math.PI * 32 * (1 - simulatedStats.ieltsReadyScore / 100)}`}
                          className="text-primary transition-all"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold">{simulatedStats.ieltsReadyScore}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">BAND {simulatedStats.ieltsReadyBand}</div>
                      <div className="text-2xl font-bold">{simulatedStats.ieltsReadyScore}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Practice Sessions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    Practice Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{simulatedStats.totalPracticeSessions}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +12% from last week
                  </p>
                </CardContent>
              </Card>

              {/* Words Practiced */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Grid3x3 className="h-4 w-4" />
                    Words Practiced
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{simulatedStats.totalWords}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Across all difficulty levels
                  </p>
                </CardContent>
              </Card>

              {/* Average Score */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Average Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{simulatedStats.averageScore}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last 7 days
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              {/* Weekly Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Progress</CardTitle>
                  <CardDescription>Your pronunciation scores over the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {simulatedStats.weeklyProgress.map((score, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-muted rounded-t-lg relative" style={{ height: '200px' }}>
                          <div 
                            className="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all"
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
              <Card>
                <CardHeader>
                  <CardTitle>Skill Breakdown</CardTitle>
                  <CardDescription>IELTS Speaking criteria scores</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(simulatedStats.skillScores).map(([skill, score]) => (
                    <div key={skill}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize">{skill}</span>
                        <span className="text-sm text-muted-foreground">{score}%</span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
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
                        <div key={ua.id} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/10 border border-primary/20">
                          <div className="text-4xl">{achievement.icon}</div>
                          <div className="text-sm font-medium text-center">{achievement.title}</div>
                          <div className="text-xs text-muted-foreground text-center">{achievement.description}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Complete practice sessions to unlock achievements!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest practice sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {simulatedStats.recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{activity.activity}</p>
                        <p className="text-sm text-muted-foreground">{activity.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{activity.score}%</p>
                        <p className="text-xs text-muted-foreground">{activity.words} words</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">Start Your Learning Journey</h3>
              <p className="text-muted-foreground mb-6">
                Begin practicing to see your progress and statistics here
              </p>
              <Button onClick={() => window.location.href = '/practice'}>
                Start Practicing
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

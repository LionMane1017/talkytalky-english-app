import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, Target, Calendar, Clock, Award, TrendingUp, 
  Crown, Star, Zap, Flame, Settings 
} from "lucide-react";
import TalkyLogo from "@/components/TalkyLogo";

export default function Profile() {
  const [selectedTab, setSelectedTab] = useState<"stats" | "achievements" | "goals">("stats");

  // Mock user data - replace with real data from backend
  const userStats = {
    name: "Guest User",
    level: "Intermediate",
    ieltsTarget: 7.5,
    currentBand: 6.5,
    totalPracticeTime: 1247, // minutes
    wordsMastered: 342,
    streakDays: 12,
    bestScore: 95,
    averageScore: 78,
    sessionsCompleted: 45,
    rank: 127,
    totalUsers: 5420,
  };

  const achievements = [
    { id: 1, name: "First Steps", description: "Complete your first practice session", icon: "🎯", unlocked: true },
    { id: 2, name: "Week Warrior", description: "Maintain a 7-day streak", icon: "🔥", unlocked: true },
    { id: 3, name: "Pronunciation Pro", description: "Score 90+ on 10 words", icon: "⭐", unlocked: true },
    { id: 4, name: "Century Club", description: "Master 100 words", icon: "💯", unlocked: true },
    { id: 5, name: "Perfect Score", description: "Get 100% on any word", icon: "🏆", unlocked: false },
    { id: 6, name: "Month Master", description: "Maintain a 30-day streak", icon: "👑", unlocked: false },
    { id: 7, name: "IELTS Ready", description: "Achieve Band 7+ average", icon: "🎓", unlocked: false },
    { id: 8, name: "Speed Demon", description: "Complete 50 sessions", icon: "⚡", unlocked: false },
  ];

  const weeklyProgress = [
    { day: "Mon", score: 72 },
    { day: "Tue", score: 78 },
    { day: "Wed", score: 81 },
    { day: "Thu", score: 75 },
    { day: "Fri", score: 85 },
    { day: "Sat", score: 88 },
    { day: "Sun", score: 82 },
  ];

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const bandProgress = ((userStats.currentBand - 5) / (userStats.ieltsTarget - 5)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 pb-20">
      <div className="container py-4 px-4 sm:py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <TalkyLogo />
        </div>

        {/* Profile Header */}
        <Card className="mb-6 bg-white/15 backdrop-blur-lg border-2 border-white/30 shadow-2xl">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-4xl font-bold text-white shadow-xl">
                {userStats.name.charAt(0)}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{userStats.name}</h1>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3 mb-3">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none">
                    {userStats.level}
                  </Badge>
                  <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-none">
                    Rank #{userStats.rank}
                  </Badge>
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-none">
                    {userStats.streakDays} Day Streak 🔥
                  </Badge>
                </div>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-6 text-xs sm:text-sm text-white/80">
                  <span>📊 {userStats.sessionsCompleted} Sessions</span>
                  <span>⭐ {userStats.wordsMastered} Words Mastered</span>
                  <span>⏱️ {formatTime(userStats.totalPracticeTime)} Practice Time</span>
                </div>
              </div>
              <Button variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
          <Button
            variant={selectedTab === "stats" ? "default" : "outline"}
            onClick={() => setSelectedTab("stats")}
            className={selectedTab === "stats" 
              ? "bg-white text-purple-900 hover:bg-white/90" 
              : "bg-white/10 text-white border-white/30 hover:bg-white/20"}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Statistics
          </Button>
          <Button
            variant={selectedTab === "achievements" ? "default" : "outline"}
            onClick={() => setSelectedTab("achievements")}
            className={selectedTab === "achievements" 
              ? "bg-white text-purple-900 hover:bg-white/90" 
              : "bg-white/10 text-white border-white/30 hover:bg-white/20"}
          >
            <Trophy className="h-4 w-4 mr-2" />
            Achievements
          </Button>
          <Button
            variant={selectedTab === "goals" ? "default" : "outline"}
            onClick={() => setSelectedTab("goals")}
            className={selectedTab === "goals" 
              ? "bg-white text-purple-900 hover:bg-white/90" 
              : "bg-white/10 text-white border-white/30 hover:bg-white/20"}
          >
            <Target className="h-4 w-4 mr-2" />
            Goals
          </Button>
        </div>

        {/* Statistics Tab */}
        {selectedTab === "stats" && (
          <div className="space-y-6">
            {/* Key Stats Grid */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md border-white/20">
                <CardContent className="pt-6 text-center">
                  <Clock className="h-8 w-8 text-blue-300 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{formatTime(userStats.totalPracticeTime)}</p>
                  <p className="text-sm text-white/70 mt-1">Total Practice</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md border-white/20">
                <CardContent className="pt-6 text-center">
                  <Star className="h-8 w-8 text-green-300 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{userStats.wordsMastered}</p>
                  <p className="text-sm text-white/70 mt-1">Words Mastered</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md border-white/20">
                <CardContent className="pt-6 text-center">
                  <Flame className="h-8 w-8 text-orange-300 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{userStats.streakDays}</p>
                  <p className="text-sm text-white/70 mt-1">Day Streak</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 backdrop-blur-md border-white/20">
                <CardContent className="pt-6 text-center">
                  <Trophy className="h-8 w-8 text-yellow-300 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{userStats.bestScore}%</p>
                  <p className="text-sm text-white/70 mt-1">Best Score</p>
                </CardContent>
              </Card>
            </div>

            {/* IELTS Band Progress */}
            <Card className="bg-white/15 backdrop-blur-lg border-2 border-white/30 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  IELTS Band Progress
                </CardTitle>
                <CardDescription className="text-white/70">
                  Current: Band {userStats.currentBand} → Target: Band {userStats.ieltsTarget}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={bandProgress} className="h-4 mb-2" />
                <p className="text-sm text-white/70 text-right">{Math.round(bandProgress)}% to target</p>
              </CardContent>
            </Card>

            {/* Weekly Progress Chart */}
            <Card className="bg-white/15 backdrop-blur-lg border-2 border-white/30 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekly Progress
                </CardTitle>
                <CardDescription className="text-white/70">
                  Your pronunciation scores over the past week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-2 h-48">
                  {weeklyProgress.map((day) => (
                    <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all hover:from-blue-400 hover:to-cyan-300"
                        style={{ height: `${day.score}%` }}
                      />
                      <span className="text-xs text-white/70">{day.day}</span>
                      <span className="text-sm font-bold text-white">{day.score}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Breakdown */}
            <Card className="bg-white/15 backdrop-blur-lg border-2 border-white/30 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/70">Pronunciation</span>
                    <span className="text-white font-bold">82%</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/70">Fluency</span>
                    <span className="text-white font-bold">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/70">Vocabulary</span>
                    <span className="text-white font-bold">80%</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/70">Grammar</span>
                    <span className="text-white font-bold">70%</span>
                  </div>
                  <Progress value={70} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Achievements Tab */}
        {selectedTab === "achievements" && (
          <div className="space-y-6">
            <Card className="bg-white/15 backdrop-blur-lg border-2 border-white/30 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievement Gallery
                </CardTitle>
                <CardDescription className="text-white/70">
                  {achievements.filter(a => a.unlocked).length} of {achievements.length} unlocked
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <Card 
                      key={achievement.id}
                      className={achievement.unlocked 
                        ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30" 
                        : "bg-white/5 border-white/10 opacity-50"}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{achievement.unlocked ? achievement.icon : "🔒"}</div>
                          <div className="flex-1">
                            <h3 className="font-bold text-white mb-1 flex items-center gap-2">
                              {achievement.name}
                              {achievement.unlocked && <Zap className="h-4 w-4 text-yellow-400" />}
                            </h3>
                            <p className="text-sm text-white/70">{achievement.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Goals Tab */}
        {selectedTab === "goals" && (
          <div className="space-y-6">
            {/* Daily Goal */}
            <Card className="bg-white/15 backdrop-blur-lg border-2 border-white/30 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Daily Practice Goal
                </CardTitle>
                <CardDescription className="text-white/70">
                  Practice 20 words per day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/70">Today's Progress</span>
                    <span className="text-white font-bold">12 / 20 words</span>
                  </div>
                  <Progress value={60} className="h-3" />
                </div>
                <p className="text-sm text-white/70 mt-3">8 more words to reach your daily goal! 💪</p>
              </CardContent>
            </Card>

            {/* IELTS Target */}
            <Card className="bg-white/15 backdrop-blur-lg border-2 border-white/30 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  IELTS Band Target
                </CardTitle>
                <CardDescription className="text-white/70">
                  Achieve Band {userStats.ieltsTarget} by December 2025
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/70">Current Band</span>
                      <span className="text-white font-bold">Band {userStats.currentBand}</span>
                    </div>
                    <Progress value={bandProgress} className="h-3" />
                  </div>
                  <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-500/30">
                    <p className="text-sm text-white">
                      <strong>Next Milestone:</strong> Reach Band 7.0 (0.5 bands away)
                    </p>
                    <p className="text-xs text-white/70 mt-2">
                      Keep practicing! You're making great progress 🎯
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Premium Upgrade CTA */}
            <Card className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 backdrop-blur-lg border-2 border-purple-400/50 shadow-2xl">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Unlock Premium Features</h3>
                  <p className="text-white/80 mb-6">
                    Get unlimited practice, advanced analytics, AI tutor, and personalized learning paths
                  </p>
                  <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold text-lg px-8">
                    <Crown className="h-5 w-5 mr-2" />
                    Upgrade to Premium
                  </Button>
                  <div className="flex justify-center gap-6 mt-6 text-sm text-white/70">
                    <span>✓ Unlimited Practice</span>
                    <span>✓ AI Tutor</span>
                    <span>✓ Advanced Analytics</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

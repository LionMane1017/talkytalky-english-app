import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award, TrendingUp, Users } from "lucide-react";
import TalkyLogo from "@/components/TalkyLogo";
import BottomNav from "@/components/BottomNav";

type Period = "daily" | "weekly" | "monthly" | "alltime";

interface LeaderboardEntry {
  rank: number;
  userId: number;
  userName: string;
  score: number;
  sessionsCount: number;
  wordsLearned: number;
  isCurrentUser?: boolean;
}

export default function Leaderboard() {
  const [period, setPeriod] = useState<Period>("weekly");

  // Mock data - in production, fetch from backend
  const leaderboardData: LeaderboardEntry[] = [
    { rank: 1, userId: 1, userName: "Sarah Chen", score: 9850, sessionsCount: 45, wordsLearned: 230 },
    { rank: 2, userId: 2, userName: "Michael Brown", score: 9420, sessionsCount: 42, wordsLearned: 215 },
    { rank: 3, userId: 3, userName: "Emily Davis", score: 9180, sessionsCount: 40, wordsLearned: 205 },
    { rank: 4, userId: 4, userName: "James Wilson", score: 8950, sessionsCount: 38, wordsLearned: 198 },
    { rank: 5, userId: 5, userName: "Lisa Anderson", score: 8720, sessionsCount: 36, wordsLearned: 190 },
    { rank: 6, userId: 6, userName: "David Martinez", score: 8500, sessionsCount: 34, wordsLearned: 185 },
    { rank: 7, userId: 7, userName: "Jessica Taylor", score: 8280, sessionsCount: 32, wordsLearned: 178 },
    { rank: 8, userId: 8, userName: "Robert Johnson", score: 8050, sessionsCount: 30, wordsLearned: 172 },
    { rank: 9, userId: 9, userName: "You", score: 7820, sessionsCount: 28, wordsLearned: 165, isCurrentUser: true },
    { rank: 10, userId: 10, userName: "Chris Lee", score: 7600, sessionsCount: 26, wordsLearned: 160 },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-700" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500 hover:bg-yellow-600">🥇 1st</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400 hover:bg-gray-500">🥈 2nd</Badge>;
    if (rank === 3) return <Badge className="bg-amber-700 hover:bg-amber-800">🥉 3rd</Badge>;
    return <Badge variant="outline">#{rank}</Badge>;
  };

  const getPeriodLabel = (p: Period) => {
    const labels = {
      daily: "Today",
      weekly: "This Week",
      monthly: "This Month",
      alltime: "All Time",
    };
    return labels[p];
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-4">
          <TalkyLogo />
        </div>
      </div>

      <div className="container py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold mb-1">Leaderboard</h1>
          <p className="text-muted-foreground">
            Compete with learners worldwide and track your progress
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(["daily", "weekly", "monthly", "alltime"] as Period[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? "default" : "outline"}
              onClick={() => setPeriod(p)}
              className="flex-shrink-0"
            >
              {getPeriodLabel(p)}
            </Button>
          ))}
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* 2nd Place */}
          <div className="flex flex-col items-center pt-8">
            <Avatar className="h-16 w-16 mb-2 border-4 border-gray-400">
              <AvatarFallback className="bg-gray-100 text-gray-700 text-lg font-bold">
                {leaderboardData[1]?.userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <div className="font-semibold text-sm">{leaderboardData[1]?.userName}</div>
              <Badge className="bg-gray-400 hover:bg-gray-500 mt-1">🥈 2nd</Badge>
              <div className="text-2xl font-bold text-primary mt-2">
                {leaderboardData[1]?.score.toLocaleString()}
              </div>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center">
            <Trophy className="h-8 w-8 text-yellow-500 mb-2" />
            <Avatar className="h-20 w-20 mb-2 border-4 border-yellow-500">
              <AvatarFallback className="bg-yellow-100 text-yellow-700 text-xl font-bold">
                {leaderboardData[0]?.userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <div className="font-semibold">{leaderboardData[0]?.userName}</div>
              <Badge className="bg-yellow-500 hover:bg-yellow-600 mt-1">🥇 1st</Badge>
              <div className="text-3xl font-bold text-primary mt-2">
                {leaderboardData[0]?.score.toLocaleString()}
              </div>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center pt-8">
            <Avatar className="h-16 w-16 mb-2 border-4 border-amber-700">
              <AvatarFallback className="bg-amber-100 text-amber-700 text-lg font-bold">
                {leaderboardData[2]?.userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <div className="font-semibold text-sm">{leaderboardData[2]?.userName}</div>
              <Badge className="bg-amber-700 hover:bg-amber-800 mt-1">🥉 3rd</Badge>
              <div className="text-2xl font-bold text-primary mt-2">
                {leaderboardData[2]?.score.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Full Rankings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Rankings
            </CardTitle>
            <CardDescription>
              Top performers for {getPeriodLabel(period).toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {leaderboardData.map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${
                    entry.isCurrentUser ? "bg-primary/5 border-l-4 border-primary" : ""
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(entry.rank) || (
                      <span className="text-lg font-bold text-muted-foreground">
                        #{entry.rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={entry.isCurrentUser ? "bg-primary text-primary-foreground" : ""}>
                      {entry.userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold flex items-center gap-2">
                      {entry.userName}
                      {entry.isCurrentUser && (
                        <Badge variant="secondary" className="text-xs">You</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-3">
                      <span>{entry.sessionsCount} sessions</span>
                      <span>•</span>
                      <span>{entry.wordsLearned} words</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      {entry.score.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">#9</div>
                <div className="text-sm text-muted-foreground">Current Rank</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">+3</div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-chart-3">7,820</div>
                <div className="text-sm text-muted-foreground">Total Points</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Keep practicing to climb the leaderboard! 🚀
            </p>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Activity, Award, BarChart3, Calendar } from "lucide-react";
import TalkyLogo from "@/components/TalkyLogo";
import { trpc } from "@/lib/trpc";

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "all">("week");
  
  // Mock data for demo (will be replaced with real backend data)
  const stats = {
    totalUsers: 127,
    activeUsers: 89,
    newUsersToday: 12,
    totalSessions: 1543,
    avgSessionDuration: 8.5,
    totalWordsPracticed: 4521,
    avgScore: 76,
    topUsers: [
      { id: "1", name: "Sarah Johnson", sessions: 45, avgScore: 92, streak: 15 },
      { id: "2", name: "Mike Chen", sessions: 38, avgScore: 88, streak: 12 },
      { id: "3", name: "Emma Davis", sessions: 35, avgScore: 85, streak: 10 },
      { id: "4", name: "James Wilson", sessions: 32, avgScore: 82, streak: 8 },
      { id: "5", name: "Lisa Anderson", sessions: 28, avgScore: 80, streak: 7 },
    ],
    popularWords: [
      { word: "accommodate", attempts: 234, avgScore: 68 },
      { word: "entrepreneur", attempts: 198, avgScore: 72 },
      { word: "necessary", attempts: 187, avgScore: 75 },
      { word: "pronunciation", attempts: 176, avgScore: 70 },
      { word: "environment", attempts: 165, avgScore: 78 },
    ],
    sessionsByDay: [
      { day: "Mon", count: 145 },
      { day: "Tue", count: 178 },
      { day: "Wed", count: 192 },
      { day: "Thu", count: 165 },
      { day: "Fri", count: 134 },
      { day: "Sat", count: 98 },
      { day: "Sun", count: 87 },
    ],
    practiceTypes: [
      { type: "Vocabulary", count: 645, percentage: 42 },
      { type: "IELTS Part 1", count: 432, percentage: 28 },
      { type: "Match Cards", count: 298, percentage: 19 },
      { type: "IELTS Part 2", count: 168, percentage: 11 },
    ],
  };

  const maxSessions = Math.max(...stats.sessionsByDay.map((d: any) => d.count));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <TalkyLogo />
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="font-semibold">
                ADMIN
              </Badge>
              <div className="flex gap-1 ml-4">
                <Button
                  size="sm"
                  variant={timeRange === "day" ? "default" : "outline"}
                  onClick={() => setTimeRange("day")}
                >
                  Today
                </Button>
                <Button
                  size="sm"
                  variant={timeRange === "week" ? "default" : "outline"}
                  onClick={() => setTimeRange("week")}
                >
                  Week
                </Button>
                <Button
                  size="sm"
                  variant={timeRange === "month" ? "default" : "outline"}
                  onClick={() => setTimeRange("month")}
                >
                  Month
                </Button>
                <Button
                  size="sm"
                  variant={timeRange === "all" ? "default" : "outline"}
                  onClick={() => setTimeRange("all")}
                >
                  All Time
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor user activity and app performance
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.newUsersToday} today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
              <p className="text-xs text-muted-foreground">
                Avg {stats.avgSessionDuration} min/session
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgScore}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalWordsPracticed} words practiced
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sessions by Day */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Sessions This Week
              </CardTitle>
              <CardDescription>Daily practice session count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.sessionsByDay.map((day: any) => (
                  <div key={day.day} className="flex items-center gap-3">
                    <div className="w-12 text-sm font-medium text-muted-foreground">
                      {day.day}
                    </div>
                    <div className="flex-1">
                      <div className="h-8 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-end px-3"
                          style={{ width: `${(day.count / maxSessions) * 100}%` }}
                        >
                          <span className="text-xs font-semibold text-white">
                            {day.count}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Practice Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Practice Types
              </CardTitle>
              <CardDescription>Distribution of practice modes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.practiceTypes.map((type: any) => (
                  <div key={type.type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{type.type}</span>
                      <span className="text-sm text-muted-foreground">
                        {type.count} ({type.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        style={{ width: `${type.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top Performers
              </CardTitle>
              <CardDescription>Users with most practice sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topUsers.map((user: any, index: number) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.sessions} sessions • {user.streak} day streak
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{user.avgScore}%</div>
                      <div className="text-xs text-muted-foreground">avg score</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular Words */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Most Practiced Words
              </CardTitle>
              <CardDescription>Vocabulary words with most attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.popularWords.map((word: any, index: number) => (
                  <div
                    key={word.word}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{word.word}</div>
                      <div className="text-xs text-muted-foreground">
                        {word.attempts} attempts
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${
                        word.avgScore >= 80 ? 'text-green-600' :
                        word.avgScore >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {word.avgScore}%
                      </div>
                      <div className="text-xs text-muted-foreground">avg score</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

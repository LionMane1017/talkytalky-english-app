import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Target, Award, Mic, Grid3x3, BookOpen } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from "recharts";

export default function Dashboard() {
  // Mock data - will be replaced with real data from backend
  const ieltsReadyScore = 72;
  
  const criteriaScores = [
    { criteria: "Pronunciation", score: 75, maxScore: 100 },
    { criteria: "Fluency", score: 68, maxScore: 100 },
    { criteria: "Vocabulary", score: 80, maxScore: 100 },
    { criteria: "Grammar", score: 65, maxScore: 100 },
  ];

  const radarData = [
    { subject: "Pronunciation", score: 75, fullMark: 100 },
    { subject: "Fluency", score: 68, fullMark: 100 },
    { subject: "Vocabulary", score: 80, fullMark: 100 },
    { subject: "Grammar", score: 65, fullMark: 100 },
  ];

  const progressData = [
    { week: "Week 1", score: 45 },
    { week: "Week 2", score: 52 },
    { week: "Week 3", score: 58 },
    { week: "Week 4", score: 65 },
    { week: "Week 5", score: 72 },
  ];

  const activityData = [
    { activity: "Speaking", sessions: 24, icon: Mic },
    { activity: "Matching", sessions: 18, icon: Grid3x3 },
    { activity: "IELTS", sessions: 12, icon: BookOpen },
  ];

  const milestones = [
    { title: "First Practice", completed: true, date: "Oct 15, 2024" },
    { title: "10 Sessions Complete", completed: true, date: "Oct 22, 2024" },
    { title: "50% Ready Score", completed: true, date: "Nov 1, 2024" },
    { title: "25 Sessions Complete", completed: true, date: "Nov 8, 2024" },
    { title: "70% Ready Score", completed: true, date: "Nov 14, 2024" },
    { title: "50 Sessions Complete", completed: false, date: "In progress" },
    { title: "IELTS Ready (85%)", completed: false, date: "Target: Dec 2024" },
  ];

  const getReadyScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getReadyScoreLabel = (score: number) => {
    if (score >= 85) return "IELTS Ready";
    if (score >= 70) return "Almost Ready";
    if (score >= 50) return "Good Progress";
    return "Keep Practicing";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Your Progress</h1>

        {/* IELTS Ready Meter */}
        <Card className="mb-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-primary" />
                  IELTS Ready Meter
                </CardTitle>
                <CardDescription>Your overall readiness for IELTS Speaking test</CardDescription>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {getReadyScoreLabel(ieltsReadyScore)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p className={`text-6xl font-bold ${getReadyScoreColor(ieltsReadyScore)}`}>
                {ieltsReadyScore}%
              </p>
            </div>
            <Progress value={ieltsReadyScore} className="h-4 mb-4" />
            <p className="text-sm text-center text-muted-foreground">
              {ieltsReadyScore >= 85 
                ? "You're ready to take the IELTS Speaking test!" 
                : ieltsReadyScore >= 70
                ? "Keep practicing! You're almost ready."
                : ieltsReadyScore >= 50
                ? "Good progress! Continue practicing regularly."
                : "Focus on all four criteria to improve your score."}
            </p>
          </CardContent>
        </Card>

        {/* Criteria Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Score by Criteria</CardTitle>
              <CardDescription>Your performance across IELTS criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {criteriaScores.map((item) => (
                  <div key={item.criteria}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{item.criteria}</span>
                      <span className="text-sm font-bold text-primary">{item.score}%</span>
                    </div>
                    <Progress value={item.score} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills Radar</CardTitle>
              <CardDescription>Visual breakdown of your abilities</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ChartContainer
                config={{
                  score: {
                    label: "Score",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[250px] w-full"
              >
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Progress Over Time */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Progress Over Time
            </CardTitle>
            <CardDescription>Your IELTS Ready Score improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                score: {
                  label: "Ready Score",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[200px] w-full"
            >
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Practice Activity</CardTitle>
            <CardDescription>Your practice sessions by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                sessions: {
                  label: "Sessions",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[200px] w-full"
            >
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="activity" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Milestones & Achievements
            </CardTitle>
            <CardDescription>Track your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border"
                >
                  <div className="mt-1">
                    {milestone.completed ? (
                      <Award className="h-5 w-5 text-primary" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${milestone.completed ? "text-foreground" : "text-muted-foreground"}`}>
                      {milestone.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{milestone.date}</p>
                  </div>
                  {milestone.completed && (
                    <Badge variant="secondary">Completed</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { learningPaths } from "@/data/learningPaths";
import { 
  Briefcase, 
  Plane, 
  GraduationCap, 
  MessageCircle, 
  Target,
  Clock,
  BookOpen,
  TrendingUp,
  LucideIcon
} from "lucide-react";
import { useLocation } from "wouter";
import TalkyLogo from "@/components/TalkyLogo";

const iconMap: Record<string, LucideIcon> = {
  "briefcase": Briefcase,
  "plane": Plane,
  "graduation-cap": GraduationCap,
  "message-circle": MessageCircle,
  "target": Target
};

export default function LearningPaths() {
  const [, setLocation] = useLocation();
  const [selectedDifficulty, setSelectedDifficulty] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");

  const filteredPaths = selectedDifficulty === "all" 
    ? learningPaths 
    : learningPaths.filter(path => path.difficulty === selectedDifficulty);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "intermediate": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "advanced": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="container py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <TalkyLogo />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Learning Paths</h1>
          <p className="text-muted-foreground">
            Follow structured tracks to master English for specific purposes
          </p>
        </div>

        {/* Difficulty Filter */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <Button
            variant={selectedDifficulty === "all" ? "default" : "outline"}
            onClick={() => setSelectedDifficulty("all")}
          >
            All Tracks
          </Button>
          <Button
            variant={selectedDifficulty === "beginner" ? "default" : "outline"}
            onClick={() => setSelectedDifficulty("beginner")}
          >
            Beginner
          </Button>
          <Button
            variant={selectedDifficulty === "intermediate" ? "default" : "outline"}
            onClick={() => setSelectedDifficulty("intermediate")}
          >
            Intermediate
          </Button>
          <Button
            variant={selectedDifficulty === "advanced" ? "default" : "outline"}
            onClick={() => setSelectedDifficulty("advanced")}
          >
            Advanced
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{learningPaths.length}</p>
                  <p className="text-sm text-muted-foreground">Learning Tracks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Target className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {learningPaths.reduce((sum, path) => sum + path.totalLessons, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Lessons</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-chart-3/10">
                  <Clock className="h-6 w-6 text-chart-3" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {learningPaths.reduce((sum, path) => sum + path.estimatedHours, 0)}h
                  </p>
                  <p className="text-sm text-muted-foreground">Learning Content</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Paths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPaths.map((path) => {
            const Icon = iconMap[path.icon] || BookOpen;
            
            return (
              <Card 
                key={path.id} 
                className="hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setLocation(`/learning-paths/${path.id}`)}
              >
                <CardHeader>
                  {/* Icon and Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${path.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge className={getDifficultyColor(path.difficulty)}>
                      {path.difficulty}
                    </Badge>
                  </div>

                  {/* Title and Description */}
                  <CardTitle className="text-xl mb-2">{path.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {path.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{path.totalLessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{path.estimatedHours}h total</span>
                    </div>
                  </div>

                  {/* Progress (Mock for now) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">0%</span>
                    </div>
                    <Progress value={0} />
                  </div>

                  {/* CTA */}
                  <Button className="w-full group-hover:bg-primary/90">
                    Start Learning
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredPaths.length === 0 && (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">No tracks found</h3>
                <p className="text-muted-foreground">
                  Try selecting a different difficulty level
                </p>
              </div>
              <Button onClick={() => setSelectedDifficulty("all")}>
                Show All Tracks
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

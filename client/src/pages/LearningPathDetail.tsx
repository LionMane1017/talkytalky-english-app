import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getLearningPathById } from "@/data/learningPaths";
import { 
  ArrowLeft,
  Clock,
  CheckCircle2,
  Lock,
  Play,
  BookOpen
} from "lucide-react";
import { useLocation, useRoute } from "wouter";
import TalkyLogo from "@/components/TalkyLogo";
import { toast } from "sonner";

export default function LearningPathDetail() {
  const [, params] = useRoute("/learning-paths/:pathId");
  const [, setLocation] = useLocation();
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const path = params?.pathId ? getLearningPathById(params.pathId) : null;

  if (!path) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Learning Path Not Found</CardTitle>
            <CardDescription>
              The learning path you're looking for doesn't exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/learning-paths")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Learning Paths
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completionPercentage = Math.round((completedLessons.size / path.totalLessons) * 100);

  const isLessonUnlocked = (lessonIndex: number) => {
    // First lesson is always unlocked
    if (lessonIndex === 0) return true;
    
    // Check if previous lesson is completed
    const previousLesson = path.lessons[lessonIndex - 1];
    return completedLessons.has(previousLesson.id);
  };

  const startLesson = (lessonId: string, lessonIndex: number) => {
    if (!isLessonUnlocked(lessonIndex)) {
      toast.error("Complete the previous lesson first!");
      return;
    }

    // Get the lesson vocabulary words
    const lesson = path.lessons[lessonIndex];
    
    // Navigate to practice page with lesson-specific vocabulary
    // Store lesson context in sessionStorage for practice page to use
    sessionStorage.setItem('currentLesson', JSON.stringify({
      pathId: path.id,
      lessonId: lessonId,
      lessonTitle: lesson.title,
      wordIds: lesson.wordIds
    }));
    
    toast.success(`Starting: ${lesson.title}`);
    setLocation("/practice");
  };

  const markLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => {
      const newSet = new Set(prev);
      newSet.add(lessonId);
      return newSet;
    });
  };

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
      <div className="container py-6 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <TalkyLogo />
        </div>

        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => setLocation("/learning-paths")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Learning Paths
        </Button>

        {/* Path Overview */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{path.title}</h1>
                  <Badge className={getDifficultyColor(path.difficulty)}>
                    {path.difficulty}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{path.description}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{path.totalLessons} lessons</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{path.estimatedHours}h total</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {completedLessons.size}/{path.totalLessons} completed
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Overall Progress</span>
                <span className="text-muted-foreground">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Lessons List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Lessons</h2>
          
          {path.lessons.map((lesson, index) => {
            const isCompleted = completedLessons.has(lesson.id);
            const isUnlocked = isLessonUnlocked(index);
            const isLocked = !isUnlocked;

            return (
              <Card 
                key={lesson.id}
                className={`transition-all ${
                  isLocked ? "opacity-60" : "hover:shadow-md cursor-pointer"
                } ${isCompleted ? "border-primary bg-primary/5" : ""}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                          {index + 1}
                        </div>
                        <CardTitle className="text-lg">{lesson.title}</CardTitle>
                        {isCompleted && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                        {isLocked && (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <CardDescription className="ml-11">
                        {lesson.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{lesson.estimatedTime} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{lesson.wordIds.length} words</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {lesson.difficulty}
                      </Badge>
                    </div>

                    <Button
                      onClick={() => startLesson(lesson.id, index)}
                      disabled={isLocked}
                      variant={isCompleted ? "outline" : "default"}
                    >
                      {isLocked ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Locked
                        </>
                      ) : isCompleted ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Review
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Completion Card */}
        {completionPercentage === 100 && (
          <Card className="mt-8 bg-primary/10 border-primary">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/20">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Congratulations! 🎉</CardTitle>
                  <CardDescription>
                    You've completed all lessons in this learning path!
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setLocation("/learning-paths")}>
                Explore More Paths
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

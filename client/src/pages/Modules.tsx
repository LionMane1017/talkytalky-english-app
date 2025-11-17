import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Mic, MessageSquare, Target, Clock } from "lucide-react";
import { useLocation } from "wouter";

export default function Modules() {
  const [, setLocation] = useLocation();

  const modules = [
    {
      id: "vocabulary-beginner",
      title: "Vocabulary - Beginner",
      description: "Essential words for everyday conversation",
      icon: BookOpen,
      difficulty: "Beginner",
      wordCount: 40,
      estimatedTime: "30 min",
      route: "/practice"
    },
    {
      id: "ielts-part1",
      title: "IELTS Speaking Part 1",
      description: "Introduction and interview questions",
      icon: Mic,
      difficulty: "Intermediate",
      questionCount: 10,
      estimatedTime: "15 min",
      route: "/ielts"
    },
    {
      id: "ielts-part2",
      title: "IELTS Speaking Part 2",
      description: "Long turn - 2 minute speaking tasks",
      icon: MessageSquare,
      difficulty: "Advanced",
      questionCount: 8,
      estimatedTime: "25 min",
      route: "/ielts"
    },
    {
      id: "ielts-part3",
      title: "IELTS Speaking Part 3",
      description: "Abstract discussion questions",
      icon: Target,
      difficulty: "Advanced",
      questionCount: 7,
      estimatedTime: "20 min",
      route: "/ielts"
    }
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Learning Modules</h1>
          <p className="text-muted-foreground">Choose a module to start practicing</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant={
                      module.difficulty === "Beginner" ? "secondary" :
                      module.difficulty === "Intermediate" ? "default" : "destructive"
                    }>
                      {module.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {module.wordCount ? `${module.wordCount} words` : `${module.questionCount} questions`}
                      </span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{module.estimatedTime}</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => setLocation(module.route)}
                    >
                      Start Module
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getRandomQuestion, type IELTSQuestion } from "@/data/ieltsQuestions";
import { Clock, Mic, MicOff, ArrowRight, RotateCcw, BookOpen } from "lucide-react";
import { toast } from "sonner";

type PracticeMode = "part1" | "part2" | "part3" | "mock" | null;
type SessionPhase = "intro" | "preparation" | "speaking" | "complete";

export default function IELTSPractice() {
  const [mode, setMode] = useState<PracticeMode>(null);
  const [phase, setPhase] = useState<SessionPhase>("intro");
  const [currentQuestion, setCurrentQuestion] = useState<IELTSQuestion | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [questionsCompleted, setQuestionsCompleted] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeRemaining > 0 && (phase === "preparation" || phase === "speaking")) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeRemaining, phase]);

  const startPractice = (practiceMode: PracticeMode) => {
    setMode(practiceMode);
    
    if (practiceMode === "part1") {
      loadQuestion(1);
    } else if (practiceMode === "part2") {
      loadQuestion(2);
    } else if (practiceMode === "part3") {
      loadQuestion(3);
    } else if (practiceMode === "mock") {
      // Start with Part 1 for mock test
      loadQuestion(1);
    }
    
    setQuestionsCompleted(0);
    setPhase("intro");
  };

  const loadQuestion = (part: 1 | 2 | 3) => {
    const question = getRandomQuestion(part);
    setCurrentQuestion(question);
    setPhase("intro");
  };

  const startPreparation = () => {
    if (!currentQuestion) return;
    
    if (currentQuestion.part === 2) {
      setPhase("preparation");
      setTimeRemaining(currentQuestion.preparationTime || 60);
      toast.info("You have 1 minute to prepare. Make notes if needed.");
    } else {
      startSpeaking();
    }
  };

  const startSpeaking = () => {
    if (!currentQuestion) return;
    
    setPhase("speaking");
    setIsRecording(true);
    
    if (currentQuestion.part === 2) {
      setTimeRemaining(currentQuestion.speakingTime || 120);
      toast.info("Speak for 2 minutes on this topic.");
    } else if (currentQuestion.part === 1) {
      setTimeRemaining(30);
      toast.info("Answer the question naturally.");
    } else {
      setTimeRemaining(60);
      toast.info("Provide a detailed answer with examples.");
    }
  };

  const handleTimeUp = () => {
    if (phase === "preparation") {
      startSpeaking();
    } else if (phase === "speaking") {
      completeQuestion();
    }
  };

  const completeQuestion = () => {
    setIsRecording(false);
    setQuestionsCompleted(prev => prev + 1);
    setPhase("complete");
  };

  const nextQuestion = () => {
    if (!currentQuestion || !mode) return;
    
    if (mode === "mock") {
      // Mock test progression: Part 1 -> Part 2 -> Part 3
      if (currentQuestion.part === 1 && questionsCompleted < 3) {
        loadQuestion(1);
      } else if (currentQuestion.part === 1 && questionsCompleted >= 3) {
        loadQuestion(2);
      } else if (currentQuestion.part === 2) {
        loadQuestion(3);
      } else if (currentQuestion.part === 3 && questionsCompleted < 8) {
        loadQuestion(3);
      } else {
        // Mock test complete
        resetPractice();
        toast.success("Mock test complete! Great job!");
        return;
      }
    } else {
      loadQuestion(currentQuestion.part);
    }
  };

  const resetPractice = () => {
    setMode(null);
    setPhase("intro");
    setCurrentQuestion(null);
    setTimeRemaining(0);
    setIsRecording(false);
    setQuestionsCompleted(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!mode) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-6 max-w-4xl">
          <h1 className="text-3xl font-bold mb-2 text-foreground">IELTS Practice</h1>
          <p className="text-muted-foreground mb-8">
            Practice for IELTS Speaking test with realistic questions and timing
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => startPractice("part1")}
            >
              <CardHeader>
                <Badge className="w-fit mb-2">Part 1</Badge>
                <CardTitle>Quick Practice</CardTitle>
                <CardDescription>
                  Introduction and interview questions (4-5 minutes)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li>• Personal information questions</li>
                  <li>• Familiar topics</li>
                  <li>• Short answers (20-30 seconds)</li>
                </ul>
                <Button className="w-full">Start Part 1</Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => startPractice("part2")}
            >
              <CardHeader>
                <Badge className="w-fit mb-2">Part 2</Badge>
                <CardTitle>Long Turn</CardTitle>
                <CardDescription>
                  Individual long turn with preparation (3-4 minutes)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li>• 1 minute preparation time</li>
                  <li>• 2 minutes speaking</li>
                  <li>• Speak on given topic</li>
                </ul>
                <Button className="w-full">Start Part 2</Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => startPractice("part3")}
            >
              <CardHeader>
                <Badge className="w-fit mb-2">Part 3</Badge>
                <CardTitle>Discussion</CardTitle>
                <CardDescription>
                  Abstract discussion questions (4-5 minutes)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li>• Abstract topics</li>
                  <li>• Detailed answers required</li>
                  <li>• Opinion and analysis</li>
                </ul>
                <Button className="w-full">Start Part 3</Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow border-primary"
              onClick={() => startPractice("mock")}
            >
              <CardHeader>
                <Badge className="w-fit mb-2" variant="default">Full Test</Badge>
                <CardTitle>Mock Test</CardTitle>
                <CardDescription>
                  Complete IELTS Speaking test (11-14 minutes)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li>• All three parts</li>
                  <li>• Realistic timing</li>
                  <li>• Full test experience</li>
                </ul>
                <Button className="w-full">Start Mock Test</Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                IELTS Speaking Test Format
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground">Part 1 (4-5 min):</p>
                <p>General questions about yourself, home, family, work, studies, and interests.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Part 2 (3-4 min):</p>
                <p>Speak for 2 minutes on a given topic after 1 minute of preparation time.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Part 3 (4-5 min):</p>
                <p>Discussion of more abstract ideas related to Part 2 topic.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {mode === "mock" ? "Mock Test" : `Part ${currentQuestion?.part} Practice`}
            </h1>
            <Badge className="mt-2">
              Question {questionsCompleted + 1}
            </Badge>
          </div>
          <Button variant="outline" onClick={resetPractice}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Exit
          </Button>
        </div>

        {/* Timer Card */}
        {(phase === "preparation" || phase === "speaking") && (
          <Card className="mb-6 bg-primary/10 border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">
                    {phase === "preparation" ? "Preparation Time" : "Speaking Time"}
                  </span>
                </div>
                <span className="text-3xl font-bold text-primary">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <Progress 
                value={phase === "preparation" 
                  ? ((60 - timeRemaining) / 60) * 100 
                  : currentQuestion?.part === 2 
                    ? ((120 - timeRemaining) / 120) * 100
                    : ((60 - timeRemaining) / 60) * 100
                } 
                className="mt-4" 
              />
            </CardContent>
          </Card>
        )}

        {/* Question Card */}
        {currentQuestion && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">Part {currentQuestion.part}</Badge>
                {currentQuestion.category && (
                  <Badge variant="outline">{currentQuestion.category}</Badge>
                )}
              </div>
              <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
            </CardHeader>
            {phase === "intro" && currentQuestion.part === 2 && (
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  You will have 1 minute to prepare and make notes, then speak for 2 minutes.
                </p>
                <Button onClick={startPreparation} className="w-full gap-2">
                  Start Preparation
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            )}
            {phase === "intro" && currentQuestion.part !== 2 && (
              <CardContent>
                <Button onClick={startSpeaking} className="w-full gap-2">
                  <Mic className="h-4 w-4" />
                  Start Speaking
                </Button>
              </CardContent>
            )}
          </Card>
        )}

        {/* Recording Indicator */}
        {phase === "speaking" && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center animate-pulse">
                  {isRecording ? (
                    <MicOff className="h-10 w-10 text-destructive" />
                  ) : (
                    <Mic className="h-10 w-10 text-primary" />
                  )}
                </div>
                <p className="text-center text-muted-foreground">
                  {isRecording ? "Recording your response..." : "Speak now"}
                </p>
                <Button 
                  variant="outline" 
                  onClick={completeQuestion}
                  className="gap-2"
                >
                  Stop Recording
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preparation Phase */}
        {phase === "preparation" && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground mb-4">
                Use this time to organize your thoughts and make notes.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg min-h-[200px]">
                <p className="text-sm text-muted-foreground text-center">
                  Make notes here (on paper during actual test)
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Complete Phase */}
        {phase === "complete" && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-lg font-medium text-foreground mb-4">
                Response recorded successfully!
              </p>
              {currentQuestion?.followUpQuestions && currentQuestion.followUpQuestions.length > 0 && (
                <div className="mb-6 text-left">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Follow-up questions:</p>
                  <ul className="space-y-2">
                    {currentQuestion.followUpQuestions.map((q, i) => (
                      <li key={i} className="text-sm text-foreground">• {q}</li>
                    ))}
                  </ul>
                </div>
              )}
              <Button onClick={nextQuestion} className="w-full gap-2">
                Next Question
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

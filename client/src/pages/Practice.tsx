import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import SpeechRecorder from "@/components/SpeechRecorder";
import { getRandomWords, type VocabularyWord } from "@/data/vocabulary";
import { ArrowRight, RotateCcw, Trophy } from "lucide-react";

export default function Practice() {
  const [currentWord, setCurrentWord] = useState<VocabularyWord | null>(null);
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced" | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [sessionScore, setSessionScore] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);

  const startPractice = (level: "beginner" | "intermediate" | "advanced") => {
    setDifficulty(level);
    const words = getRandomWords(1, level);
    setCurrentWord(words[0]);
    setScore(null);
    setSessionScore([]);
    setAttempts(0);
  };

  const handleTranscript = (transcript: string, pronunciationScore: number) => {
    setScore(pronunciationScore);
    setSessionScore(prev => [...prev, pronunciationScore]);
    setAttempts(prev => prev + 1);
  };

  const nextWord = () => {
    if (difficulty) {
      const words = getRandomWords(1, difficulty);
      setCurrentWord(words[0]);
      setScore(null);
    }
  };

  const resetSession = () => {
    setCurrentWord(null);
    setDifficulty(null);
    setScore(null);
    setSessionScore([]);
    setAttempts(0);
  };

  const averageScore = sessionScore.length > 0
    ? Math.round(sessionScore.reduce((a, b) => a + b, 0) / sessionScore.length)
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreFeedback = (score: number) => {
    if (score >= 90) return "Excellent! 🎉";
    if (score >= 70) return "Good job! Keep practicing.";
    if (score >= 50) return "Not bad. Try again!";
    return "Keep trying. Listen carefully.";
  };

  if (!difficulty || !currentWord) {
    return (
      <div className="min-h-screen pb-20">
        <div className="container py-6 max-w-4xl">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Practice Speaking</h1>
          <p className="text-muted-foreground mb-8">
            Choose a difficulty level to start practicing pronunciation
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => startPractice("beginner")}
            >
              <CardHeader>
                <Badge className="w-fit mb-2" variant="secondary">Beginner</Badge>
                <CardTitle>Basic Words</CardTitle>
                <CardDescription>
                  Start with simple, everyday vocabulary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Start Practice</Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => startPractice("intermediate")}
            >
              <CardHeader>
                <Badge className="w-fit mb-2" variant="secondary">Intermediate</Badge>
                <CardTitle>Common Words</CardTitle>
                <CardDescription>
                  Practice frequently used vocabulary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Start Practice</Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => startPractice("advanced")}
            >
              <CardHeader>
                <Badge className="w-fit mb-2" variant="secondary">Advanced</Badge>
                <CardTitle>IELTS Words</CardTitle>
                <CardDescription>
                  Master academic and complex vocabulary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Start Practice</Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>1. Choose your difficulty level</p>
              <p>2. Click the microphone button and speak the word clearly</p>
              <p>3. Get instant feedback on your pronunciation</p>
              <p>4. Practice multiple words to improve your score</p>
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
            <h1 className="text-3xl font-bold text-foreground">Practice Session</h1>
            <Badge className="mt-2" variant="secondary">
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Badge>
          </div>
          <Button variant="outline" onClick={resetSession}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Change Level
          </Button>
        </div>

        {/* Session Stats */}
        {sessionScore.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-foreground">{attempts}</p>
                  <p className="text-sm text-muted-foreground">Attempts</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{averageScore}%</p>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent-foreground">
                    {sessionScore.filter(s => s >= 70).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Good Scores</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Word */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center text-4xl font-bold text-foreground">
              {currentWord.word}
            </CardTitle>
            <CardDescription className="text-center text-lg">
              {currentWord.phonetic}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Meaning:</p>
                <p className="text-foreground">{currentWord.meaning}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Example:</p>
                <p className="text-foreground italic">"{currentWord.example}"</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Speech Recorder */}
        <SpeechRecorder 
          targetWord={currentWord.word}
          onTranscript={handleTranscript}
        />

        {/* Score Display */}
        {score !== null && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-2">Your Score</p>
                <p className={`text-5xl font-bold ${getScoreColor(score)}`}>
                  {score}%
                </p>
                <p className="text-lg text-muted-foreground mt-2">
                  {getScoreFeedback(score)}
                </p>
              </div>
              
              <Progress value={score} className="mb-4" />
              
              <Button 
                className="w-full gap-2"
                onClick={nextWord}
              >
                Next Word
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

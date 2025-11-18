import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import GeminiVoiceRecorder from "@/components/GeminiVoiceRecorder";
import { vocabularyData, type VocabularyWord } from "@/data/vocabulary";
import { ArrowRight, RotateCcw, Trophy, Volume2 } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import TalkyLogo from "@/components/TalkyLogo";

export default function Practice() {
  const [currentWord, setCurrentWord] = useState<VocabularyWord | null>(null);
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced" | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [sessionScore, setSessionScore] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [usedWordIds, setUsedWordIds] = useState<Set<string>>(new Set());
  const { speak, isSpeaking } = useTextToSpeech();
  const { data: user } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    // Don't throw error to prevent redirect
    throwOnError: false,
  });
  const saveSessionMutation = trpc.practice.saveSession.useMutation({
    onSuccess: () => {
      toast.success("Practice session saved!");
    },
    onError: (error) => {
      console.error("Failed to save session:", error);
      // Don't show error toast if user is not logged in
      if (!error.message.includes("UNAUTHORIZED")) {
        toast.error("Failed to save session. Please try again.");
      }
    },
  });

  // Get available words for current difficulty
  const availableWords = useMemo(() => {
    if (!difficulty) return [];
    return vocabularyData.filter(
      word => word.difficulty === difficulty && !usedWordIds.has(word.id)
    );
  }, [difficulty, usedWordIds]);

  const wordsRemaining = availableWords.length;
  const totalWords = vocabularyData.filter(w => w.difficulty === difficulty).length;

  const startPractice = (level: "beginner" | "intermediate" | "advanced") => {
    setDifficulty(level);
    setUsedWordIds(new Set());
    const words = vocabularyData.filter(w => w.difficulty === level);
    if (words.length > 0) {
      const randomWord = words[Math.floor(Math.random() * words.length)];
      setCurrentWord(randomWord);
      setUsedWordIds(new Set([randomWord.id]));
    }
    setScore(null);
    setSessionScore([]);
    setAttempts(0);
  };

  const handleTranscript = useCallback((transcript: string, pronunciationScore: number) => {
    setScore(pronunciationScore);
    setSessionScore(prev => [...prev, pronunciationScore]);
    setAttempts(prev => prev + 1);
    
    // Save session to backend (only if logged in)
    if (user && difficulty && currentWord) {
      saveSessionMutation.mutate({
        type: "pronunciation",
        difficulty,
        score: pronunciationScore,
        wordsCompleted: 1,
        accuracy: pronunciationScore,
      });
    }
  }, [user, difficulty, currentWord, saveSessionMutation]);

  const nextWord = () => {
    if (!difficulty) return;

    const available = vocabularyData.filter(
      word => word.difficulty === difficulty && !usedWordIds.has(word.id)
    );

    if (available.length === 0) {
      toast.info("You've practiced all words in this level! Starting over...");
      setUsedWordIds(new Set());
      const allWords = vocabularyData.filter(w => w.difficulty === difficulty);
      if (allWords.length > 0) {
        const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
        setCurrentWord(randomWord);
        setUsedWordIds(new Set([randomWord.id]));
      }
    } else {
      const randomWord = available[Math.floor(Math.random() * available.length)];
      setCurrentWord(randomWord);
      setUsedWordIds(prev => {
        const newSet = new Set(prev);
        newSet.add(randomWord.id);
        return newSet;
      });
    }
    setScore(null);
  };

  const resetSession = () => {
    setCurrentWord(null);
    setDifficulty(null);
    setScore(null);
    setSessionScore([]);
    setAttempts(0);
    setUsedWordIds(new Set());
  };

  const averageScore = sessionScore.length > 0
    ? Math.round(sessionScore.reduce((a, b) => a + b, 0) / sessionScore.length)
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-300";
    if (score >= 70) return "text-yellow-300";
    return "text-red-300";
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
          <div className="mb-8">
            <TalkyLogo />
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <div className="container py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">Practice Session</h1>
            <Badge className="mt-2 bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Badge>
          </div>
          <Button variant="outline" onClick={resetSession} className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Change Level
          </Button>
        </div>

        {/* Session Stats */}
        {sessionScore.length > 0 && (
          <Card className="mb-6 bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardContent className="pt-6">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-white">{attempts}</p>
                  <p className="text-sm text-white/70">Attempts</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-300">{averageScore}%</p>
                  <p className="text-sm text-white/70">Avg Score</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-300">
                    {sessionScore.filter(s => s >= 70).length}
                  </p>
                  <p className="text-sm text-white/70">Good Scores</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-300">{wordsRemaining}/{totalWords}</p>
                  <p className="text-sm text-white/70">Remaining</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Word */}
        <Card className="mb-6 bg-white/15 backdrop-blur-lg border-2 border-white/30 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-center gap-4">
              <CardTitle className="text-center text-6xl font-bold text-white drop-shadow-2xl animate-pulse">
                {currentWord.word}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => speak(currentWord.word)}
                disabled={isSpeaking}
                className="rounded-full bg-white/20 hover:bg-white/30 border-white/40"
              >
                <Volume2 className={`h-6 w-6 text-white ${isSpeaking ? 'animate-pulse' : ''}`} />
              </Button>
            </div>
            <CardDescription className="text-center text-2xl font-medium text-yellow-200 mt-3">
              {currentWord.phonetic}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-5 rounded-xl border border-white/20 backdrop-blur-sm">
              <p className="text-sm font-bold text-yellow-300 mb-2 uppercase tracking-wide">📖 Meaning</p>
              <p className="text-white text-lg leading-relaxed">{currentWord.meaning}</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-5 rounded-xl border border-white/20 backdrop-blur-sm">
              <p className="text-sm font-bold text-yellow-300 mb-2 uppercase tracking-wide">💬 Example</p>
              <p className="text-white text-lg italic leading-relaxed">"{currentWord.example}"</p>
            </div>
          </CardContent>
        </Card>

        {/* Gemini Voice Recorder */}
        <GeminiVoiceRecorder 
          targetWord={currentWord.word}
          difficulty={difficulty}
          onResult={(result) => {
            setScore(result.scores.overall);
            setSessionScore(prev => [...prev, result.scores.overall]);
            setAttempts(prev => prev + 1);
            
            // Save session if user is logged in
            if (user) {
              saveSessionMutation.mutate({
                type: "pronunciation",
                difficulty,
                score: result.scores.overall,
                wordsCompleted: 1,
                accuracy: result.scores.accuracy,
                duration: 30,
              });
            }
          }}
          previousScore={sessionScore[sessionScore.length - 1]}
        />

        {/* Score Display */}
        {score !== null && (
          <div className="mt-6 space-y-4">
            <Card className="bg-white/15 backdrop-blur-lg border-2 border-white/30 shadow-2xl">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <p className="text-sm text-white/70 mb-2 uppercase tracking-wide">Your Score</p>
                  <p className={`text-6xl font-bold ${getScoreColor(score)} drop-shadow-lg`}>
                    {score}%
                  </p>
                  <p className="text-xl text-white mt-3">
                    {getScoreFeedback(score)}
                  </p>
                </div>
                <Progress value={score} className="mb-4 h-3" />
              </CardContent>
            </Card>
            
            <Button 
              className="w-full gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg shadow-xl"
              onClick={nextWord}
              size="lg"
            >
              Next Word
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

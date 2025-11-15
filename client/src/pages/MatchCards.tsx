import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getRandomWords, type VocabularyWord } from "@/data/vocabulary";
import { Trophy, RotateCcw, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface MatchCard {
  id: string;
  content: string;
  type: "word" | "meaning";
  wordId: string;
  isMatched: boolean;
}

export default function MatchCards() {
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced" | null>(null);
  const [cards, setCards] = useState<MatchCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<MatchCard[]>([]);
  const [matches, setMatches] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const { data: user } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    throwOnError: false,
  });
  
  const saveSessionMutation = trpc.practice.saveSession.useMutation({
    onSuccess: () => {
      toast.success("Match session saved!");
    },
    onError: (error) => {
      console.error("Failed to save session:", error);
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !gameComplete) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameComplete]);

  const startGame = (level: "beginner" | "intermediate" | "advanced") => {
    setDifficulty(level);
    const words = getRandomWords(6, level);
    
    const gameCards: MatchCard[] = [];
    words.forEach(word => {
      gameCards.push({
        id: `word-${word.id}`,
        content: word.word,
        type: "word",
        wordId: word.id,
        isMatched: false
      });
      gameCards.push({
        id: `meaning-${word.id}`,
        content: word.meaning,
        type: "meaning",
        wordId: word.id,
        isMatched: false
      });
    });

    // Shuffle cards
    const shuffled = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setSelectedCards([]);
    setMatches(0);
    setAttempts(0);
    setTimeElapsed(0);
    setIsPlaying(true);
    setGameComplete(false);
  };

  const handleCardClick = (card: MatchCard) => {
    if (card.isMatched || selectedCards.find(c => c.id === card.id)) {
      return;
    }

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setAttempts(prev => prev + 1);
      
      // Check if cards match
      if (newSelected[0].wordId === newSelected[1].wordId && 
          newSelected[0].type !== newSelected[1].type) {
        // Match found!
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.wordId === card.wordId ? { ...c, isMatched: true } : c
          ));
          setMatches(prev => prev + 1);
          setSelectedCards([]);
          
          // Check if game is complete
          const totalPairs = cards.length / 2;
          if (matches + 1 === totalPairs) {
            setGameComplete(true);
            setIsPlaying(false);
            
            // Save session to backend (only if logged in)
            const finalAccuracy = Math.round(((matches + 1) / attempts) * 100);
            if (user && difficulty) {
              saveSessionMutation.mutate({
                type: "matching",
                difficulty,
                score: finalAccuracy,
                wordsCompleted: totalPairs,
                accuracy: finalAccuracy,
                duration: timeElapsed,
              });
            }
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    setDifficulty(null);
    setCards([]);
    setSelectedCards([]);
    setMatches(0);
    setAttempts(0);
    setTimeElapsed(0);
    setIsPlaying(false);
    setGameComplete(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const accuracy = attempts > 0 ? Math.round((matches / attempts) * 100) : 0;

  if (!difficulty || cards.length === 0) {
    return (
      <div className="min-h-screen pb-20">
        <div className="container py-6 max-w-4xl">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Match Cards</h1>
          <p className="text-muted-foreground mb-8">
            Match English words with their meanings to build your vocabulary
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => startGame("beginner")}
            >
              <CardHeader>
                <Badge className="w-fit mb-2" variant="secondary">Beginner</Badge>
                <CardTitle>Basic Words</CardTitle>
                <CardDescription>
                  6 pairs of simple vocabulary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Start Game</Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => startGame("intermediate")}
            >
              <CardHeader>
                <Badge className="w-fit mb-2" variant="secondary">Intermediate</Badge>
                <CardTitle>Common Words</CardTitle>
                <CardDescription>
                  6 pairs of everyday vocabulary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Start Game</Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => startGame("advanced")}
            >
              <CardHeader>
                <Badge className="w-fit mb-2" variant="secondary">Advanced</Badge>
                <CardTitle>IELTS Words</CardTitle>
                <CardDescription>
                  6 pairs of academic vocabulary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Start Game</Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                How to Play
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>1. Choose your difficulty level to start</p>
              <p>2. Click on cards to reveal words and meanings</p>
              <p>3. Match each word with its correct meaning</p>
              <p>4. Complete all pairs as quickly as possible!</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Match Cards</h1>
            <Badge className="mt-2" variant="secondary">
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Badge>
          </div>
          <Button variant="outline" onClick={resetGame}>
            <RotateCcw className="h-4 w-4 mr-2" />
            New Game
          </Button>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-2xl font-bold text-foreground">{formatTime(timeElapsed)}</p>
              </div>
              <p className="text-sm text-muted-foreground">Time</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold text-primary">{matches}/{cards.length / 2}</p>
              <p className="text-sm text-muted-foreground">Matches</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold text-accent-foreground">{attempts}</p>
              <p className="text-sm text-muted-foreground">Attempts</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground">Progress</p>
              <p className="text-sm text-muted-foreground">
                {Math.round((matches / (cards.length / 2)) * 100)}%
              </p>
            </div>
            <Progress value={(matches / (cards.length / 2)) * 100} />
          </CardContent>
        </Card>

        {/* Game Complete */}
        {gameComplete && (
          <Card className="mb-6 bg-primary/10 border-primary">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Congratulations! 🎉</h2>
              <p className="text-muted-foreground mb-4">
                You completed the game in {formatTime(timeElapsed)} with {attempts} attempts!
              </p>
              <div className="flex gap-4 justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{accuracy}%</p>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                </div>
              </div>
              <Button className="mt-6" onClick={resetGame}>
                Play Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Game Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cards.map(card => {
            const isSelected = selectedCards.find(c => c.id === card.id);
            const isMatched = card.isMatched;

            return (
              <Card
                key={card.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  isMatched && "opacity-50 cursor-not-allowed bg-primary/10 border-primary",
                  isSelected && "bg-accent border-accent-foreground scale-105"
                )}
                onClick={() => handleCardClick(card)}
              >
                <CardContent className="pt-6 min-h-[120px] flex items-center justify-center">
                  <p className={cn(
                    "text-center font-medium",
                    card.type === "word" ? "text-lg text-foreground" : "text-sm text-muted-foreground"
                  )}>
                    {card.content}
                  </p>
                  {isMatched && (
                    <CheckCircle2 className="absolute top-2 right-2 h-5 w-5 text-primary" />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Keyboard, Volume2, Trophy, Zap } from "lucide-react";
import { toast } from "sonner";

interface PracticeInputProps {
  targetWord: string;
  onSubmit: (input: string, score: number) => void;
}

export default function PracticeInput({
  targetWord,
  onSubmit,
}: PracticeInputProps) {
  const [inputMode, setInputMode] = useState<"text" | "voice">("text");
  const [textInput, setTextInput] = useState("");
  const [isPlayingNative, setIsPlayingNative] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [xpPoints, setXpPoints] = useState(0);

  // Calculate similarity score (Levenshtein distance)
  const calculateScore = (input: string, target: string): number => {
    const inputLower = input.toLowerCase().trim();
    const targetLower = target.toLowerCase().trim();

    if (inputLower === targetLower) return 100;

    const distance = levenshteinDistance(inputLower, targetLower);
    const maxLength = Math.max(inputLower.length, targetLower.length);
    const score = Math.max(0, Math.round(((maxLength - distance) / maxLength) * 100));

    return score;
  };

  // Levenshtein distance algorithm
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) {
      toast.error("Please type the word first");
      return;
    }

    const score = calculateScore(textInput, targetWord);
    
    // Update combo and XP
    if (score >= 80) {
      const newCombo = comboCount + 1;
      setComboCount(newCombo);
      const earnedXP = score;
      setXpPoints(xpPoints + earnedXP);
      
      if (newCombo >= 5) {
        toast.success(`🔥 ${newCombo}x Combo! Amazing streak!`);
      }
    } else {
      setComboCount(0);
    }

    onSubmit(textInput, score);
    setTextInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTextSubmit();
    }
  };

  const playNativePronunciation = () => {
    setIsPlayingNative(true);
    const utterance = new SpeechSynthesisUtterance(targetWord);
    utterance.lang = "en-US";
    utterance.rate = 0.8;
    utterance.onend = () => setIsPlayingNative(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="font-bold">{comboCount}x Combo</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10">
          <Zap className="h-5 w-5 text-blue-500" />
          <span className="font-bold">{xpPoints} XP</span>
        </div>
      </div>

      {/* Input Mode Toggle */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant={inputMode === "text" ? "default" : "outline"}
          size="sm"
          onClick={() => setInputMode("text")}
        >
          <Keyboard className="h-4 w-4 mr-2" />
          Type
        </Button>
        <Button
          variant={inputMode === "voice" ? "default" : "outline"}
          size="sm"
          onClick={() => setInputMode("voice")}
          disabled
        >
          <Mic className="h-4 w-4 mr-2" />
          Voice (Coming Soon)
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Text Input Mode */}
          {inputMode === "text" && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Type the word you see above
                </p>
              </div>

              <div className="flex gap-2">
                <Input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type here..."
                  className="text-lg"
                  autoFocus
                />
                <Button onClick={handleTextSubmit} size="lg">
                  Submit
                </Button>
              </div>

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={playNativePronunciation}
                  disabled={isPlayingNative}
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  {isPlayingNative ? "Playing..." : "Hear Pronunciation"}
                </Button>
              </div>
            </div>
          )}

          {/* Voice Input Mode (Disabled) */}
          {inputMode === "voice" && (
            <div className="text-center py-8 text-muted-foreground">
              <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Voice input coming soon!</p>
              <p className="text-sm mt-2">Please use text input for now</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

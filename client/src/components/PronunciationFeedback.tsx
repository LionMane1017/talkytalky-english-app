import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

interface PronunciationFeedbackProps {
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  pronunciationScore: number;
  feedback: string[];
}

export default function PronunciationFeedback({
  accuracyScore,
  fluencyScore,
  completenessScore,
  pronunciationScore,
  feedback,
}: PronunciationFeedbackProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: "Excellent", variant: "default" as const };
    if (score >= 80) return { label: "Very Good", variant: "default" as const };
    if (score >= 70) return { label: "Good", variant: "secondary" as const };
    if (score >= 60) return { label: "Fair", variant: "secondary" as const };
    return { label: "Needs Practice", variant: "destructive" as const };
  };

  const overallBadge = getScoreBadge(pronunciationScore);

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Pronunciation Assessment</CardTitle>
          <Badge variant={overallBadge.variant}>{overallBadge.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center py-4 bg-muted/30 rounded-lg">
          <div className={`text-5xl font-bold ${getScoreColor(pronunciationScore)}`}>
            {pronunciationScore}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Overall Score</p>
        </div>

        {/* Detailed Metrics */}
        <div className="space-y-4">
          {/* Accuracy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Accuracy</span>
              <span className={`text-sm font-bold ${getScoreColor(accuracyScore)}`}>
                {accuracyScore}%
              </span>
            </div>
            <Progress value={accuracyScore} className="h-2" />
            <p className="text-xs text-muted-foreground">
              How correctly you pronounced the words
            </p>
          </div>

          {/* Fluency */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Fluency</span>
              <span className={`text-sm font-bold ${getScoreColor(fluencyScore)}`}>
                {fluencyScore}%
              </span>
            </div>
            <Progress value={fluencyScore} className="h-2" />
            <p className="text-xs text-muted-foreground">
              How smoothly and naturally you spoke
            </p>
          </div>

          {/* Completeness */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completeness</span>
              <span className={`text-sm font-bold ${getScoreColor(completenessScore)}`}>
                {completenessScore}%
              </span>
            </div>
            <Progress value={completenessScore} className="h-2" />
            <p className="text-xs text-muted-foreground">
              How much of the phrase you completed
            </p>
          </div>
        </div>

        {/* Feedback Messages */}
        {feedback.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm font-medium mb-3">
              <Info className="h-4 w-4" />
              <span>Feedback</span>
            </div>
            {feedback.map((message, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm bg-muted/50 p-3 rounded-lg"
              >
                {pronunciationScore >= 80 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                )}
                <span className="text-muted-foreground">{message}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

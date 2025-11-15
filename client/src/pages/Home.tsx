import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Grid3x3, Trophy, BarChart3 } from "lucide-react";
import { Link } from "wouter";

export default function Home() {

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-background py-12 px-4">
        <div className="container max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Master English Speaking
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Practice pronunciation, build vocabulary, and prepare for IELTS with AI-powered feedback and comprehensive analytics.
          </p>
          <Link href="/practice">
            <Button size="lg" className="gap-2">
              <Mic className="h-5 w-5" />
              Start Practicing
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="container py-12 max-w-6xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Learning Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/practice">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mic className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Speak & Score</CardTitle>
                </div>
                <CardDescription>
                  Practice pronunciation with real-time feedback and scoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• AI-powered pronunciation analysis</li>
                  <li>• Instant feedback and scoring</li>
                  <li>• IELTS-focused vocabulary</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/match">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <Grid3x3 className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <CardTitle>Match Cards</CardTitle>
                </div>
                <CardDescription>
                  Build vocabulary by matching words to meanings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Interactive matching game</li>
                  <li>• Multiple difficulty levels</li>
                  <li>• Track your progress</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/ielts">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-chart-3/20 rounded-lg">
                    <Trophy className="h-6 w-6 text-chart-3" />
                  </div>
                  <CardTitle>IELTS Practice</CardTitle>
                </div>
                <CardDescription>
                  Prepare for IELTS Speaking test with realistic practice
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Part 1, 2, 3 practice modes</li>
                  <li>• Full mock tests</li>
                  <li>• Timed speaking challenges</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-chart-4/20 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-chart-4" />
                  </div>
                  <CardTitle>Progress Dashboard</CardTitle>
                </div>
                <CardDescription>
                  Track your improvement with detailed analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• IELTS Ready Meter</li>
                  <li>• Score breakdown by criteria</li>
                  <li>• Milestones and achievements</li>
                </ul>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* IELTS Info Section */}
      <div className="bg-muted/50 py-12">
        <div className="container max-w-4xl px-4">
          <h2 className="text-2xl font-bold mb-4 text-center text-foreground">IELTS Speaking Criteria</h2>
          <p className="text-center text-muted-foreground mb-8">
            Our app helps you improve across all four IELTS Speaking assessment criteria:
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card p-4 rounded-lg border border-border text-center">
              <div className="font-semibold text-foreground mb-1">Pronunciation</div>
              <div className="text-sm text-muted-foreground">25%</div>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border text-center">
              <div className="font-semibold text-foreground mb-1">Fluency</div>
              <div className="text-sm text-muted-foreground">25%</div>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border text-center">
              <div className="font-semibold text-foreground mb-1">Vocabulary</div>
              <div className="text-sm text-muted-foreground">25%</div>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border text-center">
              <div className="font-semibold text-foreground mb-1">Grammar</div>
              <div className="text-sm text-muted-foreground">25%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

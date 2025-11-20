import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Grid3x3, Trophy, BarChart3, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import TalkyLogo from "@/components/TalkyLogo";

export default function Home() {
  const features = [
    {
      icon: Mic,
      title: "Speak & Score",
      description: "Practice pronunciation with real-time feedback and scoring",
      link: "/practice",
      color: "text-purple-600 dark:text-purple-400"
    },
    {
      icon: Grid3x3,
      title: "Match Cards",
      description: "Build vocabulary through interactive matching games",
      link: "/match",
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: Trophy,
      title: "IELTS Practice",
      description: "Prepare for IELTS Speaking test with realistic practice modes",
      link: "/ielts",
      color: "text-cyan-600 dark:text-cyan-400"
    },
    {
      icon: BarChart3,
      title: "Progress Dashboard",
      description: "Track your improvement with detailed analytics and insights",
      link: "/",
      color: "text-indigo-600 dark:text-indigo-400"
    }
  ];

  const criteria = [
    { name: "Pronunciation", percentage: 25, color: "bg-purple-600" },
    { name: "Fluency", percentage: 25, color: "bg-blue-600" },
    { name: "Vocabulary", percentage: 25, color: "bg-cyan-600" },
    { name: "Grammar", percentage: 25, color: "bg-indigo-600" }
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/5 to-transparent py-16 px-4">
        <div className="container max-w-4xl text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <TalkyLogo />
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">AI-Powered Learning Platform</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Master English Speaking
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Practice pronunciation, build vocabulary, and prepare for IELTS with cutting-edge AI feedback and comprehensive analytics.
          </p>
          
          <Link href="/practice">
            <Button size="lg" className="gap-2 text-lg px-8">
              <Mic className="h-5 w-5" />
              Start Practicing
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="container py-12 max-w-6xl">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Learning Features
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {features.map((feature) => (
            <Link key={feature.title} href={feature.link}>
              <Card className="cursor-pointer h-full hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-muted ${feature.color}`}>
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* IELTS Criteria Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">IELTS Speaking Criteria</CardTitle>
            <CardDescription>
              Our app helps you improve across all four IELTS Speaking assessment criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {criteria.map((criterion) => (
                <div key={criterion.name} className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-3">
                    <svg className="w-24 h-24 -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - criterion.percentage / 100)}`}
                        className={criterion.color.replace('bg-', 'text-')}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">{criterion.percentage}%</span>
                    </div>
                  </div>
                  <p className="font-medium">{criterion.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

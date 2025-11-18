import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Mic, Trophy, Zap, Target, Users, BookOpen, Star } from "lucide-react";
import { Link } from "wouter";
import TalkyLogo from "@/components/TalkyLogo";

export default function Landing() {
  const features = [
    {
      icon: Mic,
      title: "AI Pronunciation Scoring",
      description: "Get instant feedback on your pronunciation with advanced speech recognition technology"
    },
    {
      icon: BookOpen,
      title: "150+ Vocabulary Words",
      description: "Practice with carefully curated words across beginner, intermediate, and advanced levels"
    },
    {
      icon: Target,
      title: "IELTS Exam Preparation",
      description: "Master all three parts of the IELTS Speaking test with 100+ practice questions"
    },
    {
      icon: Trophy,
      title: "Progress Tracking",
      description: "Monitor your improvement with detailed analytics and performance metrics"
    },
    {
      icon: Zap,
      title: "Gamified Learning",
      description: "Earn XP points, unlock achievements, and build streaks to stay motivated"
    },
    {
      icon: Users,
      title: "Global Leaderboards",
      description: "Compete with learners worldwide and climb the rankings"
    }
  ];

  const pricingTiers = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out Talky Talky",
      features: [
        "50 words per day",
        "Basic pronunciation feedback",
        "Progress tracking",
        "Mobile & desktop access",
        "Community support"
      ],
      limitations: [
        "Daily practice limit",
        "Ads supported"
      ],
      cta: "Start Free",
      popular: false,
      href: "/dashboard"
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "per month",
      description: "Best for serious learners",
      features: [
        "Unlimited practice",
        "Advanced AI feedback",
        "All vocabulary & IELTS questions",
        "No ads",
        "Detailed analytics",
        "Learning paths",
        "Priority support"
      ],
      limitations: [],
      cta: "Go Pro",
      popular: true,
      href: "/dashboard"
    },
    {
      name: "Premium",
      price: "$19.99",
      period: "per month",
      description: "For professionals & exam prep",
      features: [
        "Everything in Pro",
        "1-on-1 coaching sessions",
        "Personalized study plan",
        "Weekly progress reports",
        "Certificate of completion",
        "Lifetime access to materials",
        "24/7 premium support"
      ],
      limitations: [],
      cta: "Go Premium",
      popular: false,
      href: "/dashboard"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "IELTS Student",
      avatar: "SC",
      rating: 5,
      text: "Talky Talky helped me improve my speaking score from 6.5 to 8.0 in just 3 months! The instant feedback is incredibly helpful."
    },
    {
      name: "Mohammed Al-Rahman",
      role: "Business Professional",
      avatar: "MA",
      rating: 5,
      text: "As a non-native speaker, I struggled with pronunciation. This app made practice fun and effective. Highly recommend!"
    },
    {
      name: "Elena Rodriguez",
      role: "University Student",
      avatar: "ER",
      rating: 5,
      text: "The gamification keeps me motivated to practice every day. I've built a 45-day streak and my confidence has skyrocketed!"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Hero Section */}
      <section className="container py-20 max-w-6xl">
        <div className="flex flex-col items-center text-center space-y-8">
          <TalkyLogo />
          
          <Badge variant="secondary" className="text-sm px-4 py-1">
            🎉 Join 10,000+ learners improving their English
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl">
            Master English Speaking with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500">
              AI-Powered Practice
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl">
            Practice pronunciation anytime, get instant feedback, and speak English confidently. 
            Perfect for IELTS preparation and everyday conversation.
          </p>

          <div className="flex gap-4 flex-wrap justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Free Trial
                <Zap className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
          <p className="text-xl text-muted-foreground">
            Powerful features designed to accelerate your English learning journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container py-20 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground">
            Start improving your English in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-2xl font-bold text-primary">
              1
            </div>
            <h3 className="text-xl font-bold">Choose Your Level</h3>
            <p className="text-muted-foreground">
              Select from beginner, intermediate, or advanced difficulty based on your current skills
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-2xl font-bold text-primary">
              2
            </div>
            <h3 className="text-xl font-bold">Speak & Practice</h3>
            <p className="text-muted-foreground">
              Click the microphone and speak clearly. Our AI listens and analyzes your pronunciation
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-2xl font-bold text-primary">
              3
            </div>
            <h3 className="text-xl font-bold">Get Instant Feedback</h3>
            <p className="text-muted-foreground">
              Receive detailed scores and tips to improve. Track your progress over time
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container py-20 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-xl text-muted-foreground">
            Start free, upgrade when you're ready
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {pricingTiers.map((tier, index) => (
            <Card 
              key={index} 
              className={`relative ${tier.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-primary to-purple-500">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground"> / {tier.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Link href={tier.href}>
                  <Button 
                    className="w-full" 
                    variant={tier.popular ? "default" : "outline"}
                    size="lg"
                  >
                    {tier.cta}
                  </Button>
                </Link>

                <div className="space-y-2">
                  {tier.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container py-20 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Loved by Learners Worldwide</h2>
          <p className="text-xl text-muted-foreground">
            See what our users have to say about their experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <CardTitle className="text-base">{testimonial.name}</CardTitle>
                    <CardDescription className="text-sm">{testimonial.role}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-1 mt-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground italic">
                  "{testimonial.text}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 max-w-4xl">
        <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-primary/20">
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            <h2 className="text-4xl font-bold">
              Ready to Improve Your English?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of learners who are already speaking English more confidently
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Your Free Trial
                <Zap className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              No credit card required • Cancel anytime • 50 free words daily
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container py-12 max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <TalkyLogo />
              <p className="text-sm text-muted-foreground">
                Master English speaking with AI-powered practice
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/practice">Practice</Link></li>
                <li><Link href="/learning-paths">Learning Paths</Link></li>
                <li><Link href="/leaderboard">Leaderboard</Link></li>
                <li><a href="#pricing">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#">About Us</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2024 Talky Talky. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

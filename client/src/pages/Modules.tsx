import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Mic, MessageSquare, Target, Clock, Search, Filter } from "lucide-react";
import { Link } from "wouter";

interface Module {
  id: string;
  title: string;
  description: string;
  category: "vocabulary" | "speaking-part1" | "speaking-part2" | "speaking-part3" | "mock-test" | "review";
  difficulty: "beginner" | "intermediate" | "advanced";
  itemCount: number;
  estimatedMinutes: number;
  progress: number;
  icon: React.ReactNode;
  route: string;
}

const modules: Module[] = [
  // Vocabulary Modules
  {
    id: "vocab-beginner",
    title: "Essential Vocabulary",
    description: "80 common words for everyday topics",
    category: "vocabulary",
    difficulty: "beginner",
    itemCount: 80,
    estimatedMinutes: 40,
    progress: 0,
    icon: <BookOpen className="h-5 w-5" />,
    route: "/match-cards?level=beginner"
  },
  {
    id: "vocab-intermediate",
    title: "Academic Vocabulary",
    description: "100 words for academic and professional contexts",
    category: "vocabulary",
    difficulty: "intermediate",
    itemCount: 100,
    estimatedMinutes: 50,
    progress: 0,
    icon: <BookOpen className="h-5 w-5" />,
    route: "/match-cards?level=intermediate"
  },
  {
    id: "vocab-advanced",
    title: "Advanced Vocabulary",
    description: "70 sophisticated words for Band 7+ scores",
    category: "vocabulary",
    difficulty: "advanced",
    itemCount: 70,
    estimatedMinutes: 35,
    progress: 0,
    icon: <BookOpen className="h-5 w-5" />,
    route: "/match-cards?level=advanced"
  },
  
  // Speaking Part 1 Modules
  {
    id: "speaking-part1-personal",
    title: "Part 1: Personal Topics",
    description: "Questions about you, your family, work, and hobbies",
    category: "speaking-part1",
    difficulty: "beginner",
    itemCount: 80,
    estimatedMinutes: 80,
    progress: 0,
    icon: <Mic className="h-5 w-5" />,
    route: "/ielts?mode=part1&topic=personal"
  },
  {
    id: "speaking-part1-daily",
    title: "Part 1: Daily Life",
    description: "Questions about routines, food, travel, and technology",
    category: "speaking-part1",
    difficulty: "beginner",
    itemCount: 80,
    estimatedMinutes: 80,
    progress: 0,
    icon: <Mic className="h-5 w-5" />,
    route: "/ielts?mode=part1&topic=daily"
  },
  {
    id: "speaking-part1-interests",
    title: "Part 1: Interests & Preferences",
    description: "Questions about likes, dislikes, and opinions",
    category: "speaking-part1",
    difficulty: "intermediate",
    itemCount: 80,
    estimatedMinutes: 80,
    progress: 0,
    icon: <Mic className="h-5 w-5" />,
    route: "/ielts?mode=part1&topic=interests"
  },
  
  // Speaking Part 2 Modules
  {
    id: "speaking-part2-people",
    title: "Part 2: Describe a Person",
    description: "20 cue cards about people you know or admire",
    category: "speaking-part2",
    difficulty: "intermediate",
    itemCount: 20,
    estimatedMinutes: 60,
    progress: 0,
    icon: <MessageSquare className="h-5 w-5" />,
    route: "/ielts?mode=part2&topic=people"
  },
  {
    id: "speaking-part2-places",
    title: "Part 2: Describe a Place",
    description: "20 cue cards about locations and environments",
    category: "speaking-part2",
    difficulty: "intermediate",
    itemCount: 20,
    estimatedMinutes: 60,
    progress: 0,
    icon: <MessageSquare className="h-5 w-5" />,
    route: "/ielts?mode=part2&topic=places"
  },
  {
    id: "speaking-part2-experiences",
    title: "Part 2: Describe an Experience",
    description: "20 cue cards about memorable events and activities",
    category: "speaking-part2",
    difficulty: "intermediate",
    itemCount: 20,
    estimatedMinutes: 60,
    progress: 0,
    icon: <MessageSquare className="h-5 w-5" />,
    route: "/ielts?mode=part2&topic=experiences"
  },
  {
    id: "speaking-part2-objects",
    title: "Part 2: Describe an Object",
    description: "20 cue cards about things and possessions",
    category: "speaking-part2",
    difficulty: "advanced",
    itemCount: 20,
    estimatedMinutes: 60,
    progress: 0,
    icon: <MessageSquare className="h-5 w-5" />,
    route: "/ielts?mode=part2&topic=objects"
  },
  
  // Speaking Part 3 Modules
  {
    id: "speaking-part3-society",
    title: "Part 3: Society & Culture",
    description: "Abstract discussions about social issues",
    category: "speaking-part3",
    difficulty: "advanced",
    itemCount: 100,
    estimatedMinutes: 150,
    progress: 0,
    icon: <MessageSquare className="h-5 w-5" />,
    route: "/ielts?mode=part3&topic=society"
  },
  {
    id: "speaking-part3-technology",
    title: "Part 3: Technology & Innovation",
    description: "Discussions about tech impact and future trends",
    category: "speaking-part3",
    difficulty: "advanced",
    itemCount: 100,
    estimatedMinutes: 150,
    progress: 0,
    icon: <MessageSquare className="h-5 w-5" />,
    route: "/ielts?mode=part3&topic=technology"
  },
  {
    id: "speaking-part3-environment",
    title: "Part 3: Environment & Sustainability",
    description: "Discussions about environmental challenges",
    category: "speaking-part3",
    difficulty: "advanced",
    itemCount: 100,
    estimatedMinutes: 150,
    progress: 0,
    icon: <MessageSquare className="h-5 w-5" />,
    route: "/ielts?mode=part3&topic=environment"
  },
  
  // Mock Tests
  {
    id: "mock-test-full",
    title: "Full Mock Test",
    description: "Complete 11-14 minute IELTS Speaking simulation",
    category: "mock-test",
    difficulty: "intermediate",
    itemCount: 1,
    estimatedMinutes: 14,
    progress: 0,
    icon: <Target className="h-5 w-5" />,
    route: "/ielts?mode=mock"
  },
];

const categoryLabels = {
  vocabulary: "Vocabulary Builder",
  "speaking-part1": "Speaking Part 1",
  "speaking-part2": "Speaking Part 2",
  "speaking-part3": "Speaking Part 3",
  "mock-test": "Mock Tests",
  review: "Review Queue"
};

const difficultyColors = {
  beginner: "bg-green-500/20 text-green-300 border-green-500/30",
  intermediate: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  advanced: "bg-red-500/20 text-red-300 border-red-500/30"
};

export default function Modules() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...Object.keys(categoryLabels)] as const;

  return (
    <div className="min-h-screen pb-20 pt-6 px-4">
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Learning Modules</h1>
          <p className="text-muted-foreground">
            Comprehensive IELTS preparation organized into focused learning paths
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="whitespace-nowrap"
              >
                {cat === "all" ? "All" : categoryLabels[cat as keyof typeof categoryLabels]}
              </Button>
            ))}
          </div>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map(module => (
            <Card key={module.id} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {module.icon}
                  </div>
                  <Badge className={difficultyColors[module.difficulty]}>
                    {module.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{module.itemCount} items</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>~{module.estimatedMinutes} min</span>
                    </div>
                  </div>

                  {/* Progress */}
                  {module.progress > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{module.progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${module.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Link href={module.route}>
                    <Button className="w-full group-hover:bg-primary/90 transition-colors">
                      {module.progress > 0 ? "Continue" : "Start Module"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredModules.length === 0 && (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No modules found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

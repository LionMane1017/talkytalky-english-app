export interface LearningPathLesson {
  id: string;
  title: string;
  description: string;
  wordIds: string[]; // References to vocabulary IDs
  estimatedTime: number; // in minutes
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  totalLessons: number;
  estimatedHours: number;
  lessons: LearningPathLesson[];
}

export const learningPaths: LearningPath[] = [
  {
    id: "business-english",
    title: "Business English Track",
    description: "Master professional vocabulary for workplace communication, meetings, and presentations",
    category: "Professional",
    icon: "briefcase",
    color: "from-blue-500 to-cyan-500",
    difficulty: "intermediate",
    totalLessons: 8,
    estimatedHours: 4,
    lessons: [
      {
        id: "be-1",
        title: "Office Basics",
        description: "Common workplace vocabulary and phrases",
        wordIds: ["71", "72", "74", "82", "83"],
        estimatedTime: 20,
        difficulty: "beginner"
      },
      {
        id: "be-2",
        title: "Meetings & Presentations",
        description: "Professional communication in formal settings",
        wordIds: ["84", "85", "90", "91", "92"],
        estimatedTime: 25,
        difficulty: "intermediate"
      },
      {
        id: "be-3",
        title: "Email & Written Communication",
        description: "Professional writing vocabulary",
        wordIds: ["93", "94", "95", "96", "97"],
        estimatedTime: 25,
        difficulty: "intermediate"
      },
      {
        id: "be-4",
        title: "Negotiations & Agreements",
        description: "Vocabulary for business deals and contracts",
        wordIds: ["98", "99", "100", "101", "102"],
        estimatedTime: 30,
        difficulty: "advanced"
      },
      {
        id: "be-5",
        title: "Project Management",
        description: "Terms for planning and executing projects",
        wordIds: ["103", "104", "105", "106", "107"],
        estimatedTime: 30,
        difficulty: "advanced"
      },
      {
        id: "be-6",
        title: "Financial Vocabulary",
        description: "Business finance and accounting terms",
        wordIds: ["108", "109", "110", "111", "112"],
        estimatedTime: 35,
        difficulty: "advanced"
      },
      {
        id: "be-7",
        title: "Leadership & Management",
        description: "Vocabulary for team leadership",
        wordIds: ["113", "114", "115", "116", "117"],
        estimatedTime: 30,
        difficulty: "advanced"
      },
      {
        id: "be-8",
        title: "Business Strategy",
        description: "High-level business planning vocabulary",
        wordIds: ["118", "119", "120", "121", "122"],
        estimatedTime: 35,
        difficulty: "advanced"
      }
    ]
  },
  {
    id: "travel-essentials",
    title: "Travel Essentials",
    description: "Essential vocabulary for traveling, hotels, restaurants, and navigation",
    category: "Practical",
    icon: "plane",
    color: "from-purple-500 to-pink-500",
    difficulty: "beginner",
    totalLessons: 6,
    estimatedHours: 3,
    lessons: [
      {
        id: "te-1",
        title: "Airport & Flight",
        description: "Vocabulary for air travel",
        wordIds: ["1", "2", "3", "4", "5"],
        estimatedTime: 20,
        difficulty: "beginner"
      },
      {
        id: "te-2",
        title: "Hotel & Accommodation",
        description: "Checking in and hotel services",
        wordIds: ["6", "7", "8", "9", "10"],
        estimatedTime: 25,
        difficulty: "beginner"
      },
      {
        id: "te-3",
        title: "Restaurant & Food",
        description: "Ordering food and dining vocabulary",
        wordIds: ["11", "12", "13", "14", "45"],
        estimatedTime: 25,
        difficulty: "beginner"
      },
      {
        id: "te-4",
        title: "Directions & Transportation",
        description: "Getting around in a new city",
        wordIds: ["46", "47", "48", "49", "50"],
        estimatedTime: 30,
        difficulty: "beginner"
      },
      {
        id: "te-5",
        title: "Shopping & Money",
        description: "Making purchases and handling currency",
        wordIds: ["51", "52", "53", "54", "55"],
        estimatedTime: 25,
        difficulty: "beginner"
      },
      {
        id: "te-6",
        title: "Emergency Situations",
        description: "Important phrases for emergencies",
        wordIds: ["56", "57", "58", "59", "60"],
        estimatedTime: 30,
        difficulty: "intermediate"
      }
    ]
  },
  {
    id: "academic-english",
    title: "Academic English",
    description: "Advanced vocabulary for academic writing, research, and university studies",
    category: "Academic",
    icon: "graduation-cap",
    color: "from-green-500 to-emerald-500",
    difficulty: "advanced",
    totalLessons: 7,
    estimatedHours: 5,
    lessons: [
      {
        id: "ae-1",
        title: "Research & Analysis",
        description: "Vocabulary for academic research",
        wordIds: ["123", "124", "125", "126", "127"],
        estimatedTime: 35,
        difficulty: "advanced"
      },
      {
        id: "ae-2",
        title: "Critical Thinking",
        description: "Analytical and evaluative vocabulary",
        wordIds: ["128", "129", "130", "131", "132"],
        estimatedTime: 40,
        difficulty: "advanced"
      },
      {
        id: "ae-3",
        title: "Academic Writing",
        description: "Formal writing and essay vocabulary",
        wordIds: ["133", "134", "135", "136", "137"],
        estimatedTime: 40,
        difficulty: "advanced"
      },
      {
        id: "ae-4",
        title: "Scientific Method",
        description: "Vocabulary for scientific research",
        wordIds: ["138", "139", "140", "141", "142"],
        estimatedTime: 45,
        difficulty: "advanced"
      },
      {
        id: "ae-5",
        title: "Data & Statistics",
        description: "Quantitative analysis vocabulary",
        wordIds: ["143", "144", "145", "146", "147"],
        estimatedTime: 40,
        difficulty: "advanced"
      },
      {
        id: "ae-6",
        title: "Theories & Concepts",
        description: "Abstract academic terminology",
        wordIds: ["148", "149", "150", "31", "32"],
        estimatedTime: 45,
        difficulty: "advanced"
      },
      {
        id: "ae-7",
        title: "Academic Presentations",
        description: "Presenting research and findings",
        wordIds: ["33", "34", "35", "36", "37"],
        estimatedTime: 40,
        difficulty: "advanced"
      }
    ]
  },
  {
    id: "daily-conversation",
    title: "Daily Conversation",
    description: "Everyday vocabulary for casual conversations and social interactions",
    category: "Social",
    icon: "message-circle",
    color: "from-orange-500 to-red-500",
    difficulty: "beginner",
    totalLessons: 5,
    estimatedHours: 2.5,
    lessons: [
      {
        id: "dc-1",
        title: "Greetings & Introductions",
        description: "Meeting people and basic greetings",
        wordIds: ["1", "2", "41", "42", "43"],
        estimatedTime: 20,
        difficulty: "beginner"
      },
      {
        id: "dc-2",
        title: "Family & Friends",
        description: "Talking about relationships",
        wordIds: ["42", "43", "61", "62", "63"],
        estimatedTime: 25,
        difficulty: "beginner"
      },
      {
        id: "dc-3",
        title: "Hobbies & Interests",
        description: "Discussing leisure activities",
        wordIds: ["64", "65", "66", "67", "68"],
        estimatedTime: 30,
        difficulty: "beginner"
      },
      {
        id: "dc-4",
        title: "Weather & Seasons",
        description: "Talking about weather and climate",
        wordIds: ["59", "60", "69", "70", "15"],
        estimatedTime: 25,
        difficulty: "beginner"
      },
      {
        id: "dc-5",
        title: "Making Plans",
        description: "Arranging meetings and activities",
        wordIds: ["16", "17", "18", "19", "20"],
        estimatedTime: 30,
        difficulty: "intermediate"
      }
    ]
  },
  {
    id: "ielts-preparation",
    title: "IELTS Preparation",
    description: "Comprehensive vocabulary for IELTS Speaking test success",
    category: "Test Prep",
    icon: "target",
    color: "from-indigo-500 to-purple-500",
    difficulty: "intermediate",
    totalLessons: 6,
    estimatedHours: 4,
    lessons: [
      {
        id: "ip-1",
        title: "IELTS Part 1 Essentials",
        description: "Common Part 1 topics vocabulary",
        wordIds: ["21", "22", "23", "24", "25"],
        estimatedTime: 30,
        difficulty: "intermediate"
      },
      {
        id: "ip-2",
        title: "Describing People & Places",
        description: "Descriptive vocabulary for Part 2",
        wordIds: ["26", "27", "28", "29", "30"],
        estimatedTime: 35,
        difficulty: "intermediate"
      },
      {
        id: "ip-3",
        title: "Abstract Topics",
        description: "Complex vocabulary for Part 3",
        wordIds: ["31", "32", "33", "34", "35"],
        estimatedTime: 40,
        difficulty: "advanced"
      },
      {
        id: "ip-4",
        title: "Opinion & Justification",
        description: "Expressing and supporting opinions",
        wordIds: ["36", "37", "38", "39", "40"],
        estimatedTime: 40,
        difficulty: "advanced"
      },
      {
        id: "ip-5",
        title: "Social Issues",
        description: "Discussing contemporary topics",
        wordIds: ["75", "76", "77", "78", "79"],
        estimatedTime: 45,
        difficulty: "advanced"
      },
      {
        id: "ip-6",
        title: "Technology & Environment",
        description: "Modern IELTS themes",
        wordIds: ["80", "81", "86", "87", "88"],
        estimatedTime: 45,
        difficulty: "advanced"
      }
    ]
  }
];

export function getLearningPathById(id: string): LearningPath | undefined {
  return learningPaths.find(path => path.id === id);
}

export function getLessonById(pathId: string, lessonId: string): LearningPathLesson | undefined {
  const path = getLearningPathById(pathId);
  return path?.lessons.find(lesson => lesson.id === lessonId);
}

export function getLearningPathsByDifficulty(difficulty: "beginner" | "intermediate" | "advanced"): LearningPath[] {
  return learningPaths.filter(path => path.difficulty === difficulty);
}

export interface VocabularyWord {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
}

export const vocabularyData: VocabularyWord[] = [
  // Beginner Level
  {
    id: "1",
    word: "Hello",
    phonetic: "/həˈloʊ/",
    meaning: "A greeting used when meeting someone",
    example: "Hello, how are you today?",
    difficulty: "beginner",
    category: "Greetings"
  },
  {
    id: "2",
    word: "Thank you",
    phonetic: "/θæŋk juː/",
    meaning: "An expression of gratitude",
    example: "Thank you for your help.",
    difficulty: "beginner",
    category: "Greetings"
  },
  {
    id: "3",
    word: "Beautiful",
    phonetic: "/ˈbjuːtɪfl/",
    meaning: "Pleasing to the senses or mind aesthetically",
    example: "The sunset was beautiful.",
    difficulty: "beginner",
    category: "Adjectives"
  },
  {
    id: "4",
    word: "Important",
    phonetic: "/ɪmˈpɔːrtnt/",
    meaning: "Of great significance or value",
    example: "Education is important for success.",
    difficulty: "beginner",
    category: "Adjectives"
  },
  {
    id: "5",
    word: "Family",
    phonetic: "/ˈfæməli/",
    meaning: "A group of people related by blood or marriage",
    example: "I love spending time with my family.",
    difficulty: "beginner",
    category: "Nouns"
  },
  
  // Intermediate Level
  {
    id: "6",
    word: "Accomplish",
    phonetic: "/əˈkɑːmplɪʃ/",
    meaning: "To achieve or complete successfully",
    example: "She accomplished all her goals this year.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "7",
    word: "Demonstrate",
    phonetic: "/ˈdemənstreɪt/",
    meaning: "To show or make evident",
    example: "The teacher will demonstrate the experiment.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "8",
    word: "Significant",
    phonetic: "/sɪɡˈnɪfɪkənt/",
    meaning: "Important or notable",
    example: "This is a significant achievement.",
    difficulty: "intermediate",
    category: "Adjectives"
  },
  {
    id: "9",
    word: "Opportunity",
    phonetic: "/ˌɑːpərˈtuːnəti/",
    meaning: "A favorable time or occasion",
    example: "This job is a great opportunity.",
    difficulty: "intermediate",
    category: "Nouns"
  },
  {
    id: "10",
    word: "Environment",
    phonetic: "/ɪnˈvaɪrənmənt/",
    meaning: "The surroundings or conditions in which a person, animal, or plant lives",
    example: "We must protect the environment.",
    difficulty: "intermediate",
    category: "Nouns"
  },
  
  // Advanced Level
  {
    id: "11",
    word: "Comprehensive",
    phonetic: "/ˌkɑːmprɪˈhensɪv/",
    meaning: "Complete and including everything that is necessary",
    example: "The report provides a comprehensive analysis.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  {
    id: "12",
    word: "Deteriorate",
    phonetic: "/dɪˈtɪriəreɪt/",
    meaning: "To become progressively worse",
    example: "His health began to deteriorate rapidly.",
    difficulty: "advanced",
    category: "Verbs"
  },
  {
    id: "13",
    word: "Inevitable",
    phonetic: "/ɪnˈevɪtəbl/",
    meaning: "Certain to happen; unavoidable",
    example: "Change is inevitable in life.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  {
    id: "14",
    word: "Phenomenon",
    phonetic: "/fəˈnɑːmɪnən/",
    meaning: "A remarkable or exceptional occurrence",
    example: "Climate change is a global phenomenon.",
    difficulty: "advanced",
    category: "Nouns"
  },
  {
    id: "15",
    word: "Substantial",
    phonetic: "/səbˈstænʃl/",
    meaning: "Of considerable importance, size, or worth",
    example: "There has been substantial progress.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  {
    id: "16",
    word: "Accommodate",
    phonetic: "/əˈkɑːmədeɪt/",
    meaning: "To provide lodging or sufficient space for",
    example: "The hotel can accommodate 200 guests.",
    difficulty: "advanced",
    category: "Verbs"
  },
  {
    id: "17",
    word: "Conscientious",
    phonetic: "/ˌkɑːnʃiˈenʃəs/",
    meaning: "Wishing to do what is right, especially to do one's work properly",
    example: "She is a conscientious student.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  {
    id: "18",
    word: "Perseverance",
    phonetic: "/ˌpɜːrsəˈvɪrəns/",
    meaning: "Persistence in doing something despite difficulty",
    example: "Success requires perseverance.",
    difficulty: "advanced",
    category: "Nouns"
  },
  {
    id: "19",
    word: "Articulate",
    phonetic: "/ɑːrˈtɪkjuleɪt/",
    meaning: "To express an idea or feeling fluently and coherently",
    example: "He can articulate his thoughts clearly.",
    difficulty: "advanced",
    category: "Verbs"
  },
  {
    id: "20",
    word: "Meticulous",
    phonetic: "/məˈtɪkjələs/",
    meaning: "Showing great attention to detail; very careful",
    example: "She is meticulous in her work.",
    difficulty: "advanced",
    category: "Adjectives"
  }
];

export function getWordsByDifficulty(difficulty: "beginner" | "intermediate" | "advanced") {
  return vocabularyData.filter(word => word.difficulty === difficulty);
}

export function getWordById(id: string) {
  return vocabularyData.find(word => word.id === id);
}

export function getRandomWords(count: number, difficulty?: "beginner" | "intermediate" | "advanced") {
  const filtered = difficulty 
    ? vocabularyData.filter(word => word.difficulty === difficulty)
    : vocabularyData;
  
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

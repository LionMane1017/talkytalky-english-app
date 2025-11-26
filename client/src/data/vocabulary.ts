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
  },
  
  // Additional Beginner Words
  {
    id: "21",
    word: "Happy",
    phonetic: "/ˈhæpi/",
    meaning: "Feeling or showing pleasure or contentment",
    example: "I am happy to see you.",
    difficulty: "beginner",
    category: "Adjectives"
  },
  {
    id: "22",
    word: "Friend",
    phonetic: "/frend/",
    meaning: "A person with whom one has a bond of mutual affection",
    example: "She is my best friend.",
    difficulty: "beginner",
    category: "Nouns"
  },
  {
    id: "23",
    word: "Study",
    phonetic: "/ˈstʌdi/",
    meaning: "To devote time and attention to gaining knowledge",
    example: "I study English every day.",
    difficulty: "beginner",
    category: "Verbs"
  },
  {
    id: "24",
    word: "Weather",
    phonetic: "/ˈweðər/",
    meaning: "The state of the atmosphere at a particular time and place",
    example: "The weather is nice today.",
    difficulty: "beginner",
    category: "Nouns"
  },
  {
    id: "25",
    word: "Delicious",
    phonetic: "/dɪˈlɪʃəs/",
    meaning: "Highly pleasant to the taste",
    example: "This food is delicious.",
    difficulty: "beginner",
    category: "Adjectives"
  },
  
  // Additional Intermediate Words (IELTS Common)
  {
    id: "26",
    word: "Analyze",
    phonetic: "/ˈænəlaɪz/",
    meaning: "To examine something in detail to understand it better",
    example: "We need to analyze the data carefully.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "27",
    word: "Beneficial",
    phonetic: "/ˌbenɪˈfɪʃl/",
    meaning: "Favorable or advantageous; resulting in good",
    example: "Exercise is beneficial for your health.",
    difficulty: "intermediate",
    category: "Adjectives"
  },
  {
    id: "28",
    word: "Contribute",
    phonetic: "/kənˈtrɪbjuːt/",
    meaning: "To give something in order to help achieve or provide something",
    example: "Everyone should contribute to the project.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "29",
    word: "Diverse",
    phonetic: "/daɪˈvɜːrs/",
    meaning: "Showing a great deal of variety; very different",
    example: "The city has a diverse population.",
    difficulty: "intermediate",
    category: "Adjectives"
  },
  {
    id: "30",
    word: "Efficient",
    phonetic: "/ɪˈfɪʃnt/",
    meaning: "Achieving maximum productivity with minimum wasted effort",
    example: "This is an efficient way to work.",
    difficulty: "intermediate",
    category: "Adjectives"
  },
  
  // Additional Advanced Words (IELTS Academic)
  {
    id: "31",
    word: "Ambiguous",
    phonetic: "/æmˈbɪɡjuəs/",
    meaning: "Open to more than one interpretation; not having one obvious meaning",
    example: "The statement was deliberately ambiguous.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  {
    id: "32",
    word: "Contemplate",
    phonetic: "/ˈkɑːntəmpleɪt/",
    meaning: "To think about something carefully and for a long time",
    example: "He contemplated his future career.",
    difficulty: "advanced",
    category: "Verbs"
  },
  {
    id: "33",
    word: "Diligent",
    phonetic: "/ˈdɪlɪdʒənt/",
    meaning: "Having or showing care and conscientiousness in one's work",
    example: "She is a diligent worker.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  {
    id: "34",
    word: "Eloquent",
    phonetic: "/ˈeləkwənt/",
    meaning: "Fluent or persuasive in speaking or writing",
    example: "He gave an eloquent speech.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  {
    id: "35",
    word: "Facilitate",
    phonetic: "/fəˈsɪlɪteɪt/",
    meaning: "To make an action or process easy or easier",
    example: "Technology can facilitate learning.",
    difficulty: "advanced",
    category: "Verbs"
  },
  {
    id: "36",
    word: "Hypothesis",
    phonetic: "/haɪˈpɑːθəsɪs/",
    meaning: "A proposed explanation made on the basis of limited evidence",
    example: "The scientist tested her hypothesis.",
    difficulty: "advanced",
    category: "Nouns"
  },
  {
    id: "37",
    word: "Implement",
    phonetic: "/ˈɪmplɪment/",
    meaning: "To put a decision or plan into effect",
    example: "We will implement the new policy next month.",
    difficulty: "advanced",
    category: "Verbs"
  },
  {
    id: "38",
    word: "Justify",
    phonetic: "/ˈdʒʌstɪfaɪ/",
    meaning: "To show or prove to be right or reasonable",
    example: "Can you justify your decision?",
    difficulty: "advanced",
    category: "Verbs"
  },
  {
    id: "39",
    word: "Pragmatic",
    phonetic: "/præɡˈmætɪk/",
    meaning: "Dealing with things sensibly and realistically",
    example: "We need a pragmatic approach to this problem.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  {
    id: "40",
    word: "Resilient",
    phonetic: "/rɪˈzɪliənt/",
    meaning: "Able to withstand or recover quickly from difficult conditions",
    example: "Children are remarkably resilient.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  // Additional Beginner Words (41-70)
  
  
  
  {
    id: "44",
    word: "School",
    phonetic: "/skuːl/",
    meaning: "An institution for educating children",
    example: "I go to school every day.",
    difficulty: "beginner",
    category: "Nouns"
  },
  {
    id: "45",
    word: "Food",
    phonetic: "/fuːd/",
    meaning: "Any substance consumed to provide nutritional support",
    example: "I like Italian food.",
    difficulty: "beginner",
    category: "Nouns"
  },
  {
    id: "46",
    word: "Water",
    phonetic: "/ˈwɔːtər/",
    meaning: "A clear liquid essential for life",
    example: "Please give me a glass of water.",
    difficulty: "beginner",
    category: "Nouns"
  },
  {
    id: "47",
    word: "House",
    phonetic: "/haʊs/",
    meaning: "A building for people to live in",
    example: "We bought a new house.",
    difficulty: "beginner",
    category: "Nouns"
  },
  {
    id: "48",
    word: "Book",
    phonetic: "/bʊk/",
    meaning: "A written or printed work consisting of pages",
    example: "I'm reading an interesting book.",
    difficulty: "beginner",
    category: "Nouns"
  },
  {
    id: "49",
    word: "Time",
    phonetic: "/taɪm/",
    meaning: "The indefinite continued progress of existence",
    example: "What time is it?",
    difficulty: "beginner",
    category: "Nouns"
  },
  {
    id: "50",
    word: "Good",
    phonetic: "/ɡʊd/",
    meaning: "To be desired or approved of",
    example: "That's a good idea.",
    difficulty: "beginner",
    category: "Adjectives"
  },
  {
    id: "51",
    word: "Big",
    phonetic: "/bɪɡ/",
    meaning: "Of considerable size or extent",
    example: "That's a big car.",
    difficulty: "beginner",
    category: "Adjectives"
  },
  {
    id: "52",
    word: "Small",
    phonetic: "/smɔːl/",
    meaning: "Of a size that is less than normal",
    example: "I need a small coffee.",
    difficulty: "beginner",
    category: "Adjectives"
  },
  {
    id: "53",
    word: "New",
    phonetic: "/njuː/",
    meaning: "Not existing before; recently made",
    example: "I bought a new phone.",
    difficulty: "beginner",
    category: "Adjectives"
  },
  {
    id: "54",
    word: "Old",
    phonetic: "/oʊld/",
    meaning: "Having lived for a long time",
    example: "My grandfather is very old.",
    difficulty: "beginner",
    category: "Adjectives"
  },
  {
    id: "55",
    word: "Easy",
    phonetic: "/ˈiːzi/",
    meaning: "Achieved without great effort",
    example: "This test is easy.",
    difficulty: "beginner",
    category: "Adjectives"
  },
  {
    id: "56",
    word: "Hard",
    phonetic: "/hɑːrd/",
    meaning: "Requiring a great deal of effort",
    example: "This question is hard.",
    difficulty: "beginner",
    category: "Adjectives"
  },
  {
    id: "57",
    word: "Fast",
    phonetic: "/fæst/",
    meaning: "Moving or capable of moving at high speed",
    example: "He runs very fast.",
    difficulty: "beginner",
    category: "Adjectives"
  },
  {
    id: "58",
    word: "Slow",
    phonetic: "/sloʊ/",
    meaning: "Moving at a low speed",
    example: "The traffic is slow today.",
    difficulty: "beginner",
    category: "Adjectives"
  },
  {
    id: "59",
    word: "Hot",
    phonetic: "/hɑːt/",
    meaning: "Having a high temperature",
    example: "The coffee is too hot.",
    difficulty: "beginner",
    category: "Adjectives"
  },
  {
    id: "60",
    word: "Cold",
    phonetic: "/koʊld/",
    meaning: "Of a low temperature",
    example: "It's cold outside.",
    difficulty: "beginner",
    category: "Adjectives"
  },
  {
    id: "61",
    word: "Run",
    phonetic: "/rʌn/",
    meaning: "To move at a speed faster than walking",
    example: "I run every morning.",
    difficulty: "beginner",
    category: "Verbs"
  },
  {
    id: "62",
    word: "Walk",
    phonetic: "/wɔːk/",
    meaning: "To move at a regular pace by lifting and setting down each foot",
    example: "Let's walk to the park.",
    difficulty: "beginner",
    category: "Verbs"
  },
  {
    id: "63",
    word: "Eat",
    phonetic: "/iːt/",
    meaning: "To put food into the mouth and swallow it",
    example: "I eat breakfast at 7 AM.",
    difficulty: "beginner",
    category: "Verbs"
  },
  {
    id: "64",
    word: "Drink",
    phonetic: "/drɪŋk/",
    meaning: "To take liquid into the mouth and swallow it",
    example: "I drink water every day.",
    difficulty: "beginner",
    category: "Verbs"
  },
  {
    id: "65",
    word: "Sleep",
    phonetic: "/sliːp/",
    meaning: "To rest with eyes closed and mind inactive",
    example: "I sleep for eight hours.",
    difficulty: "beginner",
    category: "Verbs"
  },
  {
    id: "66",
    word: "Work",
    phonetic: "/wɜːrk/",
    meaning: "Activity involving mental or physical effort",
    example: "I work in an office.",
    difficulty: "beginner",
    category: "Verbs"
  },
  {
    id: "67",
    word: "Play",
    phonetic: "/pleɪ/",
    meaning: "To engage in activity for enjoyment",
    example: "Children play in the park.",
    difficulty: "beginner",
    category: "Verbs"
  },
  {
    id: "68",
    word: "Read",
    phonetic: "/riːd/",
    meaning: "To look at and comprehend written words",
    example: "I read books every night.",
    difficulty: "beginner",
    category: "Verbs"
  },
  {
    id: "69",
    word: "Write",
    phonetic: "/raɪt/",
    meaning: "To mark letters or words on a surface",
    example: "Please write your name here.",
    difficulty: "beginner",
    category: "Verbs"
  },
  {
    id: "70",
    word: "Listen",
    phonetic: "/ˈlɪsən/",
    meaning: "To give attention with the ear",
    example: "Listen to the teacher carefully.",
    difficulty: "beginner",
    category: "Verbs"
  },
  // Additional Intermediate Words (71-110)
  {
    id: "71",
    word: "Anticipate",
    phonetic: "/ænˈtɪsəpeɪt/",
    meaning: "To expect or predict something will happen",
    example: "I anticipate the meeting will be productive.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "72",
    word: "Benefit",
    phonetic: "/ˈbenɪfɪt/",
    meaning: "An advantage or profit gained from something",
    example: "Exercise has many health benefits.",
    difficulty: "intermediate",
    category: "Nouns"
  },
  {
    id: "73",
    word: "Challenge",
    phonetic: "/ˈtʃælɪndʒ/",
    meaning: "A task that tests someone's abilities",
    example: "Learning a new language is a challenge.",
    difficulty: "intermediate",
    category: "Nouns"
  },
  {
    id: "74",
    word: "Develop",
    phonetic: "/dɪˈveləp/",
    meaning: "To grow or cause to grow gradually",
    example: "We need to develop new skills.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  
  {
    id: "76",
    word: "Experience",
    phonetic: "/ɪkˈspɪriəns/",
    meaning: "Practical contact with events or facts",
    example: "She has five years of work experience.",
    difficulty: "intermediate",
    category: "Nouns"
  },
  {
    id: "77",
    word: "Influence",
    phonetic: "/ˈɪnfluəns/",
    meaning: "The capacity to have an effect on someone or something",
    example: "Parents have a strong influence on their children.",
    difficulty: "intermediate",
    category: "Nouns"
  },
  {
    id: "78",
    word: "Knowledge",
    phonetic: "/ˈnɑːlɪdʒ/",
    meaning: "Facts, information, and skills acquired through experience",
    example: "Knowledge is power.",
    difficulty: "intermediate",
    category: "Nouns"
  },
  {
    id: "79",
    word: "Maintain",
    phonetic: "/meɪnˈteɪn/",
    meaning: "To cause something to continue in the same state",
    example: "It's important to maintain good health.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  
  {
    id: "81",
    word: "Participate",
    phonetic: "/pɑːrˈtɪsɪpeɪt/",
    meaning: "To take part in an activity",
    example: "Everyone should participate in the discussion.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "82",
    word: "Progress",
    phonetic: "/ˈprɑːɡres/",
    meaning: "Forward movement toward a goal",
    example: "We're making good progress on the project.",
    difficulty: "intermediate",
    category: "Nouns"
  },
  {
    id: "83",
    word: "Require",
    phonetic: "/rɪˈkwaɪər/",
    meaning: "To need something for a purpose",
    example: "This job requires good communication skills.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "84",
    word: "Resource",
    phonetic: "/ˈriːsɔːrs/",
    meaning: "A supply of something that can be used",
    example: "Water is a valuable natural resource.",
    difficulty: "intermediate",
    category: "Nouns"
  },
  {
    id: "85",
    word: "Strategy",
    phonetic: "/ˈstrætədʒi/",
    meaning: "A plan of action designed to achieve a goal",
    example: "We need a new marketing strategy.",
    difficulty: "intermediate",
    category: "Nouns"
  },
  {
    id: "86",
    word: "Technology",
    phonetic: "/tekˈnɑːlədʒi/",
    meaning: "The application of scientific knowledge for practical purposes",
    example: "Technology has changed our lives.",
    difficulty: "intermediate",
    category: "Nouns"
  },
  {
    id: "87",
    word: "Tradition",
    phonetic: "/trəˈdɪʃən/",
    meaning: "A custom or belief passed down through generations",
    example: "It's a family tradition to celebrate together.",
    difficulty: "intermediate",
    category: "Nouns"
  },
  {
    id: "88",
    word: "Valuable",
    phonetic: "/ˈvæljuəbl/",
    meaning: "Worth a great deal of money or very useful",
    example: "Your advice is very valuable.",
    difficulty: "intermediate",
    category: "Adjectives"
  },
  {
    id: "89",
    word: "Variety",
    phonetic: "/vəˈraɪəti/",
    meaning: "A number of different types of things",
    example: "The store offers a wide variety of products.",
    difficulty: "intermediate",
    category: "Nouns"
  },
  {
    id: "90",
    word: "Communicate",
    phonetic: "/kəˈmjuːnɪkeɪt/",
    meaning: "To share or exchange information",
    example: "It's important to communicate clearly.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "91",
    word: "Compare",
    phonetic: "/kəmˈper/",
    meaning: "To estimate similarities or differences",
    example: "Let's compare the two options.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "92",
    word: "Consider",
    phonetic: "/kənˈsɪdər/",
    meaning: "To think carefully about something",
    example: "Please consider my proposal.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  
  
  {
    id: "95",
    word: "Determine",
    phonetic: "/dɪˈtɜːrmɪn/",
    meaning: "To cause something to occur in a particular way",
    example: "Your attitude will determine your success.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "96",
    word: "Establish",
    phonetic: "/ɪˈstæblɪʃ/",
    meaning: "To set up or create something",
    example: "They established the company in 1995.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "97",
    word: "Identify",
    phonetic: "/aɪˈdentɪfaɪ/",
    meaning: "To recognize or establish who or what something is",
    example: "Can you identify the problem?",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "98",
    word: "Indicate",
    phonetic: "/ˈɪndɪkeɪt/",
    meaning: "To point out or show something",
    example: "The results indicate a positive trend.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "99",
    word: "Investigate",
    phonetic: "/ɪnˈvestɪɡeɪt/",
    meaning: "To carry out research or study into something",
    example: "Police are investigating the incident.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "100",
    word: "Obtain",
    phonetic: "/əbˈteɪn/",
    meaning: "To get or acquire something",
    example: "You need to obtain permission first.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "101",
    word: "Occur",
    phonetic: "/əˈkɜːr/",
    meaning: "To happen or take place",
    example: "The accident occurred yesterday.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "102",
    word: "Predict",
    phonetic: "/prɪˈdɪkt/",
    meaning: "To say what will happen in the future",
    example: "It's difficult to predict the weather.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "103",
    word: "Prevent",
    phonetic: "/prɪˈvent/",
    meaning: "To stop something from happening",
    example: "We must prevent accidents in the workplace.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "104",
    word: "Promote",
    phonetic: "/prəˈmoʊt/",
    meaning: "To support or encourage something",
    example: "The campaign promotes healthy eating.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "105",
    word: "Recognize",
    phonetic: "/ˈrekəɡnaɪz/",
    meaning: "To identify someone or something from previous knowledge",
    example: "I didn't recognize you at first.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "106",
    word: "Respond",
    phonetic: "/rɪˈspɑːnd/",
    meaning: "To say or do something as a reaction",
    example: "How did she respond to the news?",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "107",
    word: "Select",
    phonetic: "/sɪˈlekt/",
    meaning: "To carefully choose from a group",
    example: "Please select your preferred option.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  
  {
    id: "109",
    word: "Similar",
    phonetic: "/ˈsɪmələr/",
    meaning: "Having a resemblance in appearance or nature",
    example: "The two cars are very similar.",
    difficulty: "intermediate",
    category: "Adjectives"
  },
  {
    id: "110",
    word: "Specific",
    phonetic: "/spəˈsɪfɪk/",
    meaning: "Clearly defined or identified",
    example: "Can you be more specific about the problem?",
    difficulty: "intermediate",
    category: "Adjectives"
  },
  // Additional Advanced Words (111-150)
  
  
  {
    id: "113",
    word: "Arbitrary",
    phonetic: "/ˈɑːrbɪtreri/",
    meaning: "Based on random choice rather than reason",
    example: "The decision seemed arbitrary.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  {
    id: "114",
    word: "Coherent",
    phonetic: "/koʊˈhɪrənt/",
    meaning: "Logical and consistent",
    example: "She presented a coherent argument.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  
  {
    id: "116",
    word: "Constitute",
    phonetic: "/ˈkɑːnstɪtuːt/",
    meaning: "To be a part of a whole",
    example: "Women constitute 40% of the workforce.",
    difficulty: "advanced",
    category: "Verbs"
  },
  {
    id: "117",
    word: "Contemporary",
    phonetic: "/kənˈtempəreri/",
    meaning: "Living or occurring at the same time",
    example: "Contemporary art is very diverse.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  {
    id: "118",
    word: "Controversy",
    phonetic: "/ˈkɑːntrəvɜːrsi/",
    meaning: "Disagreement or argument about something important",
    example: "The decision sparked controversy.",
    difficulty: "advanced",
    category: "Nouns"
  },
  {
    id: "119",
    word: "Criteria",
    phonetic: "/kraɪˈtɪriə/",
    meaning: "Standards by which something is judged",
    example: "What are the selection criteria?",
    difficulty: "advanced",
    category: "Nouns"
  },
  {
    id: "120",
    word: "Diminish",
    phonetic: "/dɪˈmɪnɪʃ/",
    meaning: "To make or become less",
    example: "The pain will diminish over time.",
    difficulty: "advanced",
    category: "Verbs"
  },
  {
    id: "121",
    word: "Elaborate",
    phonetic: "/ɪˈlæbəreɪt/",
    meaning: "Involving many carefully arranged parts",
    example: "She gave an elaborate explanation.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  {
    id: "122",
    word: "Emphasize",
    phonetic: "/ˈemfəsaɪz/",
    meaning: "To give special importance to something",
    example: "I must emphasize the importance of this.",
    difficulty: "advanced",
    category: "Verbs"
  },
  {
    id: "123",
    word: "Enhance",
    phonetic: "/ɪnˈhæns/",
    meaning: "To improve the quality or value of something",
    example: "This will enhance your skills.",
    difficulty: "advanced",
    category: "Verbs"
  },
  {
    id: "124",
    word: "Equivalent",
    phonetic: "/ɪˈkwɪvələnt/",
    meaning: "Equal in value, amount, or meaning",
    example: "One dollar is equivalent to 100 cents.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  
  
  
  {
    id: "128",
    word: "Inherent",
    phonetic: "/ɪnˈhɪrənt/",
    meaning: "Existing as a natural or essential part",
    example: "There are inherent risks in this activity.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  {
    id: "129",
    word: "Integrate",
    phonetic: "/ˈɪntɪɡreɪt/",
    meaning: "To combine parts into a whole",
    example: "We need to integrate these systems.",
    difficulty: "advanced",
    category: "Verbs"
  },
  {
    id: "130",
    word: "Legitimate",
    phonetic: "/lɪˈdʒɪtɪmət/",
    meaning: "Conforming to the law or rules",
    example: "That's a legitimate concern.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  {
    id: "131",
    word: "Manipulate",
    phonetic: "/məˈnɪpjuleɪt/",
    meaning: "To control or influence skillfully",
    example: "Don't try to manipulate the data.",
    difficulty: "advanced",
    category: "Verbs"
  },
  {
    id: "132",
    word: "Negligible",
    phonetic: "/ˈneɡlɪdʒəbl/",
    meaning: "So small as to be not worth considering",
    example: "The difference is negligible.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  {
    id: "133",
    word: "Objective",
    phonetic: "/əbˈdʒektɪv/",
    meaning: "Not influenced by personal feelings",
    example: "Try to be objective in your assessment.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  {
    id: "134",
    word: "Paradigm",
    phonetic: "/ˈpærədaɪm/",
    meaning: "A typical example or pattern of something",
    example: "This represents a paradigm shift.",
    difficulty: "advanced",
    category: "Nouns"
  },
  {
    id: "135",
    word: "Perceive",
    phonetic: "/pərˈsiːv/",
    meaning: "To become aware of through the senses",
    example: "How do you perceive this situation?",
    difficulty: "advanced",
    category: "Verbs"
  },
  {
    id: "136",
    word: "Persistent",
    phonetic: "/pərˈsɪstənt/",
    meaning: "Continuing firmly despite difficulties",
    example: "She is very persistent in her efforts.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  
  {
    id: "138",
    word: "Preliminary",
    phonetic: "/prɪˈlɪmɪneri/",
    meaning: "Coming before the main part",
    example: "These are preliminary results.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  {
    id: "139",
    word: "Prevalent",
    phonetic: "/ˈprevələnt/",
    meaning: "Widespread in a particular area",
    example: "This disease is prevalent in tropical regions.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  {
    id: "140",
    word: "Profound",
    phonetic: "/prəˈfaʊnd/",
    meaning: "Very great or intense",
    example: "The book had a profound effect on me.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  {
    id: "141",
    word: "Redundant",
    phonetic: "/rɪˈdʌndənt/",
    meaning: "Not needed; superfluous",
    example: "This information is redundant.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  {
    id: "142",
    word: "Reinforce",
    phonetic: "/ˌriːɪnˈfɔːrs/",
    meaning: "To strengthen or support",
    example: "This will reinforce your argument.",
    difficulty: "advanced",
    category: "Verbs"
  },
  {
    id: "143",
    word: "Reluctant",
    phonetic: "/rɪˈlʌktənt/",
    meaning: "Unwilling and hesitant",
    example: "He was reluctant to accept the offer.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  {
    id: "144",
    word: "Simulate",
    phonetic: "/ˈsɪmjuleɪt/",
    meaning: "To imitate the appearance or character of",
    example: "The program can simulate real conditions.",
    difficulty: "advanced",
    category: "Verbs"
  },
  {
    id: "145",
    word: "Sophisticated",
    phonetic: "/səˈfɪstɪkeɪtɪd/",
    meaning: "Having a great deal of worldly experience and knowledge",
    example: "She has sophisticated taste in art.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  {
    id: "146",
    word: "Subsequent",
    phonetic: "/ˈsʌbsɪkwənt/",
    meaning: "Coming after something in time",
    example: "Subsequent events proved him right.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  
  {
    id: "148",
    word: "Suppress",
    phonetic: "/səˈpres/",
    meaning: "To forcibly put an end to something",
    example: "He tried to suppress his anger.",
    difficulty: "advanced",
    category: "Verbs"
  },
  {
    id: "149",
    word: "Sustainable",
    phonetic: "/səˈsteɪnəbl/",
    meaning: "Able to be maintained at a certain level",
    example: "We need sustainable development.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  {
    id: "150",
    word: "Unprecedented",
    phonetic: "/ʌnˈpresɪdentɪd/",
    meaning: "Never done or known before",
    example: "This is an unprecedented situation.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  // New Beginner Words (151-163)
  {
    id: "151",
    word: "Absolute",
    phonetic: "/ˈæbsəluːt/",
    meaning: "Complete; total; not relative",
    example: "The absolute truth is what matters most.",
    difficulty: "beginner",
    category: "Adjectives"
  },
  {
    id: "152",
    word: "Accurate",
    phonetic: "/ˈækjərət/",
    meaning: "Correct and precise",
    example: "The weather forecast was very accurate.",
    difficulty: "beginner",
    category: "Adjectives"
  },
  {
    id: "153",
    word: "Achieve",
    phonetic: "/əˈtʃiːv/",
    meaning: "To successfully reach or accomplish",
    example: "She achieved her goal of becoming a doctor.",
    difficulty: "beginner",
    category: "Verbs"
  },
  {
    id: "154",
    word: "Address",
    phonetic: "/əˈdres/",
    meaning: "A place where someone lives; to speak to",
    example: "What is your home address?",
    difficulty: "beginner",
    category: "Nouns"
  },
  {
    id: "155",
    word: "Admit",
    phonetic: "/ədˈmɪt/",
    meaning: "To allow entry; to confess or acknowledge",
    example: "I must admit that I made a mistake.",
    difficulty: "beginner",
    category: "Verbs"
  },
  {
    id: "156",
    word: "Adopt",
    phonetic: "/əˈdɑːpt/",
    meaning: "To legally take a child as one's own; to accept",
    example: "They decided to adopt a child.",
    difficulty: "beginner",
    category: "Verbs"
  },
  {
    id: "157",
    word: "Advance",
    phonetic: "/ədˈvæns/",
    meaning: "To move forward; progress",
    example: "Technology continues to advance rapidly.",
    difficulty: "beginner",
    category: "Verbs"
  },
  {
    id: "158",
    word: "Affect",
    phonetic: "/əˈfekt/",
    meaning: "To influence or have an effect on",
    example: "The weather affects my mood.",
    difficulty: "beginner",
    category: "Verbs"
  },
  {
    id: "159",
    word: "Afford",
    phonetic: "/əˈfɔːrd/",
    meaning: "To have enough money for; to be able to do",
    example: "I cannot afford a new car right now.",
    difficulty: "beginner",
    category: "Verbs"
  },
  {
    id: "160",
    word: "Agree",
    phonetic: "/əˈɡriː/",
    meaning: "To have the same opinion; to consent",
    example: "We all agree that this is a good idea.",
    difficulty: "beginner",
    category: "Verbs"
  },
  {
    id: "161",
    word: "Aim",
    phonetic: "/eɪm/",
    meaning: "A goal or purpose; to point or direct",
    example: "My aim is to become fluent in English.",
    difficulty: "beginner",
    category: "Nouns"
  },
  {
    id: "162",
    word: "Allow",
    phonetic: "/əˈlaʊ/",
    meaning: "To permit or enable",
    example: "The teacher allows students to ask questions.",
    difficulty: "beginner",
    category: "Verbs"
  },
  {
    id: "163",
    word: "Announce",
    phonetic: "/əˈnaʊns/",
    meaning: "To make known publicly",
    example: "The president announced new policies today.",
    difficulty: "beginner",
    category: "Verbs"
  },
  // New Intermediate Words (164-178)
  {
    id: "164",
    word: "Abandon",
    phonetic: "/əˈbændən/",
    meaning: "To leave someone or something behind",
    example: "They abandoned their plans due to bad weather.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "165",
    word: "Ability",
    phonetic: "/əˈbɪləti/",
    meaning: "The power or skill to do something",
    example: "She has the ability to solve complex problems.",
    difficulty: "intermediate",
    category: "Nouns"
  },
  {
    id: "166",
    word: "Absence",
    phonetic: "/ˈæbsəns/",
    meaning: "The state of being away or not present",
    example: "His absence from the meeting was noted.",
    difficulty: "intermediate",
    category: "Nouns"
  },
  {
    id: "167",
    word: "Abstract",
    phonetic: "/ˈæbstrækt/",
    meaning: "Existing in thought; not concrete",
    example: "Abstract art requires interpretation.",
    difficulty: "intermediate",
    category: "Adjectives"
  },
  {
    id: "168",
    word: "Academic",
    phonetic: "/ˌækəˈdemɪk/",
    meaning: "Related to education or learning",
    example: "Her academic performance improved significantly.",
    difficulty: "intermediate",
    category: "Adjectives"
  },
  {
    id: "169",
    word: "Accelerate",
    phonetic: "/əkˈseləreɪt/",
    meaning: "To increase speed; to speed up",
    example: "The car accelerated down the highway.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "170",
    word: "Accept",
    phonetic: "/əkˈsept/",
    meaning: "To receive or agree to take",
    example: "She accepted the job offer.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "171",
    word: "Acknowledge",
    phonetic: "/əkˈnɑːlɪdʒ/",
    meaning: "To recognize or admit the truth of",
    example: "He acknowledged his mistake.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "172",
    word: "Acquire",
    phonetic: "/əˈkwaɪər/",
    meaning: "To obtain or gain possession of",
    example: "The company acquired a new subsidiary.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "173",
    word: "Adapt",
    phonetic: "/əˈdæpt/",
    meaning: "To adjust to new conditions",
    example: "Animals adapt to their environment.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "174",
    word: "Adequate",
    phonetic: "/ˈædɪkwət/",
    meaning: "Sufficient or satisfactory",
    example: "The funding was adequate for the project.",
    difficulty: "intermediate",
    category: "Adjectives"
  },
  {
    id: "175",
    word: "Adjacent",
    phonetic: "/əˈdʒeɪsənt/",
    meaning: "Next to or adjoining something",
    example: "The adjacent rooms share a wall.",
    difficulty: "intermediate",
    category: "Adjectives"
  },
  {
    id: "176",
    word: "Adjust",
    phonetic: "/əˈdʒʌst/",
    meaning: "To make small changes to something",
    example: "Please adjust the volume on the speaker.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "177",
    word: "Admire",
    phonetic: "/ədˈmaɪər/",
    meaning: "To regard with respect or approval",
    example: "I admire her dedication to her work.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  {
    id: "178",
    word: "Advocate",
    phonetic: "/ˈædvəkeɪt/",
    meaning: "To publicly support or recommend",
    example: "She advocates for environmental protection.",
    difficulty: "intermediate",
    category: "Verbs"
  },
  // New Advanced Words (179-201)
  {
    id: "179",
    word: "Aberration",
    phonetic: "/ˌæbəˈreɪʃən/",
    meaning: "A deviation from the normal or expected",
    example: "The unusual weather was an aberration.",
    difficulty: "advanced",
    category: "Nouns"
  },
  {
    id: "180",
    word: "Abeyance",
    phonetic: "/əˈbeɪəns/",
    meaning: "A state of suspension or inactivity",
    example: "The project is in abeyance pending review.",
    difficulty: "advanced",
    category: "Nouns"
  },
  {
    id: "181",
    word: "Abscond",
    phonetic: "/əbˈskɑːnd/",
    meaning: "To leave secretly and hide",
    example: "The suspect absconded with the evidence.",
    difficulty: "advanced",
    category: "Verbs"
  },
  {
    id: "182",
    word: "Abstain",
    phonetic: "/əbˈsteɪn/",
    meaning: "To refrain from or avoid",
    example: "He decided to abstain from voting.",
    difficulty: "advanced",
    category: "Verbs"
  },
  {
    id: "183",
    word: "Abundance",
    phonetic: "/əˈbʌndəns/",
    meaning: "A very large quantity; plenty",
    example: "The region has an abundance of natural resources.",
    difficulty: "advanced",
    category: "Nouns"
  },
  {
    id: "184",
    word: "Abyss",
    phonetic: "/əˈbɪs/",
    meaning: "A deep chasm or void",
    example: "The ocean's abyss remains largely unexplored.",
    difficulty: "advanced",
    category: "Nouns"
  },
  {
    id: "185",
    word: "Accede",
    phonetic: "/əkˈsiːd/",
    meaning: "To agree or give consent",
    example: "The government acceded to the demands.",
    difficulty: "advanced",
    category: "Verbs"
  },
  {
    id: "186",
    word: "Accentuate",
    phonetic: "/əkˈsentʃueɪt/",
    meaning: "To emphasize or make more prominent",
    example: "The lighting accentuates the building's features.",
    difficulty: "advanced",
    category: "Verbs"
  },
  {
    id: "187",
    word: "Accessibility",
    phonetic: "/ˌæksesəˈbɪləti/",
    meaning: "The quality of being accessible",
    example: "Website accessibility is important for all users.",
    difficulty: "advanced",
    category: "Nouns"
  },
  {
    id: "188",
    word: "Accessory",
    phonetic: "/əkˈsesəri/",
    meaning: "A supplementary item; a person involved in a crime",
    example: "She wore jewelry as an accessory.",
    difficulty: "advanced",
    category: "Nouns"
  },
  {
    id: "189",
    word: "Acclaim",
    phonetic: "/əˈkleɪm/",
    meaning: "Enthusiastic approval or praise",
    example: "The film received critical acclaim.",
    difficulty: "advanced",
    category: "Nouns"
  },
  {
    id: "190",
    word: "Accolade",
    phonetic: "/ˈækəleɪd/",
    meaning: "An award or expression of praise",
    example: "He received numerous accolades for his work.",
    difficulty: "advanced",
    category: "Nouns"
  },
  {
    id: "191",
    word: "Accomplice",
    phonetic: "/əˈkɑːmplɪs/",
    meaning: "A partner in crime",
    example: "The accomplice was also arrested.",
    difficulty: "advanced",
    category: "Nouns"
  },
  {
    id: "192",
    word: "Accord",
    phonetic: "/əˈkɔːrd/",
    meaning: "An agreement; harmony",
    example: "The two nations reached an accord.",
    difficulty: "advanced",
    category: "Nouns"
  },
  {
    id: "193",
    word: "Accumulate",
    phonetic: "/əˈkjuːmjuleɪt/",
    meaning: "To gather or collect over time",
    example: "Dust accumulates on unused surfaces.",
    difficulty: "advanced",
    category: "Verbs"
  },
  {
    id: "194",
    word: "Acerbic",
    phonetic: "/əˈsɜːrbɪk/",
    meaning: "Sharp or harsh in tone or manner",
    example: "His acerbic comments offended many people.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  {
    id: "195",
    word: "Acidity",
    phonetic: "/əˈsɪdəti/",
    meaning: "The quality of being acidic",
    example: "The acidity of the soil affects plant growth.",
    difficulty: "advanced",
    category: "Nouns"
  },
  {
    id: "196",
    word: "Acquiesce",
    phonetic: "/ˌækwiˈes/",
    meaning: "To agree or accept without protest",
    example: "She acquiesced to the decision.",
    difficulty: "advanced",
    category: "Verbs"
  },
  {
    id: "197",
    word: "Acquisition",
    phonetic: "/ˌækwɪˈzɪʃən/",
    meaning: "The act of acquiring something",
    example: "The acquisition of new technology improved efficiency.",
    difficulty: "advanced",
    category: "Nouns"
  },
  {
    id: "198",
    word: "Acrimony",
    phonetic: "/ˈækrɪmoʊni/",
    meaning: "Bitterness or harshness of tone",
    example: "There was acrimony between the former partners.",
    difficulty: "advanced",
    category: "Nouns"
  },
  {
    id: "199",
    word: "Acrobatic",
    phonetic: "/ˌækrəˈbætɪk/",
    meaning: "Involving skillful physical movements",
    example: "The acrobatic performance was breathtaking.",
    difficulty: "advanced",
    category: "Adjectives"
  },
  {
    id: "200",
    word: "Acronym",
    phonetic: "/ˈækrənɪm/",
    meaning: "A word formed from initials",
    example: "NASA is an acronym for National Aeronautics and Space Administration.",
    difficulty: "advanced",
    category: "Nouns"
  },
  {
    id: "201",
    word: "Acuity",
    phonetic: "/əˈkjuːəti/",
    meaning: "Sharpness of vision or thought",
    example: "Her mental acuity impressed everyone.",
    difficulty: "advanced",
    category: "Nouns"
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

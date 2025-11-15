export interface IELTSQuestion {
  id: string;
  part: 1 | 2 | 3;
  question: string;
  category?: string;
  preparationTime?: number; // in seconds
  speakingTime?: number; // in seconds
  followUpQuestions?: string[];
}

export const ieltsQuestions: IELTSQuestion[] = [
  // Part 1: Introduction and Interview (4-5 minutes)
  {
    id: "p1-1",
    part: 1,
    question: "What is your full name?",
    category: "Personal Information"
  },
  {
    id: "p1-2",
    part: 1,
    question: "Where are you from?",
    category: "Personal Information"
  },
  {
    id: "p1-3",
    part: 1,
    question: "Do you work or are you a student?",
    category: "Work/Studies"
  },
  {
    id: "p1-4",
    part: 1,
    question: "What do you like most about your job/studies?",
    category: "Work/Studies"
  },
  {
    id: "p1-5",
    part: 1,
    question: "What do you do in your free time?",
    category: "Hobbies"
  },
  {
    id: "p1-6",
    part: 1,
    question: "Do you enjoy reading? What kind of books do you like?",
    category: "Hobbies"
  },
  {
    id: "p1-7",
    part: 1,
    question: "Tell me about your hometown.",
    category: "Home"
  },
  {
    id: "p1-8",
    part: 1,
    question: "What do you like about living in your city?",
    category: "Home"
  },
  {
    id: "p1-9",
    part: 1,
    question: "Do you prefer to spend time alone or with friends?",
    category: "Social Life"
  },
  {
    id: "p1-10",
    part: 1,
    question: "What kind of music do you enjoy?",
    category: "Entertainment"
  },

  // Part 2: Long Turn (3-4 minutes including prep)
  {
    id: "p2-1",
    part: 2,
    question: "Describe a person who has influenced you. You should say: who this person is, how you know them, what influence they have had on you, and explain why this person is important to you.",
    category: "People",
    preparationTime: 60,
    speakingTime: 120,
    followUpQuestions: [
      "Do you still keep in touch with this person?",
      "How has this influence affected your life decisions?"
    ]
  },
  {
    id: "p2-2",
    part: 2,
    question: "Describe a memorable journey you have taken. You should say: where you went, who you went with, what you did there, and explain why this journey was memorable.",
    category: "Travel",
    preparationTime: 60,
    speakingTime: 120,
    followUpQuestions: [
      "Would you like to go back to this place?",
      "What did you learn from this journey?"
    ]
  },
  {
    id: "p2-3",
    part: 2,
    question: "Describe a skill you would like to learn. You should say: what the skill is, why you want to learn it, how you would learn it, and explain how this skill would be useful to you.",
    category: "Skills",
    preparationTime: 60,
    speakingTime: 120,
    followUpQuestions: [
      "Do you think you will actually learn this skill?",
      "What challenges might you face?"
    ]
  },
  {
    id: "p2-4",
    part: 2,
    question: "Describe a book that you enjoyed reading. You should say: what the book was about, when you read it, why you chose to read it, and explain why you enjoyed it.",
    category: "Books",
    preparationTime: 60,
    speakingTime: 120,
    followUpQuestions: [
      "Would you recommend this book to others?",
      "Do you prefer reading books or watching movies?"
    ]
  },
  {
    id: "p2-5",
    part: 2,
    question: "Describe a goal you have achieved. You should say: what the goal was, how you achieved it, what challenges you faced, and explain how you felt when you achieved it.",
    category: "Achievement",
    preparationTime: 60,
    speakingTime: 120,
    followUpQuestions: [
      "What did you learn from achieving this goal?",
      "Do you have any new goals now?"
    ]
  },

  // Part 3: Discussion (4-5 minutes)
  {
    id: "p3-1",
    part: 3,
    question: "How has technology changed the way people communicate?",
    category: "Technology"
  },
  {
    id: "p3-2",
    part: 3,
    question: "Do you think social media has more positive or negative effects on society?",
    category: "Technology"
  },
  {
    id: "p3-3",
    part: 3,
    question: "What are the advantages and disadvantages of living in a big city?",
    category: "Urban Life"
  },
  {
    id: "p3-4",
    part: 3,
    question: "How important is education for success in life?",
    category: "Education"
  },
  {
    id: "p3-5",
    part: 3,
    question: "Do you think people today have better work-life balance than in the past?",
    category: "Work"
  },
  {
    id: "p3-6",
    part: 3,
    question: "What role should governments play in protecting the environment?",
    category: "Environment"
  },
  {
    id: "p3-7",
    part: 3,
    question: "How has globalization affected traditional cultures?",
    category: "Culture"
  },
  {
    id: "p3-8",
    part: 3,
    question: "What are the benefits of learning a foreign language?",
    category: "Language"
  },
  {
    id: "p3-9",
    part: 3,
    question: "Do you think money is the most important factor in job satisfaction?",
    category: "Work"
  },
  {
    id: "p3-10",
    part: 3,
    question: "How can society better support elderly people?",
    category: "Social Issues"
  }
];

export function getQuestionsByPart(part: 1 | 2 | 3) {
  return ieltsQuestions.filter(q => q.part === part);
}

export function getRandomQuestion(part: 1 | 2 | 3) {
  const questions = getQuestionsByPart(part);
  return questions[Math.floor(Math.random() * questions.length)];
}

export function getQuestionById(id: string) {
  return ieltsQuestions.find(q => q.id === id);
}

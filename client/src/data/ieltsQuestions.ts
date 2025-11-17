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
  },
  // Additional Part 1 Questions (p1-11 to p1-40)
  {
    id: "p1-11",
    part: 1,
    question: "What kind of music do you like?",
    category: "Hobbies"
  },
  {
    id: "p1-12",
    part: 1,
    question: "Do you prefer to live in a house or an apartment?",
    category: "Home"
  },
  {
    id: "p1-13",
    part: 1,
    question: "What do you usually do on weekends?",
    category: "Hobbies"
  },
  {
    id: "p1-14",
    part: 1,
    question: "Do you like cooking? What kind of food do you cook?",
    category: "Food"
  },
  {
    id: "p1-15",
    part: 1,
    question: "Do you prefer to travel alone or with others?",
    category: "Travel"
  },
  {
    id: "p1-16",
    part: 1,
    question: "What's your favorite season and why?",
    category: "Weather"
  },
  {
    id: "p1-17",
    part: 1,
    question: "Do you use social media? Which platforms do you use?",
    category: "Technology"
  },
  {
    id: "p1-18",
    part: 1,
    question: "What kind of sports do you like?",
    category: "Sports"
  },
  {
    id: "p1-19",
    part: 1,
    question: "Do you like shopping? What do you usually buy?",
    category: "Shopping"
  },
  {
    id: "p1-20",
    part: 1,
    question: "What's your favorite color?",
    category: "Personal Preferences"
  },
  {
    id: "p1-21",
    part: 1,
    question: "Do you prefer mornings or evenings?",
    category: "Daily Routine"
  },
  {
    id: "p1-22",
    part: 1,
    question: "What kind of movies do you enjoy?",
    category: "Entertainment"
  },
  {
    id: "p1-23",
    part: 1,
    question: "Do you have any pets?",
    category: "Animals"
  },
  {
    id: "p1-24",
    part: 1,
    question: "What do you do to relax?",
    category: "Hobbies"
  },
  {
    id: "p1-25",
    part: 1,
    question: "Do you like your hometown? Why or why not?",
    category: "Home"
  },
  {
    id: "p1-26",
    part: 1,
    question: "What kind of weather do you like best?",
    category: "Weather"
  },
  {
    id: "p1-27",
    part: 1,
    question: "Do you prefer to eat at home or in restaurants?",
    category: "Food"
  },
  {
    id: "p1-28",
    part: 1,
    question: "What's your favorite way to spend time with friends?",
    category: "Social Life"
  },
  {
    id: "p1-29",
    part: 1,
    question: "Do you like art? What kind of art do you enjoy?",
    category: "Arts"
  },
  {
    id: "p1-30",
    part: 1,
    question: "What languages can you speak?",
    category: "Language"
  },
  {
    id: "p1-31",
    part: 1,
    question: "Do you prefer city life or countryside life?",
    category: "Lifestyle"
  },
  {
    id: "p1-32",
    part: 1,
    question: "What's your favorite holiday or festival?",
    category: "Culture"
  },
  {
    id: "p1-33",
    part: 1,
    question: "Do you like taking photos? What do you photograph?",
    category: "Hobbies"
  },
  {
    id: "p1-34",
    part: 1,
    question: "What kind of clothes do you like to wear?",
    category: "Fashion"
  },
  {
    id: "p1-35",
    part: 1,
    question: "Do you prefer to study in the morning or at night?",
    category: "Studies"
  },
  {
    id: "p1-36",
    part: 1,
    question: "What's your favorite type of transportation?",
    category: "Transport"
  },
  {
    id: "p1-37",
    part: 1,
    question: "Do you like gardening or plants?",
    category: "Nature"
  },
  {
    id: "p1-38",
    part: 1,
    question: "What do you usually do when you have free time?",
    category: "Hobbies"
  },
  {
    id: "p1-39",
    part: 1,
    question: "Do you prefer hot or cold drinks?",
    category: "Food"
  },
  {
    id: "p1-40",
    part: 1,
    question: "What's your favorite room in your home?",
    category: "Home"
  },
  // Additional Part 2 Questions (p2-6 to p2-30)
  {
    id: "p2-6",
    part: 2,
    question: "Describe a memorable journey you have taken. You should say: where you went, who you went with, what you did there, and explain why it was memorable.",
    category: "Travel",
    preparationTime: 60,
    speakingTime: 120
  },
  {
    id: "p2-7",
    part: 2,
    question: "Describe a skill you would like to learn. You should say: what the skill is, why you want to learn it, how you would learn it, and explain how it would benefit you.",
    category: "Personal Development",
    preparationTime: 60,
    speakingTime: 120
  },
  {
    id: "p2-8",
    part: 2,
    question: "Describe a time when you helped someone. You should say: who you helped, how you helped them, why you helped them, and explain how you felt about it.",
    category: "Experience",
    preparationTime: 60,
    speakingTime: 120
  },
  {
    id: "p2-9",
    part: 2,
    question: "Describe your favorite restaurant. You should say: where it is, what kind of food it serves, how often you go there, and explain why you like it.",
    category: "Places",
    preparationTime: 60,
    speakingTime: 120
  },
  {
    id: "p2-10",
    part: 2,
    question: "Describe a piece of technology you find useful. You should say: what it is, when you got it, how you use it, and explain why it's useful to you.",
    category: "Technology",
    preparationTime: 60,
    speakingTime: 120
  },
  {
    id: "p2-11",
    part: 2,
    question: "Describe a childhood memory. You should say: what happened, when it happened, who was involved, and explain why you remember it.",
    category: "Memory",
    preparationTime: 60,
    speakingTime: 120
  },
  {
    id: "p2-12",
    part: 2,
    question: "Describe a goal you have achieved. You should say: what the goal was, how you achieved it, what challenges you faced, and explain how you felt when you achieved it.",
    category: "Achievement",
    preparationTime: 60,
    speakingTime: 120
  },
  {
    id: "p2-13",
    part: 2,
    question: "Describe a festival or celebration in your country. You should say: what it is, when it takes place, how people celebrate it, and explain why it's important.",
    category: "Culture",
    preparationTime: 60,
    speakingTime: 120
  },
  {
    id: "p2-14",
    part: 2,
    question: "Describe a time when you were late for something. You should say: what you were late for, why you were late, what happened, and explain how you felt.",
    category: "Experience",
    preparationTime: 60,
    speakingTime: 120
  },
  {
    id: "p2-15",
    part: 2,
    question: "Describe a gift you gave to someone. You should say: what the gift was, who you gave it to, why you chose it, and explain how they reacted.",
    category: "Objects",
    preparationTime: 60,
    speakingTime: 120
  },
  {
    id: "p2-16",
    part: 2,
    question: "Describe a sport you would like to try. You should say: what the sport is, how you learned about it, what equipment is needed, and explain why you want to try it.",
    category: "Sports",
    preparationTime: 60,
    speakingTime: 120
  },
  {
    id: "p2-17",
    part: 2,
    question: "Describe a website you use often. You should say: what the website is, how you found it, what you use it for, and explain why you find it useful.",
    category: "Technology",
    preparationTime: 60,
    speakingTime: 120
  },
  {
    id: "p2-18",
    part: 2,
    question: "Describe a time when you felt proud of yourself. You should say: what you did, when it happened, why you felt proud, and explain how it affected you.",
    category: "Personal Experience",
    preparationTime: 60,
    speakingTime: 120
  },
  {
    id: "p2-19",
    part: 2,
    question: "Describe a building you find interesting. You should say: where it is, what it looks like, what it's used for, and explain why you find it interesting.",
    category: "Places",
    preparationTime: 60,
    speakingTime: 120
  },
  {
    id: "p2-20",
    part: 2,
    question: "Describe a time when you learned something new. You should say: what you learned, how you learned it, why you wanted to learn it, and explain how it helped you.",
    category: "Learning",
    preparationTime: 60,
    speakingTime: 120
  },
  {
    id: "p2-21",
    part: 2,
    question: "Describe a person who has influenced you. You should say: who they are, how you know them, what they did, and explain how they influenced you.",
    category: "People",
    preparationTime: 60,
    speakingTime: 120
  },
  {
    id: "p2-22",
    part: 2,
    question: "Describe a time when you had to make a difficult decision. You should say: what the decision was, what options you had, how you made the decision, and explain why it was difficult.",
    category: "Experience",
    preparationTime: 60,
    speakingTime: 120
  },
  {
    id: "p2-23",
    part: 2,
    question: "Describe a park or garden you like. You should say: where it is, what it looks like, how often you go there, and explain why you like it.",
    category: "Places",
    preparationTime: 60,
    speakingTime: 120
  },
  {
    id: "p2-24",
    part: 2,
    question: "Describe a time when you worked in a team. You should say: what the project was, who was in the team, what your role was, and explain what you learned from the experience.",
    category: "Work",
    preparationTime: 60,
    speakingTime: 120
  },
  {
    id: "p2-25",
    part: 2,
    question: "Describe a piece of advice you received. You should say: what the advice was, who gave it to you, when you received it, and explain whether you followed it.",
    category: "Experience",
    preparationTime: 60,
    speakingTime: 120
  },
  {
    id: "p2-26",
    part: 2,
    question: "Describe a hobby you enjoyed as a child. You should say: what the hobby was, when you started it, how you did it, and explain why you enjoyed it.",
    category: "Hobbies",
    preparationTime: 60,
    speakingTime: 120
  },
  {
    id: "p2-27",
    part: 2,
    question: "Describe a time when the weather affected your plans. You should say: what your plans were, what the weather was like, how it affected you, and explain how you felt about it.",
    category: "Experience",
    preparationTime: 60,
    speakingTime: 120
  },
  {
    id: "p2-28",
    part: 2,
    question: "Describe a photograph you like. You should say: what the photograph shows, when it was taken, who took it, and explain why you like it.",
    category: "Objects",
    preparationTime: 60,
    speakingTime: 120
  },
  {
    id: "p2-29",
    part: 2,
    question: "Describe a time when you received good news. You should say: what the news was, how you received it, how you reacted, and explain why it was important to you.",
    category: "Experience",
    preparationTime: 60,
    speakingTime: 120
  },
  {
    id: "p2-30",
    part: 2,
    question: "Describe a place you would like to visit in the future. You should say: where it is, what you know about it, what you would do there, and explain why you want to visit it.",
    category: "Travel",
    preparationTime: 60,
    speakingTime: 120
  },
  // Additional Part 3 Questions (p3-11 to p3-35)
  {
    id: "p3-11",
    part: 3,
    question: "What are the advantages and disadvantages of social media?",
    category: "Technology"
  },
  {
    id: "p3-12",
    part: 3,
    question: "How has education changed in recent years?",
    category: "Education"
  },
  {
    id: "p3-13",
    part: 3,
    question: "Do you think people spend too much time on their phones?",
    category: "Technology"
  },
  {
    id: "p3-14",
    part: 3,
    question: "What are the benefits of living in a multicultural society?",
    category: "Society"
  },
  {
    id: "p3-15",
    part: 3,
    question: "How can we encourage young people to be more active?",
    category: "Health"
  },
  {
    id: "p3-16",
    part: 3,
    question: "What impact does tourism have on local communities?",
    category: "Travel"
  },
  {
    id: "p3-17",
    part: 3,
    question: "Do you think traditional skills are still important today?",
    category: "Culture"
  },
  {
    id: "p3-18",
    part: 3,
    question: "How can technology improve healthcare?",
    category: "Technology"
  },
  {
    id: "p3-19",
    part: 3,
    question: "What are the main causes of stress in modern life?",
    category: "Lifestyle"
  },
  {
    id: "p3-20",
    part: 3,
    question: "Should companies be responsible for protecting the environment?",
    category: "Environment"
  },
  {
    id: "p3-21",
    part: 3,
    question: "How has the role of women in society changed?",
    category: "Society"
  },
  {
    id: "p3-22",
    part: 3,
    question: "What are the pros and cons of working from home?",
    category: "Work"
  },
  {
    id: "p3-23",
    part: 3,
    question: "Do you think children today have too much pressure?",
    category: "Education"
  },
  {
    id: "p3-24",
    part: 3,
    question: "How can cities be made more environmentally friendly?",
    category: "Environment"
  },
  {
    id: "p3-25",
    part: 3,
    question: "What role does art play in society?",
    category: "Arts"
  },
  {
    id: "p3-26",
    part: 3,
    question: "How has online shopping changed consumer behavior?",
    category: "Shopping"
  },
  {
    id: "p3-27",
    part: 3,
    question: "Should governments invest more in public transportation?",
    category: "Transport"
  },
  {
    id: "p3-28",
    part: 3,
    question: "What are the effects of advertising on society?",
    category: "Media"
  },
  {
    id: "p3-29",
    part: 3,
    question: "How can we preserve endangered languages?",
    category: "Language"
  },
  {
    id: "p3-30",
    part: 3,
    question: "Do you think celebrities have too much influence on young people?",
    category: "Society"
  },
  {
    id: "p3-31",
    part: 3,
    question: "What are the benefits and drawbacks of artificial intelligence?",
    category: "Technology"
  },
  {
    id: "p3-32",
    part: 3,
    question: "How can we reduce food waste?",
    category: "Environment"
  },
  {
    id: "p3-33",
    part: 3,
    question: "Should universities be free for everyone?",
    category: "Education"
  },
  {
    id: "p3-34",
    part: 3,
    question: "What impact does fast fashion have on the environment?",
    category: "Environment"
  },
  {
    id: "p3-35",
    part: 3,
    question: "How can communities support mental health?",
    category: "Health"
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

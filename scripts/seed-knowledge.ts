/**
 * Seed script to teach TalkyTalky about IELTS and the app's curriculum
 * Run: npx tsx scripts/seed-knowledge.ts
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDb } from "../server/db";
import { systemKnowledge } from "../drizzle/schema";
import * as dotenv from "dotenv";

dotenv.config();

// 📚 The Knowledge Base - IELTS Band Descriptors and App Content
const KNOWLEDGE_BASE = [
  {
    category: "IELTS_RUBRIC",
    topic: "Band 9 Fluency and Coherence",
    content: "Band 9: Speaks fluently with only rare repetition or self-correction. Any hesitation is content-related rather than to find words or grammar. Speaks coherently with fully appropriate cohesive features. Develops topics fully and appropriately."
  },
  {
    category: "IELTS_RUBRIC",
    topic: "Band 8 Fluency and Coherence",
    content: "Band 8: Speaks fluently with only occasional repetition or self-correction. Hesitation is usually content-related and only rarely to search for language. Develops topics coherently and appropriately."
  },
  {
    category: "IELTS_RUBRIC",
    topic: "Band 7 Fluency and Coherence",
    content: "Band 7: Speaks at length without noticeable effort or loss of coherence. May demonstrate language-related hesitation at times, or some repetition and/or self-correction. Uses a range of connectives and discourse markers with some flexibility."
  },
  {
    category: "IELTS_RUBRIC",
    topic: "Band 9 Lexical Resource",
    content: "Band 9: Uses vocabulary with full flexibility and precision in all topics. Uses idiomatic language naturally and accurately."
  },
  {
    category: "IELTS_RUBRIC",
    topic: "Band 8 Lexical Resource",
    content: "Band 8: Uses a wide vocabulary resource readily and flexibly to convey precise meaning. Uses less common and idiomatic vocabulary skillfully, with occasional inaccuracies. Uses paraphrase effectively as required."
  },
  {
    category: "IELTS_RUBRIC",
    topic: "Band 7 Lexical Resource",
    content: "Band 7: Uses vocabulary resource flexibly to discuss a variety of topics. Uses some less common and idiomatic vocabulary and shows some awareness of style and collocation, with some inappropriate choices. Uses paraphrase effectively."
  },
  {
    category: "IELTS_RUBRIC",
    topic: "Band 9 Grammatical Range and Accuracy",
    content: "Band 9: Uses a full range of structures naturally and appropriately. Produces consistently accurate structures apart from 'slips' characteristic of native speaker speech."
  },
  {
    category: "IELTS_RUBRIC",
    topic: "Band 8 Grammatical Range and Accuracy",
    content: "Band 8: Uses a wide range of structures flexibly. Produces a majority of error-free sentences with only very occasional inappropriacies or basic/non-systematic errors."
  },
  {
    category: "IELTS_RUBRIC",
    topic: "Band 7 Grammatical Range and Accuracy",
    content: "Band 7: Uses a range of complex structures with some flexibility. Frequently produces error-free sentences, though some grammatical mistakes persist."
  },
  {
    category: "IELTS_RUBRIC",
    topic: "Band 9 Pronunciation",
    content: "Band 9: Uses a full range of pronunciation features with precision and subtlety. Sustains flexible use of features throughout. Is effortless to understand."
  },
  {
    category: "IELTS_RUBRIC",
    topic: "Band 8 Pronunciation",
    content: "Band 8: Uses a wide range of pronunciation features. Sustains flexible use of features, with only occasional lapses. Is easy to understand throughout; L1 accent has minimal effect on intelligibility."
  },
  {
    category: "IELTS_RUBRIC",
    topic: "Band 7 Pronunciation",
    content: "Band 7: Shows all the positive features of Band 6 and some, but not all, of the positive features of Band 8. Uses a range of pronunciation features with mixed control. Shows some effective use of features but this is not sustained. Can generally be understood throughout, though mispronunciation of individual words or sounds reduces clarity at times."
  },
  {
    category: "APP_CONTENT",
    topic: "Business English Vocabulary",
    content: "The app's Business English track includes these words: Negotiate, Collaborate, Stakeholder, Leverage, Synergy, Paradigm, Facilitate, Implement, Strategic, Revenue, Deadline, Proposal, Objective, Efficiency, Innovation."
  },
  {
    category: "APP_CONTENT",
    topic: "Travel Vocabulary",
    content: "The app's Travel Essentials track includes: Itinerary, Excursion, Accommodation, Scenic, Landmark, Cuisine, Backpacking, Jet-lag, Souvenir, Destination, Reservation, Departure, Arrival, Boarding, Luggage."
  },
  {
    category: "APP_CONTENT",
    topic: "Academic English Vocabulary",
    content: "The app's Academic English track includes: Hypothesis, Methodology, Analysis, Conclusion, Evidence, Research, Theory, Concept, Framework, Perspective, Critique, Evaluate, Interpret, Synthesize, Demonstrate."
  },
  {
    category: "APP_CONTENT",
    topic: "Daily Conversation Vocabulary",
    content: "The app's Daily Conversation track includes: Appreciate, Recommend, Convenient, Familiar, Particular, Situation, Experience, Opportunity, Relationship, Community, Environment, Responsibility, Challenge, Achievement, Confidence."
  },
  {
    category: "PRONUNCIATION",
    topic: "TH Sound",
    content: "The 'TH' sound (/θ/ and /ð/) is made by placing the tongue between the teeth and blowing air. It should not sound like 'S', 'Z', 'D', or 'F'. Practice words: think, this, through, although,ether, breathe."
  },
  {
    category: "PRONUNCIATION",
    topic: "R and L Sounds",
    content: "The 'R' sound is produced with the tongue curled back slightly without touching the roof of the mouth. The 'L' sound requires the tongue to touch the alveolar ridge (behind the upper teeth). Practice pairs: right/light, read/lead, rice/lice, rock/lock."
  },
  {
    category: "PRONUNCIATION",
    topic: "Vowel Sounds",
    content: "English has 12 pure vowel sounds and 8 diphthongs. Common mistakes include confusing /i:/ (sheep) with /ɪ/ (ship), /æ/ (cat) with /ʌ/ (cut), and /ɔ:/ (caught) with /ɒ/ (cot). Practice minimal pairs to distinguish these sounds."
  },
  {
    category: "PRONUNCIATION",
    topic: "Word Stress",
    content: "Word stress is crucial in English. Incorrect stress can make words unintelligible. For example: REcord (noun) vs reCORD (verb), PREsent (noun) vs preSENT (verb). Multi-syllable words typically have one primary stress and may have secondary stress."
  },
  {
    category: "GRAMMAR",
    topic: "Present Perfect vs Simple Past",
    content: "Present Perfect (have/has + past participle) is used for actions with present relevance or unspecified time. Simple Past is for completed actions at a specific time. Example: 'I have lived here for 5 years' (still living) vs 'I lived there in 2010' (finished)."
  },
  {
    category: "GRAMMAR",
    topic: "Conditionals",
    content: "Zero conditional (if + present, present) for general truths. First conditional (if + present, will) for real future possibilities. Second conditional (if + past, would) for hypothetical present/future. Third conditional (if + past perfect, would have) for hypothetical past."
  }
];

async function seed() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const db = await getDb();

  if (!db) {
    throw new Error("Database connection failed");
  }

  console.log("🧠 Seeding Knowledge Base...");
  console.log(`📚 Total items to process: ${KNOWLEDGE_BASE.length}`);

  for (const item of KNOWLEDGE_BASE) {
    try {
      // Generate embedding for the knowledge content
      const result = await model.embedContent(item.content);
      const embedding = result.embedding.values;

      // Insert into database
      await db.insert(systemKnowledge).values({
        category: item.category,
        topic: item.topic,
        content: item.content,
        embedding: JSON.stringify(embedding) // Store as JSON string
      });

      console.log(`✅ Added: [${item.category}] ${item.topic}`);
    } catch (error) {
      console.error(`❌ Failed to add ${item.topic}:`, error);
    }
  }

  console.log("🎉 Knowledge Base seeded successfully!");
  console.log(`📊 Total entries: ${KNOWLEDGE_BASE.length}`);
  console.log("🎯 TalkyTalky is now a certified IELTS instructor!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("💥 Seed script failed:", error);
  process.exit(1);
});

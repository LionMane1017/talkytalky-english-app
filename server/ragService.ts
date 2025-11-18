/**
 * Mini RAG (Retrieval-Augmented Generation) Service
 * Provides semantic search and contextual memory for personalized coaching
 */

import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { practiceSessions, systemKnowledge } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generate embedding for text using OpenAI embeddings
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Generate a semantic embedding for the following text. Return only the embedding vector as a JSON array of numbers."
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "embedding",
          strict: true,
          schema: {
            type: "object",
            properties: {
              embedding: {
                type: "array",
                items: { type: "number" },
                description: "Vector embedding of the input text"
              }
            },
            required: ["embedding"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error("No embedding generated");
    }

    const parsed = JSON.parse(content);
    return parsed.embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    // Fallback: generate a simple hash-based pseudo-embedding
    return generateSimpleEmbedding(text);
  }
}

/**
 * Simple fallback embedding based on text characteristics
 */
function generateSimpleEmbedding(text: string): number[] {
  const embedding = new Array(384).fill(0); // Standard embedding size
  const words = text.toLowerCase().split(/\s+/);
  
  // Generate pseudo-embedding based on word characteristics
  words.forEach((word, idx) => {
    const hash = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const position = hash % embedding.length;
    embedding[position] += 1 / (idx + 1); // Weight by position
  });
  
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
}

/**
 * Calculate cosine similarity between two embeddings
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }
  
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Search for relevant past practice sessions using semantic similarity
 */
export async function searchRelevantSessions(
  userId: number,
  query: string,
  limit: number = 5
): Promise<Array<{
  session: any;
  similarity: number;
}>> {
  const db = await getDb();
  if (!db) {
    console.warn("[RAG] Database not available");
    return [];
  }

  try {
    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);
    
    // Get recent sessions with embeddings
    const sessions = await db
      .select()
      .from(practiceSessions)
      .where(eq(practiceSessions.userId, userId))
      .orderBy(desc(practiceSessions.createdAt))
      .limit(50); // Get last 50 sessions to search through
    
    // Calculate similarity scores
    const results = sessions
      .filter(session => session.embedding) // Only sessions with embeddings
      .map(session => {
        const sessionEmbedding = JSON.parse(session.embedding!);
        const similarity = cosineSimilarity(queryEmbedding, sessionEmbedding);
        return { session, similarity };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
    
    return results;
  } catch (error) {
    console.error("[RAG] Error searching sessions:", error);
    return [];
  }
}

/**
 * Build context string from relevant sessions for AI coaching
 */
export async function buildCoachingContext(
  userId: number,
  currentActivity: string
): Promise<string> {
  const relevantSessions = await searchRelevantSessions(userId, currentActivity, 3);
  
  if (relevantSessions.length === 0) {
    return "This is the user's first session. Provide encouraging and supportive feedback.";
  }
  
  let context = "Based on the user's practice history:\n\n";
  
  relevantSessions.forEach((result, idx) => {
    const session = result.session;
    context += `${idx + 1}. Previous session (${new Date(session.createdAt).toLocaleDateString()}):\n`;
    context += `   - Type: ${session.type}\n`;
    context += `   - Score: ${session.score}/100\n`;
    
    if (session.context) {
      context += `   - Practiced: ${session.context}\n`;
    }
    
    if (session.userWeaknesses) {
      try {
        const weaknesses = JSON.parse(session.userWeaknesses);
        if (weaknesses.length > 0) {
          context += `   - Struggled with: ${weaknesses.join(", ")}\n`;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    
    if (session.userStrengths) {
      try {
        const strengths = JSON.parse(session.userStrengths);
        if (strengths.length > 0) {
          context += `   - Strengths: ${strengths.join(", ")}\n`;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    
    if (session.feedback) {
      context += `   - Previous feedback: ${session.feedback.substring(0, 200)}...\n`;
    }
    
    context += "\n";
  });
  
  context += "Use this information to provide personalized, contextual coaching that builds on their progress and addresses their specific challenges.";
  
  return context;
}

/**
 * Get Smart Context: Hybrid RAG combining User History + System Knowledge
 * This is the key upgrade that transforms TalkyTalky from generic AI to certified IELTS instructor
 */
export async function getSmartContext(
  userId: number,
  currentTopic: string
): Promise<string> {
  const db = await getDb();
  if (!db) {
    console.warn("[System RAG] Database not available");
    return "";
  }

  try {
    // Initialize Gemini for embeddings
    if (!process.env.GEMINI_API_KEY) {
      console.warn("[System RAG] GEMINI_API_KEY not set");
      return "";
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

    // 1. Vectorize the current topic/question
    const result = await model.embedContent(currentTopic);
    const queryVector = result.embedding.values;

    // 2. Retrieve USER History (Personal RAG) - Use existing buildCoachingContext!
    const userContext = await buildCoachingContext(userId, currentTopic);

    // 3. Retrieve SYSTEM Knowledge (Expert RAG)
    const allKnowledge = await db.select().from(systemKnowledge);

    // Calculate similarity scores and rank
    const rankedKnowledge = allKnowledge
      .filter(doc => doc.embedding) // Only docs with embeddings
      .map(doc => {
        const docEmbedding = JSON.parse(doc.embedding!);
        const score = cosineSimilarity(queryVector, docEmbedding);
        return { ...doc, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Top 3 most relevant knowledge pieces

    // 4. Construct the Ultimate Hybrid Context
    let smartContext = "";

    // Add System Knowledge first (Expert Foundation)
    if (rankedKnowledge.length > 0) {
      smartContext += "📚 EXPERT KNOWLEDGE BASE:\n";
      rankedKnowledge.forEach(k => {
        smartContext += `- [${k.category}] ${k.topic}: ${k.content}\n`;
      });
      smartContext += "\n";
    }

    // Add User History (Personalization)
    if (userContext) {
      smartContext += "👤 USER HISTORY:\n";
      smartContext += userContext;
      smartContext += "\n";
    }

    // Add Instruction
    smartContext += "🎯 INSTRUCTION:\n";
    smartContext += "You are TalkyTalky, a certified IELTS instructor. Use the Expert Knowledge Base to provide accurate, grounded feedback based on official IELTS criteria. Reference the User History to personalize your coaching. If the user makes a mistake related to their past struggles, gently point it out and provide specific improvement strategies.\n";

    return smartContext;
  } catch (error) {
    console.error("[System RAG] Error building smart context:", error);
    // Fallback to user context only
    return await buildCoachingContext(userId, currentTopic);
  }
}

/**
 * Save session with embedding for future retrieval
 */
export async function saveSessionWithEmbedding(sessionData: {
  userId: number;
  type: string;
  difficulty?: string;
  score?: number;
  duration?: number;
  wordsCompleted?: number;
  accuracy?: number;
  context?: string;
  feedback?: string;
  userStrengths?: string[];
  userWeaknesses?: string[];
}): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[RAG] Database not available");
    return;
  }

  try {
    // Build text for embedding
    const embeddingText = [
      `Type: ${sessionData.type}`,
      sessionData.difficulty ? `Difficulty: ${sessionData.difficulty}` : "",
      sessionData.context ? `Context: ${sessionData.context}` : "",
      sessionData.feedback ? `Feedback: ${sessionData.feedback}` : "",
      sessionData.userWeaknesses ? `Weaknesses: ${sessionData.userWeaknesses.join(", ")}` : "",
      sessionData.userStrengths ? `Strengths: ${sessionData.userStrengths.join(", ")}` : "",
    ].filter(Boolean).join("\n");
    
    // Generate embedding
    const embedding = await generateEmbedding(embeddingText);
    
    // Save to database
    await db.insert(practiceSessions).values({
      userId: sessionData.userId,
      type: sessionData.type as any,
      difficulty: sessionData.difficulty as any,
      score: sessionData.score,
      duration: sessionData.duration,
      wordsCompleted: sessionData.wordsCompleted,
      accuracy: sessionData.accuracy,
      context: sessionData.context,
      feedback: sessionData.feedback,
      userStrengths: sessionData.userStrengths ? JSON.stringify(sessionData.userStrengths) : null,
      userWeaknesses: sessionData.userWeaknesses ? JSON.stringify(sessionData.userWeaknesses) : null,
      embedding: JSON.stringify(embedding),
    });
    
    console.log("[RAG] Session saved with embedding");
  } catch (error) {
    console.error("[RAG] Error saving session with embedding:", error);
    throw error;
  }
}

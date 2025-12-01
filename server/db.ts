import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, practiceSessions, InsertPracticeSession, userProgress, InsertUserProgress, vocabularyProgress, InsertVocabularyProgress, userAchievements, InsertUserAchievement, lessonSessions, lessonWordAttempts, lessonMetadataCache } from "../drizzle/schema";
import { ENV } from './_core/env';
import * as schema from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL, { schema, mode: "default" });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Practice Sessions
export async function createPracticeSession(session: InsertPracticeSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(practiceSessions).values(session);
  return result;
}

export async function getUserPracticeSessions(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(practiceSessions)
    .where(eq(practiceSessions.userId, userId))
    .orderBy(desc(practiceSessions.createdAt))
    .limit(limit);
}

export async function getSessionStats(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      totalSessions: sql<number>`COUNT(*)`,
      avgScore: sql<number>`AVG(${practiceSessions.score})`,
      totalDuration: sql<number>`SUM(${practiceSessions.duration})`,
    })
    .from(practiceSessions)
    .where(eq(practiceSessions.userId, userId));

  return result[0];
}

// User Progress
export async function getUserProgress(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(userProgress)
    .where(eq(userProgress.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function upsertUserProgress(progress: InsertUserProgress) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .insert(userProgress)
    .values(progress)
    .onDuplicateKeyUpdate({
      set: {
        totalSessions: progress.totalSessions,
        pronunciationScore: progress.pronunciationScore,
        fluencyScore: progress.fluencyScore,
        vocabularyScore: progress.vocabularyScore,
        grammarScore: progress.grammarScore,
        ieltsReadyScore: progress.ieltsReadyScore,
        updatedAt: new Date(),
      },
    });
}

// Vocabulary Progress
export async function upsertVocabularyProgress(vocabProgress: InsertVocabularyProgress) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .insert(vocabularyProgress)
    .values(vocabProgress)
    .onDuplicateKeyUpdate({
      set: {
        attempts: vocabProgress.attempts,
        successCount: vocabProgress.successCount,
        lastScore: vocabProgress.lastScore,
        lastPracticed: new Date(),
        nextReview: vocabProgress.nextReview,
        reviewInterval: vocabProgress.reviewInterval,
        easeFactor: vocabProgress.easeFactor,
        repetitions: vocabProgress.repetitions,
      },
    });
}

export async function getUserVocabularyProgress(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(vocabularyProgress)
    .where(eq(vocabularyProgress.userId, userId))
    .orderBy(desc(vocabularyProgress.lastPracticed));
}

export async function getVocabularyProgressByWord(userId: number, wordId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(vocabularyProgress)
    .where(
      and(
        eq(vocabularyProgress.userId, userId),
        eq(vocabularyProgress.wordId, wordId)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// Achievements
export async function unlockAchievement(userId: number, achievementId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if already unlocked
  const existing = await db
    .select()
    .from(userAchievements)
    .where(
      and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return null; // Already unlocked
  }

  await db.insert(userAchievements).values({
    userId,
    achievementId,
  });

  return achievementId;
}

export async function getUserAchievements(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId))
    .orderBy(desc(userAchievements.unlockedAt));
}

// Get words that need review (spaced repetition)
export async function getWordsNeedingReview(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  
  return await db
    .select()
    .from(vocabularyProgress)
    .where(
      and(
        eq(vocabularyProgress.userId, userId),
        sql`(${vocabularyProgress.nextReview} IS NULL OR ${vocabularyProgress.nextReview} <= ${now})`
      )
    )
    .orderBy(vocabularyProgress.lastPracticed);
}

// Get user by ID
export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Get practice sessions in date range
export async function getUserPracticeSessionsInRange(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(practiceSessions)
    .where(
      and(
        eq(practiceSessions.userId, userId),
        sql`${practiceSessions.createdAt} >= ${startDate}`,
        sql`${practiceSessions.createdAt} <= ${endDate}`
      )
    )
    .orderBy(desc(practiceSessions.createdAt));
}

// Get vocabulary progress in date range
export async function getUserVocabularyProgressInRange(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(vocabularyProgress)
    .where(
      and(
        eq(vocabularyProgress.userId, userId),
        sql`${vocabularyProgress.lastPracticed} >= ${startDate}`,
        sql`${vocabularyProgress.lastPracticed} <= ${endDate}`
      )
    )
    .orderBy(desc(vocabularyProgress.lastPracticed));
}

// Get achievements in date range
export async function getUserAchievementsInRange(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(userAchievements)
    .where(
      and(
        eq(userAchievements.userId, userId),
        sql`${userAchievements.unlockedAt} >= ${startDate}`,
        sql`${userAchievements.unlockedAt} <= ${endDate}`
      )
    )
    .orderBy(desc(userAchievements.unlockedAt));
}

import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Practice sessions table - stores all practice attempts
 */
export const practiceSessions = mysqlTable("practiceSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["pronunciation", "matching", "ielts_part1", "ielts_part2", "ielts_part3", "mock_test"]).notNull(),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]),
  score: int("score"), // 0-100
  duration: int("duration"), // in seconds
  wordsCompleted: int("wordsCompleted"),
  accuracy: int("accuracy"), // 0-100
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PracticeSession = typeof practiceSessions.$inferSelect;
export type InsertPracticeSession = typeof practiceSessions.$inferInsert;

/**
 * User progress table - aggregated stats per user
 */
export const userProgress = mysqlTable("userProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  totalSessions: int("totalSessions").default(0).notNull(),
  pronunciationScore: int("pronunciationScore").default(0).notNull(), // 0-100
  fluencyScore: int("fluencyScore").default(0).notNull(), // 0-100
  vocabularyScore: int("vocabularyScore").default(0).notNull(), // 0-100
  grammarScore: int("grammarScore").default(0).notNull(), // 0-100
  ieltsReadyScore: int("ieltsReadyScore").default(0).notNull(), // 0-100
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;

/**
 * Vocabulary progress table - tracks individual word practice
 */
export const vocabularyProgress = mysqlTable("vocabularyProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  wordId: varchar("wordId", { length: 64 }).notNull(),
  attempts: int("attempts").default(0).notNull(),
  successCount: int("successCount").default(0).notNull(),
  lastScore: int("lastScore"), // 0-100
  lastPracticed: timestamp("lastPracticed").defaultNow().notNull(),
});

export type VocabularyProgress = typeof vocabularyProgress.$inferSelect;
export type InsertVocabularyProgress = typeof vocabularyProgress.$inferInsert;
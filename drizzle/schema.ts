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
  // RAG fields for contextual memory
  context: text("context"), // What the user was practicing (words, topics, etc.)
  feedback: text("feedback"), // AI feedback given during session
  userStrengths: text("userStrengths"), // JSON array of strengths identified
  userWeaknesses: text("userWeaknesses"), // JSON array of weaknesses identified
  embedding: text("embedding"), // Vector embedding for semantic search (stored as JSON array)
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
  // Spaced repetition fields
  nextReview: timestamp("nextReview"),
  reviewInterval: int("reviewInterval").default(1), // days
  easeFactor: int("easeFactor").default(250), // stored as int (2.5 * 100)
  repetitions: int("repetitions").default(0),
});

export type VocabularyProgress = typeof vocabularyProgress.$inferSelect;
export type InsertVocabularyProgress = typeof vocabularyProgress.$inferInsert;

/**
 * User achievements table - tracks unlocked badges and milestones
 */
export const userAchievements = mysqlTable("userAchievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  achievementId: varchar("achievementId", { length: 64 }).notNull(),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;

/**
 * Email preferences table - controls email notifications and reports
 */
export const emailPreferences = mysqlTable("emailPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  weeklyReport: mysqlEnum("weeklyReport", ["enabled", "disabled"]).default("enabled").notNull(),
  monthlyReport: mysqlEnum("monthlyReport", ["enabled", "disabled"]).default("enabled").notNull(),
  achievementNotifications: mysqlEnum("achievementNotifications", ["enabled", "disabled"]).default("enabled").notNull(),
  preferredDay: mysqlEnum("preferredDay", ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]).default("monday"),
  lastWeeklyReport: timestamp("lastWeeklyReport"),
  lastMonthlyReport: timestamp("lastMonthlyReport"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailPreference = typeof emailPreferences.$inferSelect;
export type InsertEmailPreference = typeof emailPreferences.$inferInsert;

/**
 * Study groups table - collaborative learning groups
 */
export const studyGroups = mysqlTable("studyGroups", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  creatorId: int("creatorId").notNull(),
  isPublic: mysqlEnum("isPublic", ["yes", "no"]).default("yes").notNull(),
  memberCount: int("memberCount").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudyGroup = typeof studyGroups.$inferSelect;
export type InsertStudyGroup = typeof studyGroups.$inferInsert;

/**
 * Study group members table - tracks group membership
 */
export const studyGroupMembers = mysqlTable("studyGroupMembers", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("groupId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["admin", "member"]).default("member").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type StudyGroupMember = typeof studyGroupMembers.$inferSelect;
export type InsertStudyGroupMember = typeof studyGroupMembers.$inferInsert;

/**
 * Leaderboard entries table - tracks user rankings
 */
export const leaderboardEntries = mysqlTable("leaderboardEntries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  period: mysqlEnum("period", ["daily", "weekly", "monthly", "alltime"]).notNull(),
  score: int("score").notNull(),
  rank: int("rank"),
  sessionsCount: int("sessionsCount").default(0),
  wordsLearned: int("wordsLearned").default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
export type InsertLeaderboardEntry = typeof leaderboardEntries.$inferInsert;
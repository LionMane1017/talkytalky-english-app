-- ==========================================
-- Gemini 3 Master Architecture: Lesson State Management
-- ==========================================

-- 1. Enable UUID extension for unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the Session Table (The Single Source of Truth for State)
CREATE TABLE IF NOT EXISTS lesson_sessions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR NOT NULL, 
    lesson_id VARCHAR NOT NULL, -- References learning_path_lessons
    
    -- STATE PERSISTENCE
    word_order_ids TEXT[] NOT NULL, -- Stores the exact order (randomized or default)
    current_index INTEGER DEFAULT 0, -- Where the user is currently
    is_randomized BOOLEAN DEFAULT FALSE,
    
    -- PROGRESS METRICS
    status VARCHAR(20) DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'
    words_completed INTEGER DEFAULT 0,
    
    -- TIMESTAMPS
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quickly finding a user's active session
CREATE INDEX IF NOT EXISTS idx_sessions_user_lesson ON lesson_sessions(user_id, lesson_id, status);

-- 3. Create the Attempts Table (Granular Analytics)
CREATE TABLE IF NOT EXISTS lesson_word_attempts (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    lesson_session_id VARCHAR REFERENCES lesson_sessions(id) ON DELETE CASCADE,
    word_id VARCHAR NOT NULL,
    
    -- PERFORMANCE DATA
    attempt_number INTEGER DEFAULT 1,
    transcription TEXT,
    pronunciation_score INTEGER, -- 0-100
    ai_feedback TEXT,
    audio_url TEXT, -- Optional: S3 URL if uploaded
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for analyzing difficult words across all users
CREATE INDEX IF NOT EXISTS idx_word_attempts_word_score ON lesson_word_attempts(word_id, pronunciation_score);

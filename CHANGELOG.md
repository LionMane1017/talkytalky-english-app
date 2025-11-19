# TalkyTalky - Changelog

## Version 2.0.0 - Gemini Live Integration (November 18, 2025)

### 🎯 Major Changes

This version represents a complete architectural transformation of the Practice page, moving from separate API calls to a unified Gemini Live conversational assistant.

---

## Phase 34: System RAG + Knowledge Base

**Goal:** Add certified IELTS knowledge to TalkyTalky for grounded coaching

### Database Changes
- **Added `systemKnowledge` table** to `drizzle/schema.ts`
  - Fields: `id`, `category`, `title`, `content`, `embedding`, `createdAt`
  - Stores IELTS Band Descriptors, pronunciation guides, vocabulary lists
  
- **Created seed script** `scripts/seed-knowledge.ts`
  - Seeded 22 knowledge entries:
    - 12 IELTS Band Descriptors (Bands 7-9 for 4 criteria)
    - 4 App Vocabulary Lists (Business, Travel, Academic, Daily)
    - 4 Pronunciation Guides (TH sound, R/L, Vowels, Word Stress)
    - 2 Grammar Rules (Present Perfect, Conditionals)

### Backend API Changes
- **Enhanced `server/ragService.ts`**
  - Added `getSmartContext()` function for Hybrid RAG
  - Combines User History + System Knowledge
  - Vectorizes queries using Gemini embeddings
  - Ranks knowledge by semantic similarity

- **Updated `server/ragRouter.ts`**
  - Added `getSmartContext` endpoint (publicProcedure)
  - Returns combined context for AI Coach

### Frontend Changes
- **Updated `client/src/pages/AICoach.tsx`**
  - Replaced `getCoachingContext` with `getSmartContext`
  - Injects IELTS criteria into system prompt
  - Shows "Smart Context Active" indicator

---

## Phase 35: Authentication Bug Fix

**Goal:** Make Practice page work without login

### Backend Changes
- **Modified `server/routers.ts`**
  - Changed `transcribeAudio` from `protectedProcedure` to `publicProcedure`
  - Changed `analyzePronunciation` from `protectedProcedure` to `publicProcedure`
  - Changed `generateSpeech` from `protectedProcedure` to `publicProcedure`

- **Modified `server/ragRouter.ts`**
  - Changed `getSmartContext` to `publicProcedure`
  - Added guest user fallback (userId: 0 for non-logged users)

### Frontend Changes
- **Updated `client/src/hooks/useTextToSpeech.ts`**
  - Added browser TTS fallback for API rate limits
  - Handles 500 errors gracefully

---

## Phase 36: PCM Audio Playback

**Goal:** Implement proper Gemini TTS audio format handling

### Frontend Changes
- **Enhanced `client/src/hooks/useTextToSpeech.ts`**
  - Added PCM audio format support
  - Implemented 3-layer fallback:
    1. Audio element with `data:audio/pcm;rate=24000;base64`
    2. AudioContext for raw PCM 24kHz decoding
    3. Browser Web Speech API

---

## Phase 37: High-Quality Browser TTS

**Goal:** Replace unreliable Gemini TTS with premium browser voices

### Frontend Changes
- **Completely rewrote `client/src/hooks/useTextToSpeech.ts`**
  - Removed Gemini API dependency
  - Implemented intelligent voice selection:
    - Priority: Google > Microsoft Zira > Apple > English female > Default
  - Optimized voice parameters:
    - Rate: 0.85 (slightly slower for clarity)
    - Pitch: 1.05 (pleasant female tone)
    - Volume: 1.0 (full volume)

---

## Phase 38: Pronunciation Analysis Bug Fix

**Goal:** Fix missing word parameter error

### Frontend Changes
- **Fixed `client/src/pages/Practice.tsx`**
  - Changed prop name from `targetWord` to `word`
  - Changed callback from `onResult` to `onAnalysisComplete`
  - Fixed prop mismatch between Practice and GeminiVoiceRecorder

---

## Phase 39: Recording Animations

**Goal:** Add professional recording experience

### Frontend Changes
- **Enhanced `client/src/components/GeminiVoiceRecorder.tsx`**
  - Added VoiceWaveform animation (20 bars responding to mic input)
  - Implemented 5-second countdown timer with large number display
  - Added circular progress ring animation
  - Implemented auto-stop when countdown reaches 0
  - Added audio level monitoring for waveform

---

## Phase 40: Unified Gemini Live Assistant

**Goal:** Replace separate APIs with one conversational assistant

### Major Architectural Change
**Created `client/src/pages/PracticeLive.tsx`** - Complete rewrite of Practice page

#### Key Features:
1. **Single Gemini Live Session**
   - Replaces `analyzePronunciation` API
   - Replaces `generateSpeech` API
   - Replaces disconnected interactions

2. **Full Context Awareness**
   - Knows current word, difficulty, user history
   - Uses System RAG (IELTS criteria, pronunciation guides)
   - Maintains conversation history

3. **Live Audio Streaming**
   - User speaks → Gemini listens via Live Audio
   - Gemini responds → Audio playback via AudioContext
   - Real-time pronunciation analysis

4. **Professional UI**
   - Voice waveform animation during recording
   - 5-second countdown with auto-stop
   - Conversation history display
   - Status indicators (Idle, Connecting, Connected, Speaking, Listening)

### Routing Changes
- **Updated `client/src/App.tsx`**
  - Changed `/practice` route from `Practice` to `PracticeLive`

---

## Phase 41: Gemini Live Configuration Fix

**Goal:** Fix silent Gemini assistant (missing audio output)

### Documentation
- **Created `HANDOFF_PRACTICE_DEBUG.md`**
  - Comprehensive debugging guide
  - Expected vs actual behavior
  - Technical context and file structure
  - Debugging checklist
  - Comparison: AICoach (working) vs PracticeLive (broken)

### Frontend Changes
- **Fixed `client/src/pages/PracticeLive.tsx`**
  - Added `speechConfig` with Zephyr voice
  - Added `inputAudioTranscription: {}`
  - Added `outputAudioTranscription: {}`
  - Added `latencyHint: 'interactive'` to AudioContext
  - Added explicit trigger message to force introduction
  - Improved microphone settings (echo cancellation, noise suppression)

---

## Phase 42: Corrected Configuration Structure

**Goal:** Fix configuration nesting (critical bug identified by Gemini 3.0)

### Frontend Changes
- **Fixed `client/src/pages/PracticeLive.tsx`** (CRITICAL FIX)
  - **Moved `speechConfig` from `config` to `generationConfig`** (correct nesting level)
  - **Added `responseModalities: 'audio'`** (forces audio output mode - THIS WAS THE KEY MISSING PIECE!)
  - Changed model from `gemini-2.5-flash-native-audio-preview-09-2025` to `gemini-2.0-flash-exp`
  - Updated trigger message with `endOfTurn: true` flag
  - Removed `inputAudioTranscription` and `outputAudioTranscription` (not needed with new structure)

**Why This Matters:**
Without `responseModalities: 'audio'`, Gemini defaults to text-only mode even if `speechConfig` is present. This was the root cause of the silent assistant.

---

## Phase 43: Auto-Start Session

**Goal:** Remove manual "Start Session" button for smoother UX

### Frontend Changes
- **Enhanced `client/src/pages/PracticeLive.tsx`**
  - Added `useEffect` hook to auto-trigger `startSession()` when difficulty and word are set
  - Removed "Start Session" button from UI
  - Replaced with "Connecting..." status indicator
  - Session now starts automatically when user clicks "Start Practice"

---

## Known Issues

### 1. Microphone Access in Sandbox
**Issue:** AudioContext errors in preview environment  
**Cause:** Sandbox doesn't have real audio devices  
**Impact:** Practice page only works when published to real domain  
**Status:** Expected behavior - not a bug

### 2. Gemini API Rate Limits
**Issue:** 10 requests/minute limit on `gemini-2.0-flash-exp`  
**Mitigation:** Browser TTS fallback implemented  
**Status:** Working as designed

---

## Technical Stack

### Backend
- **Framework:** Node.js + tRPC
- **Database:** PostgreSQL with Drizzle ORM
- **AI:** Google Gemini 2.0 Flash + Gemini Live API
- **Vector Search:** Gemini embeddings for RAG

### Frontend
- **Framework:** React 19 + TypeScript
- **Routing:** Wouter
- **UI:** shadcn/ui + Tailwind CSS 4
- **Audio:** Web Audio API + Gemini Live
- **State:** React hooks + tRPC queries

---

## Migration Notes

### From Version 1.x to 2.0.0

1. **Database Migration Required**
   ```bash
   pnpm db:push
   npx tsx scripts/seed-knowledge.ts
   ```

2. **Environment Variables**
   - No new variables required
   - Existing `VITE_GEMINI_API_KEY` is sufficient

3. **Breaking Changes**
   - Old Practice page replaced with PracticeLive
   - Pronunciation analysis now uses Gemini Live instead of REST API
   - TTS switched from Gemini API to browser voices

---

## Testing Checklist

- [x] System RAG returns IELTS criteria
- [x] AI Coach uses Smart Context
- [x] Practice page works without login
- [x] Browser TTS voice quality (high-quality female voice)
- [x] Recording animations (waveform, countdown)
- [x] Auto-start session on difficulty selection
- [ ] Gemini Live audio output (requires real browser with mic/speakers)
- [ ] End-to-end pronunciation practice flow (requires published environment)

---

## Contributors

- Manus AI Agent (Implementation)
- Gemini 3.0 (Configuration debugging and fixes)

---

## Next Steps

1. **Test in Published Environment** - Verify Gemini Live works with real microphone
2. **Add Visual Feedback** - "🎤 Gemini Speaking..." indicator
3. **Implement Score Tracking** - Save pronunciation scores to database
4. **Add Achievement System** - Badges for milestones

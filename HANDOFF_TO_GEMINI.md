# 🎯 HANDOFF TO GEMINI 3.0: Critical Bug Fixes & Word Awareness System

## 📋 EXECUTIVE SUMMARY

**Project:** TalkyTalky - English Speaking & Pronunciation Practice App  
**Tech Stack:** React 19 + TypeScript + Vite + tRPC + Drizzle ORM + PostgreSQL + Gemini Live API  
**Current Issue:** Two critical bugs preventing proper functionality  
**Target:** Implement robust module-specific content routing + Gemini word awareness system

---

## 🚨 CRITICAL BUGS TO FIX

### Bug #1: All Questions/Words Repeating Regardless of Module Selection
**Problem:** When users click different modules in `/modules` page, they all route to the same practice pages without any context about which module was selected. Result: Same questions appear regardless of module choice.

**Root Cause:**
- Modules page (`client/src/pages/Modules.tsx`) defines 4 different modules:
  - "Vocabulary - Beginner" → routes to `/practice`
  - "IELTS Speaking Part 1" → routes to `/ielts`
  - "IELTS Speaking Part 2" → routes to `/ielts`
  - "IELTS Speaking Part 3" → routes to `/ielts`
  
- **NO module context is passed** when routing (line 98: `onClick={() => setLocation(module.route)}`)
- Practice pages don't know which module the user selected
- All IELTS modules route to same page without differentiating Part 1/2/3

**Current Broken Flow:**
```
User clicks "IELTS Part 1" → Routes to /ielts → Shows random questions from ALL parts
User clicks "IELTS Part 2" → Routes to /ielts → Shows SAME random questions
User clicks "IELTS Part 3" → Routes to /ielts → Shows SAME random questions
```

---

### Bug #2: Gemini Has No Awareness of Current Word Context
**Problem:** Gemini Live AI coach doesn't know which specific word the user is currently practicing. She needs explicit word tagging in every interaction so she can provide targeted pronunciation coaching.

**Root Cause:**
- `PracticeLive.tsx` (line 168-203) sends system instructions to Gemini
- System prompt mentions the word: `"The student is practicing: ${currentWord.word}"`
- BUT this is only sent ONCE at session start
- When `nextWord()` is called, Gemini doesn't receive updated word context
- Gemini needs to be notified every time the word changes

**What's Needed:**
- Tag system: Every message to Gemini should include current word metadata
- Word change notifications: Explicit message when advancing to next word
- Alphabetical ordering enforcement: Words must be presented in A-Z order
- Gemini awareness: She should acknowledge which word she's coaching on

---

## 🏗️ TECHNICAL ARCHITECTURE

### Frontend Stack
```
client/
├── src/
│   ├── pages/
│   │   ├── Modules.tsx          ← Module selection UI (NEEDS FIX)
│   │   ├── Practice.tsx         ← Basic pronunciation practice
│   │   ├── PracticeLive.tsx     ← Gemini Live AI coaching (NEEDS FIX)
│   │   ├── IELTSPractice.tsx    ← IELTS speaking test (NEEDS FIX)
│   │   └── MatchCards.tsx       ← Vocabulary matching game
│   ├── data/
│   │   ├── vocabulary.ts        ← 150 words (beginner/intermediate/advanced)
│   │   └── ieltsQuestions.ts    ← 105 IELTS questions (Part 1/2/3)
│   └── lib/
│       └── trpc.ts              ← API client
```

### Backend Stack
```
server/
├── routers/
│   ├── practice.ts              ← Save practice sessions
│   ├── vocabulary.ts            ← Vocabulary progress tracking
│   └── rag.ts                   ← Smart context retrieval
└── db/
    └── schema.ts                ← Database tables (users, sessions, progress)
```

### Database Schema (PostgreSQL + Drizzle ORM)
```typescript
// Key tables:
- users: User authentication
- practice_sessions: Saved practice records (type, score, duration, timestamp)
- vocabulary_progress: Word-level tracking (word_id, correct_count, difficulty)
- achievements: Unlocked badges
- user_achievements: User-achievement relationships
```

### Data Files

**vocabulary.ts** (150 words):
```typescript
export const vocabularyData: VocabularyWord[] = [
  {
    id: "word-001",
    word: "abandon",
    phonetic: "/əˈbændən/",
    meaning: "To leave behind or give up completely",
    example: "They had to abandon their car in the flood.",
    difficulty: "intermediate",
    partOfSpeech: "verb"
  },
  // ... 149 more words
];
```

**ieltsQuestions.ts** (105 questions):
```typescript
export const ieltsQuestions: IELTSQuestion[] = [
  {
    id: "q001",
    part: 1,
    category: "Work & Study",
    question: "Do you work or are you a student?",
    difficulty: "beginner",
    tips: "Give a clear answer and add 1-2 details about your work/studies."
  },
  // ... 104 more questions
];
```

---

## ✅ SOLUTION REQUIREMENTS

### Fix #1: Module-Specific Content Routing

**Implementation Steps:**

1. **Update Modules.tsx** - Pass module context via URL params or state:
   ```typescript
   // Option A: URL params (RECOMMENDED)
   onClick={() => setLocation(`${module.route}?module=${module.id}`)}
   
   // Option B: sessionStorage
   onClick={() => {
     sessionStorage.setItem('selectedModule', JSON.stringify(module));
     setLocation(module.route);
   }}
   ```

2. **Update IELTSPractice.tsx** - Filter questions by module:
   ```typescript
   // Read module context
   const [, params] = useRoute("/ielts");
   const moduleId = new URLSearchParams(window.location.search).get('module');
   
   // Filter questions based on module
   const getQuestionsForModule = (moduleId: string) => {
     switch(moduleId) {
       case 'ielts-part1':
         return ieltsQuestions.filter(q => q.part === 1);
       case 'ielts-part2':
         return ieltsQuestions.filter(q => q.part === 2);
       case 'ielts-part3':
         return ieltsQuestions.filter(q => q.part === 3);
       default:
         return ieltsQuestions; // Fallback to all
     }
   };
   ```

3. **Update Practice.tsx** - Handle vocabulary module difficulty:
   ```typescript
   const moduleId = new URLSearchParams(window.location.search).get('module');
   
   // Auto-select difficulty based on module
   useEffect(() => {
     if (moduleId === 'vocabulary-beginner') {
       startPractice('beginner');
     }
   }, [moduleId]);
   ```

4. **Anti-Repetition Logic** - Already exists, ensure it's working:
   ```typescript
   // Current implementation in PracticeLive.tsx (line 80-85)
   const availableWords = useMemo(() => {
     if (!difficulty) return [];
     return vocabularyData.filter(
       word => word.difficulty === difficulty && !usedWordIds.has(word.id)
     );
   }, [difficulty, usedWordIds]);
   ```

---

### Fix #2: Gemini Word Awareness System

**Implementation Steps:**

1. **Add Word Tagging to System Prompt** (PracticeLive.tsx line 168-203):
   ```typescript
   const systemInstructions = `You are TalkyTalky, a friendly AI pronunciation coach...
   
   🎯 CURRENT WORD CONTEXT:
   - Word: ${currentWord.word}
   - Phonetic: ${currentWord.phonetic}
   - Difficulty: ${difficulty}
   - Position: ${currentWordIndex + 1} of ${totalWords}
   - Alphabetical Order: ${allWordsInLevel.map(w => w.word).join(', ')}
   
   CRITICAL RULES:
   1. You MUST acknowledge you're coaching on "${currentWord.word}" in your first response
   2. Stay focused on THIS word only - don't introduce other words
   3. Words are presented in alphabetical order - respect this sequence
   4. When user masters this word, I will send you a [WORD_CHANGE] notification
   
   ...rest of prompt...`;
   ```

2. **Send Word Change Notifications** - Update `nextWord()` function:
   ```typescript
   const nextWord = useCallback(() => {
     // Get all words sorted alphabetically
     const allWords = vocabularyData
       .filter(w => w.difficulty === difficulty)
       .sort((a, b) => a.word.localeCompare(b.word));
     
     // Find next unused word in alphabetical order
     const nextAvailableWord = allWords.find(w => !usedWordIds.has(w.id));
     
     if (nextAvailableWord && status === AppStatus.CONNECTED) {
       setCurrentWord(nextAvailableWord);
       setUsedWordIds(prev => new Set(Array.from(prev).concat(nextAvailableWord.id)));
       setScore(null);
       
       // 🚨 CRITICAL: Notify Gemini about word change
       sessionPromiseRef.current?.then((session) => {
         session.send({
           text: `[WORD_CHANGE] Moving to next word: "${nextAvailableWord.word}" (${nextAvailableWord.phonetic}). 
                  This is word ${usedWordIds.size + 1} of ${totalWords} in alphabetical order.
                  Please introduce this word and guide the student through pronunciation practice.`,
           endOfTurn: true
         });
       });
     }
   }, [difficulty, usedWordIds, status]);
   ```

3. **Add Word Metadata to Every User Message** - Wrap user transcripts:
   ```typescript
   // In onmessage callback (line 264-303)
   if (message.serverContent?.turnComplete) {
     const userInput = currentInputTranscriptionRef.current.trim();
     
     if (userInput) {
       // Send with word context tag
       const taggedInput = `[WORD: ${currentWord.word}] ${userInput}`;
       setTranscripts(prev => [...prev, { role: 'user', text: userInput }]);
       
       // Gemini receives the tagged version internally
       // Display shows clean version to user
     }
   }
   ```

4. **Enforce Alphabetical Order** - Update word selection logic:
   ```typescript
   const startPractice = (level: "beginner" | "intermediate" | "advanced") => {
     setDifficulty(level);
     setUsedWordIds(new Set());
     setCurrentWordIndex(0);
     
     // Get words sorted alphabetically for deterministic order
     const words = vocabularyData
       .filter(w => w.difficulty === level)
       .sort((a, b) => a.word.localeCompare(b.word)); // ← CRITICAL: Alphabetical sort
     
     if (words.length > 0) {
       setCurrentWord(words[0]); // Start with first word alphabetically
       setUsedWordIds(new Set([words[0].id]));
       connectToGemini(words[0], level);
     }
   };
   ```

5. **Display Current Word Progress** - Add UI indicator:
   ```tsx
   <div className="mb-4 p-3 bg-primary/10 rounded-lg">
     <p className="text-sm text-muted-foreground">
       Word {currentWordIndex + 1} of {totalWords} (Alphabetical Order)
     </p>
     <p className="text-xs text-muted-foreground mt-1">
       Next: {availableWords[0]?.word || 'Complete!'}
     </p>
   </div>
   ```

---

## 🧪 TESTING CHECKLIST

### Module Routing Tests
- [ ] Click "Vocabulary - Beginner" → Should show only beginner words
- [ ] Click "IELTS Part 1" → Should show only Part 1 questions
- [ ] Click "IELTS Part 2" → Should show only Part 2 questions
- [ ] Click "IELTS Part 3" → Should show only Part 3 questions
- [ ] Verify no question/word repetition within same module
- [ ] Verify different modules show different content

### Gemini Word Awareness Tests
- [ ] Start practice → Gemini mentions correct first word (alphabetically)
- [ ] Advance to next word → Gemini acknowledges word change
- [ ] Check console logs → Verify [WORD_CHANGE] notifications sent
- [ ] Verify words appear in alphabetical order (A → Z)
- [ ] Test all 3 difficulty levels (beginner, intermediate, advanced)
- [ ] Verify Gemini stays focused on current word (doesn't jump ahead)

---

## 📁 KEY FILES TO MODIFY

### Priority 1 (Critical):
1. **client/src/pages/Modules.tsx** (lines 96-101)
   - Add module context to navigation

2. **client/src/pages/IELTSPractice.tsx** (lines 1-50)
   - Read module context
   - Filter questions by part

3. **client/src/pages/PracticeLive.tsx** (lines 168-203, 464-490)
   - Add word tagging to system prompt
   - Send word change notifications
   - Enforce alphabetical ordering

### Priority 2 (Important):
4. **client/src/pages/Practice.tsx** (lines 54-60)
   - Auto-select difficulty from module context

5. **client/src/data/ieltsQuestions.ts**
   - Verify all questions have correct `part` field (1, 2, or 3)

---

## 🎯 SUCCESS CRITERIA

### Module Routing
✅ Each module shows unique, non-repeating content  
✅ IELTS Part 1/2/3 are properly separated  
✅ Vocabulary modules filter by difficulty  
✅ No cross-contamination between modules  

### Gemini Word Awareness
✅ Gemini explicitly mentions current word in responses  
✅ Words presented in strict alphabetical order (A-Z)  
✅ Word change notifications sent and acknowledged  
✅ No word skipping or random jumping  
✅ Console logs show proper word tracking  

---

## 🚀 DEPLOYMENT NOTES

- **No database migrations needed** - These are frontend-only fixes
- **No new dependencies** - Use existing routing and state management
- **Backward compatible** - Existing practice sessions unaffected
- **Testing environment** - Dev server at port 3000

---

## 📞 HANDOFF CONTACT

**Current Status:** Dev server running, project fully functional except for these 2 bugs  
**Priority:** HIGH - Blocking user experience  
**Estimated Fix Time:** 2-3 hours  
**Testing Required:** Manual testing across all modules + Gemini interaction logs

---

## 💡 ADDITIONAL CONTEXT

### Why Alphabetical Order Matters
- Provides predictable, structured learning progression
- Easier for users to track which words they've covered
- Prevents confusion from random word jumping
- Gemini can reference "next word" meaningfully

### Why Word Tagging Matters
- Gemini Live maintains conversation context across turns
- Without explicit word tags, she may drift off-topic
- Tags ensure pronunciation coaching stays focused
- Enables better progress tracking and feedback

### Current Anti-Repetition Logic (Already Working)
```typescript
// PracticeLive.tsx line 80-85
const availableWords = useMemo(() => {
  if (!difficulty) return [];
  return vocabularyData.filter(
    word => word.difficulty === difficulty && !usedWordIds.has(word.id)
  );
}, [difficulty, usedWordIds]);
```
This ensures no word repeats within a session - just needs alphabetical ordering added.

---

## 🎬 FINAL NOTES

**Key Insight:** The app has all the data and logic needed - it just needs proper routing context and Gemini awareness. These are surgical fixes, not architectural changes.

**Philosophy:** Make Gemini an aware, contextual coach rather than a generic conversation partner. She should know exactly where the student is in their learning journey.

**User Impact:** Once fixed, users will experience a coherent, progressive learning path instead of random, repetitive content.

---

**Ready for implementation! 🚀**

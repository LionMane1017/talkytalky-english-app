# 🚨 CRITICAL BUG: Word Context Mismatch in Gemini Live API

## Branch: `bugfix/word-context-mismatch`

---

## 🎯 Issue Summary

**Problem**: The Practice page displays one word on screen (e.g., "Anticipate") but Gemini introduces a completely different word (e.g., "Folder" or "Secretary").

**User Report**: "Manus she is still mixed up" - Screen shows "Anticipate" but Gemini says "Folder" or "Secretary"

**Impact**: CRITICAL - Core pronunciation practice feature is unusable. Users cannot practice the words they see on screen.

---

## 🔍 Root Cause Analysis (Manus Investigation)

### Architecture Overview
You (Claude) designed this system with:
1. **JSON Protocol**: `GeminiProtocols.createWordPayload()` sends structured word context
2. **Dual Send Methods**: 
   - `sendRealtimeInput()` for initial word context (line 277-280 in PracticeLive.tsx)
   - `send()` for subsequent word changes (line 559 in PracticeLive.tsx)
3. **Word Order System**: Alphabetically sorted vocabulary for deterministic progression

### Suspected Issues

#### 1. **Protocol Mismatch**
- Initial context uses `sendRealtimeInput({ mimeType: 'application/json', data: JSON.stringify(payload) })`
- Next word uses `send({ text: JSON.stringify(payload), endOfTurn: true })`
- **Question**: Does Gemini parse these differently?

#### 2. **All-Words vs Lesson-Words**
```typescript
// Line 205-206: Uses ALL 187 words instead of lesson-specific words
const allWordsInLevel = vocabularyData
  .sort((a, b) => a.word.localeCompare(b.word));
```
- When in lesson mode, should use `lessonWords` (5-60 words)
- Currently uses all vocabulary, causing index mismatch?

#### 3. **Race Condition**
- Initial word context sent at 500ms delay (line 273-283)
- Greeting might trigger before word context is received
- Gemini might be using cached/wrong word from system prompt

#### 4. **System Prompt Context**
```typescript
// Line 217-222: System prompt includes lesson context but not specific word
const systemPrompt = GeminiProtocols.buildSystemPrompt(
  lessonTitle,
  lessonImportance,
  lessonTopicContext,
  totalWords
);
```
- Does system prompt need the initial word embedded?
- Is Gemini ignoring the JSON payload and using prompt context?

---

## 📂 Key Files to Investigate

### 1. `client/src/pages/PracticeLive.tsx`
**Lines 180-283**: `startSession()` function
- Sets up Gemini Live connection
- Sends initial word context via `sendRealtimeInput`
- **Check**: Is the JSON payload format correct for Gemini Live API?

**Lines 510-563**: `nextWord()` function
- Updates word on screen
- Sends new word context via `send` method
- **Check**: Does `send` vs `sendRealtimeInput` matter?

### 2. `client/src/lib/gemini/prompts.ts`
**Lines 280-292**: `createWordPayload()` function
```typescript
createWordPayload: (word: any, index: number, total: number): WordPayload => ({
  type: "CONTEXT_UPDATE",
  timestamp: Date.now(),
  state: {
    index: index + 1,
    total: total,
    currentWord: word.word,
    phonetic: word.phonetic,
    definition: word.meaning,
    example: word.example
  },
  instruction: `Focus ONLY on "${word.word}". Introduce it immediately with enthusiasm and warmth. Be encouraging!`
})
```
- **Check**: Is this the correct protocol format for Gemini Live?
- **Check**: Does Gemini actually parse and use this JSON?

**Lines 234-275**: `buildSystemPrompt()` function
- Contains instruction: "You will receive JSON messages labeled 'CONTEXT_UPDATE'"
- **Check**: Is Gemini actually receiving and parsing these messages?

### 3. `client/src/data/vocabulary.ts`
- Contains all 1,945 vocabulary words
- **Check**: Is word indexing correct?

### 4. `client/src/data/learningPaths.ts`
- Contains lesson-specific word assignments
- **Check**: Are lesson word IDs matching vocabulary IDs?

---

## 🧪 Debugging Steps

### Step 1: Verify JSON Payload Reception
Add console logging in Gemini's response to confirm it's receiving the JSON:
```typescript
// In onmessage callback
console.log('📥 Gemini received:', message.serverContent);
```

### Step 2: Test Protocol Format
Try different JSON sending methods:
```typescript
// Option A: Current method
session.sendRealtimeInput({ 
  mimeType: 'application/json',
  data: JSON.stringify(payload)
});

// Option B: Text-based JSON
session.send({ 
  text: JSON.stringify(payload), 
  endOfTurn: true 
});

// Option C: Embedded in text instruction
session.send({ 
  text: `CONTEXT_UPDATE: ${word.word}. Focus only on this word.`, 
  endOfTurn: true 
});
```

### Step 3: Check Word Order Synchronization
```typescript
// In startSession() - verify word order
console.log('📚 Word order:', allWordsInLevel.map(w => w.word));
console.log('📍 Current word:', currentWord.word);
console.log('📍 Current index:', currentWordIndex);

// In nextWord() - verify index progression
console.log('📍 Moving from:', currentWord.word);
console.log('📍 Moving to:', nextWordData.word);
console.log('📍 Index:', nextIndex, '/', allWords.length);
```

### Step 4: Test Lesson Mode
```typescript
// When lesson is loaded
console.log('📚 Lesson words:', lessonWords.map(w => w.word));
console.log('📚 Using lesson mode:', !!lessonContext);
```

---

## 🎯 Expected Behavior

1. User selects "Beginner" difficulty
2. Screen shows first word alphabetically: "Beautiful"
3. Gemini introduces: "Let's practice the word 'Beautiful'..."
4. User clicks "Next Word"
5. Screen shows second word: "Big"
6. Gemini introduces: "Next up: 'Big'..."

**Current Broken Behavior**:
1. Screen shows: "Anticipate"
2. Gemini says: "Let's practice 'Folder'..." ❌

---

## 🔧 Potential Fixes

### Fix 1: Ensure Lesson Words Are Used
```typescript
// In startSession() - line 205
const allWordsInLevel = lessonContext && lessonWords.length > 0
  ? lessonWords  // Use lesson-specific words
  : vocabularyData.filter(w => w.difficulty === difficulty).sort((a, b) => a.word.localeCompare(b.word));
```

### Fix 2: Unify Send Methods
```typescript
// Use ONLY sendRealtimeInput for all word context updates
session.sendRealtimeInput({ 
  mimeType: 'application/json',
  data: JSON.stringify(payload)
});
```

### Fix 3: Add Word to System Prompt
```typescript
// Include current word in system prompt
const systemPrompt = `${GeminiProtocols.buildSystemPrompt(...)}

**CURRENT WORD**: "${currentWord.word}"
Focus ONLY on this word. Introduce it immediately.`;
```

### Fix 4: Simplify to Text-Based Context
```typescript
// Skip JSON protocol, use plain text
session.send({ 
  text: `NEW WORD: "${word.word}" (${word.phonetic}). Meaning: ${word.meaning}. Example: ${word.example}. Introduce this word now!`,
  endOfTurn: true 
});
```

---

## 📊 Test Cases

### Test Case 1: Beginner Practice (Alphabetical)
1. Select "Beginner" difficulty
2. Verify first word is "Beautiful" (alphabetically first)
3. Verify Gemini introduces "Beautiful"
4. Click "Next Word"
5. Verify second word is "Big"
6. Verify Gemini introduces "Big"

### Test Case 2: Lesson Practice (Office Basics)
1. Navigate to Learning Paths → Business English → Office Basics
2. Click "Start"
3. Verify first word is "Anticipate" (first in lesson)
4. Verify Gemini introduces "Anticipate"
5. Click "Next Word"
6. Verify second word is "Benefit"
7. Verify Gemini introduces "Benefit"

### Test Case 3: Auto-Advance
1. Start practice
2. Say "Yes" when Gemini asks "Ready for next word?"
3. Verify screen updates to next word
4. Verify Gemini introduces the NEW word (not old one)

---

## 🚀 Success Criteria

- [ ] Screen word ALWAYS matches Gemini's introduction
- [ ] Lesson mode uses only lesson-specific words
- [ ] Auto-advance updates word correctly
- [ ] No race conditions between UI and Gemini
- [ ] Console logs show correct word context being sent
- [ ] All 3 test cases pass

---

## 💬 Questions for Claude

1. Is the JSON protocol format correct for Gemini Live API?
2. Should we use `sendRealtimeInput` or `send` for word context updates?
3. Is there a better way to ensure Gemini receives and uses the word context?
4. Should the system prompt include the current word, or rely only on JSON payloads?
5. Is there a Gemini Live API limitation we're hitting?

---

## 📝 Notes

- This bug was introduced after vocabulary expansion to 1,945 words
- The all-words-alphabetical system was implemented for stability
- Lesson-specific filtering was commented out (line 203-204)
- User confirmed: "Something must be on your end Claude worked extra hard on this setup"

---

## 🔗 Related Files

- `client/src/pages/PracticeLive.tsx` (main component)
- `client/src/lib/gemini/prompts.ts` (protocol definitions)
- `client/src/data/vocabulary.ts` (word database)
- `client/src/data/learningPaths.ts` (lesson definitions)
- `todo.md` (line 1267+: bug tracking)

---

## 🎯 Handoff to Claude

Claude, you built this beautiful Gemini Live integration with the JSON protocol system. The word context synchronization is broken - Gemini is introducing random words instead of the word shown on screen. 

Please investigate:
1. Why the JSON payload isn't being received/parsed correctly
2. Whether `sendRealtimeInput` vs `send` is causing issues
3. If there's a race condition or protocol mismatch
4. How to ensure Gemini ALWAYS uses the word from the latest JSON payload

The user needs this fixed urgently - it's the core feature of the app. Thank you! 🙏

---

**Branch**: `bugfix/word-context-mismatch`  
**Created**: 2025-01-16  
**Priority**: CRITICAL  
**Assigned**: Claude (Antigravity)

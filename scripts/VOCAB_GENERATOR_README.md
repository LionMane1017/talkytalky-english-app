# 🤖 Automated Vocabulary Generator - Usage Guide

## Quick Start

```bash
# Make sure your Gemini API key is in .env
npm run generate-vocab
```

**Expected Time**: 5-10 minutes  
**Output**: `client/src/data/vocabulary-generated.ts` (1,760 new words)

---

## What It Does

1. **Reads** your existing lesson structure from `learningPaths.ts`
2. **Calculates** how many words each lesson needs (target: 60 words/lesson)
3. **Generates** vocabulary using Gemini API in **parallel** (all 32 lessons at once!)
4. **Avoids** duplicating existing words
5. **Saves** to `vocabulary-generated.ts` for your review

---

## Output Format

The generated file will look like this:

```typescript
export const generatedVocabulary: VocabularyWord[] = [
  {
    id: "151",
    word: "collaborate",
    phonetic: "/kəˈlæbəreɪt/",
    meaning: "To work jointly with others on a project or task",
    example: "Our team collaborates effectively on all projects.",
    difficulty: "intermediate",
    category: "Business English Track"
  },
  // ... 1,759 more words
];
```

---

## After Generation

### Step 1: Review the Words

Open `client/src/data/vocabulary-generated.ts` and check:
- ✅ IPA phonetics look correct (format: `/IPA/`)
- ✅ Meanings are clear and concise
- ✅ Examples are natural and contextual
- ✅ Difficulty levels match lesson difficulty
- ✅ No inappropriate or archaic words

**Tip**: Use https://tophonetics.com to verify IPA if unsure

### Step 2: Integrate into Main Vocabulary

Copy the generated words into `vocabulary.ts`:

```typescript
// In vocabulary.ts
export const vocabularyData: VocabularyWord[] = [
  // ... existing words ...
  
  // Add generated words here
  ...generatedVocabulary
];
```

### Step 3: Update Learning Paths

Update `learningPaths.ts` with the new word IDs. I can help automate this!

**Example**:
```typescript
{
  id: "be-1",
  title: "Office Basics",
  wordIds: ["71", "72", "74", "82", "83", // old 5 words
            "151", "152", "153", ...] // + 55 new words
}
```

---

## Troubleshooting

### Error: "GEMINI_API_KEY not found"
- Make sure `.env` has `VITE_GEMINI_API_KEY=your-key-here`
- Restart your terminal after adding the key

### Error: "Rate limit exceeded"
- Wait 1 minute and run again
- Gemini API has rate limits for free tier

### Some lessons failed to generate
- The script uses `Promise.allSettled()` so partial failures won't crash it
- Check console output to see which lessons failed
- Re-run the script (it will regenerate failed ones)

### IPA phonetics look wrong
- Manually review using https://tophonetics.com
- Or ask me to regenerate specific words

---

## Advanced: Regenerate Specific Lessons

If you only want to regenerate certain lessons, modify the script:

```typescript
// In generate-vocabulary.ts, around line 100
for (const path of learningPaths) {
  // Only process Business English
  if (path.id !== 'business-english') continue;
  
  // ... rest of code
}
```

---

## Performance Notes

**Why is it fast?**
- Uses `Promise.all()` to generate all 32 lessons simultaneously
- Each lesson generation is independent
- Gemini API handles parallel requests efficiently

**Typical Timeline**:
- 🔄 Script starts: 0s
- ⚡ API calls sent: 1s
- 🤖 Gemini generates: 5-10 minutes
- 💾 File saved: +1s
- ✅ Done: ~10 minutes total

---

## Next Steps

After integration, you'll have:
- ✅ 1,920 total words (160 existing + 1,760 new)
- ✅ 60 words per lesson (perfect for practice sessions)
- ✅ Minimal cross-lesson repetition
- ✅ IELTS-appropriate vocabulary
- ✅ Proper IPA phonetics

Ready to enhance your AI Coach database! 🚀

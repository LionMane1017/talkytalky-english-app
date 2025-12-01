/**
 * Automated Vocabulary Generator
 * 
 * Generates 1,760 IELTS vocabulary words across 32 lessons using Gemini API.
 * Runs all generations in parallel for maximum speed (~5-10 minutes total).
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';
import { learningPaths } from '../client/src/data/learningPaths.js';
import { vocabularyData } from '../client/src/data/vocabulary.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Gemini with API key from .env
const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('❌ ERROR: No Gemini API key found!');
    console.error('Please add VITE_GEMINI_API_KEY or GEMINI_API_KEY to your .env file');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

interface VocabularyWord {
    id: string;
    word: string;
    phonetic: string;
    meaning: string;
    example: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    category: string;
}

// Track existing words to avoid duplication
const existingWords = new Set(vocabularyData.map(w => w.word.toLowerCase()));
let nextWordId = Math.max(...vocabularyData.map(w => parseInt(w.id))) + 1;

/**
 * Generate vocabulary for a single lesson using Gemini
 */
async function generateLessonVocabulary(
    lessonId: string,
    lessonTitle: string,
    lessonDescription: string,
    difficulty: "beginner" | "intermediate" | "advanced",
    category: string,
    count: number = 55
): Promise<VocabularyWord[]> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Generate exactly ${count} unique IELTS-level English vocabulary words for the lesson: "${lessonTitle}".

Context: ${lessonDescription}
Difficulty Level: ${difficulty}
Category: ${category}

Requirements:
1. Each word must be IELTS-appropriate (commonly tested in IELTS exams)
2. Provide ACCURATE IPA phonetic transcription (this is critical!)
3. Clear, concise definition (one sentence)
4. Natural example sentence showing real-world usage
5. Words should relate to the lesson theme
6. Avoid these existing words: ${Array.from(existingWords).slice(0, 50).join(', ')}... (and ${existingWords.size - 50} more)

Output Format (JSON array):
[
  {
    "word": "collaborate",
    "phonetic": "/kəˈlæbəreɪt/",
    "meaning": "To work jointly with others on a project or task",
    "example": "Our team collaborates effectively on all projects.",
    "difficulty": "${difficulty}",
    "category": "${category}"
  },
  ...
]

CRITICAL: 
- Return ONLY valid JSON array, no markdown, no explanation
- Exactly ${count} words
- Accurate IPA phonetics (use /slashes/)
- Natural, contextual examples
- No duplicates within the list`;

    try {
        console.log(`🔄 Generating ${count} words for: ${lessonTitle} (${difficulty})...`);

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Extract JSON from response (handle markdown code blocks if present)
        let jsonText = text.trim();
        if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        }

        const generatedWords = JSON.parse(jsonText) as Array<{
            word: string;
            phonetic: string;
            meaning: string;
            example: string;
            difficulty: string;
            category: string;
        }>;

        // Add IDs and track words
        const wordsWithIds: VocabularyWord[] = generatedWords.map(w => {
            existingWords.add(w.word.toLowerCase());
            return {
                id: (nextWordId++).toString(),
                word: w.word,
                phonetic: w.phonetic,
                meaning: w.meaning,
                example: w.example,
                difficulty: w.difficulty as any,
                category: w.category
            };
        });

        console.log(`✅ Generated ${wordsWithIds.length} words for: ${lessonTitle}`);
        return wordsWithIds;

    } catch (error) {
        console.error(`❌ Error generating for ${lessonTitle}:`, error);
        throw error;
    }
}

/**
 * Main generation function - SEQUENTIAL with rate limiting
 */
async function generateAllVocabulary() {
    console.log('🚀 Starting Vocabulary Generation...\n');
    console.log(`📊 Target: 1,760 words across 32 lessons`);
    console.log(`📚 Starting ID: ${nextWordId}\n`);

    // FULL GENERATION MODE
    const TEST_MODE = false;
    if (TEST_MODE) {
        console.log('⚠️  TEST MODE: Only generating Business English (8 lessons, ~440 words)\n');
    }

    console.log('='.repeat(80));

    const allGeneratedWords: VocabularyWord[] = [];
    let successCount = 0;
    let failCount = 0;

    // Process lessons SEQUENTIALLY to avoid rate limits
    for (const path of learningPaths) {
        // TEST MODE: Skip non-Business English paths
        if (TEST_MODE && path.id !== 'business-english') {
            console.log(`⏭️  Skipping ${path.title} (TEST MODE)`);
            continue;
        }

        console.log(`\n🎯 ${path.title} (${path.lessons.length} lessons)`);

        for (const lesson of path.lessons) {
            const currentWordCount = lesson.wordIds.length;
            const wordsNeeded = Math.max(0, 60 - currentWordCount);

            if (wordsNeeded > 0) {
                try {
                    const words = await generateLessonVocabulary(
                        lesson.id,
                        lesson.title,
                        lesson.description,
                        lesson.difficulty,
                        path.title,
                        wordsNeeded
                    );

                    allGeneratedWords.push(...words);
                    successCount++;

                    // Rate limiting: wait 2 seconds between API calls
                    console.log('⏳ Waiting 2s before next generation...');
                    await new Promise(resolve => setTimeout(resolve, 2000));

                } catch (error) {
                    console.error(`❌ Failed to generate for ${lesson.id}:`, error);
                    failCount++;

                    // Wait longer after an error
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            } else {
                console.log(`✓ ${lesson.id}: ${lesson.title} (already has ${currentWordCount} words)`);
            }

            // Save checkpoint every 5 lessons
            if ((successCount + failCount) % 5 === 0 && allGeneratedWords.length > 0) {
                console.log(`\n💾 Checkpoint: Saving ${allGeneratedWords.length} words so far...`);
                saveToFile(allGeneratedWords, true);
            }
        }
    }

    console.log('\n' + '='.repeat(80));
    console.log(`\n✅ Generation Complete!`);
    console.log(`📝 Total Generated: ${allGeneratedWords.length} words`);
    console.log(`🎯 Success Rate: ${successCount}/${successCount + failCount} lessons`);

    if (TEST_MODE) {
        console.log(`\n⚠️  TEST MODE COMPLETE`);
        console.log(`Review the output, then set TEST_MODE = false to generate all lessons`);
    }

    // Save final file
    saveToFile(allGeneratedWords, false);

    return allGeneratedWords;
}

/**
 * Save generated words to file
 */
function saveToFile(words: VocabularyWord[], isCheckpoint: boolean) {
    const outputPath = path.join(__dirname, '../client/src/data/vocabulary-generated.ts');
    const checkpointLabel = isCheckpoint ? ' (CHECKPOINT)' : '';

    const fileContent = `/**
 * AUTO-GENERATED VOCABULARY${checkpointLabel}
 * 
 * Generated on: ${new Date().toISOString()}
 * Total Words: ${words.length}
 * 
 * IMPORTANT: Review these words before integrating into main vocabulary.ts
 * Check for: accuracy, IPA phonetics, IELTS appropriateness
 */

import { VocabularyWord } from './vocabulary';

export const generatedVocabulary: VocabularyWord[] = ${JSON.stringify(words, null, 2)};

/**
 * To integrate into main vocabulary:
 * 1. Review all words for accuracy
 * 2. Verify IPA phonetics
 * 3. Check for duplicates
 * 4. Copy to vocabularyData array in vocabulary.ts
 * 5. Update learningPaths.ts with new word IDs
 */
`;

    fs.writeFileSync(outputPath, fileContent, 'utf-8');

    if (!isCheckpoint) {
        console.log(`\n💾 Saved to: ${outputPath}`);
        console.log(`\n📋 Next Steps:`);
        console.log(`1. Review: ${outputPath}`);
        console.log(`2. Verify IPA phonetics (use https://tophonetics.com if needed)`);
        console.log(`3. Copy words to vocabulary.ts`);
        console.log(`4. Update learningPaths.ts with new word IDs (I can help with this!)`);
    }
}

// Run the generator
generateAllVocabulary()
    .then((words) => {
        console.log(`\n🎉 SUCCESS! Generated ${words.length} words`);
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ FATAL ERROR:', error);
        process.exit(1);
    });

/**
 * Script to update learningPaths.ts with correct word IDs
 * Maps each lesson to its corresponding 55-60 word range
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Word ID ranges for each lesson (55 words each, except first lesson of each track which has 60)
const lessonWordRanges: Record<string, { start: number; count: number }> = {
    // Business English Track (IDs 202-641) - 8 lessons × 55 = 440 words
    'be-1': { start: 202, count: 55 },
    'be-2': { start: 257, count: 55 },
    'be-3': { start: 312, count: 55 },
    'be-4': { start: 367, count: 55 },
    'be-5': { start: 422, count: 55 },
    'be-6': { start: 477, count: 55 },
    'be-7': { start: 532, count: 55 },
    'be-8': { start: 587, count: 55 },

    // Travel Essentials (IDs 642-971) - 6 lessons × 55 = 330 words
    'te-1': { start: 642, count: 55 },
    'te-2': { start: 697, count: 55 },
    'te-3': { start: 752, count: 55 },
    'te-4': { start: 807, count: 55 },
    'te-5': { start: 862, count: 55 },
    'te-6': { start: 917, count: 55 },

    // Academic English (IDs 972-1356) - 7 lessons × 55 = 385 words
    'ae-1': { start: 972, count: 55 },
    'ae-2': { start: 1027, count: 55 },
    'ae-3': { start: 1082, count: 55 },
    'ae-4': { start: 1137, count: 55 },
    'ae-5': { start: 1192, count: 55 },
    'ae-6': { start: 1247, count: 55 },
    'ae-7': { start: 1302, count: 55 },

    // Daily Conversation (IDs 1357-1631) - 5 lessons × 55 = 275 words
    'dc-1': { start: 1357, count: 55 },
    'dc-2': { start: 1412, count: 55 },
    'dc-3': { start: 1467, count: 55 },
    'dc-4': { start: 1522, count: 55 },
    'dc-5': { start: 1577, count: 55 },

    // IELTS Preparation (IDs 1632-1961) - 6 lessons × 55 = 330 words
    'ip-1': { start: 1632, count: 55 },
    'ip-2': { start: 1687, count: 55 },
    'ip-3': { start: 1742, count: 55 },
    'ip-4': { start: 1797, count: 55 },
    'ip-5': { start: 1852, count: 55 },
    'ip-6': { start: 1907, count: 55 },
};

function generateWordIds(start: number, count: number): string[] {
    return Array.from({ length: count }, (_, i) => String(start + i));
}

function updateLearningPaths() {
    const filePath = path.join(__dirname, 'client/src/data/learningPaths.ts');
    let content = fs.readFileSync(filePath, 'utf-8');

    // Update each lesson's wordIds
    Object.entries(lessonWordRanges).forEach(([lessonId, range]) => {
        const wordIds = generateWordIds(range.start, range.count);
        const wordIdsString = JSON.stringify(wordIds);

        // Find and replace the wordIds for this lesson
        const regex = new RegExp(
            `(id: "${lessonId}"[\\s\\S]*?wordIds: )\\[[^\\]]*\\]`,
            'g'
        );

        content = content.replace(regex, `$1${wordIdsString}`);
    });

    // Write back to file
    fs.writeFileSync(filePath, content, 'utf-8');

    console.log('✅ Successfully updated learningPaths.ts with new word IDs!');
    console.log('\n📊 Word ID Assignments:');
    console.log('='.repeat(80));

    Object.entries(lessonWordRanges).forEach(([lessonId, range]) => {
        const end = range.start + range.count - 1;
        console.log(`${lessonId.padEnd(6)} → IDs ${range.start}-${end} (${range.count} words)`);
    });
}

updateLearningPaths();

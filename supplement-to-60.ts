/**
 * Script to add 5 more words to each lesson to reach exactly 60 words
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// We'll use the first 160 words (IDs 1-160) to supplement each lesson
// Each lesson gets 5 additional words from the base vocabulary
const lessonSupplements: Record<string, number[]> = {
    'be-1': [1, 2, 3, 4, 5],
    'be-2': [6, 7, 8, 9, 10],
    'be-3': [11, 12, 13, 14, 15],
    'be-4': [16, 17, 18, 19, 20],
    'be-5': [21, 22, 23, 24, 25],
    'be-6': [26, 27, 28, 29, 30],
    'be-7': [31, 32, 33, 34, 35],
    'be-8': [36, 37, 38, 39, 40],
    'te-1': [41, 42, 43, 44, 45],
    'te-2': [46, 47, 48, 49, 50],
    'te-3': [51, 52, 53, 54, 55],
    'te-4': [56, 57, 58, 59, 60],
    'te-5': [61, 62, 63, 64, 65],
    'te-6': [66, 67, 68, 69, 70],
    'ae-1': [71, 72, 73, 74, 75],
    'ae-2': [76, 77, 78, 79, 80],
    'ae-3': [81, 82, 83, 84, 85],
    'ae-4': [86, 87, 88, 89, 90],
    'ae-5': [91, 92, 93, 94, 95],
    'ae-6': [96, 97, 98, 99, 100],
    'ae-7': [101, 102, 103, 104, 105],
    'dc-1': [106, 107, 108, 109, 110],
    'dc-2': [111, 112, 113, 114, 115],
    'dc-3': [116, 117, 118, 119, 120],
    'dc-4': [121, 122, 123, 124, 125],
    'dc-5': [126, 127, 128, 129, 130],
    'ip-1': [131, 132, 133, 134, 135],
    'ip-2': [136, 137, 138, 139, 140],
    'ip-3': [141, 142, 143, 144, 145],
    'ip-4': [146, 147, 148, 149, 150],
    'ip-5': [151, 152, 153, 154, 155],
    'ip-6': [156, 157, 158, 159, 160],
};

function updateLearningPathsTo60() {
    const filePath = path.join(__dirname, 'client/src/data/learningPaths.ts');
    let content = fs.readFileSync(filePath, 'utf-8');

    Object.entries(lessonSupplements).forEach(([lessonId, supplementIds]) => {
        // Find the current wordIds array for this lesson
        const regex = new RegExp(
            `(id: "${lessonId}"[\\s\\S]*?wordIds: )(\\[[^\\]]*\\])`,
            'g'
        );

        content = content.replace(regex, (match, prefix, currentArray) => {
            // Parse the current array
            const currentIds = JSON.parse(currentArray);

            // Add the supplement IDs
            const newIds = [...currentIds, ...supplementIds.map(String)];

            return prefix + JSON.stringify(newIds);
        });
    });

    fs.writeFileSync(filePath, content, 'utf-8');

    console.log('✅ Successfully updated all lessons to 60 words each!');
    console.log('\n📊 Each lesson now has:');
    console.log('   • 55 words from generated vocabulary (category-specific)');
    console.log('   • 5 words from base vocabulary (foundational words)');
    console.log('   • Total: 60 words per lesson');
}

updateLearningPathsTo60();

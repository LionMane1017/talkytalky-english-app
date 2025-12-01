/**
 * Script to find and use only existing vocabulary IDs for supplements
 */

import { vocabularyData } from './client/src/data/vocabulary';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all existing IDs from vocabulary
const existingIds = vocabularyData.map(w => parseInt(w.id)).sort((a, b) => a - b);
console.log(`Total existing IDs: ${existingIds.length}`);
console.log(`ID range: ${existingIds[0]} to ${existingIds[existingIds.length - 1]}`);

// Find IDs 1-200 that actually exist
const baseIds = existingIds.filter(id => id >= 1 && id <= 201);
console.log(`\nBase vocabulary IDs (1-201): ${baseIds.length} words`);

// We need 160 IDs for supplements (32 lessons × 5 words)
// Use the first 160 existing base IDs
const supplementPool = baseIds.slice(0, 160);

console.log(`\nSupplement pool: ${supplementPool.length} IDs`);
console.log(`Range: ${supplementPool[0]} to ${supplementPool[supplementPool.length - 1]}`);

// Create new supplement assignments
const lessonIds = [
    'be-1', 'be-2', 'be-3', 'be-4', 'be-5', 'be-6', 'be-7', 'be-8',
    'te-1', 'te-2', 'te-3', 'te-4', 'te-5', 'te-6',
    'ae-1', 'ae-2', 'ae-3', 'ae-4', 'ae-5', 'ae-6', 'ae-7',
    'dc-1', 'dc-2', 'dc-3', 'dc-4', 'dc-5',
    'ip-1', 'ip-2', 'ip-3', 'ip-4', 'ip-5', 'ip-6'
];

const newSupplements: Record<string, number[]> = {};

lessonIds.forEach((lessonId, index) => {
    const start = index * 5;
    newSupplements[lessonId] = supplementPool.slice(start, start + 5);
});

// Update learningPaths.ts
const filePath = path.join(__dirname, 'client/src/data/learningPaths.ts');
let content = fs.readFileSync(filePath, 'utf-8');

Object.entries(newSupplements).forEach(([lessonId, supplementIds]) => {
    const regex = new RegExp(
        `(id: "${lessonId}"[\\s\\S]*?wordIds: )(\\[[^\\]]*\\])`,
        'g'
    );

    content = content.replace(regex, (match, prefix, currentArray) => {
        const currentIds = JSON.parse(currentArray);

        // Keep only the first 55 IDs (the generated ones), remove old supplements
        const generatedIds = currentIds.slice(0, 55);

        // Add new valid supplement IDs
        const newIds = [...generatedIds, ...supplementIds.map(String)];

        return prefix + JSON.stringify(newIds);
    });
});

fs.writeFileSync(filePath, content, 'utf-8');

console.log('\n✅ Successfully updated supplements with valid IDs!');
console.log('\nSample assignments:');
Object.entries(newSupplements).slice(0, 5).forEach(([lessonId, ids]) => {
    console.log(`  ${lessonId}: ${ids.join(', ')}`);
});

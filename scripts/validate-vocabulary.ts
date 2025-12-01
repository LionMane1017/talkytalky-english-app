/**
 * Vocabulary Validation Script
 * 
 * Validates that all generated vocabulary aligns with requirements:
 * - Proper structure for Gemini integration
 * - All required fields present
 * - Correct difficulty levels
 * - Valid IPA phonetics
 * - No duplicates
 */

import { generatedVocabulary } from '../client/src/data/vocabulary-generated.js';
import { learningPaths } from '../client/src/data/learningPaths.js';

console.log('🔍 Starting Vocabulary Validation...\n');
console.log('='.repeat(80));

// Validation counters
let totalWords = 0;
let errors = 0;
let warnings = 0;

// Track issues
const issues: string[] = [];
const duplicateIds = new Set<string>();
const seenIds = new Set<string>();

// Required fields for Gemini
const requiredFields = ['id', 'word', 'phonetic', 'meaning', 'example', 'difficulty', 'category'];
const validDifficulties = ['beginner', 'intermediate', 'advanced'];

console.log('\n📋 VALIDATION CHECKS:\n');

// 1. Check structure and required fields
console.log('1️⃣  Checking structure and required fields...');
generatedVocabulary.forEach((word, index) => {
    totalWords++;

    // Check all required fields exist
    requiredFields.forEach(field => {
        if (!(field in word) || !word[field as keyof typeof word]) {
            errors++;
            issues.push(`❌ Word #${index + 1} (${word.word || 'UNKNOWN'}): Missing or empty field '${field}'`);
        }
    });

    // Check difficulty is valid
    if (word.difficulty && !validDifficulties.includes(word.difficulty)) {
        errors++;
        issues.push(`❌ Word #${index + 1} (${word.word}): Invalid difficulty '${word.difficulty}'`);
    }

    // Check for duplicate IDs
    if (seenIds.has(word.id)) {
        errors++;
        duplicateIds.add(word.id);
        issues.push(`❌ Duplicate ID found: ${word.id} (${word.word})`);
    }
    seenIds.add(word.id);

    // Check IPA phonetic format
    if (word.phonetic && !word.phonetic.match(/^\/.*\/$/)) {
        warnings++;
        issues.push(`⚠️  Word #${index + 1} (${word.word}): Phonetic may be malformed: '${word.phonetic}'`);
    }

    // Check example sentence has content
    if (word.example && word.example.length < 10) {
        warnings++;
        issues.push(`⚠️  Word #${index + 1} (${word.word}): Example sentence seems too short`);
    }
});

console.log(`   ✅ Checked ${totalWords} words\n`);

// 2. Check category distribution
console.log('2️⃣  Checking category distribution...');
const categoryCount: { [key: string]: number } = {};
generatedVocabulary.forEach(word => {
    categoryCount[word.category] = (categoryCount[word.category] || 0) + 1;
});

Object.entries(categoryCount).forEach(([category, count]) => {
    console.log(`   - ${category}: ${count} words`);
});
console.log();

// 3. Check difficulty distribution
console.log('3️⃣  Checking difficulty distribution...');
const difficultyCount = {
    beginner: generatedVocabulary.filter(w => w.difficulty === 'beginner').length,
    intermediate: generatedVocabulary.filter(w => w.difficulty === 'intermediate').length,
    advanced: generatedVocabulary.filter(w => w.difficulty === 'advanced').length,
};

console.log(`   - Beginner: ${difficultyCount.beginner} words`);
console.log(`   - Intermediate: ${difficultyCount.intermediate} words`);
console.log(`   - Advanced: ${difficultyCount.advanced} words\n`);

// 4. Validate against learning paths
console.log('4️⃣  Validating word coverage for lessons...');
let lessonsChecked = 0;
let lessonsCovered = 0;

learningPaths.forEach(path => {
    path.lessons.forEach(lesson => {
        lessonsChecked++;
        const currentWords = lesson.wordIds.length;
        const targetWords = 60;

        if (currentWords >= targetWords - 10) {
            lessonsCovered++;
        } else {
            warnings++;
            issues.push(`⚠️  Lesson '${lesson.title}' only has ${currentWords} words (target: ${targetWords})`);
        }
    });
});

console.log(`   - Lessons checked: ${lessonsChecked}`);
console.log(`   - Lessons with adequate words: ${lessonsCovered}/${lessonsChecked}\n`);

// 5. Gemini Integration Readiness
console.log('5️⃣  Checking Gemini integration readiness...');

const geminiRequirements = [
    { check: 'All words have meanings', pass: generatedVocabulary.every(w => w.meaning && w.meaning.length > 0) },
    { check: 'All words have examples', pass: generatedVocabulary.every(w => w.example && w.example.length > 0) },
    { check: 'All words have phonetics', pass: generatedVocabulary.every(w => w.phonetic && w.phonetic.length > 0) },
    { check: 'All words have difficulty levels', pass: generatedVocabulary.every(w => validDifficulties.includes(w.difficulty)) },
    { check: 'All words have categories', pass: generatedVocabulary.every(w => w.category && w.category.length > 0) },
    { check: 'No duplicate IDs', pass: duplicateIds.size === 0 },
];

geminiRequirements.forEach(req => {
    console.log(`   ${req.pass ? '✅' : '❌'} ${req.check}`);
    if (!req.pass) errors++;
});
console.log();

// Print summary
console.log('='.repeat(80));
console.log('\n📊 VALIDATION SUMMARY:\n');
console.log(`Total Words Validated: ${totalWords}`);
console.log(`Errors: ${errors}`);
console.log(`Warnings: ${warnings}\n`);

if (errors === 0 && warnings === 0) {
    console.log('✅ ✅ ✅  PERFECT! All vocabulary data is valid and ready for Gemini! ✅ ✅ ✅\n');
} else if (errors === 0) {
    console.log(`✅ PASSED with ${warnings} warnings (review recommended)\n`);
} else {
    console.log(`❌ FAILED with ${errors} errors and ${warnings} warnings\n`);
}

// Print issues if any
if (issues.length > 0) {
    console.log('='.repeat(80));
    console.log('\n🔴 ISSUES FOUND:\n');
    issues.slice(0, 50).forEach(issue => console.log(issue));

    if (issues.length > 50) {
        console.log(`\n... and ${issues.length - 50} more issues\n`);
    }
}

console.log('='.repeat(80));

// Exit with appropriate code
process.exit(errors > 0 ? 1 : 0);

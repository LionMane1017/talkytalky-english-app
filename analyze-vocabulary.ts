/**
 * Script to analyze learning paths and identify lessons needing more words
 */

import { learningPaths } from './client/src/data/learningPaths';
import { vocabularyData } from './client/src/data/vocabulary';

console.log('📊 TalkyTalky Vocabulary Analysis Report\n');
console.log('='.repeat(80));

// Count total available vocabulary
const totalVocab = vocabularyData.length;
const maxWordId = Math.max(...vocabularyData.map(w => parseInt(w.id)));
console.log(`\n📚 Total Vocabulary: ${totalVocab} words (IDs 1-${maxWordId})\n`);

// Track word usage across lessons
const wordUsage = new Map<string, string[]>();

// Analyze each learning path
learningPaths.forEach(path => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🎯 ${path.title} (${path.difficulty})`);
    console.log(`   ${path.totalLessons} lessons • ${path.estimatedHours} hours`);
    console.log(`${'='.repeat(80)}\n`);

    path.lessons.forEach((lesson, index) => {
        const wordCount = lesson.wordIds.length;
        const status = wordCount >= 60 ? '✅' : wordCount >= 30 ? '⚠️' : '❌';
        const gap = Math.max(0, 60 - wordCount);

        console.log(`${status} ${lesson.id.padEnd(8)} "${lesson.title.padEnd(35)}" ${wordCount.toString().padStart(2)} words ${gap > 0 ? `(need ${gap})` : ''}`);

        // Track which lessons use each word (for repetition analysis)
        lesson.wordIds.forEach(wordId => {
            if (!wordUsage.has(wordId)) {
                wordUsage.set(wordId, []);
            }
            wordUsage.get(wordId)!.push(lesson.id);
        });
    });
});

// Summary statistics
console.log(`\n${'='.repeat(80)}`);
console.log('📈 SUMMARY STATISTICS');
console.log(`${'='.repeat(80)}\n`);

const allLessons = learningPaths.flatMap(p => p.lessons);
const lessonCounts = allLessons.map(l => l.wordIds.length);
const totalWords = lessonCounts.reduce((sum, count) => sum + count, 0);
const avgWordsPerLesson = Math.round(totalWords / allLessons.length);

console.log(`Total Lessons: ${allLessons.length}`);
console.log(`Average Words per Lesson: ${avgWordsPerLesson}`);
console.log(`Min Words in a Lesson: ${Math.min(...lessonCounts)}`);
console.log(`Max Words in a Lesson: ${Math.max(...lessonCounts)}`);

const needsExpansion = allLessons.filter(l => l.wordIds.length < 60);
console.log(`\nLessons < 60 words: ${needsExpansion.length} out of ${allLessons.length}`);

// Word repetition analysis
const repeatedWords = Array.from(wordUsage.entries())
    .filter(([_, lessons]) => lessons.length > 1)
    .sort((a, b) => b[1].length - a[1].length);

console.log(`\n${'='.repeat(80)}`);
console.log('🔄 WORD REPETITION ANALYSIS');
console.log(`${'='.repeat(80)}\n`);

console.log(`Unique words used: ${wordUsage.size}`);
console.log(`Words used in multiple lessons: ${repeatedWords.length}`);

if (repeatedWords.length > 0) {
    console.log(`\nTop 10 most repeated words:`);
    repeatedWords.slice(0, 10).forEach(([wordId, lessons]) => {
        const word = vocabularyData.find(w => w.id === wordId);
        console.log(`  Word ${wordId.padStart(3)} "${word?.word || 'unknown'}" used in ${lessons.length} lessons: ${lessons.join(', ')}`);
    });
}

// Calculate words needed
const wordsNeeded = needsExpansion.reduce((total, lesson) => {
    return total + Math.max(0, 60 - lesson.wordIds.length);
}, 0);

console.log(`\n${'='.repeat(80)}`);
console.log('🎯 EXPANSION REQUIREMENTS');
console.log(`${'='.repeat(80)}\n`);

console.log(`Total new words needed: ${wordsNeeded}`);
console.log(`Available unused word IDs: ${maxWordId < totalVocab ? totalVocab - maxWordId : 'Need to create more'}`);
console.log(`\nRecommendation: ${wordsNeeded > (totalVocab - wordUsage.size) ? 'CREATE' : 'USE EXISTING'} vocabulary`);

export { };

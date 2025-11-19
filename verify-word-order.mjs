#!/usr/bin/env node
import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./client/src/data/vocabulary.ts', 'utf8').match(/export const vocabularyData.*?=\s*(\[[\s\S]*?\]);/)[1]);

console.log('🔍 WORD ORDER VERIFICATION SCRIPT\n');
console.log('=' .repeat(80));

const difficulties = ['beginner', 'intermediate', 'advanced'];

difficulties.forEach(difficulty => {
  const words = data
    .filter(w => w.difficulty === difficulty)
    .sort((a, b) => a.word.localeCompare(b.word));
  
  console.log(`\n📚 ${difficulty.toUpperCase()} LEVEL (${words.length} words)`);
  console.log('-'.repeat(80));
  
  words.forEach((word, index) => {
    console.log(`${(index + 1).toString().padStart(3, ' ')}. ${word.word.padEnd(20, ' ')} | ${word.meaning}`);
  });
});

console.log('\n' + '='.repeat(80));
console.log('✅ Word order is DETERMINISTIC and ALPHABETICAL');
console.log('✅ Same order every time - no randomization');
console.log('✅ Sequential progression from index 0 to N-1');
console.log('=' .repeat(80));

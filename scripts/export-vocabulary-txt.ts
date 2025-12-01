/**
 * Export Vocabulary to TXT Format
 * 
 * Converts the generated vocabulary from TypeScript to a readable TXT file
 */

import { generatedVocabulary } from '../client/src/data/vocabulary-generated.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Generate TXT format
let txtContent = `
================================================================================
                    TALKYTALKY VOCABULARY WORDLIST
                    Generated: ${new Date().toISOString().split('T')[0]}
                    Total Words: ${generatedVocabulary.length}
================================================================================

`;

// Group by category
const byCategory: { [key: string]: typeof generatedVocabulary } = {};

generatedVocabulary.forEach(word => {
    if (!byCategory[word.category]) {
        byCategory[word.category] = [];
    }
    byCategory[word.category].push(word);
});

// Export by category
Object.keys(byCategory).sort().forEach((category, categoryIndex) => {
    const words = byCategory[category];

    txtContent += `\n${'='.repeat(80)}\n`;
    txtContent += `CATEGORY ${categoryIndex + 1}: ${category.toUpperCase()}\n`;
    txtContent += `Total Words: ${words.length}\n`;
    txtContent += `${'='.repeat(80)}\n\n`;

    words.forEach((word, index) => {
        txtContent += `${index + 1}. ${word.word.toUpperCase()}\n`;
        txtContent += `   Phonetic: ${word.phonetic}\n`;
        txtContent += `   Difficulty: ${word.difficulty}\n`;
        txtContent += `   Meaning: ${word.meaning}\n`;
        txtContent += `   Example: "${word.example}"\n`;
        txtContent += `\n`;
    });
});

// Add summary at the end
txtContent += `\n${'='.repeat(80)}\n`;
txtContent += `SUMMARY\n`;
txtContent += `${'='.repeat(80)}\n\n`;

const difficultyCount = {
    beginner: generatedVocabulary.filter(w => w.difficulty === 'beginner').length,
    intermediate: generatedVocabulary.filter(w => w.difficulty === 'intermediate').length,
    advanced: generatedVocabulary.filter(w => w.difficulty === 'advanced').length,
};

txtContent += `Total Words: ${generatedVocabulary.length}\n\n`;
txtContent += `By Difficulty:\n`;
txtContent += `  - Beginner: ${difficultyCount.beginner}\n`;
txtContent += `  - Intermediate: ${difficultyCount.intermediate}\n`;
txtContent += `  - Advanced: ${difficultyCount.advanced}\n\n`;

txtContent += `By Category:\n`;
Object.keys(byCategory).sort().forEach(category => {
    txtContent += `  - ${category}: ${byCategory[category].length} words\n`;
});

txtContent += `\n${'='.repeat(80)}\n`;
txtContent += `END OF WORDLIST\n`;
txtContent += `${'='.repeat(80)}\n`;

// Save to file
const outputPath = path.join(__dirname, '../vocabulary-wordlist.txt');
fs.writeFileSync(outputPath, txtContent, 'utf-8');

console.log(`✅ Vocabulary exported to TXT format!`);
console.log(`📄 File: ${outputPath}`);
console.log(`📊 Total Words: ${generatedVocabulary.length}`);
console.log(`📝 File Size: ${(Buffer.byteLength(txtContent) / 1024).toFixed(2)} KB`);

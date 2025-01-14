import nodejieba from 'nodejieba';
import hskDictionaryData from './dict_hsk.json';
import fs from 'fs/promises';

// Types for our analysis results
type HSKWordAnalysis = {
    word: string;
    count: number;
    hskLevel: number;  // 0 if not found in HSK
};

type HSKLevelStats = {
    totalWords: number;       // total occurrences of words at this level
    uniqueWords: number;      // number of unique words at this level
    words: HSKWordAnalysis[];    // detailed word information
};

type HSKLevel = 0|1|2|3|4|5|6|7|8|9;

type HSKTextAnalysis = {
    // Overall statistics
    totalWords: number;           // total words in text (including repeats)
    uniqueWords: number;          // total unique words in text
    
    // HSK level statistics
    hskLevels: {
        [key in HSKLevel]: HSKLevelStats;    // 0 is used for words that don't exist in hskDictionary
    };
    
    // Quick lookup maps
    wordToAnalysis: Map<string, HSKWordAnalysis>;  // quick word lookup
    
    // Helper methods
    getWordInfo: (word: string) => HSKWordAnalysis | undefined;
    getHSKLevelCount: (level: number) => number;
    getWordsAtLevel: (level: number) => HSKWordAnalysis[];
};

class ChineseTextAnalyzer {
  private hskDictionary: Map<string,number>;
  
  constructor() {
    this.hskDictionary = new Map(Object.entries(hskDictionaryData));
  }

  private generateHSKWordAnalysis(words: string[]): Map<string, HSKWordAnalysis> {
    const wordToAnalysis = new Map<string, HSKWordAnalysis>();
    words.forEach((word) => {
      let wordAnalysis = wordToAnalysis.get(word);
      if (!wordAnalysis) {
        wordAnalysis = {
          word,
          count: 0,
          hskLevel: this.hskDictionary.get(word) || 0
        }
        wordToAnalysis.set(word, wordAnalysis);
      }
      wordAnalysis.count += 1;
    });
    return wordToAnalysis;
  } 

  private initialiseHSKLevels(): HSKTextAnalysis['hskLevels'] {
    const hskLevels: HSKTextAnalysis['hskLevels'] = {
      0: { totalWords: 0, uniqueWords: 0, words: [] },
      1: { totalWords: 0, uniqueWords: 0, words: [] },
      2: { totalWords: 0, uniqueWords: 0, words: [] },
      3: { totalWords: 0, uniqueWords: 0, words: [] },
      4: { totalWords: 0, uniqueWords: 0, words: [] },
      5: { totalWords: 0, uniqueWords: 0, words: [] },
      6: { totalWords: 0, uniqueWords: 0, words: [] },
      7: { totalWords: 0, uniqueWords: 0, words: [] },
      8: { totalWords: 0, uniqueWords: 0, words: [] },
      9: { totalWords: 0, uniqueWords: 0, words: [] }
    }
    return hskLevels;
  }

  private buildHSKLevelStats(wordToAnalysis: Map<string, HSKWordAnalysis>) {
    const hskLevels = this.initialiseHSKLevels();
    wordToAnalysis.forEach((wordAnalysis) => {
      const levelStats = hskLevels[wordAnalysis.hskLevel as HSKLevel];
      levelStats.words.push(wordAnalysis);
      levelStats.totalWords += wordAnalysis.count;
      levelStats.uniqueWords += 1
    })
    return hskLevels;
  }

  public hskAnalysis(text: string): HSKTextAnalysis{
    const words = nodejieba.cut(text);
    const wordToAnalysis = this.generateHSKWordAnalysis(words);
    const hskLevels = this.buildHSKLevelStats(wordToAnalysis);

    return {
      totalWords: words.length,
      uniqueWords: wordToAnalysis.size,
      hskLevels,
      wordToAnalysis,
      getWordInfo: (word: string) => wordToAnalysis.get(word),
      getHSKLevelCount: (level: number) => {
        return hskLevels[level as keyof typeof hskLevels].totalWords;
      },
      getWordsAtLevel: (level: number) => {
        return hskLevels[level as keyof typeof hskLevels].words;
      }
    }
  }
}

async function main() {
  const textFile = process.argv[2];
  const text = await fs.readFile(textFile, 'utf8');
  const analyzer = new ChineseTextAnalyzer();
  const analysis = analyzer.hskAnalysis(text);
  console.log(analysis);
}

main();

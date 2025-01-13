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
    // load HSK dictionary from file
  }

  public HSKAnalysis(text: string): HSKTextAnalysis{
    const words = nodejieba.cut(text);

    const wordCounts = new Map<string, number>();

    words.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    });

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

    const wordToAnalysis = new Map<string, HSKWordAnalysis>();
    wordCounts.forEach((count, word) => {
      const hskLevel = this.hskDictionary.get(word) || 0;
      const wordAnalysis: HSKWordAnalysis = {
        word,
        count,
        hskLevel
      };
      
      wordToAnalysis.set(word, wordAnalysis);

      if (hskLevel) {
        const levelStats = hskLevels[hskLevel as HSKLevel];
        levelStats.words.push(wordAnalysis);
        levelStats.totalWords += count;
        levelStats.uniqueWords += 1
      }
    })

    const result: HSKTextAnalysis = {
      totalWords: words.length,
      uniqueWords: wordCounts.size,
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
    
    return result;
  }

}

async function main() {
  const textFile = process.argv[2];
  const text = await fs.readFile(textFile, 'utf8');
  const analyzer = new ChineseTextAnalyzer();
  const analysis = analyzer.HSKAnalysis(text);
  console.log(analysis);
}

main();

// Types for our analysis results
export type HSKWordAnalysis = {
    word: string;
    count: number;
    hskLevel: number;  // 0 if not found in HSK
};

export type HSKLevelStats = {
    totalWords: number;       // total occurrences of words at this level
    uniqueWords: number;      // number of unique words at this level
    words: HSKWordAnalysis[];    // detailed word information
};

export type HSKLevel = 0|1|2|3|4|5|6|7|8|9;

export type HSKTextAnalysis = {
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

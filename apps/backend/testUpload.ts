import * as fs from 'fs/promises';

async function analyzeText(text: string) {
    try {
        const response = await fetch('http://localhost:3000/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });
        
        if (!response.ok) {
            throw new Error('Analysis failed');
        }
        
        const analysis = await response.json();
        return analysis;
    } catch (error) {
        console.error('Error analyzing text:', error);
        throw error;
    }
}

async function main() {
  const textFile = process.argv[2];
  const text = await fs.readFile(textFile, 'utf8');
  analyzeText(text)
      .then(analysis => console.log(analysis))
      .catch(error => console.error(error));
}

main();

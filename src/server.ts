import express from 'express';
import cors from 'cors';
import { ChineseTextAnalyzer, serializeAnalysis } from './ChineseTextAnalyzer';

const app = express();
const port = process.env.PORT || 3000;

const analyzer = new ChineseTextAnalyzer();

app.use(cors());
app.use(express.json());

app.get('api/health', (req, res) => {
  res.json({ status: 'ok'});
});

app.post('/api/analyze', (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Invalid input: text must be a non-empty string'
      });
    }

    const analysis = analyzer.hskAnalysis(text);
    res.json(serializeAnalysis(analysis));
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'An error occurred while analyzing the text'
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at localhost:${port}`);
})

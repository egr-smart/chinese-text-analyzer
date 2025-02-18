import { HSKTextAnalysis } from '@cta/types';
import { useState } from "react";

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>("");
  const [analysis, setAnalysis] = useState<HSKTextAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        // load result into variable, validate data and catch any errors before setting the text
        try {
          const text = e.target?.result;
          if (typeof text !== "string") {
            throw new Error("Invalid file content: expected text format");
          }
          validateText(text);
          setText(removeNonChineseText(text));
        } catch (err) {
          if (err instanceof Error) setError(err.message);
        }
      };
      reader.readAsText(selectedFile);
    } 
  };

  const validateText = (text:string) => {
    if (!text.trim()) {
      throw new Error("File is empty.");
    }
    if (!/[\u4e00-\u9fff]/.test(text)) {
      throw new Error("File must contain Chinese characters.");
    }
  }

  const removeNonChineseText = (text:string) => {
    return text.replace(/[^\u4e00-\u9fff]/g, ""); // the regex \u4e00-\u9fff matches all common Chinese chars (traditional and simplified)
  }

  const handleUpload = async () => {
    if (!text) {
      setError("Please upload a valid text file.");
      return;
    }
    setError(null);
    try {
      const response = await fetch("http://localhost:3000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        throw new Error("Failed to analyze text");
      }
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Upload a File for Analysis</h2>
      <input type="file" accept=".txt, .srt" onChange={handleFileChange} className="mb-2" />
      <button
        onClick={handleUpload}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      >
        Analyze
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {analysis && (
        <div className="mt-4 p-4 border rounded">
          <h3 className="font-semibold">Analysis Result:</h3>
          <table className="w-full border-collapse border border-gray-300 mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">HSK Level</th>
                <th className="border border-gray-300 p-2">Word Count</th>
                <th className="border border-gray-300 p-2">Unique Count</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(analysis.hskLevels)
                  .sort(([a], [b]) => (a === "0" ? 1 : b === "0" ? -1 : a - b))
                  .map(([level, stats]) => (
                <tr key={level}>
                  <td className="border border-gray-300 p-2">{level == 0 ? 'Unknown' : level}</td>
                  <td className="border border-gray-300 p-2">{stats.totalWords}</td>
                  <td className="border border-gray-300 p-2">{stats.uniqueWords}</td>
                </tr>
              ))}
              <tr>
                <td className="border border-gray-300 p-2">{'Total'}</td>
                <td className="border border-gray-300 p-2">{analysis.totalWords}</td>
                <td className="border border-gray-300 p-2">{analysis.uniqueWords}</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2">Total Words: {analysis.totalWords}</p>
          <p>Unique Words: {analysis.uniqueWords}</p>
        </div>
      )}
    </div>
  );
}

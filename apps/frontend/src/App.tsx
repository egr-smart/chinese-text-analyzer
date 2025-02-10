import { useState } from "react";

export default function FileUploader() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => setText(e.target.result);
      reader.readAsText(selectedFile);
    }
  };

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
      setError(err.message);
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
          <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(analysis, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

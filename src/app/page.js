"use client";

import { useState } from "react";

export default function Home() {
  // holds text input
  const [text, setText] = useState("");
  // holds the result from the Cohere API
  const [result, setResult] = useState(null);
  // tracks whether the app is currently waiting for a response from the API
  const [loading, setLoading] = useState(false);

  // handles what happens when the user clicks the "Analyze" button
  const analyzeText = async () => {
    // first, set loading to true
    setLoading(true);
    // then, make a POST request to the API
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    // then, convert the response to JSON
    const data = await res.json();
    // then, set the result to the data we got from the API
    setResult(data);
    // finally, set loading to false
    setLoading(false);
  };

  // display the page
  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {" "}
        Cognitive Distortion Analyzer
      </h1>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        className="w-full p-3 border border-gray-300 rounded mb-4"
      />
      <button
        onClick={analyzeText}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>
      {result?.results && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h2 className="font-semibold text-lg mb-2">Distortions Found:</h2>
          <ul className="space-y-2">
            {result.results.map(({ input, prediction, confidence }, idx) => (
              <li
                key={idx}
                className="border-l-4 pl-3 border-blue-500 bg-white p-2 shadow-sm rounded"
              >
                <p className="text-gray-800">
                  <span className="font-medium text-black">"{input}"</span>
                </p>
                <p className="text-sm text-gray-600">
                  → {prediction} ({(confidence * 100).toFixed(1)}% confidence)
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}

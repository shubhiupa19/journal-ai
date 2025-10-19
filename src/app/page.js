"use client";

import { useState } from "react";
import Highlighter from "react-highlight-words";
import {
  DISTORTION_DATA,
  DISTORTION_COLORS,
  DISTORTION_ORDER,
} from "./constants/distortions";

export default function Home() {
  // holds text input
  const [text, setText] = useState("");
  // holds the result from the Cohere API
  const [result, setResult] = useState(null);
  // tracks whether the app is currently waiting for a response from the API
  const [loading, setLoading] = useState(false);
  const [hoveredInfo, setHoveredInfo] = useState(null);

  // handles what happens when the user clicks the "Analyze" button
  const analyzeText = async () => {
    // first, set loading to true
    setLoading(true);
    // Use environment variable for API URL (defaults to localhost for development)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/predict";
    // then, make a POST request to the API
    const res = await fetch(apiUrl, {
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
          <h2 className="font-semibold text-lg mb-2">Analysis Results:</h2>
          <div className="bg-white p-4 rounded border text-lg leading-relaxed relative mb-4">
            {/* Show original text if no distortions found */}
            {result.results.every((r) => r.prediction === "No Distortion") ? (
              <p className="text-gray-700">{text}</p>
            ) : null}
            {DISTORTION_ORDER.map((distortionType) => {
              // Find sentences for this distortion type
              const matchingSentences = result.results
                .filter((r) => r.prediction === distortionType)
                .map((r) => r.input);

              // If no sentences of this type, skip
              if (matchingSentences.length === 0) return null;

              // Get confidence for each sentence
              const getConfidence = (sentence) => {
                const match = result.results.find(
                  (r) => r.input === sentence && r.prediction === distortionType
                );
                return match ? match.confidence : 0;
              };

              return (
                <Highlighter
                  key={distortionType}
                  searchWords={matchingSentences}
                  textToHighlight={text}
                  highlightClassName={DISTORTION_COLORS[distortionType]}
                  highlightTag={({ children }) => (
                    <span
                      className={`${DISTORTION_COLORS[distortionType]} cursor-pointer rounded px-1`}
                      onMouseEnter={() =>
                        setHoveredInfo({
                          type: distortionType,
                          confidence: getConfidence(children),
                          definition:
                            DISTORTION_DATA[distortionType]?.definition,
                        })
                      }
                      onMouseLeave={() => setHoveredInfo(null)}
                    >
                      {children}
                    </span>
                  )}
                />
              );
            })}
          </div>
          {hoveredInfo && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-semibold text-blue-900">
                {hoveredInfo.type}
              </h3>
              <p className="text-sm text-blue-700">
                Confidence: {(hoveredInfo.confidence * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-blue-800 mt-1">
                {hoveredInfo.definition}
              </p>
            </div>
          )}

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800 italic">
              ⚠️ Note: This model has ~34% accuracy and is for learning purposes only.
              Predictions should not be taken as psychological advice.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

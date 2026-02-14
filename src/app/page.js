"use client";

import { useState } from "react";
import ResultsDisplay from "./components/ResultsDisplay";
export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hoveredDistortion, setHoveredDistortion] = useState(null);
  // Feedback UI state
  const [selectedSentenceIdx, setSelectedSentenceIdx] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState({});

  const [error, setError] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  

  const analyzeText = async () => {
    // Reset state before new analysis
    setResult(null);
    setHoveredDistortion(null);
    setSelectedSentenceIdx(null);
    setFeedbackSubmitted({});
    setError("");
    setFeedbackError("");

    if (text.trim() === "") {
      setError("Error: Empty message");
      return;
    }

    setLoading(true);

    try {
      const url = "api/analyze";
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        setError(
          `Status: ${res.status}. Something went wrong. Please try again`,
        );
      }
    } catch (e) {
      setError(e.message);
      console.error(`Error ${e}`);
    }
    setLoading(false);
  };

  const sendFeedback = async (idx, isAccepted, correction = null) => {
    const r = result.results[idx];
    const url = "api/feedback";
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: r.input,
          predicted_distortion: r.prediction,
          user_correction: correction,
          is_accepted: isAccepted,
          confidence: r.confidence,
        }),
      });
      setFeedbackSubmitted((prev) => ({ ...prev, [idx]: true }));
    } catch (error) {
      console.error(`Error with submitting feedback:  ${error.message}`);
      setFeedbackError("Failed to submit feedback. Please try again.");
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center text-stone-800">
        Cognitive Distortion Analyzer
      </h1>
      <p className="text-stone-500 mb-6 text-center">
        Identify negative thinking patterns in your thoughts
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        className="w-full p-4 border border-stone-200 rounded-lg mb-4 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparen text-stone-800 leading-relaxed text-lg"
      />
      <button
        onClick={analyzeText}
        className="bg-olive-green text-white px-6 py-2.5 rounded-lg font-medium hover:bg-olive-green-dark transition-colors shadow-sm"
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl mt-4 p-3">
          {" "}
          <p className="text-sm">{error}</p>{" "}
        </div>
      )}
      {result?.results && (
        <ResultsDisplay
          result={result}
          hoveredDistortion={hoveredDistortion}
          setHoveredDistortion={setHoveredDistortion}
          selectedSentenceIdx={selectedSentenceIdx}
          setSelectedSentenceIdx={setSelectedSentenceIdx}
          feedbackSubmitted={feedbackSubmitted}
          sendFeedback={sendFeedback}
          feedbackError={feedbackError}
        />
      )}
    </main>
  );
}

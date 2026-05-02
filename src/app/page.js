"use client";

import { useState } from "react";
import ResultsDisplay from "./components/ResultsDisplay";
export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
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
    <>
      <header className="flex justify-end items-center gap-2 px-4 pt-4">
        <span className="text-sm text-stone-500">{isDarkMode ? "Dark 🌙" : "Light ☀️"}</span>
        <button
          onClick={() => {
            document.documentElement.classList.toggle("dark");
            setIsDarkMode(!isDarkMode);
          }}
          className="relative inline-flex items-center w-10 h-5 rounded-full transition-colors"
          style={{ backgroundColor: isDarkMode ? "#3b82f6" : "#d1d5db" }}
        >
          <span
            className={`inline-block w-3 h-3 bg-white rounded-full shadow transform transition-transform ${
              isDarkMode ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </header>
      <main className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center text-stone-800 dark:text-stone-100">
          Cognitive Distortion Analyzer
        </h1>
        <p className="text-stone-500 mb-6 text-center dark:text-stone-400">
          Identify negative thinking patterns in your thoughts
        </p>
        <textarea
          aria-label="Journal entry text input"
          value={text}
          placeholder="Write your journal entry here ..."
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="w-full p-4 border border-stone-200 rounded-lg  bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparen text-stone-800 leading-relaxed text-lg dark:bg-gray-800 dark:text-stone-100 dark:border-gray-600"
        />
        <p
          className={`text-right text-sm mb-4  dark:text-stone-500 ${text.length > 4500 ? "text-red-500" : "text-stone-400"}`}
        >
          {text.length}/5000
        </p>
        <button
          onClick={analyzeText}
          className="bg-olive-green text-white px-6 py-2.5 rounded-lg font-medium hover:bg-olive-green-dark transition-colors shadow-sm"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl mt-4 p-3 dark:bg-red-900 dark:border-red-700 dark:text-red-200">
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
    </>
  );
}

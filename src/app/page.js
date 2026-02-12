"use client";

import { useState } from "react";
import {
  DISTORTION_DATA,
  DISTORTION_COLORS,
  DISTORTION_ORDER,
} from "./constants/distortions";

export default function Home() {
  // holds text input
  const [text, setText] = useState("");
  // holds the result from the API
  const [result, setResult] = useState(null);
  // tracks whether the app is currently waiting for a response from the API
  const [loading, setLoading] = useState(false);
  const [hoveredInfo, setHoveredInfo] = useState(null);

  // tracks which sentences need feedback
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [feedbackSent, setFeedbackSent] = useState({});

  // handles what happens when the user clicks the "Analyze" button
  const analyzeText = async () => {
    // first, set loading to true
    setLoading(true);
    // Use environment variable for API URL (defaults to localhost for development)
    const url = "api/analyze";
    // then, make a POST request to the API
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
    // then, convert the response to JSON
    const data = await res.json();

    console.log("data: ", data);
    // then, set the result to the data we got from the API
    setResult(data);

    // finally, set loading to false
    setLoading(false);
  };

  const sendFeedback = async (idx, isAccepted, correction = null) => {
    const r = result.results[idx];
    const url = "api/feedback";
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
    setFeedbackSent((prev) => ({ ...prev, [idx]: true }));
    // setSelectedIdx(null);
  };

  // display the page
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
      {result?.results && (
        <div className="mt-6 p-5 border border-gray-200 rounded-xl bg-white shadow-md">
          <h2 className="font-semibold text-lg mb-2">Analysis Results:</h2>
          <div className="bg-white p-4 rounded border text-lg leading-relaxed relative mb-4">
            {/* Show original text if all predictions are "No Distortion" */}
            {result.results.every((r) => r.prediction === "No Distortion") ? (
              <p className="text-gray-700">{text}</p>
            ) : (
              /* Show text with highlighting for detected distortions */
              <div>
                {result.results.map((r, idx) => {
                  const distortionType = r.prediction;
                  const color = DISTORTION_COLORS[distortionType];

                  // If it's "No Distortion", just show plain text
                  if (distortionType === "No Distortion") {
                    return <span key={idx}>{r.input} </span>;
                  }

                  // Otherwise, show highlighted with color
                  return (
                    <span
                      key={idx}
                      className={`${color} cursor-pointer rounded px-1`}
                      onMouseEnter={() =>
                        setHoveredInfo({
                          type: distortionType,
                          confidence: r.confidence,
                          definition:
                            DISTORTION_DATA[distortionType]?.definition,
                        })
                      }
                      onMouseLeave={() => {
                        if (selectedIdx === null) {
                          setHoveredInfo(null);
                        }
                      }}
                      onClick={() =>
                        setSelectedIdx(selectedIdx === idx ? null : idx)
                      }
                    >
                      {r.input}{" "}
                    </span>
                  );
                })}
              </div>
            )}
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

          {selectedIdx !== null && !feedbackSent[selectedIdx] && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800 mb-2">
                <strong>Feedback for: </strong> "
                {result.results[selectedIdx].input}"
              </p>
              <p className="text=sm text-green-700 mb-3">
                Predicted:{" "}
                <strong>{result.results[selectedIdx].prediction}</strong>
              </p>
              <div className="flex gap-2 items-center flex-wrap">
                <button
                  onClick={() => sendFeedback(selectedIdx, true)}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Correct
                </button>
                <span className="text-sm text-green-700">
                  or select correct distortion:
                </span>
                <select
                  onChange={(e) =>
                    sendFeedback(selectedIdx, false, e.target.value)
                  }
                  defaultValue=""
                  className="border border-green-300 rounded px-2 py-1 text-sm"
                >
                  <option value="" disabled>
                    Choose...
                  </option>
                  {DISTORTION_ORDER.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                  <option value="No Distortion">No Distortion</option>
                </select>
              </div>
            </div>
          )}

          {selectedIdx !== null && feedbackSent[selectedIdx] && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                Thanks for your feedback!
              </p>
            </div>
          )}

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800 italic">
              ⚠️ Note: This model has ~34% accuracy and is for learning purposes
              only. Predictions should not be taken as psychological advice.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

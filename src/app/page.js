"use client";

import { useState } from "react";
import ResultsDisplay from "./components/ResultsDisplay";
const G = {
  warm: "#F5F5F3",
  cream: "#FCFCFB",
  ink: "#1B1B18",
  inkSoft: "#4A4A45",
  inkMuted: "#8A8A82",
  border: "#E3E3DF",
  dBg: "#141413",
  dSurface: "#1E1E1C",
  dBorder: "#2E2E2A",
  dInk: "#E8E6E0",
  dInkSoft: "#B0AEA6",
  dInkMuted: "#6E6E66",
  accent: "#2D6A4F",
  accentLight: "#40916C",
  accentMuted: "#B7E4C7",
  accentFaint: "#D8F3DC",
};
const DIST_STYLES = {
  "All-or-nothing thinking": {
    fg: "#9B2C2C",
    bg: "#FFF5F5",
    underline: "#E53E3E",
    dkFg: "#FC8181",
  },
  "Mind Reading": {
    fg: "#2B6CB0",
    bg: "#EBF8FF",
    underline: "#4299E1",
    dkFg: "#63B3ED",
  },
  Overgeneralization: {
    fg: "#97266D",
    bg: "#FFF5F7",
    underline: "#D53F8C",
    dkFg: "#F687B3",
  },
  "Should statements": {
    fg: "#553C9A",
    bg: "#FAF5FF",
    underline: "#805AD5",
    dkFg: "#B794F4",
  },
  "Emotional Reasoning": {
    fg: "#276749",
    bg: "#F0FFF4",
    underline: "#38A169",
    dkFg: "#68D391",
  },
  Labeling: {
    fg: "#9C4221",
    bg: "#FFFAF0",
    underline: "#DD6B20",
    dkFg: "#F6AD55",
  },
  Personalization: {
    fg: "#285E61",
    bg: "#E6FFFA",
    underline: "#319795",
    dkFg: "#4FD1C5",
  },
  "Mental filter": {
    fg: "#2C5282",
    bg: "#EBF8FF",
    underline: "#3182CE",
    dkFg: "#90CDF4",
  },
  "Fortune-telling": {
    fg: "#975A16",
    bg: "#FFFFF0",
    underline: "#D69E2E",
    dkFg: "#F6E05E",
  },
  Magnification: {
    fg: "#6B2737",
    bg: "#FFF5F7",
    underline: "#B83280",
    dkFg: "#FBB6CE",
  },
};
const SAMPLE_TEXT =
  "I always mess everything up. My friend didn't text back, so they must be angry with me. I'm a complete failure at everything I try. Today was actually a pretty good day. I'll never be good enough no matter how hard I try.";

function HighlightedText({ text, results, dark, activeId, onHover, onClick }) {
  const matches = results
    .filter((r) => r.dist !== "No Distortion" && DIST_STYLES[r.dist])
    .map((r) => ({ ...r, start: text.indexOf(r.text) }))
    .filter((r) => r.start !== -1)
    .sort((a, b) => a.start - b.start);

  const parts = [];
  let cursor = 0;

  for (const match of matches) {
    //1. for if there's a gap between the cursor and the starting index of match, it means we're at a space so push on a plain text string or space
    if (cursor < match.start) {
      parts.push(text.slice(cursor, match.start));
    }
    // 2. push a <span> for the match
    parts.push(
      <span
        key={match.id}
        style={{
          boxShadow: `inset 0 -2.5px 0 0 ${DIST_STYLES[match.dist].underline}${match.id === activeId ? "bb" : "55"}`,
          cursor: "pointer",
          borderRadius: 3,
          padding: "1px 2px",
        }}
        onMouseEnter={() => onHover(match.id)}
        onMouseLeave={() => onHover(null)}
        onClick={() => onClick(match.id)}
      >
        {match.text}
      </span>,
    );

    // 3. increment cursor
    cursor = match.start + match.text.length;
  }

  // after the last match, add all remaining text
  parts.push(text.slice(cursor));
  return <div>{parts}</div>;
}

function Tooltip({ result, dark }) {
  const d = DIST_STYLES[result.dist];
  return (
    <div style={{
      position: "absolute",
      bottom: "calc(100% + 8px)",
      left: 0,
      zIndex: 20,
      pointerEvents: "none",
      background: dark ? G.dSurface : "#ffffff",
      border: `1px solid ${dark ? G.dBorder : G.border}`,
      boxShadow: dark ? "0 8px 24px rgba(0,0,0,0.4)" : "0 8px 24px rgba(0,0,0,0.08)",
      borderRadius: 10,
      padding: "14px 18px",
      maxWidth: 340,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          padding: "2px 8px",
          borderRadius: 4,
          background: dark ? "transparent" : d.bg,
          border: dark ? `1px solid ${d.dkFg}44` : "none",
          color: dark ? d.dkFg : d.fg,
        }}>
          {result.dist}
        </span>
        <span style={{ fontSize: 11, color: dark ? G.dInkMuted : G.inkMuted, fontVariantNumeric: "tabular-nums" }}>
          {Math.round(result.conf * 100)}%
        </span>
      </div>
      <p style={{ fontSize: 13, color: dark ? G.dInkSoft : G.inkSoft, margin: 0 }}>
        Click to explore this distortion
      </p>
    </div>
  );
}
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

  // Rewrite UI state + error
  const [rewritten, setRewritten] = useState(null);
  const [rewriteError, setRewriteError] = useState(null);

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

  const rewrite = async () => {
    setRewriteError(null);
    const distortions = result.results;
    const url = "api/rewrite";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text,
          distortions: distortions,
        }),
      });
      const data = await res.json();
      setRewritten(data["rewritten"]);
    } catch (error) {
      console.error(`Error with creating rewrite: ${error.message}`);
      setRewriteError("Failed to create rewrite. Please try again");
    }
  };

  return (
    <>
      <header className="flex justify-end items-center gap-2 px-4 pt-4">
        <span className="text-sm text-stone-500">
          {isDarkMode ? "Dark 🌙" : "Light ☀️"}
        </span>
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
        {rewritten && (
          <div className="mt-6 mb-6 p-4 rounded-xl border-2 border-stone-200 dark:border-stone-700 bg-stone050 dark:bg-stone-800">
            <h2 className="font-semibold text-stone-700 dark:text-stone-300 mb-2">
              Rewritten Entry
            </h2>
            <p className="text-stone-600 dark:text-stone-400">{rewritten}</p>
          </div>
        )}
        <div className="flex justify-between items-center">
          <button
            onClick={analyzeText}
            className="bg-olive-green text-white px-6 py-2.5 rounded-lg font-medium hover:bg-olive-green-dark transition-colors shadow-sm"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
          <button
            disabled={!result}
            onClick={rewrite}
            className="bg-olive-green text-white px-6 py-2.5 rounded-lg font-medium hover:bg-olive-green-dark transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Rewrite with AI
          </button>
        </div>
        {rewriteError && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl mt-4 p-3 dark:bg-red-900 dark:border-red-700 dark:text-red-200">
            {" "}
            <p className="text-sm">{rewriteError}</p>{" "}
          </div>
        )}
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

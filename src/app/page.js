"use client";

import { useState } from "react";
import { DISTORTION_DATA, DISTORTION_ORDER } from "./constants/distortions";
import { Button } from "@/components/ui/button";

const DIST_STYLES = {
  "All-or-nothing thinking": { fg: "#9B2C2C", bg: "#FFF5F5", underline: "#E53E3E", dkFg: "#FC8181" },
  "Mind Reading":            { fg: "#2B6CB0", bg: "#EBF8FF", underline: "#4299E1", dkFg: "#63B3ED" },
  Overgeneralization:        { fg: "#97266D", bg: "#FFF5F7", underline: "#D53F8C", dkFg: "#F687B3" },
  "Should statements":       { fg: "#553C9A", bg: "#FAF5FF", underline: "#805AD5", dkFg: "#B794F4" },
  "Emotional Reasoning":     { fg: "#276749", bg: "#F0FFF4", underline: "#38A169", dkFg: "#68D391" },
  Labeling:                  { fg: "#9C4221", bg: "#FFFAF0", underline: "#DD6B20", dkFg: "#F6AD55" },
  Personalization:           { fg: "#285E61", bg: "#E6FFFA", underline: "#319795", dkFg: "#4FD1C5" },
  "Mental filter":           { fg: "#2C5282", bg: "#EBF8FF", underline: "#3182CE", dkFg: "#90CDF4" },
  "Fortune-telling":         { fg: "#975A16", bg: "#FFFFF0", underline: "#D69E2E", dkFg: "#F6E05E" },
  Magnification:             { fg: "#6B2737", bg: "#FFF5F7", underline: "#B83280", dkFg: "#FBB6CE" },
};

const SAMPLE_TEXT =
  "I always mess everything up. My friend didn't text back, so they must be angry with me. I'm a complete failure at everything I try. Today was actually a pretty good day. I'll never be good enough no matter how hard I try.";

function HighlightedText({ text, results, activeId, onHover, onClick }) {
  const matches = results
    .filter((r) => r.dist !== "No Distortion" && DIST_STYLES[r.dist])
    .map((r) => ({ ...r, start: text.indexOf(r.text) }))
    .filter((r) => r.start !== -1)
    .sort((a, b) => a.start - b.start);

  const parts = [];
  let cursor = 0;
  for (const match of matches) {
    if (cursor < match.start) parts.push(text.slice(cursor, match.start));
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
    cursor = match.start + match.text.length;
  }
  parts.push(text.slice(cursor));
  return <div>{parts}</div>;
}

function Tooltip({ result }) {
  const d = DIST_STYLES[result.dist];
  return (
    <div className="absolute left-0 z-20 pointer-events-none bg-card border border-border rounded-xl p-4 max-w-sm shadow-lg" style={{ bottom: "calc(100% + 8px)", animation: "fadeIn 0.15s ease" }}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded" style={{ background: d.bg, color: d.fg }}>
          {result.dist}
        </span>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {Math.round(result.conf * 100)}%
        </span>
      </div>
      <p className="text-[13px] text-muted-foreground m-0">Click to explore this distortion</p>
    </div>
  );
}

function DistortionBadge({ dist, dark }) {
  const d = DIST_STYLES[dist];
  return (
    <span
      className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded"
      style={{
        background: dark ? "transparent" : d.bg,
        border: dark ? `1px solid ${d.dkFg}44` : "none",
        color: dark ? d.dkFg : d.fg,
      }}
    >
      {dist}
    </span>
  );
}

function StepperCard({ result, dark, total, current, onPrev, onNext, sendFeedback, feedbackSubmitted }) {
  const [showDef, setShowDef] = useState(false);
  const [fb, setFb] = useState(null);
  const [correcting, setCorrecting] = useState(false);
  const [correction, setCorrection] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const d = DIST_STYLES[result.dist];

  return (
    <div className="rounded-xl border border-border bg-card p-5" style={{ animation: "revealUp 0.35s cubic-bezier(0.23,1,0.32,1) both" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground tabular-nums">{current + 1} of {total}</span>
        <div className="flex gap-1">
          <Button variant="outline" size="icon-sm" disabled={current === 0} onClick={onPrev}>←</Button>
          <Button variant="outline" size="icon-sm" disabled={current === total - 1} onClick={onNext}>→</Button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <DistortionBadge dist={result.dist} dark={dark} />
        <span className="text-[11px] text-muted-foreground tabular-nums">{Math.round(result.conf * 100)}% confidence</span>
      </div>

      <p className="text-xl leading-relaxed my-3 pl-4 text-foreground" style={{ fontFamily: "var(--font-instrument-serif)", borderLeft: `3px solid ${d.underline}` }}>
        {result.text}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDef(!showDef)}
          style={showDef ? { background: "var(--accent-faint)", color: "var(--accent-light)", borderColor: "var(--accent-muted)" } : {}}
        >
          {showDef ? "Hide ↗" : "What is this? ↗"}
        </Button>

        <div className="flex-1" />

        {feedbackSubmitted[result.originalIdx] ? (
          <p className="text-sm" style={{ color: "var(--accent-light)" }}>✓ Thanks — your feedback helps the model improve.</p>
        ) : (
          <>
            <button
              onClick={() => { sendFeedback(result.originalIdx, true); setFb("up"); setSubmitted(true); }}
              className="w-8 h-8 rounded-md cursor-pointer text-sm transition-opacity"
              style={{ opacity: fb === "up" ? 1 : 0.4, background: fb === "up" ? "var(--accent-faint)" : "transparent", border: "none" }}
            >👍</button>
            <button
              onClick={() => { setFb("down"); setCorrecting(true); }}
              className="w-8 h-8 rounded-md cursor-pointer text-sm transition-opacity"
              style={{ opacity: fb === "down" ? 1 : 0.4, background: fb === "down" ? "#FFF5F5" : "transparent", border: "none" }}
            >👎</button>
          </>
        )}
      </div>

      {showDef && (
        <div className="mt-4 p-4 rounded-lg border" style={{ background: "var(--accent-faint)", borderColor: "var(--accent-muted)", animation: "fadeIn 0.2s ease" }}>
          <span className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: "var(--accent-light)" }}>What is this?</span>
          <p className="text-[15px] leading-relaxed m-0 text-foreground" style={{ fontFamily: "var(--font-instrument-serif)" }}>
            {DISTORTION_DATA[result.dist]?.definition}
          </p>
        </div>
      )}

      {correcting && !submitted && (
        <div className="mt-3 flex gap-2 items-center flex-wrap" style={{ animation: "fadeIn 0.2s ease" }}>
          <span className="text-sm text-muted-foreground">What distortion is this?</span>
          <select
            value={correction}
            onChange={(e) => setCorrection(e.target.value)}
            className="text-sm px-2 py-1 rounded-md border border-border bg-card text-foreground outline-none"
          >
            <option value="">Choose...</option>
            {DISTORTION_ORDER.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <Button size="sm" disabled={!correction} onClick={() => { if (correction) { sendFeedback(result.originalIdx, false, correction); setSubmitted(true); } }}>
            Submit
          </Button>
        </div>
      )}

      {submitted && (
        <p className="text-sm mt-3" style={{ color: "var(--accent-light)", animation: "fadeIn 0.2s ease" }}>
          ✓ Thanks — your feedback helps the model improve.
        </p>
      )}

      <div className="flex gap-1.5 justify-center mt-6">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{ width: i === current ? 18 : 6, height: 6, background: i === current ? "var(--primary)" : "var(--border)" }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [text, setText] = useState("");
  const [mode, setMode] = useState("write");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hoveredDistortion, setHoveredDistortion] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState({});
  const [error, setError] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [rewritten, setRewritten] = useState(null);
  const [rewriteError, setRewriteError] = useState(null);

  const analyzeText = async () => {
    setResult(null);
    setHoveredDistortion(null);
    setFeedbackSubmitted({});
    setError("");
    if (text.trim() === "") { setError("Please enter some text first."); return; }
    setLoading(true);
    try {
      const res = await fetch("api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const data = await res.json();
        const normalized = data.results.map((r, i) => ({
          id: i + 1,
          originalIdx: i,
          text: r.input,
          dist: r.prediction,
          conf: r.confidence,
        }));
        setResult(normalized);
        setMode("review");
        setActiveStep(0);
      } else {
        setError(`Status: ${res.status}. Something went wrong. Please try again.`);
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const sendFeedback = async (idx, isAccepted, correction = null) => {
    const r = result[idx];
    try {
      await fetch("api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: r.text,
          predicted_distortion: r.dist,
          user_correction: correction,
          is_accepted: isAccepted,
          confidence: r.conf,
        }),
      });
      setFeedbackSubmitted((prev) => ({ ...prev, [idx]: true }));
    } catch (e) {
      console.error(`Feedback error: ${e.message}`);
    }
  };

  const rewrite = async () => {
    setRewriteError(null);
    setRewriteLoading(true);
    try {
      const res = await fetch("api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          distortions: result.map((r) => ({ input: r.text, prediction: r.dist, confidence: r.conf })),
        }),
      });
      const data = await res.json();
      setRewritten(data["rewritten"]);
    } catch (e) {
      setRewriteError("Failed to create rewrite. Please try again.");
    }
    setRewriteLoading(false);
  };

  const backToEdit = () => { setMode("write"); setResult(null); setRewritten(null); };

  const distortedResults = result
    ? result.filter((r) => r.dist !== "No Distortion" && DIST_STYLES[r.dist])
    : [];

  return (
    <>
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 border-b border-border bg-background/80 backdrop-blur-lg">
        <span className="text-[22px] text-foreground" style={{ fontFamily: "var(--font-instrument-serif)" }}>
          Reframe
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary relative ml-1" style={{ top: -8 }} />
        </span>
        <Button variant="outline" size="sm" onClick={() => { document.documentElement.classList.toggle("dark"); setIsDarkMode(!isDarkMode); }}>
          {isDarkMode ? "Light" : "Dark"}
        </Button>
      </nav>

      <main className="px-6 py-8 max-w-2xl mx-auto">
        <h1 className="text-4xl font-normal text-foreground mb-2" style={{ fontFamily: "var(--font-instrument-serif)", animation: "revealUp 0.5s cubic-bezier(0.23,1,0.32,1) 0.1s both" }}>
          What's on your mind?
        </h1>
        <p className="text-[15px] text-muted-foreground mb-6" style={{ animation: "revealUp 0.5s cubic-bezier(0.23,1,0.32,1) 0.2s both" }}>
          Write freely. We'll help you spot patterns in your thinking.
        </p>

        {mode === "write" && (
          <textarea
            aria-label="Journal entry text input"
            value={text}
            placeholder="Write your journal entry here ..."
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="w-full p-4 rounded-xl border border-border bg-card text-foreground text-[15px] leading-relaxed resize-y outline-none focus:ring-2 focus:ring-ring/50 box-border"
            style={{ fontFamily: "var(--font-figtree)" }}
          />
        )}

        <div className="flex items-center justify-between mt-3">
          <span className={`text-[13px] tabular-nums ${text.length > 4500 ? "text-red-500" : "text-muted-foreground"}`}>
            {mode === "write"
              ? `${text.length.toLocaleString()} / 5,000`
              : `${distortedResults.length} distortion${distortedResults.length === 1 ? "" : "s"} found`}
          </span>
          <div className="flex gap-2">
            {mode === "write" && text && <Button variant="outline" size="sm" onClick={() => setText("")}>Clear</Button>}
            {mode === "write" && <Button size="sm" onClick={analyzeText} disabled={!text || loading}>{loading ? "Analyzing..." : "Analyze →"}</Button>}
            {mode === "review" && (
              <>
                <Button variant="outline" size="sm" onClick={rewrite} disabled={rewriteLoading}>{rewriteLoading ? "Rewriting..." : "AI Rewrite ✦"}</Button>
                <Button variant="outline" size="sm" onClick={backToEdit}>← Edit text</Button>
              </>
            )}
          </div>
        </div>

        {mode === "write" && !text && !result && (
          <p className="mt-2.5 text-[13px] text-muted-foreground">
            or{" "}
            <span onClick={() => setText(SAMPLE_TEXT)} className="cursor-pointer underline" style={{ color: "var(--accent-light)" }}>
              try with sample text
            </span>
          </p>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm dark:bg-red-900 dark:border-red-700 dark:text-red-200">
            {error}
          </div>
        )}

        {mode === "review" && result && (
          <div className="relative mt-4 p-4 rounded-xl border border-border bg-card text-[15px] leading-relaxed text-foreground">
            <HighlightedText
              text={text}
              results={result}
              activeId={distortedResults[activeStep]?.id ?? null}
              onHover={(id) => setHoveredDistortion(id)}
              onClick={(id) => setActiveStep(distortedResults.findIndex((r) => r.id === id))}
            />
            {hoveredDistortion && DIST_STYLES[distortedResults.find((r) => r.id === hoveredDistortion)?.dist] && (
              <Tooltip result={distortedResults.find((r) => r.id === hoveredDistortion)} />
            )}
          </div>
        )}

        {rewritten && (
          <div className="mt-5 p-5 rounded-xl border" style={{ background: "var(--primary)11", borderColor: "var(--primary)33", animation: "revealUp 0.4s cubic-bezier(0.23,1,0.32,1) both" }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: "var(--accent-light)" }}>AI Rewritten Entry</p>
            <p className="text-[15px] leading-relaxed m-0 text-foreground" style={{ fontFamily: "var(--font-instrument-serif)" }}>{rewritten}</p>
          </div>
        )}

        {rewriteError && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm dark:bg-red-900 dark:border-red-700 dark:text-red-200">
            {rewriteError}
          </div>
        )}

        {mode === "review" && distortedResults.length > 0 && (
          <div className="mt-6">
            <StepperCard
              key={distortedResults[activeStep].id}
              result={distortedResults[activeStep]}
              dark={isDarkMode}
              total={distortedResults.length}
              current={activeStep}
              onPrev={() => setActiveStep(activeStep - 1)}
              onNext={() => setActiveStep(activeStep + 1)}
              sendFeedback={sendFeedback}
              feedbackSubmitted={feedbackSubmitted}
            />
          </div>
        )}

        {mode === "review" && result && distortedResults.length === 0 && (
          <div className="mt-6 p-5 rounded-xl border" style={{ background: "var(--accent-faint)", borderColor: "var(--accent-muted)" }}>
            <p className="text-[17px] text-foreground m-0" style={{ fontFamily: "var(--font-instrument-serif)" }}>
              No distortions detected — your thinking looks balanced here.
            </p>
          </div>
        )}
      </main>

      <footer className="text-center px-6 py-8 text-[13px] italic text-muted-foreground">
        Reframe is a journaling aid, not a clinical tool (~35% accuracy). Your feedback helps improve predictions over time.
      </footer>
    </>
  );
}

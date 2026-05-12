"use client";

import { useState } from "react";
import { DISTORTION_DATA, DISTORTION_ORDER } from "@/app/constants/distortions";
import { Button } from "@/components/ui/button";
import { DIST_STYLES } from "@/app/constants/distStyles";
import DistortionBadge from "./DistortionBadge";

export default function StepperCard({
  result,
  dark,
  total,
  current,
  onPrev,
  onNext,
  direction,
  sendFeedback,
  feedbackSubmitted,
}) {
  const [showDef, setShowDef] = useState(false);
  const [fb, setFb] = useState(null);
  const [correcting, setCorrecting] = useState(false);
  const [correction, setCorrection] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const d = DIST_STYLES[result.dist];

  return (
    <div
      className="rounded-xl border border-border bg-card p-5"
      style={{
        animation: `${direction === "next" ? "revealRight" : "revealLeft"} 0.35s cubic-bezier(0.23,1,0.32,1) both `,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground tabular-nums">
          {current + 1} of {total}
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={current === 0}
            onClick={onPrev}
          >
            ←
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={current === total - 1}
            onClick={onNext}
          >
            →
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <DistortionBadge dist={result.dist} dark={dark} />
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {Math.round(result.conf * 100)}% confidence
        </span>
      </div>

      <p
        className="text-xl leading-relaxed my-3 pl-4 text-foreground"
        style={{
          fontFamily: "var(--font-instrument-serif)",
          borderLeft: `3px solid ${d.underline}`,
        }}
      >
        {result.text}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDef(!showDef)}
          style={
            showDef
              ? {
                  background: "var(--accent-faint)",
                  color: "var(--accent-light)",
                  borderColor: "var(--accent-muted)",
                }
              : {}
          }
        >
          {showDef ? "Hide ↗" : "What is this? ↗"}
        </Button>

        <div className="flex-1" />

        {feedbackSubmitted[result.originalIdx] ? (
          <p className="text-sm" style={{ color: "var(--accent-light)" }}>
            ✓ Thanks! your feedback helps the model improve.
          </p>
        ) : (
          <>
            <button
              onClick={() => {
                sendFeedback(result.originalIdx, true);
                setFb("up");
                setSubmitted(true);
              }}
              className={`w-8 h-8 rounded-md cursor-pointer text-sm transition-all hover:bg-muted ${
                fb === "up" ? "bg-[var(--accent-faint)]" : "bg-transparent"
              }`}
              style={{
                opacity: fb === "up" ? 1 : 0.4,
                border: "none",
              }}
            >
              👍
            </button>
            <button
              onClick={() => {
                setFb("down");
                setCorrecting(true);
              }}
              className={`w-8 h-8 rounded-md cursor-pointer text-sm transition-all hover:bg-muted ${
                fb === "down" ? "bg-[var(--accent-faint)]" : "bg-transparent"
              }`}
              style={{
                opacity: fb === "down" ? 1 : 0.4,
                border: "none",
              }}
            >
              👎
            </button>
          </>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground mt-2">
        Feedback is anonymous and only used to improve the model.
      </p>

      {showDef && (
        <div
          className="mt-4 p-4 rounded-lg border"
          style={{
            background: "var(--accent-faint)",
            borderColor: "var(--accent-muted)",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-widest block mb-2"
            style={{ color: "var(--accent-light)" }}
          >
            What is this?
          </span>
          <p
            className="text-[15px] leading-relaxed m-0 text-foreground"
            style={{ fontFamily: "var(--font-instrument-serif)" }}
          >
            {DISTORTION_DATA[result.dist]?.definition}
          </p>
        </div>
      )}

      {correcting && !submitted && (
        <div
          className="mt-3 flex gap-2 items-center flex-wrap"
          style={{ animation: "fadeIn 0.2s ease" }}
        >
          <span className="text-sm text-muted-foreground">
            What distortion is this?
          </span>
          <select
            value={correction}
            onChange={(e) => setCorrection(e.target.value)}
            className="text-sm px-2 py-1 rounded-md border border-border bg-card text-foreground outline-none"
          >
            <option value="">Choose...</option>
            {DISTORTION_ORDER.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            disabled={!correction}
            onClick={() => {
              if (correction) {
                sendFeedback(result.originalIdx, false, correction);
                setSubmitted(true);
              }
            }}
          >
            Submit
          </Button>
        </div>
      )}

      <div className="flex gap-1.5 justify-center mt-6">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? 18 : 6,
              height: 6,
              background: i === current ? "var(--primary)" : "var(--border)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

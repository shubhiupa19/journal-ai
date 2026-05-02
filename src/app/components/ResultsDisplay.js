import {
  DISTORTION_DATA,
  DISTORTION_COLORS,
  DISTORTION_ORDER,
} from "../constants/distortions";
import { useState } from "react";

export default function ResultsDisplay({
  result,
  hoveredDistortion,
  setHoveredDistortion,
  selectedSentenceIdx,
  setSelectedSentenceIdx,
  feedbackSubmitted,
  sendFeedback,
  feedbackError,
}) {
  const [pendingCorrection, setPendingCorrection] = useState(null);
  return (
    <div className="mt-6 p-5 border border-gray-200 rounded-xl bg-white shadow-md dark:bg-gray-800">
      <h2 className="font-semibold text-lg mb-2 dark:text-stone-100">
        Analysis Results:
      </h2>
      <div className="bg-white dark:bg-gray-700 p-4 rounded border text-lg text-stone-800 leading-relaxed relative mb-4">
        {
          <div>
            {result.results.map((sentence, idx) => {
              const distortionType = sentence.prediction;
              const color = DISTORTION_COLORS[distortionType];
              return (
                <span
                  key={idx}
                  className={`${color || "text-stone-800 dark:text-stone-100"} cursor-pointer rounded px-1`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Sentence: ${sentence.input}. Click to provide feedback`}
                  onMouseEnter={() =>
                    setHoveredDistortion({
                      type: distortionType,
                      confidence: sentence.confidence,
                      definition: DISTORTION_DATA[distortionType]?.definition,
                    })
                  }
                  onMouseLeave={() => {
                    if (selectedSentenceIdx === null) {
                      setHoveredDistortion(null);
                    }
                  }}
                  onClick={() =>
                    setSelectedSentenceIdx(
                      selectedSentenceIdx === idx ? null : idx,
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedSentenceIdx(
                        selectedSentenceIdx === idx ? null : idx,
                      );
                    }
                  }}
                >
                  {sentence.input}{" "}
                </span>
              );
            })}
          </div>
        }
      </div>
      {hoveredDistortion && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 dark:bg-blue-900 dark:border-blue-700 rounded">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 ">
            {hoveredDistortion.type}
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Confidence: {(hoveredDistortion.confidence * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
            {hoveredDistortion.definition}
          </p>
        </div>
      )}

      {selectedSentenceIdx !== null &&
        !feedbackSubmitted[selectedSentenceIdx] && (
          <div
            aria-live="polite"
            className="mt-4 p-3 bg-green-50 border border-green-200 dark:bg-green-900 dark:border-green-700 rounded"
          >
            <p className="text-sm text-green-800 dark:text-green-100 mb-2">
              <strong>Feedback for: </strong> "
              {result.results[selectedSentenceIdx].input}"
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mb-3">
              Predicted:{" "}
              <strong>{result.results[selectedSentenceIdx].prediction}</strong>
            </p>
            <div className="flex gap-2 items-center flex-wrap">
              <button
                onClick={() => sendFeedback(selectedSentenceIdx, true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendFeedback(selectedSentenceIdx, true);
                  }
                }}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Correct
              </button>
              <span className="text-sm text-green-700 dark:text-green-300">
                or select correct distortion:
              </span>
              <select
                onChange={(e) => setPendingCorrection(e.target.value)}
                defaultValue=""
                className="border border-green-300 rounded px-2 py-1 text-sm text-stone-800 dark:text-stone-200"
              >
                <option value="" disabled>
                  Choose...
                </option>
                {DISTORTION_ORDER.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <div className="basis-full mt-4">
                <button
                  disabled={!pendingCorrection}
                  onClick={() =>
                    sendFeedback(selectedSentenceIdx, false, pendingCorrection)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendFeedback(
                        selectedSentenceIdx,
                        false,
                        pendingCorrection,
                      );
                    }
                  }}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

      {selectedSentenceIdx !== null &&
        feedbackSubmitted[selectedSentenceIdx] && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 dark:bg-green-900 dark:border-green-700 rounded">
            <p className="text-sm text-green-800 dark:text-green-100">
              Thanks for your feedback!
            </p>
          </div>
        )}
      {feedbackError && (
        <div className="bg-red-50 border border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-100 rounded-xl mt-4 p-3">
          {" "}
          <p className="text-sm">{feedbackError}</p>{" "}
        </div>
      )}

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 dark:bg-yellow-900 dark:border-yellow-700 rounded">
        <p className="text-sm text-yellow-800 dark:text-yellow-100 italic">
          ⚠️ Note: This model has ~34% accuracy and is for learning purposes
          only. Predictions should not be taken as psychological advice.
        </p>
      </div>
    </div>
  );
}

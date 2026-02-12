import { DISTORTION_DATA, DISTORTION_COLORS, DISTORTION_ORDER } from "../constants/distortions";

export default function ResultsDisplay({ result, hoveredDistortion, setHoveredDistortion, selectedSentenceIdx, setSelectedSentenceIdx, feedbackSubmitted, sendFeedback, feedbackError})
{
    return (
        <div className="mt-6 p-5 border border-gray-200 rounded-xl bg-white shadow-md">
          <h2 className="font-semibold text-lg mb-2">Analysis Results:</h2>
          <div className="bg-white p-4 rounded border text-lg leading-relaxed relative mb-4">
            {
              <div>
                {result.results.map((r, idx) => {
                  const distortionType = r.prediction;
                  const color = DISTORTION_COLORS[distortionType];
                  return (
                    <span
                      key={idx}
                      className={`${color || ""} cursor-pointer rounded px-1`}
                      onMouseEnter={() =>
                        setHoveredDistortion({
                          type: distortionType,
                          confidence: r.confidence,
                          definition:
                            DISTORTION_DATA[distortionType]?.definition,
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
                    >
                      {r.input}{" "}
                    </span>
                  );
                })}
              </div>
            }
          </div>
          {hoveredDistortion && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-semibold text-blue-900">
                {hoveredDistortion.type}
              </h3>
              <p className="text-sm text-blue-700">
                Confidence: {(hoveredDistortion.confidence * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-blue-800 mt-1">
                {hoveredDistortion.definition}
              </p>
            </div>
          )}

          {selectedSentenceIdx !== null &&
            !feedbackSubmitted[selectedSentenceIdx] && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-800 mb-2">
                  <strong>Feedback for: </strong> "
                  {result.results[selectedSentenceIdx].input}"
                </p>
                <p className="text-sm text-green-700 mb-3">
                  Predicted:{" "}
                  <strong>
                    {result.results[selectedSentenceIdx].prediction}
                  </strong>
                </p>
                <div className="flex gap-2 items-center flex-wrap">
                  <button
                    onClick={() => sendFeedback(selectedSentenceIdx, true)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Correct
                  </button>
                  <span className="text-sm text-green-700">
                    or select correct distortion:
                  </span>
                  <select
                    onChange={(e) =>
                      sendFeedback(selectedSentenceIdx, false, e.target.value)
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

          {selectedSentenceIdx !== null &&
            feedbackSubmitted[selectedSentenceIdx] && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-800">
                  Thanks for your feedback!
                </p>
              </div>
            )}
          {feedbackError && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl mt-4 p-3">
              {" "}
              <p className="text-sm">{feedbackError}</p>{" "}
            </div>
          )}

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800 italic">
              ⚠️ Note: This model has ~34% accuracy and is for learning purposes
              only. Predictions should not be taken as psychological advice.
            </p>
          </div>
        </div>
     )
}

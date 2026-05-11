import { DIST_STYLES } from "@/app/constants/distStyles";

export default function HighlightedText({ text, results, activeId, onHover, onClick }) {
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

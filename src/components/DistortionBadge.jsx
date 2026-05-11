import { DIST_STYLES } from "@/app/constants/distStyles";

export default function DistortionBadge({ dist, dark }) {
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

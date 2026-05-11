import { DIST_STYLES } from "@/app/constants/distStyles";

export default function Tooltip({ result }) {
  const d = DIST_STYLES[result.dist];
  return (
    <div
      className="absolute left-0 z-20 pointer-events-none bg-card border border-border rounded-xl p-4 max-w-sm shadow-lg"
      style={{ bottom: "calc(100% + 8px)", animation: "fadeIn 0.15s ease" }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded"
          style={{ background: d.bg, color: d.fg }}
        >
          {result.dist}
        </span>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {Math.round(result.conf * 100)}%
        </span>
      </div>
      <p className="text-[13px] text-muted-foreground m-0">
        Click to explore this distortion
      </p>
    </div>
  );
}

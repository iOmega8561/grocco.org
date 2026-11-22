import type { ReactNode } from "react";

/** Common wrapper: scrolls sideways on narrow screens instead of shrinking the text to nothing. */
export function DiagramFrame({ label, width, height, children }: { label: string; width: number; height: number; children: ReactNode }) {
  return (
    <div className="diagram">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} style={{ minWidth: Math.round(width * 0.74) }}>
        <defs>
          <marker id="dg-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className="dg-head" />
          </marker>
        </defs>
        {children}
      </svg>
    </div>
  );
}

export function Box({ x, y, w, h, title, sub, strong, dashed }: { x: number; y: number; w: number; h: number; title?: string; sub?: string; strong?: boolean; dashed?: boolean }) {
  const cls = ["dg-box", strong && "dg-box--strong", dashed && "dg-box--dashed"].filter(Boolean).join(" ");
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={14} className={cls} />
      {title && (
        <text x={x + 18} y={y + 30} className="dg-title">
          {title}
        </text>
      )}
      {sub && (
        <text x={x + 18} y={y + 50} className="dg-sub">
          {sub}
        </text>
      )}
    </g>
  );
}

export function Arrow({ d, label, lx, ly, anchor = "middle" }: { d: string; label?: string; lx?: number; ly?: number; anchor?: "start" | "middle" | "end" }) {
  return (
    <g>
      <path d={d} className="dg-arrow" markerEnd="url(#dg-head)" />
      {label && (
        <text x={lx} y={ly} textAnchor={anchor} className="dg-label">
          {label}
        </text>
      )}
    </g>
  );
}

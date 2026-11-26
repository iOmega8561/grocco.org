/** An original survey probe over the timeline, turning slowly, its beacon blinking. */
export function Probe() {
  return (
    <div className="st-probe">
      <svg viewBox="0 0 120 64" width="120" height="64">
        <g fill="#24345a" stroke="#6f8fc7" strokeWidth="0.8">
          <rect x="4" y="22" width="36" height="20" rx="1.5" />
          <rect x="80" y="22" width="36" height="20" rx="1.5" />
        </g>
        <path d="M16 22 V42 M28 22 V42 M4 32 H40 M92 22 V42 M104 22 V42 M80 32 H116" stroke="#6f8fc7" strokeWidth="0.6" />
        <path d="M40 32 H80" stroke="#9aa6bd" strokeWidth="2" />
        <rect x="48" y="20" width="24" height="24" rx="5" fill="#c7cfdd" />
        <rect x="52" y="24" width="16" height="16" rx="3" fill="#8f9ab0" />
        <path d="M60 20 V9" stroke="#c7cfdd" strokeWidth="1.5" />
        <path d="M51 10 Q60 3 69 10 Z" fill="#dfe5ef" />
        <circle className="st-probe__beacon" cx="60" cy="48" r="2" fill="#ff6b6b" />
      </svg>
    </div>
  );
}

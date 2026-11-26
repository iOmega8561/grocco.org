import { useEffect, useState } from "react";

/** Hangs from the top of the timeline. Clicked, it climbs its thread and comes back down a little later. */
export function Spider() {
  const [up, setUp] = useState(false);

  useEffect(() => {
    if (!up) return;
    const timer = window.setTimeout(() => setUp(false), 5000);
    return () => window.clearTimeout(timer);
  }, [up]);

  return (
    <div className="hw-spider" data-up={up ? "" : undefined}>
      <span className="hw-spider__thread" />
      <svg className="hw-spider__body" viewBox="0 0 64 60" width="64" height="60" onClick={() => setUp(true)}>
        <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M26 30 Q14 16 6 24" />
          <path d="M25 34 Q10 28 3 38" />
          <path d="M25 38 Q11 42 6 52" />
          <path d="M27 42 Q19 50 17 58" />
          <path d="M38 30 Q50 16 58 24" />
          <path d="M39 34 Q54 28 61 38" />
          <path d="M39 38 Q53 42 58 52" />
          <path d="M37 42 Q45 50 47 58" />
        </g>
        <circle cx="32" cy="37" r="10" fill="currentColor" />
        <circle cx="32" cy="23" r="6.5" fill="currentColor" />
        <circle cx="29.5" cy="22" r="1.4" fill="#ff8a2a" />
        <circle cx="34.5" cy="22" r="1.4" fill="#ff8a2a" />
      </svg>
    </div>
  );
}

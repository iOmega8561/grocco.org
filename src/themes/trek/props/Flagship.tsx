import { useEffect, useState } from "react";
import { useReducedMotion } from "../../hooks";
import { engageWarp } from "../warp";

type Phase = "arriving" | "here" | "leaving" | "gone";

/** How long the ship stays away after going to warp. */
const awayFor = 3500;

/** An original long-range ship, in profile, nose to the left. */
function Ship() {
  return (
    <svg viewBox="0 0 200 72" width="200" height="72">
      <defs>
        <linearGradient id="st-hull" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef2f8" />
          <stop offset="0.55" stopColor="#b9c3d4" />
          <stop offset="1" stopColor="#6f7b92" />
        </linearGradient>
        <radialGradient id="st-exhaust">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.35" stopColor="#9fdcff" />
          <stop offset="1" stopColor="#3d8bff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse className="st-ship__exhaust" cx="191" cy="34" rx="12" ry="9" fill="url(#st-exhaust)" />
      <path d="M118 23 L136 5 L156 5 L150 22 Z" fill="#8e9ab0" />
      <path d="M104 45 L146 64 L166 64 L152 45 Z" fill="#7a869d" />
      <path d="M6 38 C30 29 72 22 120 21 L170 20 C182 20 188 26 188 34 C188 42 182 47 170 47 L120 47 C72 47 30 45 6 38 Z" fill="url(#st-hull)" />
      <path d="M22 38 C60 39 110 39 184 38" stroke="#5f8fd8" strokeWidth="1.4" fill="none" />
      <path d="M38 33 Q54 25 76 27 L74 31 Q56 30 42 35 Z" fill="#1a2846" />
      <path d="M46 30 Q56 27 66 28" stroke="#9cc4ff" strokeWidth="0.9" fill="none" opacity="0.8" />
      <g fill="#ffe3a3">
        {[88, 98, 108, 118, 128, 138, 148, 158].map((x) => (
          <circle key={x} cx={x} cy="31" r="1.1" />
        ))}
      </g>
      <rect x="182" y="27" width="8" height="14" rx="3" fill="#5c677d" />
    </svg>
  );
}

/**
 * The one bold thing: a ship holding station over the stack. It drops out of warp once the stack has
 * built, and when clicked it goes to warp, taking the stars with it, and comes back a moment later.
 */
export function Flagship() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduced ? "here" : "arriving");
  const [first, setFirst] = useState(true);

  useEffect(() => {
    if (phase !== "gone") return;
    const timer = window.setTimeout(() => setPhase("arriving"), awayFor);
    return () => window.clearTimeout(timer);
  }, [phase]);

  return (
    <div
      className="st-flagship"
      data-phase={phase}
      data-first={first ? "" : undefined}
      onClick={() => {
        if (phase !== "here" || reduced) return;
        setFirst(false);
        setPhase("leaving");
        engageWarp("jump");
      }}
      onAnimationEnd={(event) => {
        if (event.target !== event.currentTarget) return;
        if (phase === "arriving") setPhase("here");
        if (phase === "leaving") setPhase("gone");
      }}
    >
      <Ship />
      <span className="st-flagship__flash" />
    </div>
  );
}

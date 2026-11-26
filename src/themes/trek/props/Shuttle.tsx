import { useRef } from "react";
import { useSeen } from "../../hooks";

/** A small original shuttle, nose to the left, with one engine. */
function ShuttleShape({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 84 40" width="84" height="40">
      <defs>
        <linearGradient id="st-shuttle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f1f4fa" />
          <stop offset="1" stopColor="#8995ab" />
        </linearGradient>
        <radialGradient id="st-shuttle-glow">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.4" stopColor="#9fdcff" />
          <stop offset="1" stopColor="#3d8bff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse className="st-ship__exhaust" cx="76" cy="21" rx="8" ry="6" fill="url(#st-shuttle-glow)" />
      <path d="M8 22 C8 12 20 7 38 7 L60 9 C68 10 72 15 72 21 C72 27 68 32 60 33 L38 35 C20 35 8 31 8 22 Z" fill="url(#st-shuttle)" />
      <path d="M16 18 Q26 12 40 13 L40 18 Z" fill="#1a2846" />
      <path d="M12 25 L70 25" stroke="#5f8fd8" strokeWidth="1.2" />
      <path d="M44 33 L52 38 L64 38 L60 32 Z" fill="#7a869d" />
    </svg>
  );
}

/** Crosses the top of the featured panel, slowly, once the panel is on screen. */
export function DriftingShuttle() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useSeen(ref);
  return (
    <div ref={ref} className="st-drift" data-seen={seen ? "" : undefined}>
      <ShuttleShape className="st-drift__ship" />
    </div>
  );
}

/** On the missing page: a shuttle adrift, slowly tumbling. */
export function LostShuttle() {
  return (
    <div className="st-adrift">
      <ShuttleShape className="st-adrift__ship" />
    </div>
  );
}

import { useRef, useState } from "react";
import { useSeen } from "../../hooks";

/** A reindeer's head and neck, coming in from the left, facing right: antlers, a collar and its bell. */
function ReindeerHead() {
  return (
    <svg viewBox="0 0 100 112" width="100" height="112">
      <path d="M-4 112 C6 96 20 80 33 64 L50 70 C42 84 35 98 31 112 Z" fill="#86593a" />
      <path d="M36 70 C30 82 24 96 20 112 L27 112 C30 98 36 84 42 72 Z" fill="#efe6d6" opacity="0.4" />
      <g className="xm-peek__head">
        <g stroke="#d9c3a0" strokeWidth="2.6" strokeLinecap="round" fill="none">
          <path d="M44 37 C40 25 42 15 50 7 M43 26 L34 19 M44 18 L38 9 M47 12 L52 3" />
          <path d="M52 36 C55 25 61 17 69 13 M55.5 26 L63 27.5 M58.5 20 L58.5 11 M63.5 15.5 L71.5 10" />
        </g>
        <path className="xm-peek__ear" d="M39 41 C31 31 24 31 22 35 C26 39.5 32 43 39 45 Z" fill="#6f4a31" />
        <path d="M30 53 C30 41 40 34 52 35 C62 36 72 41 82 43 C90 45 93 51 90 56 C87 61 78 61 70 60 C60 63 50 67 42 67 C34 66 30 61 30 53 Z" fill="#9a6a46" />
        <path d="M70 49 C78 47 88 48 90.5 53 C88.5 58 80 59 72 57 Z" fill="#c49a73" />
        <ellipse cx="90" cy="51.5" rx="3.6" ry="3.2" fill="#2a1a10" />
        <g className="xm-peek__eye">
          <ellipse cx="61" cy="45.5" rx="2.6" ry="3" fill="#140d08" />
          <circle cx="62" cy="44.4" r="0.9" fill="#f4f1ea" />
        </g>
      </g>
      <path d="M29 67 C36 73.5 44 75.5 51 71" stroke="#b3262e" strokeWidth="5" strokeLinecap="round" fill="none" />
      <g className="xm-peek__bell">
        <path d="M40.5 74 V77" stroke="#c9a24a" strokeWidth="1.4" />
        <circle cx="40.5" cy="81.5" r="5.2" fill="#e2b350" />
        <path d="M37 82.5 H44" stroke="#8a6420" strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="38.8" cy="79.6" r="1.2" fill="#fff6d8" opacity="0.8" />
      </g>
      <g className="xm-peek__jingle" stroke="#f0c06a" strokeWidth="1.4" strokeLinecap="round" fill="none">
        <path d="M50 78 Q53 82 50 86 M54 75 Q59 82 54 89" />
      </g>
    </svg>
  );
}

/**
 * Peeks into the featured panel from its left edge once the panel is on screen, blinking now and then.
 * Clicked, it shakes its head and the bell on its collar jingles. Readers who ask for less motion see
 * the jingle without the shake.
 */
export function PeekingReindeer() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useSeen(ref);
  const [jingling, setJingling] = useState(false);

  return (
    <div
      ref={ref}
      className="xm-peek"
      data-seen={seen ? "" : undefined}
      data-jingling={jingling ? "" : undefined}
      onClick={() => setJingling(true)}
      // The jingle shows for every reader, with or without motion, so its end ends the shake.
      onAnimationEnd={(event) => {
        if (event.animationName === "xm-jingle") setJingling(false);
      }}
    >
      <ReindeerHead />
    </div>
  );
}

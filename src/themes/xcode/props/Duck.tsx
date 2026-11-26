import { useState } from "react";

/**
 * A rubber duck on the footer line, for rubber-duck debugging: explain the bug to the duck, out loud,
 * and the answer comes. Clicked, it bobs and squeaks.
 */
export function Duck() {
  const [squeaking, setSqueaking] = useState(false);

  return (
    <div
      className="x-duck"
      data-squeaking={squeaking ? "" : undefined}
      onClick={() => setSqueaking(true)}
      // The squeak shows for every reader, with or without motion, so its end ends the bob.
      onAnimationEnd={(event) => {
        if (event.animationName === "x-squeak") setSqueaking(false);
      }}
    >
      <svg viewBox="0 0 64 56" width="64" height="56">
        <g className="x-duck__body">
          <path d="M15 41 C8 35 7 27 11 27.5 C14 28 17 32 20 36 Z" fill="#f2b705" />
          <ellipse cx="34" cy="43" rx="24" ry="12.5" fill="#ffd23f" />
          <path d="M22 41 C27 34 38 34 41 40 C37 45 28 46 22 41 Z" fill="#f2b705" />
          <circle cx="44" cy="23" r="12" fill="#ffd23f" />
          <path d="M53 23 C60 21.5 63.5 25 60 28 C57.5 30 54 28.5 52.5 26.5 Z" fill="#ff8a1f" />
          <circle cx="47.5" cy="19.5" r="1.9" fill="#1a1a1c" />
          <circle cx="48.1" cy="18.9" r="0.6" fill="#fff" />
        </g>
        <path className="x-duck__squeak" d="M62 14 Q66 18 63 22 M65 10 Q71 17 66 25" />
      </svg>
    </div>
  );
}

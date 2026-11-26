import { useState } from "react";

/**
 * A drafting compass by the timeline, the blueprint’s tool. Clicked, it swings round its needle and
 * draws a circle, which fades away. Readers who ask for less motion see the circle without the swing.
 */
export function Compass() {
  const [drawing, setDrawing] = useState(false);

  return (
    <div
      className="x-compass"
      data-drawing={drawing ? "" : undefined}
      onClick={() => setDrawing(true)}
      // The circle shows for every reader, with or without motion, so its end ends the drawing.
      onAnimationEnd={(event) => {
        if (event.animationName === "x-circle") setDrawing(false);
      }}
    >
      <svg viewBox="0 0 60 72" width="60" height="72">
        <defs>
          <linearGradient id="x-leg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8b929b" />
            <stop offset="0.5" stopColor="#e6e9ed" />
            <stop offset="1" stopColor="#8b929b" />
          </linearGradient>
        </defs>
        {/* The circle it draws, round the needle, as far out as the pencil: set small, to stay clear of the title. */}
        <circle className="x-compass__circle" cx="39.2" cy="69" r="17.6" pathLength={1} />
        <g className="x-compass__body">
          <path d="M28.5 13 L22 64" stroke="url(#x-leg)" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M22 64 L21.6 67.6" stroke="#2c2e33" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M31.5 13 L39 66" stroke="url(#x-leg)" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M39 66 L39.2 69" stroke="#cfd3d8" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="30" cy="13" r="4.2" fill="#c8ccd1" stroke="#7d848d" />
          <rect x="28" y="1" width="4" height="9" rx="2" fill="#d9a067" />
        </g>
      </svg>
    </div>
  );
}

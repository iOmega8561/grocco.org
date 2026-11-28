import { useEffect, useState, type CSSProperties } from "react";

/** The flakes inside: where each one is when the globe is shaken, and how far it falls to settle. */
const flakes = [
  [18, 16], [26, 11], [35, 14], [43, 19], [21, 25], [31, 21], [40, 27],
  [15, 33], [25, 31], [36, 35], [46, 33], [29, 40], [20, 41], [41, 41],
].map(([x, y], i) => ({ x, y, fall: 46 - y, drift: ((i * 7) % 5) - 2, delay: (i % 5) * 0.12 }));

/** How long the snow takes to settle again. */
const settlesIn = 3800;

/**
 * A snow globe on the footer line, a tiny fir inside. Clicked, it is shaken: it wobbles, and the
 * snow swirls up and settles slowly. Readers who ask for less motion see the snow without the wobble.
 */
export function SnowGlobe() {
  const [shakes, setShakes] = useState(0);
  const shaken = shakes > 0;

  useEffect(() => {
    if (!shaken) return;
    const timer = window.setTimeout(() => setShakes(0), settlesIn);
    return () => window.clearTimeout(timer);
  }, [shakes, shaken]);

  return (
    <div className="xm-globe" data-shaken={shaken ? "" : undefined} onClick={() => setShakes((n) => n + 1)}>
      <svg viewBox="0 0 60 66" width="60" height="66">
        <defs>
          <clipPath id="xm-globe-glass">
            <circle cx="30" cy="28" r="21.5" />
          </clipPath>
        </defs>
        <g className="xm-globe__body">
          <circle cx="30" cy="28" r="22" fill="rgb(150 185 225 / 0.1)" />
          <g clipPath="url(#xm-globe-glass)">
            <ellipse cx="30" cy="49" rx="24" ry="7" fill="#e6ebf0" />
            <path d="M30 22 L37 34 H33.5 L39 43 H21 L26.5 34 H23 Z" fill="#1f5440" />
            <rect x="28.6" y="43" width="2.8" height="3.5" fill="#6f4a31" />
            <path d="M30 18.2 L31 20.6 L33.4 20.8 L31.6 22.4 L32.1 24.8 L30 23.5 L27.9 24.8 L28.4 22.4 L26.6 20.8 L29 20.6 Z" fill="#f0c06a" />
            <g key={shakes} className="xm-globe__snow" fill="#f4f1ea">
              {flakes.map((flake, i) => (
                <circle
                  key={i}
                  className="xm-globe__flake"
                  cx={flake.x}
                  cy={flake.y}
                  r={i % 3 ? 0.9 : 1.2}
                  style={{ "--fall": `${flake.fall}px`, "--drift": `${flake.drift}px`, animationDelay: `${flake.delay}s` } as CSSProperties}
                />
              ))}
            </g>
          </g>
          <circle cx="30" cy="28" r="22" fill="none" stroke="rgb(220 232 248 / 0.45)" strokeWidth="1.2" />
          <path d="M14.5 19 A17 17 0 0 1 24 10.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.45" />
        </g>
        <path d="M9 65 L13.5 49 H46.5 L51 65 Z" fill="#9e2a30" />
        <path d="M11.6 56.5 H48.4" stroke="#e2b350" strokeWidth="1.6" />
        <path d="M13.5 49 H46.5" stroke="#5e1418" strokeWidth="1.4" />
      </svg>
    </div>
  );
}

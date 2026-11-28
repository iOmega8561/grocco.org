import { useEffect, useState } from "react";

/** How long the snowman holds its hat up. */
const greetingFor = 1400;

/**
 * A snowman above the timeline, on a little drift of snow: coal eyes, a carrot, a red scarf and a top
 * hat. Clicked, it raises its hat.
 */
export function Snowman() {
  const [greeting, setGreeting] = useState(false);

  useEffect(() => {
    if (!greeting) return;
    const timer = window.setTimeout(() => setGreeting(false), greetingFor);
    return () => window.clearTimeout(timer);
  }, [greeting]);

  return (
    <div className="xm-snowman" data-greeting={greeting ? "" : undefined} onClick={() => setGreeting(true)}>
      <svg viewBox="0 -8 64 92" width="64" height="92">
        <defs>
          <radialGradient id="xm-snowball" cx="38%" cy="32%" r="75%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.65" stopColor="#e6ebf0" />
            <stop offset="1" stopColor="#b7c3d0" />
          </radialGradient>
        </defs>
        <ellipse cx="32" cy="80" rx="29" ry="4" fill="#dfe6ec" />
        <g stroke="#6f4a31" strokeWidth="1.8" strokeLinecap="round" fill="none">
          <path d="M22 38 L8 30 M12.5 32.6 L10.5 26.5" />
          <path d="M42 38 L56 31 M51.5 33.3 L54.5 27.5" />
        </g>
        <circle cx="32" cy="62" r="16.5" fill="url(#xm-snowball)" />
        <circle cx="32" cy="38.5" r="11.5" fill="url(#xm-snowball)" />
        <circle cx="32" cy="20" r="9" fill="url(#xm-snowball)" />
        <g fill="#1c2128">
          <circle cx="32" cy="35.5" r="1.3" />
          <circle cx="32" cy="41" r="1.3" />
          <circle cx="32" cy="57" r="1.4" />
          <circle cx="28.8" cy="18.2" r="1.2" />
          <circle cx="35.2" cy="18.2" r="1.2" />
          <circle cx="28.2" cy="23.6" r="0.6" />
          <circle cx="30" cy="24.7" r="0.6" />
          <circle cx="32" cy="25.1" r="0.6" />
          <circle cx="34" cy="24.7" r="0.6" />
        </g>
        <path d="M32.5 20.4 L42 22.2 L32.5 23 Z" fill="#ee8a2c" />
        <path d="M23.4 27.6 C28 30.8 36 30.8 40.6 27.6 L41 31.4 C36 34.6 28 34.6 23 31.4 Z" fill="#b3262e" />
        <path d="M35.6 31.6 L39.4 44.5 L34.8 45 L33 32.2 Z" fill="#9e2a30" />
        <g className="xm-snowman__hat">
          <ellipse cx="32" cy="12" rx="11" ry="2.2" fill="#1a1e24" />
          <rect x="25" y="-3" width="14" height="15" rx="1.2" fill="#1a1e24" />
          <rect x="25" y="7.6" width="14" height="2.6" fill="#b3262e" />
          <path d="M27 -1 V9" stroke="#fff" strokeWidth="1" opacity="0.1" />
        </g>
      </svg>
    </div>
  );
}

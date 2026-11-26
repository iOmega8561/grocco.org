import { useRef, useState } from "react";
import { useSeen } from "../../hooks";

/** The app icons on the phone’s screen, in the editor’s syntax colours: four rows of four, and a dock. */
const icons = ["#fc5fa3", "#5dd8ff", "#67b7a4", "#d0bf69", "#fc6a5d", "#a167e6", "#fd8f3f", "#5dd8ff"];

/** A generic phone, as the Simulator shows one: a dark frame, a glowing screen and a home screen of icons. */
function Phone() {
  return (
    <svg viewBox="0 0 60 120" width="60" height="120">
      <defs>
        <linearGradient id="x-screen" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#25406f" />
          <stop offset="1" stopColor="#101828" />
        </linearGradient>
      </defs>
      <rect x="0" y="30" width="2.5" height="10" rx="1" fill="#3a3c43" />
      <rect x="57.5" y="36" width="2.5" height="16" rx="1" fill="#3a3c43" />
      <rect x="2" y="2" width="56" height="116" rx="11" fill="#2b2c31" stroke="#4a4c53" />
      <rect x="6" y="6" width="48" height="108" rx="8" fill="url(#x-screen)" />
      <rect x="23" y="10" width="14" height="4.5" rx="2.25" fill="#050506" />
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={11 + (i % 4) * 10.5} y={24 + Math.floor(i / 4) * 12} width="7.5" height="7.5" rx="2" fill={icons[i % icons.length]} opacity="0.9" />
      ))}
      <rect x="9" y="96" width="42" height="12" rx="5" fill="rgb(255 255 255 / 0.12)" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={12 + i * 10} y="98.5" width="7" height="7" rx="2" fill={icons[(i * 3) % icons.length]} />
      ))}
    </svg>
  );
}

/**
 * A Simulator by the featured panel: once the panel is seen, a phone slides in from its edge. Clicked,
 * it turns to landscape and back, as Simulator’s rotate command does.
 */
export function Simulator() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useSeen(ref);
  const [landscape, setLandscape] = useState(false);

  return (
    <div
      ref={ref}
      className="x-simulator"
      data-seen={seen ? "" : undefined}
      data-landscape={landscape ? "" : undefined}
      onClick={() => setLandscape(!landscape)}
    >
      <Phone />
    </div>
  );
}

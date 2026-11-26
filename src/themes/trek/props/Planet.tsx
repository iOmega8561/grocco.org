import type { SlotProps } from "../../types";
import { seed } from "../../hooks";

/**
 * A planet at the top of each project page, its colour, side and ring chosen by the page itself,
 * so every project has its own world and always the same one.
 */
export function Planet({ pathname }: SlotProps) {
  // The language prefix is left out, so a project has the same planet in every language.
  const value = seed(pathname.replace(/^\/[a-z]+/, ""));
  const hue = value % 360;
  const side = (value >> 9) % 2 ? "left" : "right";
  const ringed = (value >> 10) % 3 !== 0;
  const id = `st-planet-${hue}`;
  return (
    <div className="st-planet" data-side={side}>
      <svg viewBox="0 0 120 120" width="120" height="120">
        <defs>
          <radialGradient id={id} cx="35%" cy="32%" r="75%">
            <stop offset="0" stopColor={`hsl(${hue} 65% 72%)`} />
            <stop offset="0.6" stopColor={`hsl(${hue} 45% 42%)`} />
            <stop offset="1" stopColor={`hsl(${hue} 50% 14%)`} />
          </radialGradient>
        </defs>
        {ringed && <path d="M14 70 A48 13 -14 0 1 106 50" stroke={`hsl(${(hue + 40) % 360} 40% 75% / 0.55)`} strokeWidth="5" fill="none" />}
        <circle cx="60" cy="60" r="32" fill={`url(#${id})`} />
        {ringed && <path d="M106 50 A48 13 -14 0 1 14 70" stroke={`hsl(${(hue + 40) % 360} 40% 78% / 0.75)`} strokeWidth="5" fill="none" />}
      </svg>
    </div>
  );
}

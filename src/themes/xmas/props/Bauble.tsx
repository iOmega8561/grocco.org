import { useState } from "react";
import type { SlotProps } from "../../types";
import { seed } from "../../hooks";

/**
 * A number for the project, its bits well stirred: the site's seed, then the finaliser of MurmurHash3,
 * since slugs differ in a few letters and the seed alone leaves its low bits alike. Shifts are
 * unsigned, so every choice below is a whole number in range.
 */
function stir(slug: string): number {
  let h = seed(`ornament:${slug}`);
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

/** The colours a bauble can be: holly, pine, candle gold, night blue, and frost. */
const glass = [
  ["#ec5a60", "#b3262e", "#4e0d12"],
  ["#4fa47e", "#1f5440", "#0a2119"],
  ["#ffe2a0", "#e2b350", "#6b4a12"],
  ["#7ea6e6", "#2f5596", "#0d1d3c"],
  ["#f4f7fb", "#b7c3d0", "#4a5866"],
];

/**
 * A glass bauble hanging at the top of each project page, swaying a little. Its colour, its
 * decoration and its side are chosen by the project itself, so every project has its own, always the
 * same one, in every language and whatever the order of the projects. Clicked, it swings, and glints.
 */
export function Bauble({ pathname }: SlotProps) {
  const [flicks, setFlicks] = useState(0);
  const value = stir(pathname.split("/").pop() ?? "");
  const [light, colour, dark] = glass[value % glass.length];
  const decoration = (value >>> 8) % 3;
  const side = (value >>> 16) % 2 ? "left" : "right";
  const trim = colour === "#e2b350" ? "#b3262e" : "#f0c06a";
  const id = `xm-glass-${value % glass.length}`;

  return (
    <div className="xm-bauble" data-side={side}>
      <svg
        key={flicks}
        viewBox="0 0 60 132"
        width="60"
        height="132"
        data-flicked={flicks > 0 ? "" : undefined}
        onClick={() => setFlicks((n) => n + 1)}
      >
        <defs>
          <radialGradient id={id} cx="36%" cy="32%" r="78%">
            <stop offset="0" stopColor={light} />
            <stop offset="0.55" stopColor={colour} />
            <stop offset="1" stopColor={dark} />
          </radialGradient>
        </defs>
        <path d="M30 0 V64" stroke="#c9a24a" strokeWidth="1" />
        <circle cx="30" cy="66" r="3" stroke="#c9a24a" strokeWidth="1.2" fill="none" />
        <rect x="24" y="67.5" width="12" height="7" rx="1.5" fill="#d8b260" />
        <path d="M26 67.5 V74.5 M30 67.5 V74.5 M34 67.5 V74.5" stroke="#8a6420" strokeWidth="0.7" />
        <circle cx="30" cy="100" r="26" fill={`url(#${id})`} />
        {decoration === 0 && (
          <g stroke={trim} strokeWidth="2" fill="none" opacity="0.85">
            <path d="M5.2 92 Q30 98 54.8 92" />
            <path d="M4.6 106 Q30 112 55.4 106" />
          </g>
        )}
        {decoration === 1 && (
          <g fill={trim} opacity="0.85">
            {[[18, 92], [30, 89], [42, 92], [14, 104], [26, 101], [38, 101], [48, 105], [22, 113], [36, 114]].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" />
            ))}
          </g>
        )}
        {decoration === 2 && (
          <g stroke={trim} strokeWidth="1.4" strokeLinecap="round" opacity="0.85">
            <path d="M30 89 V111 M20.5 94.5 L39.5 105.5 M20.5 105.5 L39.5 94.5" />
            <path d="M27 91 L30 93.5 L33 91 M27 109 L30 106.5 L33 109" fill="none" />
          </g>
        )}
        <ellipse cx="20.5" cy="89" rx="6" ry="3.6" fill="#fff" opacity="0.35" transform="rotate(-35 20.5 89)" />
        <path className="xm-bauble__glint" d="M47 80 L48.4 84.6 L53 86 L48.4 87.4 L47 92 L45.6 87.4 L41 86 L45.6 84.6 Z" fill="#fffaf0" />
      </svg>
    </div>
  );
}

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "../../hooks";
import { onRounds } from "../flight";

/** A small, stable random generator, so the snow falls the same way on every visit. */
function random(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Depth = { tile: number; flakes: number; radius: [number, number]; light: [number, number]; seed: number };

/**
 * Two depths of snow: far flakes, small, faint and slow; a few near ones, larger and a little faster.
 * Few enough that the night stays dark: about one flake every 120 pixels.
 */
const depths: Record<"far" | "near", Depth> = {
  far: { tile: 420, flakes: 10, radius: [0.7, 1.2], light: [0.2, 0.38], seed: 24 },
  near: { tile: 560, flakes: 4, radius: [1.4, 2.1], light: [0.28, 0.46], seed: 1225 },
};

/** One tile of snow, as an image that repeats down and across the sky. */
function tile({ tile: size, flakes, radius, light, seed }: Depth): string {
  const next = random(seed);
  const between = (low: number, high: number) => low + next() * (high - low);
  let circles = "";
  for (let i = 0; i < flakes; i++) {
    const r = between(...radius);
    const x = between(r + 1, size - r - 1).toFixed(1);
    const y = between(r + 1, size - r - 1).toFixed(1);
    circles += `<circle cx='${x}' cy='${y}' r='${r.toFixed(2)}' fill-opacity='${between(...light).toFixed(2)}'/>`;
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' fill='%23f4f1ea'>${circles}</svg>`;
  return `url("data:image/svg+xml,${svg.replace(/</g, "%3C").replace(/>/g, "%3E")}")`;
}

function Snow({ depth }: { depth: "far" | "near" }) {
  const settings = depths[depth];
  const style = { "--xm-tile": `${settings.tile}px`, backgroundImage: tile(settings) } as CSSProperties;
  return (
    <div className="xm-snow" data-depth={depth}>
      <div className="xm-snow__fall" style={style} />
    </div>
  );
}

/** Santa's sleigh and four reindeer, far away: a silhouette, as seen against the moon. */
function DistantSleigh() {
  const deer = (x: number) => (
    <g key={x} transform={`translate(${x} 0)`}>
      <ellipse cx="12" cy="10" rx="6" ry="2.7" />
      <path d="M7.5 9.5 L4.4 5 L1.2 5.2 L1.6 3.9 L4.8 3.5 L8.8 8 Z" />
      <path d="M4.4 4 L5.4 0.6 M5 2 L7 1.2 M3.8 4 L2.8 1" stroke="currentColor" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <path d="M8 11 L4.4 13.6 M9.4 11.5 L6.6 15 M15.4 11 L19.4 13.2 M16.6 11 L19.6 14.6" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" />
    </g>
  );
  return (
    <svg viewBox="0 0 132 24" width="132" height="24">
      <path d="M17 9 L102 13" stroke="currentColor" strokeWidth="0.6" />
      {[0, 20, 40, 60].map(deer)}
      <circle cx="113" cy="7" r="3.4" />
      <path d="M118 6 L123 10 L117 9 Z" />
      <path d="M100 16 C98 10 102 9 105 11 L113 11.5 C115 6 120 5 122 8 L121 18 L104 18 Z" />
      <path d="M96 20.5 H123 M96 20.5 C93.5 20.5 93.5 17.5 96 17.5" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** When the sleigh first crosses the moon by itself, how often after that, and how fast it flies. */
const firstCrossing = 25_000;
const betweenCrossings = 95_000;
const unhurried = 150;
/**
 * After the sleigh leaves the stack, how long until it shows up in the sky, and how fast it crosses
 * then: fast enough to be gone before it lands on the stack again, so there is never two of it.
 */
const roundsDelay = 1200;
const hurried = 330;

/**
 * Behind the site: a winter night. A faint moon, a little snow falling slowly in two depths, and now
 * and then Santa's sleigh crossing the moon, far away; it also crosses after it leaves the stack.
 * Readers who ask for less motion get the moon and the snow, still, and no crossings.
 */
export function WinterSky() {
  const reduced = useReducedMotion();
  const moon = useRef<HTMLSpanElement>(null);
  const flyer = useRef<HTMLDivElement>(null);
  const [crossing, setCrossing] = useState(0);
  const speed = useRef(unhurried);

  useEffect(() => {
    if (reduced) return;
    let delayed = 0;
    const cross = (pixelsPerSecond: number) => {
      if (document.hidden) return;
      speed.current = pixelsPerSecond;
      setCrossing((n) => n + 1);
    };
    const first = window.setTimeout(() => cross(unhurried), firstCrossing);
    const every = window.setInterval(() => cross(unhurried), betweenCrossings);
    const off = onRounds(() => {
      window.clearTimeout(delayed);
      delayed = window.setTimeout(() => cross(hurried), roundsDelay);
    });
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(delayed);
      window.clearInterval(every);
      off();
    };
  }, [reduced]);

  // Each crossing flies a straight line from past the right edge to past the left one, through the moon.
  useEffect(() => {
    const element = flyer.current;
    const disc = moon.current?.getBoundingClientRect();
    if (!crossing || !element || !disc) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const through = { x: disc.left + disc.width / 2, y: disc.top + disc.height / 2 };
    const from = { x: width + 90, y: through.y + height * 0.07 + 24 };
    const to = { x: -90, y: through.y - height * 0.04 };
    const tilt = (a: { x: number; y: number }, b: { x: number; y: number }) => (Math.atan2(a.y - b.y, a.x - b.x) * 180) / Math.PI;
    const first = Math.hypot(from.x - through.x, from.y - through.y);
    const second = Math.hypot(through.x - to.x, through.y - to.y);
    const at = (point: { x: number; y: number }, angle: number) => `translate(${point.x}px, ${point.y}px) rotate(${angle}deg)`;
    const animation = element.animate(
      [
        { transform: at(from, tilt(from, through)), opacity: 1 },
        { transform: at(through, (tilt(from, through) + tilt(through, to)) / 2), opacity: 1, offset: first / (first + second) },
        { transform: at(to, tilt(through, to)), opacity: 1 },
      ],
      { duration: ((first + second) / speed.current) * 1000, easing: "linear", fill: "both" },
    );
    return () => animation.cancel();
  }, [crossing]);

  return (
    <div className="xm-sky">
      <span ref={moon} className="xm-moon" />
      {!reduced && crossing > 0 && (
        <div key={crossing} ref={flyer} className="xm-crossing">
          <DistantSleigh />
        </div>
      )}
      <Snow depth="far" />
      <Snow depth="near" />
    </div>
  );
}

import { useEffect, useState } from "react";
import { useReducedMotion } from "../../hooks";

type Kind = "circle" | "arc" | "dimension" | "corners" | "guide";
type Drawing = { id: number; kind: Kind; x: number; y: number; size: number; angle: number };

const kinds: Kind[] = ["circle", "arc", "dimension", "corners", "guide"];

/** The wait between two drawings, in milliseconds: never in a rhythm. */
const shortest = 2600;
const longest = 5600;
/** How many drawings are kept: each lives about six seconds, so the oldest is long gone when dropped. */
const kept = 4;

/** One construction drawing, centred on its own origin; every line has a length of 1 to be drawn in. */
function Construction({ kind, size }: { kind: Kind; size: number }) {
  const r = size / 2;
  switch (kind) {
    case "circle":
      return (
        <>
          <circle r={r} pathLength={1} />
          <path d="M-7 0 H7 M0 -7 V7" pathLength={1} />
        </>
      );
    case "arc":
      return (
        <>
          <path d={`M${-r} 0 A${r} ${r} 0 0 1 ${r} 0`} pathLength={1} />
          <path d={`M${-r} 0 H${r}`} pathLength={1} />
        </>
      );
    case "dimension":
      return (
        <>
          <path d={`M${-r} 0 H${r} M${-r} -6 V6 M${r} -6 V6`} pathLength={1} />
          <text y={-7}>{Math.round(size)}</text>
        </>
      );
    case "corners": {
      const w = r * 1.4;
      const h = r * 0.9;
      const c = Math.min(18, r / 3);
      return (
        <path
          d={`M${-w} ${-h + c} V${-h} H${-w + c} M${w - c} ${-h} H${w} V${-h + c} M${w} ${h - c} V${h} H${w - c} M${-w + c} ${h} H${-w} V${h - c}`}
          pathLength={1}
        />
      );
    }
    case "guide":
      return (
        <>
          <path d={`M${-r} ${r * 0.45} L${r} ${-r * 0.45}`} pathLength={1} />
          <circle cx={-r} cy={r * 0.45} r={3} pathLength={1} />
          <circle cx={r} cy={-r * 0.45} r={3} pathLength={1} />
        </>
      );
  }
}

/**
 * Behind the site, someone sketching: now and then a faint construction line, a circle, an arc or a
 * dimension, draws itself somewhere, lingers and fades, as on the blueprint behind Xcode’s hammer.
 * Readers who ask for less motion get no sketches.
 */
export function Sketch() {
  const reduced = useReducedMotion();
  const [drawings, setDrawings] = useState<Drawing[]>([]);

  useEffect(() => {
    if (reduced) return;
    let id = 0;
    let timer = 0;
    const next = () => {
      timer = window.setTimeout(
        () => {
          if (!document.hidden) {
            const drawing: Drawing = {
              id: ++id,
              kind: kinds[Math.floor(Math.random() * kinds.length)],
              x: window.innerWidth * (0.06 + Math.random() * 0.88),
              y: window.innerHeight * (0.1 + Math.random() * 0.8),
              size: 90 + Math.random() * 170,
              angle: Math.round(Math.random() * 8) * 22.5,
            };
            setDrawings((list) => [...list.slice(1 - kept), drawing]);
          }
          next();
        },
        shortest + Math.random() * (longest - shortest),
      );
    };
    next();
    return () => window.clearTimeout(timer);
  }, [reduced]);

  return (
    <svg className="x-sketch">
      {drawings.map((drawing) => (
        <g key={drawing.id} className="x-sketch__drawing" transform={`translate(${drawing.x} ${drawing.y}) rotate(${drawing.angle})`}>
          <Construction kind={drawing.kind} size={drawing.size} />
        </g>
      ))}
    </svg>
  );
}

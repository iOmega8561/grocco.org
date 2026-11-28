import { useEffect, useState } from "react";
import { useReducedMotion } from "../../hooks";
import { startRounds } from "../flight";
import { PresentShape, wrappings } from "./Present";

type Phase = "arriving" | "here" | "leaving" | "gone";

/** How long Santa is away on his rounds before he lands again: long enough to cross the moon. */
const awayFor = 7000;
/** How many presents he leaves on the stack at most. */
const mostPresents = 3;

/** A reindeer in profile, facing left, its legs in two pairs that gallop while it flies. */
function Deer({ x, coat, shade }: { x: number; coat: string; shade: string }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <g className="xm-deer__legs xm-deer__legs--back" stroke={shade} strokeWidth="3.8" strokeLinecap="round" fill="none">
        <path d="M44 82 L46.5 92 L44.5 103" />
        <path d="M49.5 82 L52.5 92 L51.5 103" />
      </g>
      <g className="xm-deer__legs xm-deer__legs--front" stroke={shade} strokeWidth="3.8" strokeLinecap="round" fill="none">
        <path d="M20.5 83 L19.5 93 L21.5 103" />
        <path d="M26 83 L26 93 L28 103" />
      </g>
      <g transform="translate(0 4)">
        <path d="M54 65 C59.5 60 62.5 65.5 58 69.5 Z" fill="#efe6d6" />
        <path d="M12.5 70 C12.5 61.5 22 58.5 34 59 C47 59.5 57 63 57 71 C57 79.5 47.5 83 34 83 C21.5 83 12.5 78.5 12.5 70 Z" fill={coat} />
        <path d="M19 78 C26 82.5 43 82.5 51 78 C45 81 27 81.5 19 78 Z" fill="#efe6d6" opacity="0.5" />
        <path d="M17 71 C13 64.5 9.5 58 8.5 50.5 L18 48.5 C19 55 22 60 28.5 63 Z" fill={coat} />
        <path d="M10.5 53 C11.5 59.5 14 64.5 18.5 68.5 C15 62 14 57 14 53 Z" fill="#efe6d6" opacity="0.55" />
        <path d="M24 61 C21.8 68 21.8 75.5 25 82" stroke="#b3262e" strokeWidth="3.2" fill="none" />
        <circle cx="22.8" cy="71" r="1.7" fill="#f0c06a" />
        <circle cx="15.5" cy="61" r="2.2" fill="#f0c06a" />
        <g stroke="#d9c3a0" strokeWidth="1.7" strokeLinecap="round" fill="none">
          <path d="M14.5 43.5 C14.5 37 18 31 24 27.5 M17 37 L12.5 31 M20 31.5 L19 25.5 M22 29 L27.5 25" />
          <path d="M11.5 43.5 C10.5 38 12 33 15.5 29.5 M11.6 37.5 L7 34 M13.2 33 L10.5 27.5" />
        </g>
        <path d="M1 50 C0.5 46.8 3.8 44.6 8 43.6 C12.2 42.2 18 42.8 20 47 C21 51.2 18 54.4 12.8 54.4 C8 55.4 3 53.4 1 50 Z" fill={coat} />
        <path d="M17 45.5 L23.5 41.5 L20.5 47.5 Z" fill={shade} />
        <circle cx="12.6" cy="47.6" r="1.1" fill="#140d08" />
        <circle cx="2.2" cy="49.4" r="1.5" fill="#2a1a10" />
      </g>
    </g>
  );
}

/** Santa in his sleigh behind two reindeer, all original, facing left as the stack's headline does. */
function SleighShape() {
  return (
    <svg viewBox="0 0 240 110" width="240" height="110">
      <defs>
        <linearGradient id="xm-sleigh-paint" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d6353c" />
          <stop offset="0.6" stopColor="#b3262e" />
          <stop offset="1" stopColor="#7e1a20" />
        </linearGradient>
        <linearGradient id="xm-coat" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9363d" />
          <stop offset="1" stopColor="#a8232a" />
        </linearGradient>
      </defs>
      <g className="xm-sleigh__shadow" fill="#000" opacity="0.4">
        <ellipse cx="36" cy="104.5" rx="22" ry="2.4" />
        <ellipse cx="94" cy="104.5" rx="22" ry="2.4" />
        <ellipse cx="190" cy="104.5" rx="46" ry="2.6" />
      </g>

      <path d="M178 68 C150 64 114 66 88 70 M88 70 C68 67 46 67 30 70" stroke="#c9a24a" strokeWidth="1" fill="none" opacity="0.85" />
      <Deer x={60} coat="#86593a" shade="#5f3e28" />
      <Deer x={4} coat="#9a6a46" shade="#6f4a31" />

      <g stroke="#e2b350" strokeWidth="3.2" strokeLinecap="round" fill="none">
        <path d="M234 104 H150 C138 104 132 96 136 89 C139 84 146 86 145 91" />
        <path d="M162 104 V93 M214 104 V93" strokeWidth="2.6" />
      </g>

      <path d="M205 83 C203 70 207 60 215 58 C218 52 224 53 223 59 C229 65 229 76 227 83 Z" fill="#7a5233" />
      <path d="M215 58.5 C218 60.5 221 60.5 223 59" stroke="#e2b350" strokeWidth="1.3" fill="none" />
      <path d="M184 83 C182 70 186 60 196 58 C206 58 212 66 212 83 Z" fill="url(#xm-coat)" />
      <path d="M187 54 C186 62 190 68.5 196 68.5 C202 68.5 205 62 204.5 54 C200 57 191 57 187 54 Z" fill="#f4f1ea" />
      <circle cx="195.6" cy="50" r="6.4" fill="#f0c3a6" />
      <path d="M189.8 54 C191.5 52 194.5 52.4 195.6 54 C196.7 52.4 199.7 52 201.4 54 C199.5 56.2 196.6 55.6 195.6 55 C194.6 55.6 191.7 56.2 189.8 54 Z" fill="#f4f1ea" />
      <circle cx="195.6" cy="52.2" r="1.5" fill="#e3937f" />
      <circle cx="192.8" cy="49.2" r="0.9" fill="#2a1a10" />
      <circle cx="198.4" cy="49.2" r="0.9" fill="#2a1a10" />
      <path d="M189 45.5 C190 37 199 34 205.5 38 C210.5 41 213 46 214 51.5 C210 48.5 206 46.5 202.5 45.5 Z" fill="url(#xm-coat)" />
      <path d="M187.5 46.5 C187.5 43.5 204 43.5 204 46.5 C204 48.6 187.5 48.6 187.5 46.5 Z" fill="#f4f1ea" />
      <circle cx="214.4" cy="52" r="3" fill="#f4f1ea" />
      <path d="M191 64 C186 66.5 181.5 68 178.5 68" stroke="#b9282f" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="177.5" cy="68" r="3.1" fill="#1f5440" />

      <path
        d="M152 95 C142 89 141 73 150 68.5 C155 66 159.5 70 157.5 74 C162 80 172 82.5 184 82.5 L212 82.5 C213 70 216 58 224 52 C229 49 235 52 233 58 L229 95 Z"
        fill="url(#xm-sleigh-paint)"
      />
      <path d="M157.5 74 C162 80 172 82.5 184 82.5 L212 82.5 C213 70 216 58 224 52" stroke="#e2b350" strokeWidth="1.6" fill="none" />
      <circle cx="150.5" cy="71.5" r="2.6" stroke="#e2b350" strokeWidth="1.3" fill="none" />
      <path d="M160 89 H226" stroke="#e2b350" strokeWidth="1" opacity="0.55" />

      <g className="xm-sleigh__breath" fill="#f4f1ea">
        <circle cx="0" cy="54" r="2.2" />
        <circle cx="56" cy="54" r="2.2" />
      </g>
    </svg>
  );
}

/**
 * The one bold thing: Santa's sleigh, landed in the snow on top of the stack once it has built.
 * Clicked, the reindeer take off, a present drops off the back onto the stack, the sleigh crosses the
 * moon behind the site on its rounds, and a little later it lands again. Readers who ask for less
 * motion get the present without the flight.
 */
export function Sleigh() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduced ? "here" : "arriving");
  const [first, setFirst] = useState(true);
  const [presents, setPresents] = useState(0);

  useEffect(() => {
    if (phase !== "gone") return;
    const timer = window.setTimeout(() => setPhase("arriving"), awayFor);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const leave = () => {
    if (phase !== "here") return;
    setPresents((n) => Math.min(n + 1, mostPresents));
    if (reduced) return;
    setFirst(false);
    setPhase("leaving");
    startRounds();
  };

  return (
    <>
      <div className="xm-presents">
        {Array.from({ length: presents }, (_, i) => (
          <PresentShape key={i} className="xm-presents__one" {...wrappings[i]} />
        ))}
      </div>
      <div
        className="xm-sleigh"
        data-phase={phase}
        data-first={first ? "" : undefined}
        onClick={leave}
        onAnimationEnd={(event) => {
          if (event.target !== event.currentTarget) return;
          if (phase === "arriving") setPhase("here");
          if (phase === "leaving") setPhase("gone");
        }}
      >
        <SleighShape />
      </div>
    </>
  );
}

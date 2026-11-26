import { useEffect, useRef, useState } from "react";
import { useSeen } from "../../hooks";

function GhostShape({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 110 124" width="110" height="124">
      <defs>
        <linearGradient id="hw-sheet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6f1f8" />
          <stop offset="1" stopColor="#d6cae2" />
        </linearGradient>
      </defs>
      <path
        d="M52 6 C26 6 12 26 12 54 L12 106 Q20 97 28 107 Q36 117 44 107 Q52 97 60 107 Q68 117 76 107 Q84 97 92 106 L92 54 C92 26 78 6 52 6 Z"
        fill="url(#hw-sheet)"
      />
      <path className="hw-ghost__hand" d="M91 62 Q104 52 104 64 Q104 74 91 76 Z" fill="url(#hw-sheet)" />
      <g className="hw-ghost__eyes" fill="#1c1326">
        <ellipse cx="44" cy="46" rx="5" ry="7.5" />
        <ellipse cx="66" cy="46" rx="5" ry="7.5" />
      </g>
      <ellipse cx="55" cy="66" rx="5" ry="6.5" fill="#1c1326" />
    </svg>
  );
}

/** How long the ghost stays hidden at least, and how near the pointer may be when it comes back. */
const hideFor = 2200;
const recheckEvery = 600;
const margin = 32;

/**
 * Peeks in from the left edge of the black panel once it is on screen, and hides from the pointer.
 * Hiding is decided once and held: the ghost comes back only after a while, and only when the pointer
 * has left the place it would come back to. A plain :hover would flicker, because the ghost
 * leaves the pointer as it hides and returns as soon as it has left it.
 */
export function PeekingGhost() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useSeen(ref);
  const [hiding, setHiding] = useState(false);
  // Where the pointer was last seen; it may rest there without moving again.
  const pointer = useRef({ x: -1, y: -1 });

  useEffect(() => {
    if (!hiding) return;
    const move = (event: PointerEvent) => {
      pointer.current = { x: event.clientX, y: event.clientY };
    };
    window.addEventListener("pointermove", move, { passive: true });

    let timer = 0;
    const check = () => {
      const element = ref.current;
      if (!element) return;
      // Where the ghost will be once back: its peeking position, read off the hidden one.
      const box = element.getBoundingClientRect();
      const back = box.left + box.width * 0.5;
      const { x, y } = pointer.current;
      const near = x >= back - margin && x <= back + box.width + margin && y >= box.top - margin && y <= box.bottom + margin;
      if (near) timer = window.setTimeout(check, recheckEvery);
      else setHiding(false);
    };
    timer = window.setTimeout(check, hideFor);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", move);
    };
  }, [hiding]);

  return (
    <div
      ref={ref}
      className="hw-peek"
      data-seen={seen ? "" : undefined}
      data-hiding={hiding ? "" : undefined}
      onPointerEnter={(event) => {
        pointer.current = { x: event.clientX, y: event.clientY };
        if (seen) setHiding(true);
      }}
    >
      <GhostShape className="hw-ghost" />
    </div>
  );
}

/** On the missing page: a ghost looking around for it. */
export function LostGhost() {
  return (
    <div className="hw-lost">
      <GhostShape className="hw-ghost" />
    </div>
  );
}

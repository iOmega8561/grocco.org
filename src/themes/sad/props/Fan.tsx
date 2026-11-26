import { useRef } from "react";

/** The fan’s seven blades, each one turned a seventh of the way round from the last. */
const blades = Array.from({ length: 7 }, (_, i) => (i * 360) / 7);

/** How a spin-up unfolds: up to three times the speed in under half a second, held, then winding down. */
function speedAt(t: number): number {
  if (t < 0.4) return 1 + 2 * (t / 0.4);
  if (t < 1.8) return 3;
  if (t < 4) return 3 - 2 * ((t - 1.8) / 2.2);
  return 1;
}

/**
 * A server fan on the footer, turning. Clicked, it spins up for a moment and winds down again. Readers
 * who ask for less motion get it still.
 */
export function Fan() {
  const rotor = useRef<SVGGElement>(null);
  const spinning = useRef(false);

  const spinUp = () => {
    const animation = rotor.current?.getAnimations()[0];
    if (!animation || spinning.current) return;
    spinning.current = true;
    const start = performance.now();
    const step = (now: number) => {
      const t = (now - start) / 1000;
      animation.updatePlaybackRate(speedAt(t));
      if (t < 4) requestAnimationFrame(step);
      else spinning.current = false;
    };
    requestAnimationFrame(step);
  };

  return (
    <div className="sa-fan" onClick={spinUp}>
      <svg viewBox="0 0 48 48" width="48" height="48">
        <rect x="1" y="1" width="46" height="46" rx="6" className="sa-fan__frame" />
        {[6, 42].flatMap((x) => [6, 42].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.7" className="sa-fan__hole" />))}
        <circle cx="24" cy="24" r="20.5" className="sa-fan__opening" />
        <g ref={rotor} className="sa-fan__blades">
          {blades.map((angle) => (
            <path key={angle} d="M24 17.5 C27 13 31 9.5 36 8.6 C35.4 13 32.6 17.6 28.4 20.6 Z" transform={`rotate(${angle} 24 24)`} />
          ))}
          <circle cx="24" cy="24" r="6.5" className="sa-fan__hub" />
          <circle cx="24" cy="24" r="3.6" className="sa-fan__sticker" />
        </g>
        <g className="sa-fan__grille">
          <circle cx="24" cy="24" r="10.5" />
          <circle cx="24" cy="24" r="16" />
          <circle cx="24" cy="24" r="20.5" />
          <path d="M24 3.5 V17.5 M24 30.5 V44.5 M3.5 24 H17.5 M30.5 24 H44.5" />
        </g>
      </svg>
    </div>
  );
}

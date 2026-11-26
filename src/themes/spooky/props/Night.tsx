import { useEffect, useState } from "react";
import { useReducedMotion } from "../../hooks";

/** How long after the page opens the first flight comes, and how long between flights. */
const firstFlight = 3500;
const betweenFlights = 60_000;

function FlyingBat() {
  return (
    <svg viewBox="0 0 80 40" width="80" height="40">
      <g className="hw-flyer__bat">
      <g className="hw-flyer__wings">
        <path d="M37 19 Q26 4 4 10 Q11 15 9 22 Q16 19 20 26 Q26 21 31 28 Q34 23 37 24 Z" />
        <path d="M43 19 Q54 4 76 10 Q69 15 71 22 Q64 19 60 26 Q54 21 49 28 Q46 23 43 24 Z" />
      </g>
      <ellipse cx="40" cy="23" rx="5" ry="8" />
      <path d="M36 15 L35.5 8 L39 12 L41 12 L44.5 8 L44 15 Q40 19 36 15 Z" />
      </g>
    </svg>
  );
}

/**
 * Over the whole site: a thin fog at the bottom of the screen and, now and then, a few bats
 * crossing the top. Readers who asked for less motion get neither the bats nor the drift.
 */
export function Night() {
  const reduced = useReducedMotion();
  const [flight, setFlight] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const launch = () => {
      if (!document.hidden) setFlight((n) => n + 1);
    };
    const first = window.setTimeout(launch, firstFlight);
    const every = window.setInterval(launch, betweenFlights);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(every);
    };
  }, [reduced]);

  return (
    <>
      <div className="hw-fog" />
      {!reduced && flight > 0 && (
        // A new key restarts the animation; flights alternate their direction.
        <div key={flight} className="hw-flight" data-reverse={flight % 2 === 0 ? "" : undefined}>
          <div className="hw-flyer" style={{ top: "14vh", width: 64, animationDelay: "0s" }}>
            <FlyingBat />
          </div>
          <div className="hw-flyer" style={{ top: "21vh", width: 48, animationDelay: "0.7s" }}>
            <FlyingBat />
          </div>
          <div className="hw-flyer" style={{ top: "10vh", width: 40, animationDelay: "1.3s" }}>
            <FlyingBat />
          </div>
        </div>
      )}
    </>
  );
}

import { useState } from "react";

/**
 * The missing page, as a sysadmin sees it: a network port with its cable hanging out. Clicked, the
 * plug goes in, the link light blinks, and it drops out again: the page still does not exist.
 */
export function Cable() {
  const [trying, setTrying] = useState(false);

  return (
    <div
      className="sa-cable"
      data-trying={trying ? "" : undefined}
      onClick={() => setTrying(true)}
      // The link light blinks for every reader, with or without motion, so its end ends the attempt.
      onAnimationEnd={(event) => {
        if (event.animationName === "sa-link") setTrying(false);
      }}
    >
      <svg viewBox="0 0 90 200" width="90" height="200">
        <defs>
          <linearGradient id="sa-cable-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.55" stopColor="var(--sa-cable)" />
            <stop offset="1" stopColor="var(--sa-cable)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="sa-cable__port">
          <rect x="23" y="0" width="44" height="38" rx="4" className="sa-cable__panel" />
          <path d="M31 10 H59 V29 H51 V33 H39 V29 H31 Z" className="sa-cable__socket" />
          <circle cx="28.5" cy="5.5" r="1.9" className="sa-cable__led" />
          <circle cx="61.5" cy="5.5" r="1.9" className="sa-cable__led sa-cable__led--act" />
        </g>
        <g className="sa-cable__plug">
          <path d="M45 112 C45 140 30 150 34 176 C36 188 44 196 46 200" fill="none" stroke="url(#sa-cable-fade)" strokeWidth="7" strokeLinecap="round" />
          <rect x="37" y="98" width="16" height="15" rx="3" fill="var(--sa-cable)" />
          <rect x="32" y="70" width="26" height="29" rx="2" className="sa-cable__body" />
          <g className="sa-cable__contacts">
            {[35, 38, 41, 44, 47, 50, 53, 56].map((x) => (
              <path key={x} d={`M${x - 0.5} 71.5 V77`} />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}

import { useState } from "react";

/**
 * The one bold thing: a jack-o'-lantern sitting on the top slab of the stack.
 * It lands after the stack has built, glows, and goes out (or lights again) when clicked.
 */
export function Pumpkin() {
  const [lit, setLit] = useState(true);
  // Remounting the smoke on every extinguish replays its puff.
  const [puffs, setPuffs] = useState(0);

  return (
    <div
      className="hw-pumpkin"
      data-lit={lit ? "" : undefined}
      onClick={() => {
        if (lit) setPuffs((n) => n + 1);
        setLit(!lit);
      }}
    >
      <svg viewBox="0 0 120 108" width="120" height="108">
        <defs>
          <radialGradient id="hw-flame" cx="50%" cy="60%" r="60%">
            <stop offset="0" stopColor="#fff2b8" />
            <stop offset="0.55" stopColor="#ffc24a" />
            <stop offset="1" stopColor="#ff8a1c" />
          </radialGradient>
          <radialGradient id="hw-skin" cx="38%" cy="32%" r="75%">
            <stop offset="0" stopColor="#ff9b3d" />
            <stop offset="0.6" stopColor="#f06f12" />
            <stop offset="1" stopColor="#b9480b" />
          </radialGradient>
        </defs>
        <ellipse cx="60" cy="102" rx="40" ry="5" fill="#000" opacity="0.45" />
        <path d="M57 26 C56 18 58 10 66 5 C69 4 71 7 69 9 C64 13 63 19 64 27 Z" fill="#55602c" />
        <ellipse cx="33" cy="64" rx="25" ry="36" fill="#b9480b" />
        <ellipse cx="87" cy="64" rx="25" ry="36" fill="#b9480b" />
        <ellipse cx="47" cy="63" rx="22" ry="38" fill="#d95c0d" />
        <ellipse cx="73" cy="63" rx="22" ry="38" fill="#d95c0d" />
        <ellipse cx="60" cy="62" rx="19" ry="39" fill="url(#hw-skin)" />
        <g className="hw-pumpkin__face">
          <path d="M35 57 L51 57 L44 42 Z" />
          <path d="M69 57 L85 57 L76 42 Z" />
          <path d="M56 68 L64 68 L60 61 Z" />
          <path d="M31 74 L41 77 L45 83 L51 78 L60 80 L69 78 L75 83 L79 77 L89 74 Q60 106 31 74 Z" />
        </g>
      </svg>
      {!lit && puffs > 0 && <span key={puffs} className="hw-pumpkin__smoke" />}
    </div>
  );
}

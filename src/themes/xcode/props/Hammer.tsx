import { useEffect, useState } from "react";
import { useReducedMotion } from "../../hooks";

type Phase = "idle" | "building" | "succeeded";

/** How long the stack takes to build again: its slabs land 0.09s apart, each in 0.8s. */
const buildTime = 1200;
/** How long the bezel stays up. */
const shownFor = 1800;

/**
 * An original claw hammer, set down on the top of the stack: steel head standing on its face, the
 * hickory handle resting along the sheet.
 */
function HammerShape() {
  return (
    <svg viewBox="0 0 160 70" width="160" height="70">
      <defs>
        <linearGradient id="x-steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7d848d" />
          <stop offset="0.45" stopColor="#eef1f4" />
          <stop offset="1" stopColor="#8b929b" />
        </linearGradient>
        <linearGradient id="x-hickory" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9a067" />
          <stop offset="1" stopColor="#a8703f" />
        </linearGradient>
      </defs>
      <g className="x-hammer__body">
        <line x1="121" y1="38" x2="12" y2="64.5" stroke="url(#x-hickory)" strokeWidth="10" strokeLinecap="round" />
        <g stroke="#8d5c33" strokeWidth="1" opacity="0.55">
          <path d="M22 57.4 l2.2 9.2 M28 56 l2.2 9.2 M34 54.5 l2.2 9.2" />
        </g>
        <path d="M145 28 C143 12 128 3 103 2 L106 8.5 C121 10.5 128 17 127 30 Z" fill="url(#x-steel)" />
        <rect x="127" y="22" width="18" height="32" rx="2" fill="url(#x-steel)" />
        <rect x="119" y="30" width="10" height="16" rx="1.5" fill="url(#x-steel)" />
        <rect x="123" y="52" width="26" height="18" rx="3" fill="url(#x-steel)" />
      </g>
    </svg>
  );
}

/**
 * Xcode’s hammer, on the stack. Pressed, it strikes, the stack builds again from the bottom up as it
 * did when the page opened, and a bezel reports that the build succeeded. Readers who ask for less
 * motion get the report without the strike or the build.
 */
export function Hammer() {
  const reduced = useReducedMotion();
  const [builds, setBuilds] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    if (phase === "idle") return;
    const timer = window.setTimeout(
      () => setPhase(phase === "building" ? "succeeded" : "idle"),
      phase === "building" ? (reduced ? 0 : buildTime) : shownFor,
    );
    return () => window.clearTimeout(timer);
  }, [phase, reduced]);

  return (
    <>
      <span
        className="x-hammer"
        // Two names in turn, so every build starts the stack’s animation over.
        data-build={builds === 0 ? undefined : builds % 2 ? "a" : "b"}
        data-phase={phase}
        onClick={() => {
          if (phase !== "idle") return;
          setBuilds((n) => n + 1);
          setPhase("building");
        }}
      >
        <HammerShape />
      </span>
      {phase === "succeeded" && (
        <span className="x-hud">
          <svg viewBox="0 0 24 24" width="30" height="30">
            <circle cx="12" cy="12" r="11" />
            <path d="M7 12.5 l3.2 3.2 L17 8.8" />
          </svg>
          Build Succeeded
        </span>
      )}
    </>
  );
}

import type { SlotProps } from "../../types";
import { seed } from "../../hooks";

/** Asleep upside down at the top of a project page; each page picks its side, always the same one. */
export function HangingBat({ pathname }: SlotProps) {
  const side = seed(pathname) % 2 === 0 ? "left" : "right";
  return (
    <div className="hw-hanging" data-side={side}>
      <svg viewBox="0 0 56 76" width="56" height="76">
        <path d="M24 0 L24 8 M32 0 L32 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M28 8 C14 10 10 26 13 44 C16 52 20 56 28 58 C36 56 40 52 43 44 C46 26 42 10 28 8 Z" fill="currentColor" />
        <path d="M13 22 C6 30 6 44 13 50 M43 22 C50 30 50 44 43 50" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M20 58 L18 72 L25 64 Q28 66 31 64 L38 72 L36 58 Z" fill="currentColor" />
        <path d="M24 61 Q25 63 26 61 M30 61 Q31 63 32 61" stroke="#ff8a2a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

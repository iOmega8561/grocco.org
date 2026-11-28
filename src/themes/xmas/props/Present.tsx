/** The wrappings a present can come in: paper, then ribbon. */
export const wrappings = [
  { paper: "#b3262e", ribbon: "#f0c06a" },
  { paper: "#1f5440", ribbon: "#f4f1ea" },
  { paper: "#e2b350", ribbon: "#b3262e" },
] as const;

type Props = { paper: string; ribbon: string; className?: string };

/**
 * A wrapped present, seen from the front: the box, a ribbon down its middle, the lid and a bow. The
 * box is dark inside, under the lid, for the one that gets opened.
 */
export function PresentShape({ paper, ribbon, className }: Props) {
  return (
    <svg className={className} viewBox="0 0 36 36" width="36" height="36">
      <path className="xm-present__inside" d="M5 14 L8 10 H28 L31 14 Z" fill="#06090d" />
      <rect x="4" y="14" width="28" height="21" rx="1.5" fill={paper} />
      <rect x="4" y="14" width="28" height="2.5" fill="#000" opacity="0.22" />
      <rect x="16" y="14" width="4" height="21" fill={ribbon} />
      <g className="xm-present__lid">
        <rect x="2" y="9" width="32" height="6.5" rx="1.5" fill={paper} />
        <rect x="2" y="9" width="32" height="2.5" rx="1.2" fill="#fff" opacity="0.14" />
        <rect x="16" y="9" width="4" height="6.5" fill={ribbon} />
        <path d="M18 9.5 C13 2 6 3.5 9 8 C10.5 10 14 9.8 18 9.5 Z M18 9.5 C23 2 30 3.5 27 8 C25.5 10 22 9.8 18 9.5 Z" fill={ribbon} />
        <circle cx="18" cy="9" r="1.8" fill={ribbon} />
      </g>
    </svg>
  );
}

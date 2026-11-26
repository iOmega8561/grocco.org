/**
 * Warp, as the starfield draws it:
 * - "arrive": dropping out of warp, when the page opens
 * - "pass": a short stretch between two pages
 * - "jump": going to warp, when the flagship leaves
 */
export type WarpKind = "arrive" | "pass" | "jump";

const eventName = "trek:warp";

/** Asks the starfield for a warp effect, from anywhere in the theme. */
export function engageWarp(kind: WarpKind): void {
  window.dispatchEvent(new CustomEvent<WarpKind>(eventName, { detail: kind }));
}

export function onWarp(handler: (kind: WarpKind) => void): () => void {
  const listener = (event: Event) => handler((event as CustomEvent<WarpKind>).detail);
  window.addEventListener(eventName, listener);
  return () => window.removeEventListener(eventName, listener);
}

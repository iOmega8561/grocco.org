/**
 * Santa's rounds, as the sky draws them: when the sleigh leaves the stack, it crosses the moon in the
 * backdrop on its way.
 */
const eventName = "xmas:rounds";

/** Asks the sky for a crossing of the moon, from anywhere in the theme. */
export function startRounds(): void {
  window.dispatchEvent(new CustomEvent(eventName));
}

export function onRounds(handler: () => void): () => void {
  window.addEventListener(eventName, handler);
  return () => window.removeEventListener(eventName, handler);
}

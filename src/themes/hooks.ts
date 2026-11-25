import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";

/** Helpers for themes' decorations. */

const reducedQuery = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void) {
  const query = window.matchMedia(reducedQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Whether the reader asked for less motion, live. Decorations then stay still. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReduced, () => window.matchMedia(reducedQuery).matches, () => true);
}

/**
 * Becomes true the first time the slot holding the element comes well into view, and stays true.
 * It watches the slot (its host's area) rather than the element, which may start off screen.
 */
export function useSeen(ref: RefObject<Element | null>): boolean {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || seen) return;
    const target = element.closest(".theme-slot") ?? element;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setSeen(true);
      },
      { rootMargin: "0px 0px -40% 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [ref, seen]);
  return seen;
}

/** A stable number from a string, so a page always gets the same "random" choice. */
export function seed(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

import { useSyncExternalStore } from "react";

const darkQuery = "(prefers-color-scheme: dark)";

/** The scheme forced on the root (by a theme), or null when the page follows the reader. */
function forcedScheme(): "light" | "dark" | null {
  const value = document.documentElement.getAttribute("data-theme");
  return value === "light" || value === "dark" ? value : null;
}

function subscribe(onChange: () => void) {
  const query = window.matchMedia(darkQuery);
  query.addEventListener("change", onChange);
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => {
    query.removeEventListener("change", onChange);
    observer.disconnect();
  };
}

/** The scheme the page is drawn in, live: the one forced by a theme, else the reader's. */
export function useColorScheme(): { dark: boolean; forced: boolean } {
  const forced = useSyncExternalStore(subscribe, forcedScheme, () => null);
  const prefersDark = useSyncExternalStore(subscribe, () => window.matchMedia(darkQuery).matches, () => false);
  return { dark: forced ? forced === "dark" : prefersDark, forced: forced !== null };
}

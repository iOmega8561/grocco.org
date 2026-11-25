import type { ThemeDefinition } from "./types";

const root = () => document.documentElement;

/** The page's own state before any theme touched it, so turning a theme off restores it exactly. */
let original: { scheme: string | null; colors: (string | null)[] } | null = null;

function themeColorTags(): HTMLMetaElement[] {
  return [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')];
}

/**
 * Puts a theme on the root element, or takes it off with `null`:
 * `data-skin` scopes the theme's CSS, `data-theme` forces its scheme (the tokens already obey it),
 * and the browser chrome takes the theme's colour.
 */
export function applyTheme(theme: ThemeDefinition | null): void {
  const element = root();
  const tags = themeColorTags();
  original ??= { scheme: element.getAttribute("data-theme"), colors: tags.map((tag) => tag.getAttribute("content")) };

  if (theme) element.setAttribute("data-skin", theme.id);
  else element.removeAttribute("data-skin");

  const scheme = theme?.scheme ?? original.scheme;
  if (scheme) element.setAttribute("data-theme", scheme);
  else element.removeAttribute("data-theme");

  tags.forEach((tag, index) => {
    const color = theme?.themeColor ?? original?.colors[index];
    if (color) tag.setAttribute("content", color);
  });
}

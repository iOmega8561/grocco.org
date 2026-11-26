import type { MonthDay, ThemeDefinition } from "./types";

/**
 * Every folder in `themes/` with a `theme.ts` that default-exports `defineTheme({ … })` is a theme.
 * Only the definitions are bundled up front; a theme's code and CSS load when it turns on.
 */
const modules = import.meta.glob<{ default: ThemeDefinition }>("./*/theme.ts", { eager: true });

export const themes: ThemeDefinition[] = Object.values(modules)
  .map((module) => module.default)
  .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.id.localeCompare(b.id));

const seen = new Set<string>();
for (const theme of themes) {
  if (!/^[a-z][a-z0-9-]*$/.test(theme.id)) throw new Error(`Theme id "${theme.id}" must be lowercase letters, digits and hyphens`);
  if (seen.has(theme.id)) throw new Error(`Two themes use the id "${theme.id}"`);
  seen.add(theme.id);
}

export function themeById(id: string | null | undefined): ThemeDefinition | undefined {
  return themes.find((theme) => theme.id === id);
}

function monthDay(value: MonthDay): number {
  const [month, day] = value.split("-").map(Number);
  return month * 100 + day;
}

/** Whether the theme's window contains the given day. */
export function isInWindow(theme: ThemeDefinition, date: Date): boolean {
  if (typeof theme.when === "function") return theme.when(date);
  const today = (date.getMonth() + 1) * 100 + date.getDate();
  const from = monthDay(theme.when.from);
  const to = monthDay(theme.when.to);
  return from <= to ? today >= from && today <= to : today >= from || today <= to;
}

/** The theme the calendar asks for today, if any. */
export function themeForDate(date: Date): ThemeDefinition | undefined {
  return themes.find((theme) => isInWindow(theme, date));
}

/* ---------- The reader's choices ---------- */

const previewKey = "skin-preview";

/**
 * The first day of the occurrence that contains `date`, found by walking back while the window still
 * holds. Turning a theme off lasts that occurrence only: a window over the new year stays off into
 * January, and a theme with two separate days a year comes back on the second one.
 */
function occurrenceStart(theme: ThemeDefinition, date: Date): string {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  for (let i = 0; i < 366; i++) {
    const before = new Date(day);
    before.setDate(day.getDate() - 1);
    if (!isInWindow(theme, before)) break;
    day.setTime(before.getTime());
  }
  return `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
}

const offKey = (theme: ThemeDefinition, date: Date) => `skin-off:${theme.id}:${occurrenceStart(theme, date)}`;

function read(storage: () => Storage, key: string): string | null {
  try {
    return storage().getItem(key);
  } catch {
    return null;
  }
}

function write(storage: () => Storage, key: string, value: string | null): void {
  try {
    if (value === null) storage().removeItem(key);
    else storage().setItem(key, value);
  } catch {
    // Storage may be off; the choice then lasts as long as the page.
  }
}

const session = () => window.sessionStorage;
const local = () => window.localStorage;

/**
 * `?skin=<id>` previews a theme on any day, `?skin=none` previews the site without themes and
 * `?skin=auto` goes back to the calendar. The preview lasts for the browser tab.
 */
function previewFromAddress(): string | null {
  const value = new URLSearchParams(window.location.search).get("skin");
  if (value === null) return read(session, previewKey);
  if (value === "auto") {
    write(session, previewKey, null);
    return null;
  }
  if (value === "none" || themeById(value)) {
    write(session, previewKey, value);
    return value;
  }
  return read(session, previewKey);
}

export type ThemeChoice = {
  /** The theme that applies today, by calendar or by preview, whether or not the reader turned it off. */
  scheduled: ThemeDefinition | null;
  /** Whether the reader turned it off for this occurrence. */
  off: boolean;
};

export function resolveTheme(date = new Date()): ThemeChoice {
  const preview = previewFromAddress();
  if (preview === "none") return { scheduled: null, off: false };
  const scheduled = themeById(preview) ?? themeForDate(date) ?? null;
  // A preview is a deliberate request: it ignores an earlier "off".
  const off = scheduled !== null && !preview && read(local, offKey(scheduled, date)) === "1";
  return { scheduled, off };
}

/** Remembers, until the occasion comes round again, that the reader wants the theme off (or on again). */
export function rememberOff(theme: ThemeDefinition, off: boolean, date = new Date()): void {
  write(local, offKey(theme, date), off ? "1" : null);
}

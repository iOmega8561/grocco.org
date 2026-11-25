import type { ComponentType } from "react";
import type { Localized } from "../i18n/languages";

/**
 * The places where a theme may put something of its own. Each slot covers its host element
 * (`position: absolute; inset: 0`) and lets clicks through, so whatever a theme puts there
 * positions itself inside the host and never moves the content around it.
 *
 * A slot is a contract: renaming or removing one here makes every theme that fills it fail
 * the type check.
 */
export const slotNames = [
  /** Over the stack of the home page, the five slabs. */
  "hero.stack",
  /** Over the black panel of the featured project. */
  "featured",
  /** Over the timeline section of the home page. */
  "timeline",
  /** Over the heading of a project page. */
  "project.hero",
  /** Over the footer, on every page. */
  "footer",
  /** Over the page that does not exist. */
  "notFound",
] as const;

export type SlotName = (typeof slotNames)[number];

/** What every slot component receives: enough to vary deterministically by page. */
export type SlotProps = { slot: SlotName; pathname: string };

/** The code of a theme, loaded only while the theme is on. Importing it also brings its CSS. */
export type ThemeModule = {
  /** Components to render inside the slots, by slot name. */
  slots?: Partial<Record<SlotName, ComponentType<SlotProps>>>;
  /** Mounted once over the whole site, fixed to the viewport: weather, fog, flights of bats. */
  overlay?: ComponentType;
};

/** "MM-DD", the month and day a window opens or closes, both included. */
export type MonthDay = `${number}-${number}`;

export type ThemeWindow =
  /** A fixed window that repeats every year; `to` before `from` wraps over the new year. */
  | { from: MonthDay; to: MonthDay }
  /** Any rule, for dates that move (Easter, the fourth Thursday of November…). */
  | ((date: Date) => boolean);

export type ThemeDefinition = {
  /** Unique, lowercase; it is the value of `data-skin` on the root and of `?skin=` in the address. */
  id: string;
  /** A noun phrase with its article, as it reads in the footer switch: "the Halloween theme", "il tema di Halloween". */
  name: Localized<string>;
  /** When the theme turns on by itself, in the reader's own time zone. */
  when: ThemeWindow;
  /** Higher wins when two windows overlap. Defaults to 0. */
  priority?: number;
  /** Forces the light or dark scheme while the theme is on. Left out, the theme follows the reader. */
  scheme?: "light" | "dark";
  /** Browser chrome colour (`<meta name="theme-color">`) while the theme is on. */
  themeColor?: string;
  load: () => Promise<ThemeModule>;
};

/** Gives a theme file its type, like `defineProject` does for projects. */
export function defineTheme(theme: ThemeDefinition): ThemeDefinition {
  return theme;
}

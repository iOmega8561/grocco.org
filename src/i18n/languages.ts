/**
 * Registry of the languages the site is published in.
 *
 * To add a language:
 *   1. add it here (the order is the order of the language switch);
 *   2. create `messages/<code>.ts`, typed as `Messages`;
 *   3. register the messages in `messages/index.ts`.
 * Project content can be translated whenever you like: any language a project
 * does not provide falls back to `defaultLanguage`.
 */
export const languages = {
  it: { label: "Italiano", locale: "it-IT" },
  en: { label: "English", locale: "en-US" },
} as const;

export type Lang = keyof typeof languages;

export const defaultLanguage: Lang = "en";

export const languageCodes = Object.keys(languages) as Lang[];

export function isLang(value: string | undefined): value is Lang {
  return value !== undefined && Object.hasOwn(languages, value);
}

/** The best language for a first visit, from the browser's preferences. */
export function preferredLanguage(): Lang {
  const candidates = typeof navigator === "undefined" ? [] : navigator.languages ?? [navigator.language];
  for (const candidate of candidates) {
    const code = candidate.toLowerCase().split("-")[0];
    if (isLang(code)) return code;
  }
  return defaultLanguage;
}

/** A value given in one or more languages; the default language is required. */
export type Localized<T> = { [L in typeof defaultLanguage]: T } & Partial<Record<Lang, T>>;

export function pick<T>(value: Localized<T>, lang: Lang): T {
  return (value[lang] ?? value[defaultLanguage]) as T;
}

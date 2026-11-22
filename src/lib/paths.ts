import type { Lang } from "../i18n/languages";

export const paths = {
  home: (lang: Lang) => `/${lang}`,
  work: (lang: Lang) => `/${lang}#work`,
  project: (lang: Lang, slug: string) => `/${lang}/work/${slug}`,
  cv: (lang: Lang) => `/${lang}/cv`,
};

/** The same page in another language: swaps the first path segment. */
export function translatePath(pathname: string, to: Lang): string {
  const segments = pathname.split("/").filter(Boolean);
  segments[0] = to;
  return "/" + segments.join("/");
}

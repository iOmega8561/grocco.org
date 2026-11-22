import data from "../generated/github.json";

export type RepoStats = { stars: number; pushedAt: string; language: string | null };

type GitHubData = { fetchedAt: string | null; repos: Record<string, RepoStats> };

const github = data as GitHubData;

/** Stats fetched at build time by `scripts/sync-github.mjs`, or undefined if they never were. */
export function repoStats(repo: string | undefined): RepoStats | undefined {
  return repo ? github.repos[repo] : undefined;
}

const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
  ["second", 1],
];

/** "3 days ago", "tre giorni fa"… in the reader’s language. */
export function relativeTime(date: Date, locale: string, now = new Date()): string {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size || unit === "second") return format.format(Math.round(seconds / size), unit);
  }
  return format.format(0, "second");
}

/** "4 d 7 h", for uptimes. Uses the reader’s language through Intl.DurationFormat where available. */
export function duration(totalSeconds: number, locale: string): string {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const parts = days > 0 ? { days, hours } : hours > 0 ? { hours, minutes } : { minutes };
  const DurationFormat = (Intl as unknown as { DurationFormat?: new (l: string, o: object) => { format(d: object): string } }).DurationFormat;
  if (DurationFormat) return new DurationFormat(locale, { style: "narrow" }).format(parts);
  return Object.entries(parts).map(([unit, value]) => `${value} ${unit[0]}`).join(" ");
}

import { defineTheme } from "../types";

/** The day of the year, from 1 on 1 January; counted in UTC so a change of clocks can't shift it. */
function dayOfYear(date: Date): number {
  const today = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const newYearsEve = Date.UTC(date.getFullYear(), 0, 0);
  return (today - newYearsEve) / 86_400_000;
}

/**
 * Xcode, for the Day of the Programmer: the 256th day of the year, the largest power of two that fits
 * in one. 13 September, or 12 September in a leap year.
 */
export default defineTheme({
  id: "xcode",
  name: { en: "the Xcode theme", it: "il tema Xcode" },
  when: (date) => dayOfYear(date) === 256,
  scheme: "dark",
  themeColor: "#1f1f24",
  load: () => import("./index"),
});

import { defineTheme } from "../types";

/**
 * Two days a year: Star Trek Day (8 September, the first episode aired in 1966) and
 * First Contact Day (5 April 2063, in the story).
 */
export default defineTheme({
  id: "trek",
  name: { en: "the Star Trek theme", it: "il tema di Star Trek" },
  when: (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return (month === 9 && day === 8) || (month === 4 && day === 5);
  },
  scheme: "dark",
  themeColor: "#04060c",
  load: () => import("./index"),
});

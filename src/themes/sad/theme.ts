import { defineTheme } from "../types";

/** Sysadmin Day: the last Friday of July, since 2000. July has 31 days, so its last Friday is on or after the 25th. */
export default defineTheme({
  id: "sad",
  name: { en: "the Sysadmin Day theme", it: "il tema del Sysadmin Day" },
  when: (date) => date.getMonth() === 6 && date.getDay() === 5 && date.getDate() >= 25,
  scheme: "dark",
  themeColor: "#0b0c0e",
  load: () => import("./index"),
});

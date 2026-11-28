import { defineTheme } from "../types";

/** Christmas Eve and Christmas Day. */
export default defineTheme({
  id: "xmas",
  name: { en: "the Christmas theme", it: "il tema di Natale" },
  when: { from: "12-24", to: "12-25" },
  scheme: "dark",
  themeColor: "#0c1219",
  load: () => import("./index"),
});

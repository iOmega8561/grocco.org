import { defineTheme } from "../types";

/** The last days of October, ending on Halloween night. */
export default defineTheme({
  id: "spooky",
  name: { en: "the Halloween theme", it: "il tema di Halloween" },
  when: { from: "10-30", to: "10-31" },
  scheme: "dark",
  themeColor: "#0d0b12",
  load: () => import("./index"),
});

import { site } from "../../config/site";

const title = "font: 700 16px/1.6 ui-monospace, Menlo, monospace";
const line = "font: 400 12px/1.6 ui-monospace, Menlo, monospace";

const copy = {
  en: {
    title: "Happy Programmers’ Day",
    why: "Day 256 of the year: as many as the values a byte can hold.",
    reach: "If you’re reading this, we’d probably get along:",
  },
  it: {
    title: "Buona Giornata del programmatore",
    why: "Il 256º giorno dell’anno: tanti quanti i valori di un byte.",
    reach: "Se stai leggendo qui, probabilmente andremmo d’accordo:",
  },
};

/**
 * A note in the browser’s console, for the readers the day is about: the ones who open the
 * developer tools. Written once, when the theme loads, in the language of the address.
 */
export function greet(): void {
  const text = window.location.pathname.startsWith("/it") ? copy.it : copy.en;
  const contact = site.email || site.github;
  console.log(`%c${text.title}\n%c${text.why}\n${text.reach} ${contact}`, title, line);
}

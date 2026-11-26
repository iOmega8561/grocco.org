import { site } from "../../config/site";

const bold = "font: 700 13px/1.7 ui-monospace, Menlo, monospace";
const plain = "font: 400 12px/1.7 ui-monospace, Menlo, monospace";

const copy = {
  en: {
    login: "Last login:",
    from: "from your browser",
    welcome: "Welcome to grocco.org.",
    lines: [
      "Happy Sysadmin Day: the last Friday of July, since 2000.",
      "To the people who keep the systems running: thank you.",
    ],
    live: "The server behind this site reports its own state further down the home page.",
  },
  it: {
    login: "Ultimo accesso:",
    from: "dal tuo browser",
    welcome: "Benvenuto su grocco.org.",
    lines: [
      "Buon Sysadmin Day: l’ultimo venerdì di luglio, dal 2000.",
      "A chi tiene in piedi i sistemi: grazie.",
    ],
    live: "Il server dietro questo sito riporta il proprio stato più in basso nella home.",
  },
};

/**
 * A message of the day in the browser’s console, as a server greets whoever logs in to it. Written
 * once, when the theme loads, in the language of the address.
 */
export function motd(): void {
  const lang = window.location.pathname.startsWith("/it") ? "it" : "en";
  const text = copy[lang];
  const now = new Intl.DateTimeFormat(lang, {
    weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).format(new Date());
  const lines = site.statusUrl ? [...text.lines, text.live] : text.lines;
  console.log(
    `%c${text.login} ${now} ${text.from}\n%c${text.welcome}\n%c${lines.map((line) => ` * ${line}`).join("\n")}`,
    plain, bold, plain,
  );
}

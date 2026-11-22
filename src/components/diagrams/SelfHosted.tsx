import { useI18n } from "../../i18n/context";
import { pick, type Localized } from "../../i18n/languages";
import { Arrow, Box, DiagramFrame } from "./Frame";

const strings: Localized<Record<string, string>> = {
  en: {
    label: "The browser loads the static site and reads the live status from Cloudflare Pages. Every five minutes, a systemd timer on my server sends the state of its containers to the status endpoint, which keeps the last report in Workers KV.",
    browser: "Your browser",
    pages: "Cloudflare Pages",
    pagesSub: "The site and its endpoint",
    site: "The site, as static files",
    api: "/api/status",
    apiSub: "Checks the token, keeps the time",
    kv: "Workers KV: the last report",
    push: "HTTPS",
    server: "My server",
    serverSub: "Rootless Podman",
    agent: "status-agent",
    agentSub: "every 5 minutes",
  },
  it: {
    label: "Il browser carica il sito statico e legge lo stato in tempo reale da Cloudflare Pages. Ogni cinque minuti, un timer di systemd sul mio server invia lo stato dei suoi container all’endpoint, che conserva l’ultimo aggiornamento in Workers KV.",
    browser: "Il tuo browser",
    pages: "Cloudflare Pages",
    pagesSub: "Il sito e il suo endpoint",
    site: "Il sito, come file statici",
    api: "/api/status",
    apiSub: "Verifica il token, segna l’ora",
    kv: "Workers KV: l’ultimo stato",
    push: "HTTPS",
    server: "Il mio server",
    serverSub: "Podman rootless",
    agent: "status-agent",
    agentSub: "ogni 5 minuti",
  },
};

export function SelfHostedDiagram() {
  const { lang } = useI18n();
  const s = pick(strings, lang);
  return (
    <DiagramFrame label={s.label} width={760} height={300}>
      <Box x={10} y={115} w={140} h={70} title={s.browser} />
      <Box x={190} y={20} w={310} h={270} title={s.pages} sub={s.pagesSub} strong />
      <Box x={208} y={90} w={274} h={44} title={s.site} />
      <Box x={208} y={150} w={274} h={62} title={s.api} sub={s.apiSub} />
      <Box x={208} y={228} w={274} h={44} title={s.kv} />
      <Box x={550} y={60} w={200} h={190} title={s.server} sub={s.serverSub} strong />
      <Box x={568} y={150} w={164} h={62} title={s.agent} sub={s.agentSub} />
      <Arrow d="M150 140 C175 140 180 112 204 112" />
      <Arrow d="M150 160 C175 160 180 181 204 181" />
      <Arrow d="M568 181 H486" label={s.push} lx={527} ly={170} />
      <Arrow d="M345 212 V224" />
    </DiagramFrame>
  );
}

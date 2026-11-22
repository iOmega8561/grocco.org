import { useI18n } from "../../i18n/context";
import { pick, type Localized } from "../../i18n/languages";
import { Arrow, Box, DiagramFrame } from "./Frame";

const strings: Localized<Record<string, string>> = {
  en: {
    label: "The browser loads the static site from Cloudflare Pages, and reads the live status through a Cloudflare Tunnel that reaches containers on my server. A systemd timer writes the status.",
    browser: "Your browser",
    pages: "Cloudflare Pages",
    pagesSub: "The site, as static files",
    tunnel: "Cloudflare Tunnel",
    tunnelSub: "No open ports at home",
    server: "My server",
    serverSub: "Rootless Podman, Quadlet units",
    cloudflared: "cloudflared",
    web: "status-web",
    agent: "status-agent",
    agentSub: "systemd timer, reads Podman",
  },
  it: {
    label: "Il browser carica il sito statico da Cloudflare Pages e legge lo stato in tempo reale attraverso un Cloudflare Tunnel che raggiunge i container sul mio server. Un timer di systemd scrive lo stato.",
    browser: "Il tuo browser",
    pages: "Cloudflare Pages",
    pagesSub: "Il sito, come file statici",
    tunnel: "Cloudflare Tunnel",
    tunnelSub: "Nessuna porta aperta in casa",
    server: "Il mio server",
    serverSub: "Podman rootless, unità Quadlet",
    cloudflared: "cloudflared",
    web: "status-web",
    agent: "status-agent",
    agentSub: "timer systemd, legge Podman",
  },
};

export function SelfHostedDiagram() {
  const { lang } = useI18n();
  const s = pick(strings, lang);
  return (
    <DiagramFrame label={s.label} width={760} height={300}>
      <Box x={10} y={110} w={150} h={70} title={s.browser} />
      <Box x={210} y={20} w={200} h={80} title={s.pages} sub={s.pagesSub} />
      <Box x={210} y={190} w={200} h={80} title={s.tunnel} sub={s.tunnelSub} />
      <Box x={460} y={20} w={290} h={270} title={s.server} sub={s.serverSub} strong />
      <Box x={478} y={90} w={254} h={44} title={s.cloudflared} />
      <Box x={478} y={150} w={254} h={44} title={s.web} />
      <Box x={478} y={210} w={254} h={62} title={s.agent} sub={s.agentSub} />
      <Arrow d="M160 132 C185 132 185 60 206 60" />
      <Arrow d="M160 158 C185 158 185 230 206 230" />
      <Arrow d="M410 230 C440 230 445 112 474 112" />
      <Arrow d="M605 134 V146" />
      <Arrow d="M605 208 V198" />
    </DiagramFrame>
  );
}

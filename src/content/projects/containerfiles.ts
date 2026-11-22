import { defineProject } from "../types";

const supervisor = `[program:tigervnc]
priority=0
command=/usr/bin/Xvnc -rfbport 5900 -SecurityTypes None -AlwaysShared -AcceptSetDesktopSize :0
autorestart=true

[program:novnc]
priority=1
command=/usr/bin/novnc_server --listen 0.0.0.0:6080 --vnc localhost:5900 --file-only
autorestart=true

[program:xfce4]
priority=2
command=/usr/bin/dbus-run-session -- xfce4-session
environment=DISPLAY=:0
autorestart=true`;

const uxplay = `FROM docker.io/alpine:latest as STAGE1
RUN apk add --no-cache build-base git cmake pkgconfig \\
        libx11-dev openssl-dev libplist-dev avahi-dev \\
        gstreamer-dev gst-plugins-base-dev
RUN git clone https://github.com/FDH2/UxPlay.git && \\
    mkdir build && cd build && cmake ../UxPlay && make

# Only the binary and its runtime libraries reach the final image.
FROM docker.io/alpine:latest
COPY --from=STAGE1 /root/build/uxplay /usr/local/bin/uxplay
RUN apk add --no-cache openssl libplist avahi avahi-compat-libdns_sd \\
        gst-plugins-good gst-plugins-bad gst-libav pipewire pipewire-alsa && \\
    adduser -D -u 1000 default

USER default
ENTRYPOINT ["/usr/local/bin/uxplay"]`;

const workflow = `on:
  schedule:
    - cron: '0 0 1 * *'  # 1st of every month at midnight UTC
  workflow_dispatch:

jobs:
  prepare:
    steps:
      - id: set-matrix
        run: |
          SERVICES=$(jq -c '.services' .github/workflows/deploy.json)
          echo "services=$SERVICES" >> $GITHUB_OUTPUT
  build:
    needs: prepare
    strategy:
      matrix:
        service: \${{ fromJSON(needs.prepare.outputs.services) }}`;

export default defineProject({
  slug: "containerfiles",
  name: "Containerfiles",
  order: 110,
  layers: ["container", "system"],
  years: "2023 – 2026",
  stack: ["Podman", "Containerfile", "GitHub Actions", "GitHub Container Registry"],
  repo: "iOmega8561/Containerfiles",
  links: [{ kind: "source", url: "https://github.com/iOmega8561/Containerfiles" }],
  accent: { light: "#7d2a94", dark: "#d9a2f0" },
  copy: {
    en: {
      tagline: "The images my homelab runs on.",
      summary: "Containerfiles for the services of my home infrastructure, written for rootless Podman, rebuilt every month and published on the GitHub Container Registry.",
      blocks: [
        {
          type: "statement",
          text: "A whole desktop, in a container, in a browser tab.",
          detail:
            "alpine-vnc packs an XFCE desktop with Firefox into an Alpine image and serves it two ways: to any VNC client, and to any browser through noVNC. Throwaway workstations, isolated browsing, a graphical tool on a headless server.",
        },
        {
          type: "prose",
          title: "Three processes, one container",
          paragraphs: [
            "A desktop needs a display server, a session and, here, a web gateway. Rather than a shell script that starts them and hopes, supervisord runs all three in order, restarts any that falls over and sends every log to the container’s output, where Podman and journald collect them.",
            "The VNC server asks for no password, deliberately: like EasyVNC, the image assumes it lives behind a VPN or a private network, never exposed to the internet. The desktop runs as a regular user rather than root, and a D-Bus machine id is generated at build time so the session starts cleanly.",
          ],
        },
        { type: "code", file: "alpine-vnc/supervisord.conf", language: "ini", code: supervisor },
        {
          type: "code",
          title: "Build where the tools are, ship only the result",
          file: "uxplay/Containerfile",
          language: "dockerfile",
          caption: "An AirPlay receiver: compiled in a first stage with the whole toolchain, then copied into a clean image that runs as an unprivileged user.",
          code: uxplay,
        },
        {
          type: "prose",
          title: "Rebuilt every month, without me",
          paragraphs: [
            "Images rot: their base gets security fixes they never receive. A scheduled workflow reads the list of services from a JSON file, builds each one with Podman in a matrix of parallel jobs and pushes it to the GitHub Container Registry, tagged and labelled with OCI metadata pointing back to its source.",
            "Adding an image to the schedule is adding one name to a list.",
          ],
        },
        { type: "code", file: ".github/workflows/deploy.yml", language: "yaml", code: workflow },
        {
          type: "features",
          title: "Also in the collection",
          items: [
            { title: "Unbound", body: "A recursive DNS resolver, so the homelab asks the root servers directly instead of a provider." },
            { title: "Ollama and WebNUT", body: "A local language model runtime, and a web dashboard for the UPS that keeps the server up." },
            { title: "Remote desktops and gaming", body: "An RDP desktop next to the VNC one, and a Wine environment for games with DXVK and VKD3D-Proton." },
          ],
        },
      ],
    },
    it: {
      tagline: "Le immagini su cui gira il mio homelab.",
      summary: "Containerfile per i servizi della mia infrastruttura domestica, scritti per Podman rootless, ricostruiti ogni mese e pubblicati sul GitHub Container Registry.",
      blocks: [
        {
          type: "statement",
          text: "Un’intera scrivania, in un container, in una scheda del browser.",
          detail:
            "alpine-vnc racchiude una scrivania XFCE con Firefox in un’immagine Alpine e la serve in due modi: a qualsiasi client VNC, e a qualsiasi browser tramite noVNC. Postazioni usa e getta, navigazione isolata, uno strumento grafico su un server senza schermo.",
        },
        {
          type: "prose",
          title: "Tre processi, un container",
          paragraphs: [
            "Una scrivania ha bisogno di un server grafico, di una sessione e, qui, di un gateway web. Invece di uno script che li avvia e spera, supervisord li esegue tutti e tre in ordine, riavvia quello che cade e manda ogni log all’output del container, dove Podman e journald li raccolgono.",
            "Il server VNC non chiede password, di proposito: come EasyVNC, l’immagine presume di vivere dietro una VPN o una rete privata, mai esposta su internet. La scrivania gira con un utente normale anziché root, e un identificativo D-Bus viene generato in fase di build perché la sessione parta pulita.",
          ],
        },
        { type: "code", file: "alpine-vnc/supervisord.conf", language: "ini", code: supervisor },
        {
          type: "code",
          title: "Compila dove ci sono gli strumenti, distribuisci solo il risultato",
          file: "uxplay/Containerfile",
          language: "dockerfile",
          caption: "Un ricevitore AirPlay: compilato in un primo stadio con tutta la toolchain, poi copiato in un’immagine pulita che gira con un utente senza privilegi.",
          code: uxplay,
        },
        {
          type: "prose",
          title: "Ricostruite ogni mese, senza di me",
          paragraphs: [
            "Le immagini invecchiano: la loro base riceve correzioni di sicurezza che loro non vedono mai. Un workflow programmato legge l’elenco dei servizi da un file JSON, costruisce ciascuno con Podman in una matrice di job paralleli e lo pubblica sul GitHub Container Registry, con le etichette OCI che rimandano al sorgente.",
            "Aggiungere un’immagine alla programmazione significa aggiungere un nome a un elenco.",
          ],
        },
        { type: "code", file: ".github/workflows/deploy.yml", language: "yaml", code: workflow },
        {
          type: "features",
          title: "Anche nella collezione",
          items: [
            { title: "Unbound", body: "Un resolver DNS ricorsivo, perché l’homelab chieda direttamente ai root server invece che a un provider." },
            { title: "Ollama e WebNUT", body: "Un ambiente per modelli linguistici locali, e un pannello web per il gruppo di continuità che tiene acceso il server." },
            { title: "Scrivanie remote e gaming", body: "Una scrivania RDP accanto a quella VNC, e un ambiente Wine per i giochi con DXVK e VKD3D-Proton." },
          ],
        },
      ],
    },
  },
});

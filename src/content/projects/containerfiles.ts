import { defineProject } from "../types";

const supervisor = `[program:tigervnc]
priority=0
command=/usr/bin/Xvnc -rfbport 5900 -SecurityTypes None -AlwaysShared -AcceptKeyEvents -AcceptPointerEvents -AcceptSetDesktopSize -SendCutText -AcceptCutText :0
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

const unbound = `[Container]
Image=localhost/unbound:latest
User=unbound
PublishPort=127.0.0.1:1053:53/udp
PublishPort=127.0.0.1:1053:53/tcp

# Port 53 without NET_BIND_SERVICE: only this network namespace is affected.
Sysctl=net.ipv4.ip_unprivileged_port_start=53
Volume=%h/.config/unbound/unbound.conf:/etc/unbound/unbound.conf:ro,Z

# Immutable root filesystem with nothing writable at all, and least privilege.
ReadOnly=true
ReadOnlyTmpfs=false
DropCapability=ALL
NoNewPrivileges=true
PidsLimit=64`;

const uxplay = `ARG ALPINE_VERSION=3.23
FROM docker.io/library/alpine:\${ALPINE_VERSION} AS builder
ARG UXPLAY_VERSION=v1.73.4
RUN apk add --no-cache build-base git cmake pkgconf libx11-dev openssl-dev \\
        libplist-dev avahi-dev gstreamer-dev gst-plugins-base-dev
RUN git clone --depth 1 --branch "\${UXPLAY_VERSION}" https://github.com/FDH2/UxPlay.git && \\
    cmake -S UxPlay -B build -DCMAKE_BUILD_TYPE=Release -DNO_MARCH_NATIVE=ON && \\
    cmake --build build --parallel && strip build/uxplay

# Only the binary and its runtime libraries reach the final image.
FROM docker.io/library/alpine:\${ALPINE_VERSION}
RUN apk add --no-cache libgcc libstdc++ libx11 libcrypto3 libssl3 libplist \\
        avahi-compat-libdns_sd gstreamer gst-plugins-base gst-plugins-good \\
        gst-plugins-bad gst-libav gst-plugin-pipewire && \\
    addgroup -g 1000 uxplay && adduser -D -u 1000 -G uxplay uxplay
COPY --from=builder /src/build/uxplay /usr/local/bin/uxplay

USER 1000:1000
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

const video = {
  type: "video",
  src: "/media/xalpine-desktop.mp4",
  poster: "/media/xalpine-desktop-poster.webp",
  frame: "window",
} as const;

export default defineProject({
  slug: "containerfiles",
  name: "Containerfiles",
  order: 110,
  layers: ["container", "system"],
  years: "2023 – 2026",
  stack: ["Podman", "Quadlet", "Containerfile", "systemd", "GitHub Actions", "GitHub Container Registry"],
  repo: "iOmega8561/Containerfiles",
  links: [{ kind: "source", url: "https://github.com/iOmega8561/Containerfiles" }],
  accent: { light: "#7d2a94", dark: "#d9a2f0" },
  copy: {
    en: {
      tagline: "The images my homelab runs on.",
      summary:
        "Containerfiles and Quadlet units for the services of my home infrastructure, written for rootless Podman: read-only images, no capabilities unless an image declares one, rebuilt every month on the GitHub Container Registry.",
      blocks: [
        {
          type: "statement",
          text: "A whole desktop, in a container, in a browser tab.",
          detail:
            "XAlpine packs an XFCE desktop with Firefox into an Alpine image and serves it two ways: to any VNC client, and to any browser through noVNC. Throwaway workstations, isolated browsing, a graphical tool on a headless server.",
        },
        {
          ...video,
          alt: "An XFCE desktop in a browser: noVNC connects, the desktop resizes to fill the window, the file manager opens the home folder, Firefox measures 670 Mbps on fast.com, and a sentence from the clipboard panel is pasted into a terminal.",
          caption:
            "XAlpine through noVNC: the desktop follows the size of the browser window, and text typed into noVNC’s clipboard panel is pasted into the desktop’s terminal.",
        },
        {
          type: "prose",
          title: "Three processes, one container",
          paragraphs: [
            "A desktop needs a display server, a session and, here, a web gateway. Rather than a shell script that starts them and hopes, supervisord runs all three in order, restarts any that falls over and sends every log to the container’s output, where Podman and journald collect them.",
            "The VNC server asks for no password, deliberately: like EasyVNC, the image assumes it lives behind a VPN or a private network, never exposed to the internet. The desktop runs as a regular user rather than root, and a D-Bus machine id is generated at build time so the session starts cleanly.",
          ],
        },
        { type: "code", file: "xalpine/supervisord.conf", language: "ini", code: supervisor },
        {
          type: "prose",
          title: "Read-only and without capabilities, by default",
          paragraphs: [
            "Every image ships with its Quadlet unit, and every unit starts from the same profile: a read-only root filesystem, all Linux capabilities dropped, no privilege escalation, limits on memory, processes and core dumps. What an image needs to write is declared one path at a time: a named volume for what has to survive, a tmpfs for what must not.",
            "The profile is tested, not assumed. The desktop, Firefox included, the resolver and the model runtime all start with every capability mask at zero. Where an image didn’t fit, the fix went into its configuration rather than into an exception.",
            "Only the images that reach into my session map their user onto mine: UxPlay, to draw on Wayland and play through PipeWire, and the Podman engine, to read the SSH keys in my home. The others run as users that are nobody outside their namespace, and whose files belong to subordinate IDs I never log in as.",
          ],
        },
        {
          type: "table",
          title: "One profile, declared exceptions",
          caption:
            "Every unit also sets a read-only root filesystem and no-new-privileges. Loopback is the default: VNC, noVNC and the Ollama API ask for no password, so reaching them from elsewhere takes a VPN address chosen on purpose.",
          columns: ["", "Runs as", "Capabilities", "Writable", "Network"],
          rows: [
            ["XAlpine", "Its own user", "None", "Home volume, /tmp, runtime directory", "Loopback"],
            ["UxPlay", "My user", "None", "/tmp", "Host, for AirPlay discovery"],
            ["Unbound", "Its own user", "None", "Nothing", "Loopback"],
            ["Ollama", "Its own user", "None", "Model volume, /tmp", "Loopback"],
            ["Podman", "My user", "SYS_ADMIN, NET_ADMIN", "Home volume, runtime directories", "Loopback, SSH only"],
          ],
        },
        {
          type: "code",
          title: "Port 53, without NET_BIND_SERVICE",
          file: "unbound/unbound.container",
          language: "ini",
          caption:
            "Unbound’s stock configuration expects a whole system: it starts as root, binds port 53, then switches user and keeps a control socket in /run. The container’s configuration starts it as its own user instead, and the unit lowers the unprivileged port limit inside the container’s network namespace, so port 53 takes no capability and nothing on disk is ever written.",
          code: unbound,
        },
        {
          type: "code",
          title: "Build where the tools are, ship only the result",
          file: "uxplay/Containerfile",
          language: "dockerfile",
          caption:
            "An AirPlay receiver: compiled in a first stage with the whole toolchain, from pinned Alpine and UxPlay versions, then copied into a clean image that runs as an unprivileged user. Its unit hands it the Wayland, PipeWire and D-Bus sockets, and no capability.",
          code: uxplay,
        },
        {
          type: "prose",
          title: "The one that needs more",
          paragraphs: [
            "One image can’t follow the profile: Podman itself. It packs a rootless engine, Buildah and an SSH server, with storage of its own, for a remote shell where containers can be built and broken without touching the machine they run on.",
            "A nested engine has to create user namespaces, mount filesystems and set up networks, so its unit adds SYS_ADMIN and NET_ADMIN, the FUSE and TUN devices, and lifts seccomp: one line each, in plain sight, rather than privileged mode. The outer container is still rootless, so those capabilities count only inside a user namespace owned by my unprivileged account. SSH accepts keys only, listens on loopback, and its host key is generated for each deployment, never baked into the image.",
          ],
        },
        {
          type: "features",
          title: "Also in the collection",
          items: [
            { title: "Unbound", body: "A recursive DNS resolver that asks the root servers directly and validates DNSSEC, with nothing writable at all." },
            { title: "Ollama", body: "A runtime for local language models, stripped of CUDA, MLX and Vulkan for CPU-only servers, with its API on loopback." },
          ],
        },
        {
          type: "prose",
          title: "Rebuilt every month, without me",
          paragraphs: [
            "Images rot: their base gets security fixes they never receive. A scheduled workflow reads the list of services from a JSON file, builds each one with Podman in a matrix of parallel jobs and pushes it to the GitHub Container Registry, tagged with the short commit hash and labelled with OCI metadata pointing to the exact revision it was built from.",
            "Adding an image to the schedule is adding one name to a list.",
          ],
        },
        { type: "code", file: ".github/workflows/deploy.yml", language: "yaml", code: workflow },
      ],
    },
    it: {
      tagline: "Le immagini su cui gira il mio homelab.",
      summary:
        "Containerfile e unità Quadlet per i servizi della mia infrastruttura domestica, scritti per Podman rootless: immagini in sola lettura, nessuna capability se l’immagine non ne dichiara una, ricostruite ogni mese sul GitHub Container Registry.",
      blocks: [
        {
          type: "statement",
          text: "Un’intera scrivania, in un container, in una scheda del browser.",
          detail:
            "XAlpine racchiude una scrivania XFCE con Firefox in un’immagine Alpine e la serve in due modi: a qualsiasi client VNC, e a qualsiasi browser tramite noVNC. Postazioni usa e getta, navigazione isolata, uno strumento grafico su un server senza schermo.",
        },
        {
          ...video,
          alt: "Una scrivania XFCE in un browser: noVNC si collega, la scrivania si ridimensiona per riempire la finestra, il file manager apre la cartella home, Firefox misura 670 Mbps su fast.com, e una frase dal pannello degli appunti viene incollata in un terminale.",
          caption:
            "XAlpine tramite noVNC: la scrivania segue le dimensioni della finestra del browser, e il testo scritto nel pannello degli appunti di noVNC viene incollato nel terminale della scrivania.",
        },
        {
          type: "prose",
          title: "Tre processi, un container",
          paragraphs: [
            "Una scrivania ha bisogno di un server grafico, di una sessione e, qui, di un gateway web. Invece di uno script che li avvia e spera, supervisord li esegue tutti e tre in ordine, riavvia quello che cade e manda ogni log all’output del container, dove Podman e journald li raccolgono.",
            "Il server VNC non chiede password, di proposito: come EasyVNC, l’immagine presume di vivere dietro una VPN o una rete privata, mai esposta su internet. La scrivania gira con un utente normale anziché root, e un identificativo D-Bus viene generato in fase di build perché la sessione parta pulita.",
          ],
        },
        { type: "code", file: "xalpine/supervisord.conf", language: "ini", code: supervisor },
        {
          type: "prose",
          title: "Sola lettura e nessuna capability, per default",
          paragraphs: [
            "Ogni immagine arriva con la sua unità Quadlet, e ogni unità parte dallo stesso profilo: filesystem radice in sola lettura, tutte le capability di Linux rimosse, nessuna escalation di privilegi, limiti su memoria, processi e core dump. Quello che un’immagine deve scrivere è dichiarato un percorso alla volta: un volume con nome per ciò che deve sopravvivere, un tmpfs per ciò che no.",
            "Il profilo è verificato, non presunto. La scrivania, Firefox compreso, il resolver e l’ambiente per i modelli partono tutti con ogni maschera di capability a zero. Dove un’immagine non ci stava, la correzione è finita nella sua configurazione, non in un’eccezione.",
            "Solo le immagini che entrano nella mia sessione mappano il loro utente sul mio: UxPlay, per disegnare su Wayland e suonare tramite PipeWire, e il motore Podman, per leggere le chiavi SSH nella mia home. Le altre girano con utenti che fuori dal loro namespace non sono nessuno, e i cui file appartengono a ID subordinati con cui non accedo mai.",
          ],
        },
        {
          type: "table",
          title: "Un profilo, eccezioni dichiarate",
          caption:
            "Ogni unità imposta anche il filesystem radice in sola lettura e no-new-privileges. Il default è il loopback: VNC, noVNC e l’API di Ollama non chiedono password, quindi raggiungerli da altrove richiede un indirizzo VPN scelto apposta.",
          columns: ["", "Utente", "Capability", "Scrivibile", "Rete"],
          rows: [
            ["XAlpine", "Il suo", "Nessuna", "Volume home, /tmp, directory di runtime", "Loopback"],
            ["UxPlay", "Il mio", "Nessuna", "/tmp", "Dell’host, per la scoperta AirPlay"],
            ["Unbound", "Il suo", "Nessuna", "Niente", "Loopback"],
            ["Ollama", "Il suo", "Nessuna", "Volume dei modelli, /tmp", "Loopback"],
            ["Podman", "Il mio", "SYS_ADMIN, NET_ADMIN", "Volume home, directory di runtime", "Loopback, solo SSH"],
          ],
        },
        {
          type: "code",
          title: "Porta 53, senza NET_BIND_SERVICE",
          file: "unbound/unbound.container",
          language: "ini",
          caption:
            "La configurazione di serie di Unbound si aspetta un sistema intero: parte come root, apre la porta 53, poi cambia utente e tiene un socket di controllo in /run. La configurazione del container lo avvia invece con il suo utente, e l’unità abbassa il limite delle porte privilegiate dentro il namespace di rete del container, così la porta 53 non richiede capability e su disco non viene scritto niente.",
          code: unbound,
        },
        {
          type: "code",
          title: "Compila dove ci sono gli strumenti, distribuisci solo il risultato",
          file: "uxplay/Containerfile",
          language: "dockerfile",
          caption:
            "Un ricevitore AirPlay: compilato in un primo stadio con tutta la toolchain, da versioni fissate di Alpine e UxPlay, poi copiato in un’immagine pulita che gira con un utente senza privilegi. La sua unità gli passa i socket di Wayland, PipeWire e D-Bus, e nessuna capability.",
          code: uxplay,
        },
        {
          type: "prose",
          title: "Quella che chiede di più",
          paragraphs: [
            "Un’immagine non può seguire il profilo: Podman stesso. Racchiude un motore rootless, Buildah e un server SSH, con uno storage tutto suo, per una shell remota dove costruire e rompere container senza toccare la macchina su cui girano.",
            "Un motore annidato deve creare user namespace, montare filesystem e configurare reti, quindi la sua unità aggiunge SYS_ADMIN e NET_ADMIN, i dispositivi FUSE e TUN, e toglie seccomp: una riga ciascuno, in bella vista, invece della modalità privilegiata. Il container esterno resta rootless, quindi quelle capability valgono solo dentro uno user namespace che appartiene al mio account senza privilegi. SSH accetta solo chiavi, ascolta sul loopback, e la sua chiave host viene generata per ogni installazione, mai inclusa nell’immagine.",
          ],
        },
        {
          type: "features",
          title: "Anche nella collezione",
          items: [
            { title: "Unbound", body: "Un resolver DNS ricorsivo che chiede direttamente ai root server e convalida DNSSEC, senza alcun percorso scrivibile." },
            { title: "Ollama", body: "Un ambiente per modelli linguistici locali, privato di CUDA, MLX e Vulkan per server senza GPU, con la sua API sul loopback." },
          ],
        },
        {
          type: "prose",
          title: "Ricostruite ogni mese, senza di me",
          paragraphs: [
            "Le immagini invecchiano: la loro base riceve correzioni di sicurezza che loro non vedono mai. Un workflow programmato legge l’elenco dei servizi da un file JSON, costruisce ciascuno con Podman in una matrice di job paralleli e lo pubblica sul GitHub Container Registry, con l’hash breve del commit come tag e le etichette OCI che rimandano alla revisione esatta da cui è stato costruito.",
            "Aggiungere un’immagine alla programmazione significa aggiungere un nome a un elenco.",
          ],
        },
        { type: "code", file: ".github/workflows/deploy.yml", language: "yaml", code: workflow },
      ],
    },
  },
});

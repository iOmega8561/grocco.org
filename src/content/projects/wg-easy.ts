import { defineProject } from "../types";

const quadlet = `[Container]
Image=ghcr.io/iomega8561/wg-easy:config
PublishPort=127.0.0.1:3000:3000
UserNS=keep-id:uid=1000,gid=1000
# Lowercase z: the host's WireGuard has to read wg0.conf too.
Volume=%h/.wg-easy:/opt/wg:z

Environment=PASSWORD_HASH_FILE=/run/secrets/wg-easy-password-hash
Secret=wg-easy-password-hash,type=mount,target=/run/secrets/wg-easy-password-hash,uid=1000,mode=0400

# Immutable root filesystem, no capabilities, no privilege escalation.
ReadOnly=true
DropCapability=ALL
NoNewPrivileges=true

HealthCmd=["/nodejs/bin/node", "/opt/wg-easy/dist/lib/healthcheck.js"]`;

const keys = `export function generateKeyPair(): { privateKey: string, publicKey: string } {
  const key = randomBytes(32);

  // Clamped exactly as \`wg genkey\` does.
  key.writeUInt8(key.readUInt8(0) & 248, 0);
  key.writeUInt8((key.readUInt8(31) & 127) | 64, 31);

  const privateKey = key.toString('base64');
  return { privateKey, publicKey: derivePublicKey(privateKey) };
}`;

const nft = `export function generateDefaultNft(net: string, port: number, dev: string) {
  const postUp = [
    \`nft 'add table inet wg_filter_\${dev}'\`,
    \`nft 'add chain inet wg_filter_\${dev} input { type filter hook input priority filter; }'\`,
    \`nft 'add chain inet wg_filter_\${dev} forward { type filter hook forward priority filter; }'\`,
    \`nft 'add rule inet wg_filter_\${dev} input udp dport \${port} accept'\`,
    \`nft 'add rule inet wg_filter_\${dev} forward iifname "\${dev}" accept'\`,
    \`nft 'add rule inet wg_filter_\${dev} forward oifname "\${dev}" accept'\`,
    \`nft 'add table ip wg_nat_\${dev}'\`,
    \`nft 'add chain ip wg_nat_\${dev} postrouting { type nat hook postrouting priority srcnat; }'\`,
    \`nft 'add rule ip wg_nat_\${dev} postrouting ip saddr \${net} masquerade'\`
  ].join('; ');

  const postDown = [
    \`nft 'delete table inet wg_filter_\${dev}'\`,
    \`nft 'delete table ip wg_nat_\${dev}'\`
  ].join('; ');

  return { postUp, postDown };
}`;

const stats = `const pollData = async () => {
  try {
    const newClients = await Api.getClients();
    if (!isMounted) return;

    const now = Date.now();
    const timeDiff = (now - lastFetchRef.current) / 1000;

    setStats(prevStats => {
      const nextStats = { ...prevStats };
      newClients.forEach(client => {
        // …
        const rxSpeed = Math.max(0, ((client.transferRx ?? 0) - prevRx) / timeDiff);
        const txSpeed = Math.max(0, ((client.transferTx ?? 0) - prevTx) / timeDiff);

        nextStats[client.id] = {
          rxSpeed,
          txSpeed,
          historyRx: [...existingHistoryRx.slice(1), rxSpeed],
          historyTx: [...existingHistoryTx.slice(1), txSpeed],
        };
      });
      return nextStats;
    });
    // …
  } finally {
    if (isMounted) {
      timeoutId = setTimeout(pollData, 1000);
    }
  }
};`;

export default defineProject({
  slug: "wg-easy",
  name: "WG-Easy",
  order: 25,
  layers: ["system", "container", "application", "interface"],
  years: "2026",
  stack: ["WireGuard", "TypeScript", "React", "nftables", "Podman", "Quadlet", "Tailwind CSS"],
  repo: "iOmega8561/WG-Easy",
  links: [{ kind: "source", url: "https://github.com/iOmega8561/WG-Easy" }],
  accent: { light: "#88171a", dark: "#ff8f80" },
  cover: "/media/wg-easy.webp",
  copy: {
    en: {
      tagline: "WireGuard configuration, without root.",
      summary:
        "A fork of wg-easy v14, rewritten in React and TypeScript and shipped as two rootless images. It manages peers, keys and QR codes from a web page, and leaves the tunnel to the host when the container isn’t allowed to touch the kernel.",
      blocks: [
        {
          type: "media",
          src: "/media/wg-easy.webp",
          alt: "The WG-Easy client list, split diagonally between the light and the dark appearance: four clients with their addresses, an on/off switch, and buttons for the QR code, the configuration file and deletion.",
          caption: "One screenshot, both appearances: the interface follows the system’s light or dark scheme.",
          frame: "window",
        },
        {
          type: "statement",
          text: "The interface writes the configuration. Bringing it up is someone else’s job.",
          detail:
            "The original wg-easy has to own the network interface. This fork also runs where nothing may touch the kernel: a rootless container, or a host whose WireGuard is already managed by systemd. It keeps the keys, the peers and the QR codes, and leaves the tunnel to whoever is allowed to run it.",
        },
        {
          type: "table",
          title: "Two images, one for each way to run it",
          columns: ["", ":config", ":managed"],
          rows: [
            ["Inside", "Node and the app, distroless", "The same on Alpine, with wg-quick, wireguard-go and nftables"],
            ["Runs as", "An unprivileged user", "Root of its rootless user namespace"],
            ["Capabilities", "None", "NET_ADMIN"],
            ["Brings up wg0", "The host: wg-quick, systemd-networkd", "The container, with wg-quick"],
            ["Firewall and NAT", "Yours", "Generated nftables tables"],
            ["Live traffic", "—", "Per-client rates and last handshake"],
            ["Published ports", "3000/tcp", "3000/tcp, 51820/udp"],
          ],
        },
        {
          type: "prose",
          title: "No sudo, no shell, a read-only root",
          paragraphs: [
            "Both images start node directly and write only to their data directory, so they run on a read-only root filesystem. The server is bundled with every dependency it uses: an image holds the built app and a Node runtime, with no node_modules and no npm. The configuration-only image is distroless on top of that: no shell, no WireGuard tools, nothing to escalate with.",
            "The managed image needs wg-quick, which only runs as root and otherwise re-executes itself through sudo. Instead of keeping sudo, it runs as root of its own user namespace: under rootless Podman, the user who started it, holding NET_ADMIN and nothing else. The user namespace was already the real wall, and still is; what changes is that no setuid binary is left, so no-new-privileges holds, and the image that needs nothing carries nothing.",
            "The image also decides the mode. The managed one sets WG_MANAGED itself, the setting accepts only clear yes or no values, and a server asked to manage an interface without the tools to do it stops at startup and says why.",
          ],
        },
        {
          type: "code",
          title: "Shipped with its Quadlet units",
          file: "deploy/wg-easy-config.container",
          language: "ini",
          caption:
            "The password’s bcrypt hash arrives as a Podman secret, read through PASSWORD_HASH_FILE, rather than as an environment variable that podman inspect would show. The health check runs with node alone, since there is no shell to run anything else.",
          code: quadlet,
        },
        {
          type: "prose",
          title: "One JSON file, one generated config",
          paragraphs: [
            "The whole state is a single wg0.json: the server’s keys and subnet, and every client with its address and keys. Each change rewrites wg0.conf from it, readable only by its owner, with one [Peer] section for every enabled client. Disabling a client takes it out of the file; deleting it takes it out of both.",
            "When WireGuard is managed, the new file is applied with wg syncconf on the output of wg-quick strip: only the peers that changed are touched, and everyone else stays connected. Every command runs with its arguments as a list, never through a shell.",
            "Addresses are handed out as integers. The subnet is parsed into 32-bit network and broadcast addresses, and a new client gets the first one in between that isn’t the server’s or already taken. An address edited by hand goes through the same checks, and the error says which one failed.",
          ],
        },
        {
          type: "code",
          title: "Keys that never touch a command line",
          file: "lib/service/Utility.ts",
          language: "ts",
          caption:
            "Key pairs and preshared keys are generated by Node itself, so a private key is never an argument visible to ps, nor a line in a log. The public key is derived from the private one with Node’s own X25519.",
          code: keys,
        },
        {
          type: "code",
          title: "nftables, not iptables",
          file: "lib/service/Utility.ts",
          language: "ts",
          caption:
            "Each interface gets two tables of its own, so taking the tunnel down is deleting them: no other rule on the host is touched. The image also ships wireguard-go, and where the kernel can’t create a WireGuard interface, wg-quick falls back to it by itself.",
          code: nft,
        },
        {
          type: "prose",
          title: "From Vue to React",
          paragraphs: [
            "The interface of version 14 was a single Vue page with its libraries vendored next to it. Here it is a React 19 and TypeScript app, built by Vite and styled with Tailwind CSS: a login dialog, the list of clients, and dialogs to create, edit, show the QR code of or delete one. The server followed, module by module, from JavaScript to TypeScript.",
            "Each row draws its client’s traffic behind it. The page polls once a second, turns the byte counters into rates by dividing by the time that actually passed, and keeps the last thirty samples: download hangs from the top, upload rises from the bottom. The next poll is scheduled only once the previous one has answered, so a slow server never piles requests up.",
          ],
        },
        { type: "code", file: "www/hooks/useClientStats.ts", language: "ts", code: stats },
        {
          type: "features",
          title: "Details",
          items: [
            {
              title: "Basic Auth, cheaply",
              body: "Besides the session cookie, the API accepts HTTP Basic credentials for reverse proxies and scripts. Those resend the password every time and bcrypt is slow on purpose, so results are cached under the password’s SHA-256, fifty at most.",
            },
            {
              title: "Backup and restore",
              body: "The whole configuration downloads as one JSON file and comes back the same way, applied straight to the running interface when it is managed.",
            },
            {
              title: "Built on every push",
              body: "A GitHub Actions workflow builds both images with Podman, each from its own Containerfile, and publishes them on the GitHub Container Registry.",
            },
          ],
        },
        {
          type: "prose",
          paragraphs: ["WG-Easy is based on wg-easy by WeeJeWel and, like the original, is released under CC BY-NC-SA 4.0."],
        },
      ],
    },
    it: {
      tagline: "La configurazione di WireGuard, senza root.",
      summary:
        "Un fork di wg-easy v14, riscritto in React e TypeScript e distribuito come due immagini rootless. Gestisce peer, chiavi e codici QR da una pagina web, e lascia il tunnel all’host quando il container non ha il permesso di toccare il kernel.",
      blocks: [
        {
          type: "media",
          src: "/media/wg-easy.webp",
          alt: "L’elenco dei client di WG-Easy, diviso in diagonale tra l’aspetto chiaro e quello scuro: quattro client con i loro indirizzi, un interruttore e i pulsanti per il codice QR, il file di configurazione e l’eliminazione.",
          caption: "Uno screenshot, due aspetti: l’interfaccia segue il tema chiaro o scuro del sistema.",
          frame: "window",
        },
        {
          type: "statement",
          text: "L’interfaccia scrive la configurazione. Attivarla è compito di qualcun altro.",
          detail:
            "Il wg-easy originale deve possedere l’interfaccia di rete. Questo fork gira anche dove nessuno può toccare il kernel: un container rootless, o un host il cui WireGuard è già gestito da systemd. Custodisce le chiavi, i peer e i codici QR, e lascia il tunnel a chi ha il permesso di avviarlo.",
        },
        {
          type: "table",
          title: "Due immagini, una per ogni modo di usarlo",
          columns: ["", ":config", ":managed"],
          rows: [
            ["Contiene", "Node e l’app, distroless", "Lo stesso su Alpine, con wg-quick, wireguard-go e nftables"],
            ["Gira come", "Un utente senza privilegi", "Root del suo user namespace rootless"],
            ["Capability", "Nessuna", "NET_ADMIN"],
            ["Chi attiva wg0", "L’host: wg-quick, systemd-networkd", "Il container, con wg-quick"],
            ["Firewall e NAT", "A carico tuo", "Tabelle nftables generate"],
            ["Traffico in tempo reale", "—", "Velocità per client e ultimo handshake"],
            ["Porte pubblicate", "3000/tcp", "3000/tcp, 51820/udp"],
          ],
        },
        {
          type: "prose",
          title: "Niente sudo, niente shell, sola lettura",
          paragraphs: [
            "Entrambe le immagini avviano direttamente node e scrivono solo nella loro cartella dati, così girano con il filesystem di sistema in sola lettura. Il server è impacchettato con tutte le dipendenze che usa: un’immagine contiene l’app compilata e un runtime Node, senza node_modules e senza npm. L’immagine di sola configurazione è in più distroless: niente shell, niente strumenti WireGuard, niente con cui ottenere privilegi.",
            "L’immagine gestita ha bisogno di wg-quick, che gira solo come root e altrimenti si rilancia da sé con sudo. Invece di tenere sudo, gira come root del proprio user namespace: con Podman rootless, l’utente che l’ha avviata, con NET_ADMIN e nient’altro. Il vero muro era già lo user namespace, e lo resta; quello che cambia è che non resta alcun binario setuid, così no-new-privileges tiene, e l’immagine che non ha bisogno di niente non si porta dietro niente.",
            "È anche l’immagine a decidere la modalità. Quella gestita imposta da sé WG_MANAGED, l’impostazione accetta solo valori chiaramente sì o no, e un server a cui si chiede di gestire un’interfaccia senza gli strumenti per farlo si ferma all’avvio e dice perché.",
          ],
        },
        {
          type: "code",
          title: "Distribuito con le sue unità Quadlet",
          file: "deploy/wg-easy-config.container",
          language: "ini",
          caption:
            "L’hash bcrypt della password arriva come secret di Podman, letto tramite PASSWORD_HASH_FILE, invece che come variabile d’ambiente che podman inspect mostrerebbe. Il controllo di salute gira con il solo node, perché non c’è una shell con cui eseguire altro.",
          code: quadlet,
        },
        {
          type: "prose",
          title: "Un file JSON, una configurazione generata",
          paragraphs: [
            "Tutto lo stato è un unico wg0.json: le chiavi e la sottorete del server, e ogni client con il suo indirizzo e le sue chiavi. Ogni modifica riscrive da lì wg0.conf, leggibile solo dal proprietario, con una sezione [Peer] per ogni client attivo. Disattivare un client lo toglie dal file; eliminarlo lo toglie da entrambi.",
            "Quando WireGuard è gestito, il nuovo file viene applicato con wg syncconf sull’output di wg-quick strip: si toccano solo i peer cambiati, e tutti gli altri restano connessi. Ogni comando riceve gli argomenti come lista, mai attraverso una shell.",
            "Gli indirizzi vengono assegnati come numeri interi. La sottorete viene scomposta negli indirizzi di rete e di broadcast a 32 bit, e un nuovo client riceve il primo libero tra i due che non sia quello del server. Un indirizzo modificato a mano passa per gli stessi controlli, e l’errore dice quale non ha superato.",
          ],
        },
        {
          type: "code",
          title: "Chiavi che non toccano mai una riga di comando",
          file: "lib/service/Utility.ts",
          language: "ts",
          caption:
            "Le coppie di chiavi e le chiavi condivise sono generate da Node stesso, così una chiave privata non è mai un argomento visibile a ps, né una riga in un log. La chiave pubblica si ricava da quella privata con l’X25519 di Node.",
          code: keys,
        },
        {
          type: "code",
          title: "nftables, non iptables",
          file: "lib/service/Utility.ts",
          language: "ts",
          caption:
            "Ogni interfaccia ha due tabelle tutte sue, così spegnere il tunnel significa eliminarle: nessun’altra regola dell’host viene toccata. L’immagine include anche wireguard-go, e dove il kernel non riesce a creare un’interfaccia WireGuard, wg-quick ripiega da solo su di esso.",
          code: nft,
        },
        {
          type: "prose",
          title: "Da Vue a React",
          paragraphs: [
            "L’interfaccia della versione 14 era un’unica pagina Vue con le sue librerie copiate accanto. Qui è un’app React 19 e TypeScript, compilata da Vite e con lo stile di Tailwind CSS: una finestra di accesso, l’elenco dei client e le finestre per crearne uno, modificarlo, mostrarne il codice QR o eliminarlo. Il server l’ha seguita, modulo per modulo, da JavaScript a TypeScript.",
            "Ogni riga disegna dietro di sé il traffico del suo client. La pagina interroga il server una volta al secondo, trasforma i contatori di byte in velocità dividendo per il tempo effettivamente trascorso, e conserva gli ultimi trenta campioni: il download scende dall’alto, l’upload sale dal basso. La richiesta successiva parte solo quando la precedente ha avuto risposta, così un server lento non accumula mai richieste.",
          ],
        },
        { type: "code", file: "www/hooks/useClientStats.ts", language: "ts", code: stats },
        {
          type: "features",
          title: "Dettagli",
          items: [
            {
              title: "Basic Auth, a buon mercato",
              body: "Oltre al cookie di sessione, l’API accetta credenziali HTTP Basic per reverse proxy e script. Questi rimandano la password a ogni richiesta e bcrypt è lento di proposito, così i risultati restano in cache sotto lo SHA-256 della password, al massimo cinquanta.",
            },
            {
              title: "Backup e ripristino",
              body: "L’intera configurazione si scarica come un unico file JSON e torna indietro allo stesso modo, applicata direttamente all’interfaccia attiva quando è gestita.",
            },
            {
              title: "Compilato a ogni push",
              body: "Un workflow di GitHub Actions costruisce entrambe le immagini con Podman, ciascuna dal proprio Containerfile, e le pubblica sul GitHub Container Registry.",
            },
          ],
        },
        {
          type: "prose",
          paragraphs: ["WG-Easy è basato su wg-easy di WeeJeWel e, come l’originale, è distribuito con licenza CC BY-NC-SA 4.0."],
        },
      ],
    },
  },
});

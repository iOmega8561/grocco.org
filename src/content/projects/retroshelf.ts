import { defineProject } from "../types";

const quadlet = `[Container]
Image=localhost/retroshelf:latest
PublishPort=127.0.0.1:8080:8080
Volume=%h/games/library:/library:ro,z
UserNS=keep-id:uid=1000,gid=1000

# Immutable root filesystem, no capabilities, no privilege escalation.
ReadOnly=true
DropCapability=ALL
NoNewPrivileges=true

HealthCmd=node /app/dist/healthcheck.js
HealthInterval=30s

[Service]
Restart=on-failure
# A runaway scan can't starve the host.
MemoryMax=512M`;

const paths = `const FORBIDDEN_IN_SEGMENT = /[\\\\/\\u0000-\\u001f\\u007f]/;

export function isSafeSegment(segment: string): boolean {
  return (
    segment.length > 0 &&
    segment.length <= 255 &&
    segment !== '.' &&
    segment !== '..' &&
    !segment.startsWith('.') &&
    !FORBIDDEN_IN_SEGMENT.test(segment)
  );
}

/** Lexical containment check. \`root\` must already be absolute and resolved. */
export function resolveInside(root: string, relative: string): string | null {
  if (relative.includes('\\0')) return null;
  const absolute = path.resolve(root, relative);
  const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
  return absolute === root || absolute.startsWith(rootWithSep) ? absolute : null;
}`;

const zip = `/** Total archive size, computable without reading any file data. */
export function zipSize(entries: readonly ZipEntryInput[]): number {
  let total = END_RECORD;
  for (const entry of entries) {
    const nameLength = Buffer.byteLength(entry.name, 'utf8');
    total += LOCAL_HEADER + nameLength + entry.size + CENTRAL_HEADER + nameLength;
  }
  return total;
}`;

const ejs = `function configure(play: PlayConfig, detail: GameDetail): void {
  window.EJS_player = '#game';
  window.EJS_core = play.core;
  window.EJS_gameUrl = play.gameUrl;
  if (play.biosUrl) window.EJS_biosUrl = play.biosUrl;
  window.EJS_pathtodata = play.dataPath;
  window.EJS_threads = play.threads;
  // EmulatorJS' own menus follow the same language as the rest of Retroshelf.
  window.EJS_language = EJS_LANGUAGE[locale];
  // …
  // Netplay needs a third-party server, which Retroshelf deliberately doesn't use.
  window.EJS_Buttons = { netplay: false };

  // Route EmulatorJS' own Save/Load buttons and hotkeys into slot-based IndexedDB storage.
  window.EJS_onSaveState = (event) => void saveToSlot(currentSlot(), event.state);
  window.EJS_onLoadState = () => void loadFromSlot(currentSlot());
  // …
}`;

export default defineProject({
  slug: "retroshelf",
  name: "Retroshelf",
  order: 20,
  layers: ["container", "application", "interface"],
  years: "2026",
  stack: ["TypeScript", "React", "Node.js", "Express", "Podman", "Quadlet"],
  repo: "iOmega8561/Retroshelf",
  links: [{ kind: "source", url: "https://github.com/iOmega8561/Retroshelf" }],
  accent: { light: "#a85500", dark: "#ffb547" },
  cover: "/media/retroshelf-library.webp",
  copy: {
    en: {
      tagline: "A retro game library that plays in the browser.",
      summary:
        "Self-hosted, one rootless container, no database. It reads an ES-DE collection from disk and plays compatible systems in the browser with EmulatorJS.",
      blocks: [
        {
          type: "media",
          src: "/media/retroshelf-library.webp",
          srcDark: "/media/retroshelf-library-dark.webp",
          alt: "The Retroshelf library: systems grouped by maker in the sidebar, and a grid of box art.",
          caption: "My own library: 305 games across seven systems, from the Nintendo 64 to the PSP.",
          frame: "window",
        },
        {
          type: "statement",
          text: "One container. No database. Nothing to trust it with.",
          detail:
            "The catalog comes from your folders and gamelist.xml files. Favorites, history and saves stay in each player’s browser. The server stores nothing at all.",
        },
        {
          type: "features",
          items: [
            { title: "Plays in the browser", body: "From the NES to the Saturn and the PSP. Systems a browser can’t run get a download button and setup steps for a desktop emulator instead." },
            { title: "Works offline", body: "The full image bundles every EmulatorJS core and serves them itself, so the whole stack runs on a network with no internet access." },
            { title: "Made for the sofa", body: "A controller drives the whole library: the D-pad moves focus spatially, the shoulder buttons switch shelves, Start plays." },
          ],
        },
        {
          type: "pipeline",
          title: "Four walls between a URL and your disk",
          steps: [
            { title: "Indexed files only", detail: "Routes serve only files the scanner found: ROMs, their media and BIOS files. Nothing else has a URL." },
            { title: "Every segment checked", detail: "No “..”, no dotfiles, no separators, no control characters, at most 32 segments." },
            { title: "Lexical containment", detail: "The joined path must still be inside its root after normalisation." },
            { title: "Real containment", detail: "Unless symlinks are trusted, the resolved real path must stay inside the real root too." },
          ],
          caption: "The same checks apply to paths found inside gamelists, cue sheets and playlists, so a crafted file can’t point elsewhere.",
        },
        { type: "code", file: "server/src/util/paths.ts", language: "ts", code: paths },
        {
          type: "media",
          src: "/media/retroshelf-game.webp",
          srcDark: "/media/retroshelf-game-dark.webp",
          alt: "The detail panel of a Nintendo DS game: box art, Play and Download buttons, a description, developer, publisher and release date.",
          caption: "Every detail comes from the gamelist.xml next to the games, in the language of the collection.",
          frame: "window",
        },
        {
          type: "prose",
          title: "ZIP archives that don’t exist",
          paragraphs: [
            "A PlayStation disc is a cue sheet and one or more binary tracks; a multi-disc game adds a playlist. EmulatorJS wants a single URL. So Retroshelf assembles an uncompressed ZIP on the fly, streaming each file from disk and never holding the archive in memory.",
            "The archive is deterministic: entry order is fixed, timestamps come from the files, and checksums are written up front. Its size and every byte offset are known before the first byte is sent, so HEAD requests, ETags and HTTP Range requests behave exactly as they do for a real file.",
          ],
        },
        { type: "code", file: "server/src/util/zip.ts", language: "ts", code: zip },
        {
          type: "code",
          title: "Shipped with its Quadlet unit",
          file: "retroshelf.container",
          language: "ini",
          caption: "The repository ships the systemd unit next to the code: deployment is part of the project, not an afterthought.",
          code: quadlet,
        },
        {
          type: "features",
          title: "Details that add up",
          items: [
            { title: "Two languages, done properly", body: "The API returns codes, never sentences; the client translates them. Numbers, sizes and dates follow the reader’s locale." },
            { title: "Strict headers", body: "A same-origin Content Security Policy; the player page adds only what the emulator needs, WebAssembly and blob scripts. Permissions are limited to gamepads and fullscreen." },
            { title: "Tested where it matters", body: "Traversal attempts over raw HTTP, byte-range semantics, gamelist parsing, disc grouping and ZIP validity." },
          ],
        },
        {
          type: "prose",
          title: "Then EmulatorJS takes over",
          paragraphs: [
            "EmulatorJS runs libretro cores compiled to WebAssembly, and it is configured through a handful of globals set before its loader script. Retroshelf sets them per game: the core for the system, the URL of the game (for a disc game, one of those ZIP archives), the BIOS when one is needed, and the reader’s language, so the emulator’s menus and touch controls match the library.",
            "Some cores, like PPSSPP for the PSP and DOSBox Pure, are only built with threads, and threads in a browser need SharedArrayBuffer, which only a cross-origin isolated page gets. Every response carries the two headers that isolate it, and before loading anything the player checks for isolation, and for WebGL 2 on the PSP. A missing requirement becomes a sentence that explains it, not a black screen.",
            "Saves never leave the browser, but they don’t rely on EmulatorJS alone either. Its Save and Load buttons write to nine slots in Retroshelf’s own IndexedDB, each with a screenshot; battery saves are mirrored there and put back if the emulator’s cache is cleared; and leaving the page waits, briefly, for the last write to land.",
          ],
        },
        {
          type: "code",
          file: "web/src/play/main.ts",
          language: "ts",
          caption:
            "Next to it lives one workaround: EmulatorJS 4.2 ignores a controller that was already in use before the game started, so Retroshelf hands it to the first free player, exactly as EmulatorJS would.",
          code: ejs,
        },
        {
          type: "media",
          src: "/media/retroshelf-play.webp",
          srcDark: "/media/retroshelf-play-dark.webp",
          alt: "Crash Bandicoot running in a desktop browser, next to an iPhone playing Mario Kart DS with on-screen buttons.",
          caption: "The PlayStation on the desktop, the Nintendo DS on a phone. The touch controls speak Italian, like the rest of my library.",
          frame: "bare",
        },
      ],
    },
    it: {
      tagline: "Una libreria di giochi retrò che si gioca nel browser.",
      summary:
        "Self-hosted, un solo container rootless, nessun database. Legge una collezione ES-DE dal disco e fa giocare i sistemi compatibili nel browser con EmulatorJS.",
      blocks: [
        {
          type: "media",
          src: "/media/retroshelf-library.webp",
          srcDark: "/media/retroshelf-library-dark.webp",
          alt: "La libreria di Retroshelf: i sistemi raggruppati per produttore nella barra laterale, e una griglia di copertine.",
          caption: "La mia libreria: 305 giochi su sette sistemi, dal Nintendo 64 alla PSP.",
          frame: "window",
        },
        {
          type: "statement",
          text: "Un container. Nessun database. Niente da affidargli.",
          detail:
            "Il catalogo nasce dalle tue cartelle e dai file gamelist.xml. Preferiti, cronologia e salvataggi restano nel browser di ogni giocatore. Il server non conserva nulla.",
        },
        {
          type: "features",
          items: [
            { title: "Si gioca nel browser", body: "Dal NES al Saturn fino alla PSP. I sistemi che un browser non può far girare hanno un pulsante di download e le istruzioni per un emulatore desktop." },
            { title: "Funziona offline", body: "L’immagine completa include tutti i core di EmulatorJS e li serve da sé: l’intero stack gira anche su una rete senza accesso a internet." },
            { title: "Pensato per il divano", body: "Un controller guida tutta la libreria: la croce direzionale sposta il focus nello spazio, i dorsali cambiano scaffale, Start avvia il gioco." },
          ],
        },
        {
          type: "pipeline",
          title: "Quattro muri tra un URL e il tuo disco",
          steps: [
            { title: "Solo file indicizzati", detail: "Le rotte servono solo i file trovati dallo scanner: ROM, i loro contenuti multimediali e i BIOS. Nient’altro ha un URL." },
            { title: "Ogni segmento controllato", detail: "Niente “..”, niente file nascosti, separatori o caratteri di controllo, al massimo 32 segmenti." },
            { title: "Contenimento lessicale", detail: "Il percorso composto deve restare dentro la sua radice anche dopo la normalizzazione." },
            { title: "Contenimento reale", detail: "Se i link simbolici non sono considerati fidati, anche il percorso reale risolto deve restare nella radice reale." },
          ],
          caption: "Gli stessi controlli valgono per i percorsi trovati in gamelist, cue sheet e playlist: un file costruito ad arte non può puntare altrove.",
        },
        { type: "code", file: "server/src/util/paths.ts", language: "ts", code: paths },
        {
          type: "media",
          src: "/media/retroshelf-game.webp",
          srcDark: "/media/retroshelf-game-dark.webp",
          alt: "La scheda di un gioco per Nintendo DS: copertina, i pulsanti Gioca e Scarica, una descrizione, sviluppatore, editore e data di uscita.",
          caption: "Ogni dettaglio viene dal gamelist.xml accanto ai giochi, nella lingua della collezione.",
          frame: "window",
        },
        {
          type: "prose",
          title: "Archivi ZIP che non esistono",
          paragraphs: [
            "Un disco PlayStation è un cue sheet con una o più tracce binarie; un gioco su più dischi aggiunge una playlist. EmulatorJS vuole un solo URL. Retroshelf allora compone al volo uno ZIP non compresso, leggendo ogni file dal disco in streaming, senza mai tenere l’archivio in memoria.",
            "L’archivio è deterministico: l’ordine delle voci è fisso, le date vengono dai file e i checksum sono scritti in anticipo. La dimensione e ogni posizione dei byte sono note prima di inviare il primo byte, così le richieste HEAD, gli ETag e le richieste HTTP Range si comportano esattamente come per un file vero.",
          ],
        },
        { type: "code", file: "server/src/util/zip.ts", language: "ts", code: zip },
        {
          type: "code",
          title: "Distribuito con la sua unità Quadlet",
          file: "retroshelf.container",
          language: "ini",
          caption: "Il repository contiene l’unità systemd accanto al codice: il deployment fa parte del progetto, non è un ripensamento.",
          code: quadlet,
        },
        {
          type: "features",
          title: "Dettagli che fanno la differenza",
          items: [
            { title: "Due lingue, fatte bene", body: "L’API restituisce codici, mai frasi; è il client a tradurli. Numeri, dimensioni e date seguono la lingua di chi legge." },
            { title: "Intestazioni rigorose", body: "Una Content Security Policy limitata alla stessa origine; la pagina del player aggiunge solo ciò che serve all’emulatore, WebAssembly e script blob. I permessi sono ristretti a gamepad e schermo intero." },
            { title: "Test dove servono", body: "Tentativi di attraversamento dei percorsi via HTTP grezzo, semantica delle richieste a intervalli, lettura dei gamelist, raggruppamento dei dischi e validità degli ZIP." },
          ],
        },
        {
          type: "prose",
          title: "Poi tocca a EmulatorJS",
          paragraphs: [
            "EmulatorJS fa girare core libretro compilati in WebAssembly, e si configura con una manciata di variabili globali impostate prima del suo script di caricamento. Retroshelf le imposta per ogni gioco: il core del sistema, l’URL del gioco (per un gioco su disco, uno di quegli archivi ZIP), il BIOS quando serve, e la lingua di chi legge, così i menu e i comandi touch dell’emulatore parlano come la libreria.",
            "Alcuni core, come PPSSPP per la PSP e DOSBox Pure, esistono solo con i thread, e i thread in un browser richiedono SharedArrayBuffer, che spetta solo a una pagina isolata tra origini diverse. Ogni risposta porta le due intestazioni che la isolano, e prima di caricare qualsiasi cosa il player verifica l’isolamento, e WebGL 2 per la PSP. Un requisito mancante diventa una frase che lo spiega, non uno schermo nero.",
            "I salvataggi non lasciano mai il browser, ma non dipendono nemmeno solo da EmulatorJS. I suoi pulsanti Salva e Carica scrivono in nove slot nell’IndexedDB di Retroshelf, ognuno con uno screenshot; i salvataggi della cartuccia vengono copiati lì e rimessi al loro posto se la cache dell’emulatore viene svuotata; e lasciare la pagina attende, per poco, che l’ultima scrittura vada a buon fine.",
          ],
        },
        {
          type: "code",
          file: "web/src/play/main.ts",
          language: "ts",
          caption:
            "Accanto vive un rimedio: EmulatorJS 4.2 ignora un controller già in uso prima dell’avvio del gioco, così Retroshelf lo assegna al primo giocatore libero, esattamente come farebbe EmulatorJS.",
          code: ejs,
        },
        {
          type: "media",
          src: "/media/retroshelf-play.webp",
          srcDark: "/media/retroshelf-play-dark.webp",
          alt: "Crash Bandicoot in un browser desktop, accanto a un iPhone che gioca a Mario Kart DS con i pulsanti sullo schermo.",
          caption: "La PlayStation sul desktop, il Nintendo DS su un telefono. I comandi touch parlano italiano, come il resto della mia libreria.",
          frame: "bare",
        },
      ],
    },
  },
});

import { defineProject } from "../types";

const catalog = `[
  {
    "name": "Ubuntu 26.04",
    "logoURL": "https://tesseract.grocco.org/img/os-assets/ubuntu.png",
    "downloadURL": "https://cdimage.ubuntu.com/…/ubuntu-26.04.1-desktop-arm64.iso"
  },
  {
    "name": "Fedora Workstation 45",
    "logoURL": "https://tesseract.grocco.org/img/os-assets/fedora.png",
    "downloadURL": "https://fedora.mirror.garr.it/…/Fedora-Workstation-Live-45-1.4.aarch64.iso"
  }
]`;


export default defineProject({
  slug: "tesseract",
  name: "Tesseract",
  order: 15,
  layers: ["virtualization", "interface"],
  years: "2024 – 2026",
  stack: ["SwiftUI", "VirtualizationKit", "Tools4SwiftData", "Tools4SwiftUI"],
  links: [
    { kind: "appStore", url: "https://apps.apple.com/app/tesseract/id6737772431" },
    { kind: "website", url: "https://tesseract.grocco.org" },
  ],
  accent: { light: "#1f62d6", dark: "#6ea8ff" },
  icon: "/media/tesseract-icon.webp",
  cover: "/media/tesseract-macbook-dark.webp",
  copy: {
    en: {
      tagline: "Virtual machines, made easy.",
      summary: "A native virtual machine manager for the Mac, on the App Store. Its source is private; its engine is VirtualizationKit.",
      blocks: [
        {
          type: "media",
          src: "/media/tesseract-stack.webp",
          srcDark: "/media/tesseract-stack-dark.webp",
          alt: "A macOS Tahoe virtual machine running in a Tesseract console window.",
          frame: "bare",
        },
        {
          type: "statement",
          text: "Three choices, and the machine is ready.",
          detail:
            "Virtualization is full of decisions most people shouldn’t have to make. Tesseract asks for the system, the size and the extras, and makes sensible choices for everything else.",
        },
        {
          type: "video",
          src: "/media/tesseract-newvm.mp4",
          poster: "/media/tesseract-newvm-poster.webp",
          srcDark: "/media/tesseract-newvm-dark.mp4",
          posterDark: "/media/tesseract-newvm-poster-dark.webp",
          alt: "Creating a Linux machine in Tesseract: choosing the system, opening the installer catalog, picking a hardware preset and adjusting memory and disk.",
          caption: "Creating a machine: choose Linux, macOS or Windows, take an installer from the catalog or from disk, then pick a preset or tune it. The steppers move by larger amounts as values grow, and the help icon turns into a warning when a value is too low.",
          frame: "window",
        },
        {
          type: "prose",
          title: "A catalog that updates without an update",
          paragraphs: [
            "The installers Tesseract offers to download, from Ubuntu to the latest macOS restore images, are not compiled into the app. They come from two small JSON files published on the project’s website.",
            "When a distribution ships a new release, I edit a file and every installed copy of Tesseract offers it the next time it opens, without going through App Store review. If the site can’t be reached, the app still works: you pick an image from disk instead.",
          ],
        },
        { type: "code", file: "data/linux-iso.json", language: "ts", code: catalog },
        {
          type: "video",
          src: "/media/tesseract-windows.mp4",
          poster: "/media/tesseract-windows-poster.webp",
          srcDark: "/media/tesseract-windows-dark.mp4",
          posterDark: "/media/tesseract-windows-poster-dark.webp",
          alt: "Windows 11 running in Tesseract: the settings app, the virtio driver installer and the task manager.",
          caption: "Windows 11 on the QEMU back-end, installing the virtio drivers that replace its emulated hardware.",
          frame: "window",
        },
        {
          type: "features",
          title: "One app, three families of guests",
          items: [
            { title: "macOS", body: "Restore images downloaded from Apple, a guided installation, and warnings when the hardware falls below what macOS needs." },
            { title: "Linux", body: "Rosetta for x86_64 binaries and a shared folder with the Mac, both set up when the machine is created." },
            { title: "Windows", body: "Through the QEMU back-end of VirtualizationKit, with TPM 2.0 and Secure Boot as plain switches." },
          ],
        },
        {
          type: "prose",
          title: "Where everything meets",
          paragraphs: [
            "Tesseract is the app where the pieces on this site come together: VirtualizationKit runs the machines, Tools4SwiftData stores their templates, and Tools4SwiftUI provides much of the interface. The app is closed source; the three libraries are open.",
            "It collects no data. The only network requests go to its website, for the catalog, and to Apple, when it installs macOS.",
          ],
        },
      ],
    },
    it: {
      tagline: "Le macchine virtuali, rese semplici.",
      summary: "Un gestore di macchine virtuali nativo per Mac, sull’App Store. Il sorgente è privato; il motore è VirtualizationKit.",
      blocks: [
        {
          type: "media",
          src: "/media/tesseract-stack.webp",
          srcDark: "/media/tesseract-stack-dark.webp",
          alt: "Una macchina virtuale macOS Tahoe in esecuzione in una finestra di Tesseract.",
          frame: "bare",
        },
        {
          type: "statement",
          text: "Tre scelte, e la macchina è pronta.",
          detail:
            "La virtualizzazione è piena di decisioni che la maggior parte delle persone non dovrebbe dover prendere. Tesseract chiede il sistema, le dimensioni e gli extra, e per tutto il resto sceglie in modo sensato.",
        },
        {
          type: "video",
          src: "/media/tesseract-newvm.mp4",
          poster: "/media/tesseract-newvm-poster.webp",
          srcDark: "/media/tesseract-newvm-dark.mp4",
          posterDark: "/media/tesseract-newvm-poster-dark.webp",
          alt: "La creazione di una macchina Linux in Tesseract: la scelta del sistema, il catalogo delle immagini d’installazione, una preimpostazione hardware e la regolazione di memoria e disco.",
          caption: "La creazione di una macchina: scegli Linux, macOS o Windows, prendi un’immagine dal catalogo o dal disco, poi scegli una preimpostazione o regolala. I controlli avanzano a passi più grandi man mano che i valori crescono, e l’icona d’aiuto diventa un avviso quando un valore è troppo basso.",
          frame: "window",
        },
        {
          type: "prose",
          title: "Un catalogo che si aggiorna senza aggiornare l’app",
          paragraphs: [
            "Le immagini d’installazione che Tesseract propone di scaricare, da Ubuntu alle ultime immagini di ripristino di macOS, non sono compilate nell’app. Arrivano da due piccoli file JSON pubblicati sul sito del progetto.",
            "Quando una distribuzione esce con una nuova versione, modifico un file e ogni copia installata di Tesseract la propone alla successiva apertura, senza passare dalla revisione dell’App Store. Se il sito non è raggiungibile, l’app funziona lo stesso: si sceglie un’immagine dal disco.",
          ],
        },
        { type: "code", file: "data/linux-iso.json", language: "ts", code: catalog },
        {
          type: "video",
          src: "/media/tesseract-windows.mp4",
          poster: "/media/tesseract-windows-poster.webp",
          srcDark: "/media/tesseract-windows-dark.mp4",
          posterDark: "/media/tesseract-windows-poster-dark.webp",
          alt: "Windows 11 in esecuzione in Tesseract: le impostazioni, l’installazione dei driver virtio e la gestione attività.",
          caption: "Windows 11 sul back-end QEMU, mentre installa i driver virtio che sostituiscono l’hardware emulato.",
          frame: "window",
        },
        {
          type: "features",
          title: "Un’app, tre famiglie di ospiti",
          items: [
            { title: "macOS", body: "Immagini di ripristino scaricate da Apple, un’installazione guidata e avvisi quando l’hardware scende sotto ciò che serve a macOS." },
            { title: "Linux", body: "Rosetta per i binari x86_64 e una cartella condivisa con il Mac, entrambe preparate alla creazione della macchina." },
            { title: "Windows", body: "Attraverso il back-end QEMU di VirtualizationKit, con TPM 2.0 e Secure Boot come semplici interruttori." },
          ],
        },
        {
          type: "prose",
          title: "Dove tutto si incontra",
          paragraphs: [
            "Tesseract è l’app in cui si incontrano i pezzi di questo sito: VirtualizationKit fa girare le macchine, Tools4SwiftData ne conserva i template e Tools4SwiftUI fornisce gran parte dell’interfaccia. L’app è a sorgente chiuso; le tre librerie sono aperte.",
            "Non raccoglie alcun dato. Le uniche richieste di rete vanno al suo sito, per il catalogo, e ad Apple, quando installa macOS.",
          ],
        },
      ],
    },
  },
});

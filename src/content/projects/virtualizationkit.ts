import { defineProject } from "../types";

const templateCode = `struct MyTemplate: TransferableTemplate {
    var id = UUID()
    var name = "MySampleVM"
    var storage: [DiskImage] = [
        DiskImage(location: .managed(size: 64 << 30), interface: .virtio, bootOrder: 1)
    ]
    var networkTopology: NetworkTopology = .nat()
    var performancePreset: PerformancePreset = .balanced
    var display = DisplaySize(width: 1280, height: 720)
    var optionalCapabilities: [OptionalCapability] = []
}

// The same code drives both back-ends: only the type changes.
let vm = try await QEMUVirtualMachine(template: MyTemplate())
try await vm.execute(action: .start())`;

const uncompressed = `static func isCompressed(_ url: URL) -> Bool {

    var information = stat()

    guard unsafe stat(url.path(percentEncoded: false), &information) == 0 else { return false }

    return information.st_flags & UInt32(UF_COMPRESSED) != 0
}

// …

while let block = try input.read(upToCount: blockSize), !block.isEmpty {

    let isZero = block.count == blockSize ? block == zeros : block == Data(count: block.count)

    if !isZero {
        try output.seek(toOffset: length)
        try output.write(contentsOf: block)
    }

    length += UInt64(block.count)
}

// Trailing holes are not written: the size makes them part of the file.
try output.truncate(atOffset: length)`;

export default defineProject({
  slug: "virtualizationkit",
  name: "VirtualizationKit",
  order: 10,
  featured: true,
  layers: ["virtualization", "application", "interface"],
  years: "2024 – 2026",
  stack: ["Swift 6", "Virtualization.framework", "QEMU", "XPC", "SwiftUI", "AppKit"],
  repo: "iOmega8561/VirtualizationKit",
  links: [
    { kind: "source", url: "https://github.com/iOmega8561/VirtualizationKit" },
    { kind: "website", url: "https://tesseract.grocco.org" },
  ],
  accent: { light: "#4a4fd1", dark: "#9a9dff" },
  cover: "/media/tesseract-macbook-dark.webp",
  copy: {
    en: {
      tagline: "Two hypervisors, one Swift API.",
      summary:
        "A macOS framework that runs virtual machines on Apple’s Virtualization.framework or on QEMU through the same interface, and keeps both inside the App Sandbox.",
      blocks: [
        {
          type: "statement",
          text: "Windows with Secure Boot, inside the App Sandbox.",
          detail:
            "Apple’s hypervisor runs macOS and Linux. QEMU runs nearly everything else, but it expects to open files, spawn processes and talk to devices. VirtualizationKit makes both behave like one well-mannered Swift type.",
        },
        {
          type: "video",
          src: "/media/tesseract-windows-boot.mp4",
          poster: "/media/tesseract-windows-boot-poster.webp",
          srcDark: "/media/tesseract-windows-boot-dark.mp4",
          posterDark: "/media/tesseract-windows-boot-poster-dark.webp",
          alt: "Tesseract starts a Windows 11 virtual machine with TPM 2.0 and Secure Boot enabled; Windows boots to its welcome screen.",
          caption: "Tesseract boots Windows 11 on the QEMU back-end, with TPM 2.0 and Secure Boot switched on in its settings.",
          frame: "window",
        },
        {
          type: "facts",
          items: [
            { value: "2", label: "back-ends behind the same protocol" },
            { value: "320+", label: "commits since October 2024" },
            { value: "48", label: "tests on templates, launch plans and protocols" },
          ],
        },
        {
          type: "prose",
          title: "One template, any back-end",
          paragraphs: [
            "A machine is described once, in terms every back-end shares: processors, memory, disks, network, display and optional capabilities. Both back-ends implement the same VirtualMachine protocol and are driven by the same actions and execution states, so switching from one to the other means changing one type name.",
            "What only one back-end understands goes into its own options: Rosetta, nested virtualization and directory sharing for Apple’s hypervisor; TPM 2.0, Secure Boot firmware and emulated x86_64 for QEMU. Nothing is inferred from the guest operating system, so a machine keeps describing the same hardware in every release.",
          ],
        },
        {
          type: "code",
          file: "Example.swift",
          language: "swift",
          caption: "State changes are published through Combine and the Observation framework, so a SwiftUI view only has to read the machine’s state.",
          code: templateCode,
        },
        {
          type: "diagram",
          name: "qemuSandbox",
          caption: "The app opens every file and passes descriptors over XPC. The emulator never gets file access of its own.",
        },
        {
          type: "features",
          title: "How QEMU fits in the sandbox",
          items: [
            {
              title: "A process of its own",
              body: "QEMU is built as a shared library from UTM’s fork, with its dependencies linked in statically, and runs inside an XPC service embedded in the framework. It never shares an address space with the app.",
            },
            {
              title: "Descriptors, not paths",
              body: "Disk images and firmware state are opened by the app, which holds the security-scoped bookmarks, and handed over as open file descriptors. The helper needs no file-access entitlements.",
            },
            {
              title: "A patched TPM",
              body: "swtpm reopened its state file by path, which the sandbox refuses. A small patch makes it reuse the descriptor through dup(), and Windows 11 gets its TPM 2.0.",
            },
            {
              title: "A display client in Swift",
              body: "The guest screen arrives over RFB, the VNC protocol, read by a client written from scratch in Swift and drawn with Core Graphics. QEMU is driven through a native QMP client.",
            },
          ],
        },
        {
          type: "table",
          title: "Two back-ends, compared",
          columns: ["", "Apple Virtualization", "QEMU"],
          rows: [
            ["Guests", "macOS, Linux", "Linux, Windows and other UEFI guests"],
            ["Architectures", "arm64", "arm64 accelerated, x86_64 emulated"],
            ["Networking", "NAT, bridged", "NAT"],
            ["Extras", "Rosetta, nested virtualization, directory sharing, macOS installation", "TPM 2.0, Secure Boot firmware, reset"],
          ],
        },
        {
          type: "media",
          src: "/media/tesseract-macbook.webp",
          srcDark: "/media/tesseract-macbook-dark.webp",
          alt: "Tesseract running a Fedora Linux virtual machine next to its Xcode project, on a MacBook Pro.",
          caption: "In production: Tesseract, on the Mac App Store, is built on VirtualizationKit.",
          frame: "bare",
        },
        {
          type: "prose",
          title: "A bug only the App Store could ship",
          paragraphs: [
            "Tesseract 2.0 reached the Mac App Store on the new VirtualizationKit, and there, and only there, no QEMU guest would boot. One host core at 100%, no error from QEMU, the display stuck on its “Display output is not active” placeholder. The same code, built for development or signed with Developer ID, worked.",
            "The registers of the boot processor told the story: all zero, the stack pointer too, and the program counter stuck at 0x200, the exception vector of a processor whose vectors start at address zero. The first instruction of the firmware faulted, then every instruction of the vector, forever. The guest saw no firmware at all.",
            "The App Store installs applications with transparent file system compression. The 64 MiB edk2 firmware inside the installed helper took 1.3 MB on disk: its contents lived, compressed, in an extended attribute, and its data fork was empty. Ordinary reads decompress on the fly, so the file looks intact to anything that simply opens and reads it. QEMU’s block layer, which looks at an image the way disk software does, found nothing there, and handed the guest a firmware of zeros.",
          ],
        },
        {
          type: "code",
          title: "Finding a compressed file, and copying around it",
          file: "QEMU/Configuration/UncompressedPayload.swift",
          language: "swift",
          caption:
            "The copy is written from ordinary reads, which decompress, into a file the system never compressed. Blocks of zeros are skipped and left as holes, so a 64 MiB firmware that is mostly padding still takes little space.",
          code: uncompressed,
        },
        {
          type: "features",
          title: "The fix, everywhere a file becomes a drive",
          items: [
            { title: "Firmware", body: "A compressed firmware is copied once into the application’s caches and attached from there. The copy is named after the size and date of the original, so an updated application makes a new one." },
            { title: "Variable stores", body: "Templates are copied by writing their contents into a new file. The system’s own copy routines keep the compression of what they copy." },
            { title: "Machines made before the fix", body: "A variable store copied from a compressed template by an earlier version is rewritten as a plain file the next time its machine starts." },
            { title: "Reproduced in tests", body: "The tests compress files with ditto --hfsCompression, as the installer does, and check that copies keep their contents and their holes." },
          ],
        },
      ],
    },
    it: {
      tagline: "Due hypervisor, un’unica API Swift.",
      summary:
        "Un framework per macOS che avvia macchine virtuali su Virtualization.framework di Apple o su QEMU con la stessa interfaccia, e le tiene entrambe dentro la sandbox delle app.",
      blocks: [
        {
          type: "statement",
          text: "Windows con Secure Boot, dentro la sandbox delle app.",
          detail:
            "L’hypervisor di Apple fa girare macOS e Linux. QEMU fa girare quasi tutto il resto, ma si aspetta di aprire file, avviare processi e parlare con i dispositivi. VirtualizationKit fa comportare entrambi come un unico, educato tipo Swift.",
        },
        {
          type: "video",
          src: "/media/tesseract-windows-boot.mp4",
          poster: "/media/tesseract-windows-boot-poster.webp",
          srcDark: "/media/tesseract-windows-boot-dark.mp4",
          posterDark: "/media/tesseract-windows-boot-poster-dark.webp",
          alt: "Tesseract avvia una macchina virtuale Windows 11 con TPM 2.0 e Secure Boot attivi; Windows arriva alla schermata di benvenuto.",
          caption: "Tesseract avvia Windows 11 sul back-end QEMU, con TPM 2.0 e Secure Boot attivati nelle impostazioni.",
          frame: "window",
        },
        {
          type: "facts",
          items: [
            { value: "2", label: "back-end dietro lo stesso protocollo" },
            { value: "320+", label: "commit da ottobre 2024" },
            { value: "48", label: "test su template, piani di avvio e protocolli" },
          ],
        },
        {
          type: "prose",
          title: "Un template, qualunque back-end",
          paragraphs: [
            "Una macchina si descrive una volta sola, con concetti comuni a ogni back-end: processori, memoria, dischi, rete, schermo e capacità opzionali. Entrambi i back-end implementano lo stesso protocollo VirtualMachine e rispondono alle stesse azioni e agli stessi stati di esecuzione: passare dall’uno all’altro significa cambiare il nome di un tipo.",
            "Ciò che solo un back-end capisce va nelle sue opzioni: Rosetta, virtualizzazione annidata e cartelle condivise per l’hypervisor di Apple; TPM 2.0, firmware Secure Boot e x86_64 emulato per QEMU. Niente viene dedotto dal sistema ospite, così una macchina descrive lo stesso hardware a ogni versione.",
          ],
        },
        {
          type: "code",
          file: "Example.swift",
          language: "swift",
          caption: "I cambi di stato arrivano tramite Combine e il framework Observation: a una vista SwiftUI basta leggere lo stato della macchina.",
          code: templateCode,
        },
        {
          type: "diagram",
          name: "qemuSandbox",
          caption: "L’app apre ogni file e passa i descrittori via XPC. L’emulatore non ha mai accesso ai file per conto suo.",
        },
        {
          type: "features",
          title: "Come QEMU entra nella sandbox",
          items: [
            {
              title: "Un processo tutto suo",
              body: "QEMU è compilato come libreria condivisa dal fork di UTM, con le dipendenze collegate staticamente, e gira in un servizio XPC incluso nel framework. Non condivide mai lo spazio di memoria con l’app.",
            },
            {
              title: "Descrittori, non percorsi",
              body: "Immagini disco e stato del firmware li apre l’app, che custodisce i segnalibri con ambito di sicurezza, e li passa come descrittori già aperti. Il processo di supporto non ha bisogno di permessi sui file.",
            },
            {
              title: "Un TPM modificato",
              body: "swtpm riapriva il file di stato tramite il percorso, e la sandbox lo impediva. Una piccola patch gli fa riusare il descrittore con dup(), e Windows 11 ottiene il suo TPM 2.0.",
            },
            {
              title: "Un client video in Swift",
              body: "Lo schermo dell’ospite arriva via RFB, il protocollo di VNC, letto da un client scritto da zero in Swift e disegnato con Core Graphics. QEMU si comanda con un client QMP nativo.",
            },
          ],
        },
        {
          type: "table",
          title: "I due back-end a confronto",
          columns: ["", "Apple Virtualization", "QEMU"],
          rows: [
            ["Ospiti", "macOS, Linux", "Linux, Windows e altri ospiti UEFI"],
            ["Architetture", "arm64", "arm64 accelerata, x86_64 emulata"],
            ["Rete", "NAT, bridge", "NAT"],
            ["Extra", "Rosetta, virtualizzazione annidata, cartelle condivise, installazione di macOS", "TPM 2.0, firmware Secure Boot, reset"],
          ],
        },
        {
          type: "media",
          src: "/media/tesseract-macbook.webp",
          srcDark: "/media/tesseract-macbook-dark.webp",
          alt: "Tesseract che esegue una macchina virtuale Fedora Linux accanto al suo progetto Xcode, su un MacBook Pro.",
          caption: "In produzione: Tesseract, sul Mac App Store, è costruito su VirtualizationKit.",
          frame: "bare",
        },
        {
          type: "prose",
          title: "Un bug che solo l’App Store poteva distribuire",
          paragraphs: [
            "Tesseract 2.0 è arrivato sul Mac App Store con il nuovo VirtualizationKit, e lì, solo lì, nessun ospite QEMU si avviava. Un core dell’host al 100%, nessun errore da QEMU, lo schermo fermo sul suo segnaposto “Display output is not active”. Lo stesso codice, compilato per lo sviluppo o firmato con Developer ID, funzionava.",
            "I registri del processore di avvio raccontavano tutto: tutti a zero, anche lo stack pointer, e il program counter fermo a 0x200, il vettore delle eccezioni di un processore i cui vettori partono dall’indirizzo zero. La prima istruzione del firmware generava un’eccezione, poi ogni istruzione del vettore, all’infinito. L’ospite non vedeva alcun firmware.",
            "L’App Store installa le applicazioni con la compressione trasparente del file system. Il firmware edk2 da 64 MiB dentro l’helper installato occupava 1,3 MB su disco: il contenuto stava, compresso, in un attributo esteso, e il data fork era vuoto. Le letture ordinarie decomprimono al volo, così il file sembra intatto a chiunque si limiti ad aprirlo e leggerlo. Il block layer di QEMU, che guarda un’immagine come fa un software per dischi, non ci trovava nulla, e consegnava all’ospite un firmware fatto di zeri.",
          ],
        },
        {
          type: "code",
          title: "Riconoscere un file compresso, e aggirarlo con una copia",
          file: "QEMU/Configuration/UncompressedPayload.swift",
          language: "swift",
          caption:
            "La copia si scrive a partire da letture ordinarie, che decomprimono, in un file che il sistema non ha mai compresso. I blocchi di zeri vengono saltati e lasciati come buchi, così un firmware da 64 MiB fatto quasi solo di riempimento occupa comunque poco spazio.",
          code: uncompressed,
        },
        {
          type: "features",
          title: "La correzione, ovunque un file diventa un disco",
          items: [
            { title: "Firmware", body: "Un firmware compresso viene copiato una volta nelle cache dell’applicazione e collegato da lì. La copia prende il nome da dimensione e data dell’originale, così un’applicazione aggiornata ne crea una nuova." },
            { title: "Archivi delle variabili", body: "I modelli vengono copiati scrivendone il contenuto in un file nuovo. Le funzioni di copia del sistema conservano la compressione di ciò che copiano." },
            { title: "Macchine create prima della correzione", body: "Un archivio delle variabili copiato da un modello compresso da una versione precedente viene riscritto come file normale al successivo avvio della sua macchina." },
            { title: "Riprodotto nei test", body: "I test comprimono i file con ditto --hfsCompression, come fa l’installer, e verificano che le copie conservino contenuto e buchi." },
          ],
        },
      ],
    },
  },
});

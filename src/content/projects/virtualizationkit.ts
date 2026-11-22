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
      ],
    },
  },
});

import type { Localized } from "../i18n/languages";
import type { LayerId } from "./types";

type Layer = { name: string; tech: string[] };

type ProfileCopy = {
  headline: string;
  intro: string;
  layers: Record<LayerId, Layer>;
  featured: { headline: string; body: string };
  principles: { title: string; items: { title: string; body: string }[] };
  timeline: { title: string; intro: string; steps: { when: string; title: string; body: string; slug?: string }[] };
};

export const profile: Localized<ProfileCopy> = {
  en: {
    headline: "From the system up.",
    intro:
      "I’m Giuseppe Rocco, a computer engineer. I write software and I think about where it will run: from the Linux kernel to the SwiftUI interface, by way of virtual machines and rootless containers.",
    layers: {
      interface: { name: "Interface", tech: ["SwiftUI", "React", "visionOS", "AppKit"] },
      application: { name: "Application", tech: ["Swift", "Spring", "TypeScript", "C++"] },
      container: { name: "Container", tech: ["Rootless Podman", "Quadlet", "Containerfile"] },
      virtualization: { name: "Virtualization", tech: ["Virtualization.framework", "QEMU", "KVM", "Proxmox"] },
      system: { name: "System", tech: ["Linux", "systemd", "Arch Linux", "WireGuard", "OpenZFS"] },
    },
    featured: {
      headline: "Windows with Secure Boot, in an app built for the Mac App Store.",
      body: "VirtualizationKit puts Apple’s Virtualization.framework and QEMU behind one Swift API. QEMU runs in an isolated XPC service that only ever receives files that are already open, which is what lets it live inside the App Sandbox.",
    },
    principles: {
      title: "How I work",
      items: [
        {
          title: "Deployment comes first",
          body: "When something has to run on Linux, the first file I write is its Containerfile, then its Quadlet unit. Knowing where the code will live shapes how I write it.",
        },
        {
          title: "Least privilege, everywhere",
          body: "Rootless containers with a read-only filesystem and no capabilities on Linux. The App Sandbox on macOS, even for an emulator. Each piece gets only the access it needs.",
        },
        {
          title: "Concurrency the compiler can check",
          body: "Swift 6 strict concurrency, actors and Sendable values. If two threads could race, I want the build to fail rather than the app.",
        },
      ],
    },
    timeline: {
      title: "How I got there",
      intro: "Five steps in about two and a half years. Each project prepared the next one.",
      steps: [
        {
          when: "2024",
          title: "Tesseract",
          body: "A virtual machine manager for the Mac, published on the App Store and built on Apple’s Virtualization.framework.",
          slug: "tesseract",
        },
        {
          when: "October 2024",
          title: "VirtualizationKit",
          body: "The engine of Tesseract becomes a framework of its own, with an API designed to host more than one back-end.",
          slug: "virtualizationkit",
        },
        {
          when: "February 2025",
          title: "QEMU Manager",
          body: "A rework of a QEMU front-end for macOS, with QEMU bundled in: from m68k Macs to Windows 11 on ARM.",
          slug: "qemu-manager",
        },
        {
          when: "March 2025",
          title: "EasyVNC",
          body: "A VNC client in SwiftUI, built on libvncclient through an Objective-C++ bridge.",
          slug: "easyvnc",
        },
        {
          when: "November 2026",
          title: "The QEMU back-end",
          body: "Both lessons return in VirtualizationKit, rewritten: QEMU sandboxed in an XPC service, and native RFB and QMP clients in pure Swift.",
          slug: "virtualizationkit",
        },
      ],
    },
  },
  it: {
    headline: "Dal sistema in su.",
    intro:
      "Sono Giuseppe Rocco, ingegnere informatico. Scrivo software e penso a dove girerà: dal kernel Linux all’interfaccia SwiftUI, passando per macchine virtuali e container rootless.",
    layers: {
      interface: { name: "Interfaccia", tech: ["SwiftUI", "React", "visionOS", "AppKit"] },
      application: { name: "Applicazione", tech: ["Swift", "Spring", "TypeScript", "C++"] },
      container: { name: "Container", tech: ["Podman rootless", "Quadlet", "Containerfile"] },
      virtualization: { name: "Virtualizzazione", tech: ["Virtualization.framework", "QEMU", "KVM", "Proxmox"] },
      system: { name: "Sistema", tech: ["Linux", "systemd", "Arch Linux", "WireGuard", "OpenZFS"] },
    },
    featured: {
      headline: "Windows con Secure Boot, in un’app pensata per il Mac App Store.",
      body: "VirtualizationKit mette Virtualization.framework di Apple e QEMU dietro un’unica API Swift. QEMU gira in un servizio XPC isolato che riceve soltanto file già aperti: è questo che gli permette di vivere dentro la sandbox delle app.",
    },
    principles: {
      title: "Come lavoro",
      items: [
        {
          title: "Prima il deployment",
          body: "Quando qualcosa deve girare su Linux, il primo file che scrivo è il Containerfile, poi l’unità Quadlet. Sapere dove vivrà il codice cambia il modo in cui lo scrivo.",
        },
        {
          title: "Privilegi minimi, ovunque",
          body: "Container rootless con filesystem in sola lettura e nessuna capability su Linux. La sandbox delle app su macOS, perfino per un emulatore. Ogni pezzo ha solo gli accessi che gli servono.",
        },
        {
          title: "Concorrenza verificata dal compilatore",
          body: "Swift 6 con la strict concurrency, attori e valori Sendable. Se due thread possono entrare in conflitto, voglio che fallisca la compilazione, non l’app.",
        },
      ],
    },
    timeline: {
      title: "Come ci sono arrivato",
      intro: "Cinque passi in circa due anni e mezzo. Ogni progetto ha preparato il successivo.",
      steps: [
        {
          when: "2024",
          title: "Tesseract",
          body: "Un gestore di macchine virtuali per Mac, pubblicato sull’App Store e costruito su Virtualization.framework di Apple.",
          slug: "tesseract",
        },
        {
          when: "Ottobre 2024",
          title: "VirtualizationKit",
          body: "Il motore di Tesseract diventa un framework a sé, con un’API pensata per ospitare più di un back-end.",
          slug: "virtualizationkit",
        },
        {
          when: "Febbraio 2025",
          title: "QEMU Manager",
          body: "La rielaborazione di un’interfaccia per QEMU su macOS, con QEMU incluso: dai Mac m68k a Windows 11 su ARM.",
          slug: "qemu-manager",
        },
        {
          when: "Marzo 2025",
          title: "EasyVNC",
          body: "Un client VNC in SwiftUI, costruito su libvncclient attraverso un ponte in Objective-C++.",
          slug: "easyvnc",
        },
        {
          when: "Novembre 2026",
          title: "Il back-end QEMU",
          body: "Le due lezioni tornano in VirtualizationKit, riscritte: QEMU isolato in un servizio XPC, e client RFB e QMP nativi in Swift puro.",
          slug: "virtualizationkit",
        },
      ],
    },
  },
};

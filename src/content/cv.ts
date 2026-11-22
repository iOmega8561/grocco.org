import type { Localized } from "../i18n/languages";

type Entry = {
  title: string;
  /** Company, school or issuer. Leave empty to hide it. */
  place?: string;
  /** Shown as written, e.g. "2023 – today". Leave empty to hide it. */
  when?: string;
  body?: string;
  url?: string;
};

type CvCopy = {
  summary: string;
  experience: Entry[];
  education: Entry[];
  certifications: Entry[];
  languages: Entry[];
  /** `projects` may be empty for skills practised at work, without public code. */
  evidence: { skill: string; detail: string; projects: string[] }[];
};

export const cv: Localized<CvCopy> = {
  en: {
    summary:
      "Computer engineer at the meeting point of systems and application development. At work I build full-stack software with Spring and React and look after the company’s infrastructure on Proxmox. In my own time I write virtualization software for the Mac, have shipped apps to the App Store, and run a containerized home infrastructure.",
    experience: [
      {
        title: "Software & Systems Engineer",
        place: "DIGITAL360 GOV, Naples",
        when: "November 2025 – today",
        body: "REST services in Java and Spring, from new features to core bug fixes, and dynamic interfaces in React. I also manage the company’s IT infrastructure: Proxmox hypervisors and VPS administration, with centralized logging and syslog aggregation for proactive monitoring.",
      },
      {
        title: "ARTE Team Lead & Developer",
        place: "Apple Developer Academy, Naples",
        when: "July 2024 – June 2025",
        body: "Software engineering for Apple Vision Pro in the Advanced Research Track Experience: multi-modal DICOM imaging for mixed reality, with the University Hospital Federico II (Policlinico). Third-party C++ libraries integrated through Objective-C++ bridging, interfaces in SwiftUI and RealityKit, Scrum with Jira and Confluence.",
        url: "https://www.developeracademy.unina.it/en/about",
      },
    ],
    education: [
      {
        title: "B.Sc. in Computer Engineering",
        place: "Università eCampus",
        when: "2025",
        body: "Computer architecture and assembly, software engineering, computer networks, operating systems and concurrent programming.",
      },
    ],
    certifications: [
      {
        title: "Database Engineer",
        place: "Regione Campania",
        when: "2024",
        body: "Design, implementation and maintenance of database systems, data modelling, SQL, IT security and cloud fundamentals. EQF level 5.",
        url: "https://capire.regione.campania.it/rrtq/public/scheda/141",
      },
    ],
    languages: [
      { title: "Italian", place: "Native" },
      { title: "English", place: "C1, proficient in every skill" },
    ],
    evidence: [
      { skill: "Rootless Podman and Quadlet", detail: "Hardened units, read-only images, systemd as the orchestrator.", projects: ["retroshelf", "containerfiles"] },
      { skill: "Virtualization", detail: "Virtualization.framework and QEMU, from the API down to the process model. Proxmox clusters at work and at home.", projects: ["virtualizationkit", "tesseract", "qemu-manager"] },
      { skill: "Swift 6 and strict concurrency", detail: "Actors, Sendable values and macros that generate the boilerplate.", projects: ["tools4swiftdata", "virtualizationkit"] },
      { skill: "C and C++ on Apple platforms", detail: "Cross-compiling native libraries and bridging them with Objective-C++.", projects: ["dcmvision", "easyvnc"] },
      { skill: "SwiftUI and RealityKit", detail: "Reusable components, macOS-specific behaviour, touch-first layouts, immersive spaces.", projects: ["tools4swiftui", "playos", "openchat", "dcmvision"] },
      { skill: "Java and Spring", detail: "REST services in production, at DIGITAL360 GOV.", projects: [] },
      { skill: "React and TypeScript", detail: "Interfaces at work; front-ends and Node back-ends that ship as a single container.", projects: ["retroshelf"] },
      { skill: "Linux administration", detail: "Installers, post-install configuration, centralized logging, homelab services.", projects: ["archibald", "containerfiles"] },
    ],
  },
  it: {
    summary:
      "Ingegnere informatico nel punto d’incontro tra sistemi e sviluppo applicativo. Al lavoro costruisco software full-stack con Spring e React e mi occupo dell’infrastruttura aziendale su Proxmox. Nel tempo libero scrivo software di virtualizzazione per Mac, ho pubblicato app sull’App Store e gestisco un’infrastruttura domestica containerizzata.",
    experience: [
      {
        title: "System & Software Engineer",
        place: "DIGITAL360 GOV, Napoli",
        when: "Novembre 2025 – oggi",
        body: "Servizi REST in Java e Spring, dalle nuove funzionalità alla correzione di bug strutturali, e interfacce dinamiche in React. Gestisco anche l’infrastruttura IT aziendale: hypervisor Proxmox e amministrazione di VPS, con logging centralizzato e aggregazione syslog per un monitoraggio proattivo.",
      },
      {
        title: "ARTE Team Lead & Developer",
        place: "Apple Developer Academy, Napoli",
        when: "Luglio 2024 – giugno 2025",
        body: "Ingegneria del software per Apple Vision Pro nell’Advanced Research Track Experience: imaging DICOM multimodale per la realtà mista, in collaborazione con l’Azienda Ospedaliera Universitaria Federico II (Policlinico). Librerie C++ di terze parti integrate con ponti in Objective-C++, interfacce in SwiftUI e RealityKit, metodologia Scrum con Jira e Confluence.",
        url: "https://www.developeracademy.unina.it/en/about",
      },
    ],
    education: [
      {
        title: "Laurea in Ingegneria Informatica",
        place: "Università eCampus",
        when: "2025",
        body: "Architettura dei calcolatori e assembly, ingegneria del software, reti di calcolatori, sistemi operativi e programmazione concorrente.",
      },
    ],
    certifications: [
      {
        title: "Database Engineer",
        place: "Regione Campania",
        when: "2024",
        body: "Progettazione, realizzazione e manutenzione di sistemi di basi di dati, modellazione dei dati, SQL, fondamenti di sicurezza informatica e cloud. Livello EQF 5.",
        url: "https://capire.regione.campania.it/rrtq/public/scheda/141",
      },
    ],
    languages: [
      { title: "Italiano", place: "Madrelingua" },
      { title: "Inglese", place: "C1, avanzato in tutte le competenze" },
    ],
    evidence: [
      { skill: "Podman rootless e Quadlet", detail: "Unità irrobustite, immagini in sola lettura, systemd come orchestratore.", projects: ["retroshelf", "containerfiles"] },
      { skill: "Virtualizzazione", detail: "Virtualization.framework e QEMU, dall’API fino al modello dei processi. Cluster Proxmox al lavoro e a casa.", projects: ["virtualizationkit", "tesseract", "qemu-manager"] },
      { skill: "Swift 6 e strict concurrency", detail: "Attori, valori Sendable e macro che generano il codice ripetitivo.", projects: ["tools4swiftdata", "virtualizationkit"] },
      { skill: "C e C++ sulle piattaforme Apple", detail: "Compilazione incrociata di librerie native e ponti in Objective-C++.", projects: ["dcmvision", "easyvnc"] },
      { skill: "SwiftUI e RealityKit", detail: "Componenti riutilizzabili, comportamenti specifici di macOS, interfacce per il touch, spazi immersivi.", projects: ["tools4swiftui", "playos", "openchat", "dcmvision"] },
      { skill: "Java e Spring", detail: "Servizi REST in produzione, in DIGITAL360 GOV.", projects: [] },
      { skill: "React e TypeScript", detail: "Interfacce al lavoro; front-end e back-end Node che si distribuiscono come un unico container.", projects: ["retroshelf"] },
      { skill: "Amministrazione Linux", detail: "Installazione, configurazione post-installazione, logging centralizzato, servizi per l’homelab.", projects: ["archibald", "containerfiles"] },
    ],
  },
};

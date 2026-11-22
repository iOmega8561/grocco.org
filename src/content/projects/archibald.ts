import { defineProject } from "../types";

const session = `❯ ./archibald.py
Message: Welcome giuseppe, select a profile:
1) Cockpit server
2) Display ready
3) Minimal setup
4) Cinnamon
5) Gnome desktop
6) Plasma desktop
Answer: 6`;

const profile = `"""Partial Plasma Desktop Environment package collection"""

deps = [
    "display"
]

name = "Plasma desktop"

pkgs = [
    "plasma-desktop",
    "sddm",
    "dolphin",
    "konsole",
    "kscreen",
    "plasma-nm",
    "xdg-desktop-portal-kde",
    # …
]`;

const pci = `def __parse_pci(gfxd):

    # Try to find known pci devs from lspci
    pcidevs = linux.lspci()

    for device in gfxd:

        # Repeat match for every user defined driver group
        match = [
            f"VGA compatible controller: {device}",
            f"Display controller: {device}",
            f"3D controller: {device}"
        ]

        if any(x in pcidevs for x in match):
            return gfxd[device]

    return []`;

export default defineProject({
  slug: "archibald",
  name: "Archibald",
  order: 70,
  layers: ["system"],
  years: "2022 – 2026",
  stack: ["Python", "Arch Linux", "pacman", "systemd"],
  repo: "iOmega8561/Archibald",
  links: [{ kind: "source", url: "https://github.com/iOmega8561/Archibald" }],
  accent: { light: "#0f6c9e", dark: "#5cc0f2" },
  copy: {
    en: {
      tagline: "Install Arch by hand. Let it do the rest.",
      summary: "A post-install configurator for people who follow the Arch Linux handbook themselves but don’t want to rebuild their setup by hand every time.",
      blocks: [
        { type: "code", file: "zsh", language: "console", code: session },
        {
          type: "statement",
          text: "The installation is a ritual. The setup afterwards shouldn’t be.",
          detail:
            "Installing Arch by the handbook teaches you your system. Reinstalling the same desktop, drivers and services for the tenth time teaches you nothing. Archibald picks up where the handbook ends.",
        },
        {
          type: "prose",
          title: "Profiles are Python",
          paragraphs: [
            "A profile is a Python module: a name, the packages, the services to enable, the groups, the shell, AUR and Flatpak packages, files to write and commands to run. Every field but the name is optional.",
            "Profiles depend on each other. Plasma depends on display, which brings the shared graphics stack; Archibald resolves the dependencies recursively, applies each profile once, and in the right order.",
          ],
        },
        { type: "code", file: "profiles/plasma.py", language: "python", code: profile },
        {
          type: "pipeline",
          title: "What applying a profile does",
          steps: [
            { title: "Drivers", detail: "Reads lspci and adds the driver packages for the graphics card it finds." },
            { title: "Packages", detail: "Installs everything with pacman in one transaction." },
            { title: "Files", detail: "Writes the configuration files, with the user’s home filled in." },
            { title: "Groups and services", detail: "Adds the user to groups and enables the systemd units." },
            { title: "Extras", detail: "Changes the shell, installs Flatpaks, sets up paru for the AUR, runs custom commands." },
          ],
        },
        { type: "code", title: "Drivers, from the hardware it finds", file: "functions/setup.py", language: "python", code: pci },
        {
          type: "prose",
          paragraphs: [
            "It runs inside arch-chroot or on a booted system, as a user with sudo rather than as root, and has been my first command after every Arch installation since 2022.",
          ],
        },
      ],
    },
    it: {
      tagline: "Installa Arch a mano. Al resto pensa lui.",
      summary: "Un configuratore post-installazione per chi segue da sé la guida di Arch Linux, ma non vuole ricostruire a mano il proprio ambiente ogni volta.",
      blocks: [
        { type: "code", file: "zsh", language: "console", code: session },
        {
          type: "statement",
          text: "L’installazione è un rito. La configurazione dopo non dovrebbe esserlo.",
          detail:
            "Installare Arch seguendo la guida ti insegna il tuo sistema. Reinstallare per la decima volta lo stesso desktop, gli stessi driver e servizi non ti insegna nulla. Archibald riprende da dove finisce la guida.",
        },
        {
          type: "prose",
          title: "I profili sono Python",
          paragraphs: [
            "Un profilo è un modulo Python: un nome, i pacchetti, i servizi da abilitare, i gruppi, la shell, i pacchetti AUR e Flatpak, i file da scrivere e i comandi da eseguire. Tutti i campi tranne il nome sono facoltativi.",
            "I profili dipendono l’uno dall’altro. Plasma dipende da display, che porta lo stack grafico comune; Archibald risolve le dipendenze in modo ricorsivo e applica ogni profilo una volta sola, nell’ordine giusto.",
          ],
        },
        { type: "code", file: "profiles/plasma.py", language: "python", code: profile },
        {
          type: "pipeline",
          title: "Cosa succede quando applica un profilo",
          steps: [
            { title: "Driver", detail: "Legge lspci e aggiunge i pacchetti dei driver per la scheda grafica che trova." },
            { title: "Pacchetti", detail: "Installa tutto con pacman in un’unica transazione." },
            { title: "File", detail: "Scrive i file di configurazione, con la home dell’utente al posto giusto." },
            { title: "Gruppi e servizi", detail: "Aggiunge l’utente ai gruppi e abilita le unità systemd." },
            { title: "Extra", detail: "Cambia la shell, installa i Flatpak, prepara paru per l’AUR, esegue i comandi personalizzati." },
          ],
        },
        { type: "code", title: "I driver, dall’hardware che trova", file: "functions/setup.py", language: "python", code: pci },
        {
          type: "prose",
          paragraphs: [
            "Funziona dentro arch-chroot o su un sistema avviato, come utente con sudo e non come root, ed è il primo comando che lancio dopo ogni installazione di Arch dal 2022.",
          ],
        },
      ],
    },
  },
});

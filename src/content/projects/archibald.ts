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

const linux = `class pacman:
    """Executable: pacman"""

    # sudo pacman -S pkgs
    @staticmethod
    def S(pkgs: list):
        """Command: pacman -S %s --noconfirm --needed"""

        try:

            with open(f"{logpath}/pacman.log", "a", encoding="utf-8") as log:

                # Invoke subprocess
                subprocess.run(
                    ["sudo", "pacman", "-S", "--noconfirm", "--needed"] + pkgs,
                    stdout = log,
                    stderr = subprocess.STDOUT,
                    check  = True,
                    text   = True
                )

            # Return true for success
            return True
        except subprocess.CalledProcessError:

            # Return false for failure
            return False

class paru:
    """Executable: paru"""

    @staticmethod
    def setup():
        # …
        if pacman.Qs(["paru"]):
            return True

        if not clone("https://aur.archlinux.org/paru") or not makepkg.sir("paru"):
            return False

        return True`;

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
          title: "Commands that read like commands",
          paragraphs: [
            "Everything Archibald does to the system goes through one module, linux.py. Each executable is a class named after it, and each method after its flags: pacman.S, pacman.Qs, usermod.aG, makepkg.sir. The module breaks PEP 8 on purpose, so that reading the setup reads like the shell session it replaces.",
            "Arguments travel as lists, straight to the executable, so a package or group name can’t turn into a command; only the custom commands a profile spells out go through bash. Each wrapper writes its output to a log of its own, pacman.log, systemctl.log, paru.log, and returns true or false instead of raising: the setup decides what is fatal, and the terminal stays readable.",
            "Tools arrive when they’re first needed. lspci installs pciutils, cloning installs git, Flatpak installs itself, and paru is built from the AUR with makepkg the first time a profile asks for an AUR package. Privileges are per command too: a path inside the user’s home is written as the user, a system path through sudo tee.",
          ],
        },
        { type: "code", file: "functions/linux.py", language: "python", code: linux },
        {
          type: "prose",
          paragraphs: [
            "It runs inside arch-chroot or on a booted system, as a user with sudo rather than as root, and has been my first command after every Arch installation since 2022.",
          ],
        },
        {
          type: "media",
          src: "/media/archibald-fastfetch.webp",
          srcDark: "/media/archibald-fastfetch-dark.webp",
          alt: "fastfetch in GNOME Console, next to the Arch Linux logo: Arch Linux with the zen kernel, GNOME 51 on Wayland, an AMD Ryzen 7 5800X3D and an NVIDIA GeForce RTX 3080 Ti.",
          caption: "My workstation, twelve minutes after boot. I use Arch, btw.",
          frame: "bare",
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
          title: "Comandi che si leggono come comandi",
          paragraphs: [
            "Tutto ciò che Archibald fa al sistema passa per un solo modulo, linux.py. Ogni eseguibile è una classe con il suo nome, e ogni metodo prende il nome dei suoi flag: pacman.S, pacman.Qs, usermod.aG, makepkg.sir. Il modulo viola PEP 8 di proposito, perché leggere la configurazione somigli alla sessione di shell che sostituisce.",
            "Gli argomenti viaggiano come liste, dritti all’eseguibile, così il nome di un pacchetto o di un gruppo non può diventare un comando; solo i comandi personalizzati scritti in un profilo passano per bash. Ogni wrapper scrive il proprio output in un log tutto suo, pacman.log, systemctl.log, paru.log, e restituisce vero o falso invece di sollevare eccezioni: è la configurazione a decidere cosa è fatale, e il terminale resta leggibile.",
            "Gli strumenti arrivano quando servono per la prima volta. lspci installa pciutils, la clonazione installa git, Flatpak installa sé stesso, e paru viene compilato dall’AUR con makepkg la prima volta che un profilo chiede un pacchetto AUR. Anche i privilegi sono per comando: un percorso nella home dell’utente viene scritto come utente, un percorso di sistema con sudo tee.",
          ],
        },
        { type: "code", file: "functions/linux.py", language: "python", code: linux },
        {
          type: "prose",
          paragraphs: [
            "Funziona dentro arch-chroot o su un sistema avviato, come utente con sudo e non come root, ed è il primo comando che lancio dopo ogni installazione di Arch dal 2022.",
          ],
        },
        {
          type: "media",
          src: "/media/archibald-fastfetch.webp",
          srcDark: "/media/archibald-fastfetch-dark.webp",
          alt: "fastfetch in GNOME Console, accanto al logo di Arch Linux: Arch Linux con il kernel zen, GNOME 51 su Wayland, un AMD Ryzen 7 5800X3D e una NVIDIA GeForce RTX 3080 Ti.",
          caption: "La mia workstation, dodici minuti dopo l’avvio. I use Arch, btw.",
          frame: "bare",
        },
      ],
    },
  },
});

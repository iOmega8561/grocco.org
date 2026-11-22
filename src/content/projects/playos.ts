import { defineProject } from "../types";

const shell = `fileprivate nonisolated static let commands: [String: ShellCommand] = [

    "cd": .init(
        name: "cd",
        description: "Changes the current directory.",
        usage: "cd <directory>",
        minArgs: 1,
        execute: { model, args in
            // minArgs is checked before execute runs, so args[0] exists.
            model.changeDirectory(to: args[0])
        }
    ),

    "help": .init(
        name: "help",
        description: "Displays a list of available commands.",
        usage: "help",
        minArgs: 0,
        execute: { model, _ in
            let available = Self.commands.keys.sorted().joined(separator: ", ")
            model.outputLines.append("Available commands: \\(available)")
        }
    ),
    // ls, pwd, clear, playfetch…
]`;

export default defineProject({
  slug: "playos",
  name: "PlayOS",
  order: 60,
  layers: ["interface"],
  years: "2025",
  stack: ["SwiftUI", "WebKit", "Swift Playgrounds", "iPadOS"],
  repo: "iOmega8561/PlayOS",
  links: [{ kind: "source", url: "https://github.com/iOmega8561/PlayOS" }],
  accent: { light: "#2b7a3b", dark: "#74d98a" },
  cover: "/media/playos.webp",
  copy: {
    en: {
      tagline: "A pretend computer, to learn how real ones work.",
      summary: "An interactive desktop built in SwiftUI that teaches young people how an operating system works, with a terminal, a task manager and coding challenges.",
      blocks: [
        { type: "media", src: "/media/playos.webp", alt: "PlayOS on an iPad: the menu, a task manager and a terminal running playfetch.", frame: "bare" },
        {
          type: "statement",
          text: "Everything a computer does, safe to break.",
          detail:
            "Kids use computers all day and rarely see how they work. PlayOS gives them one they can poke at: start apps, kill processes, wander a file system, and nothing they do can hurt the real device.",
        },
        {
          type: "features",
          items: [
            { title: "A real window manager", body: "Windows open, minimise, move, resize and come to the front, with gestures sized for fingers rather than a pointer." },
            { title: "A boot sequence", body: "The system powers on, greets the user with a short tutorial, and reaches the desktop, like the real thing." },
            { title: "Apps to explore", body: "Terminal, Task Manager, Calculator, Paint, Settings, and offline web apps with coding challenges, a quiz and games." },
          ],
        },
        {
          type: "prose",
          title: "A shell built from a table",
          paragraphs: [
            "The terminal’s commands are not a chain of if statements. Each one is a value: a name, a description, its usage, the minimum number of arguments, and the closure that runs it. The shell checks the arguments once, generically, and help lists the table itself.",
            "Adding a command is adding an entry. The file system behind cd, ls and pwd is a small tree of directories, enough to show what a path is.",
          ],
        },
        { type: "code", file: "TerminalEmulatorAppView.swift", language: "swift", code: shell },
        {
          type: "prose",
          paragraphs: [
            "The task manager shows the windows that are open as processes, each with its identifier, and ending one closes its window: the clearest way I know to explain what a process is. Everything runs offline, and nothing leaves the device.",
          ],
        },
      ],
    },
    it: {
      tagline: "Un computer per finta, per capire come funzionano quelli veri.",
      summary: "Una scrivania interattiva costruita in SwiftUI che insegna ai più giovani come funziona un sistema operativo, con terminale, gestione attività e sfide di programmazione.",
      blocks: [
        { type: "media", src: "/media/playos.webp", alt: "PlayOS su un iPad: il menu, la gestione attività e un terminale che esegue playfetch.", frame: "bare" },
        {
          type: "statement",
          text: "Tutto ciò che fa un computer, senza paura di romperlo.",
          detail:
            "I ragazzi usano computer tutto il giorno e raramente vedono come funzionano. PlayOS gliene dà uno da esplorare: avviare app, terminare processi, girare per un file system, senza che nulla possa danneggiare il dispositivo vero.",
        },
        {
          type: "features",
          items: [
            { title: "Un vero gestore di finestre", body: "Le finestre si aprono, si riducono, si spostano, si ridimensionano e passano in primo piano, con gesti pensati per le dita e non per un puntatore." },
            { title: "Una sequenza di avvio", body: "Il sistema si accende, accoglie l’utente con un breve tutorial e arriva alla scrivania, come quello vero." },
            { title: "App da esplorare", body: "Terminale, Gestione attività, Calcolatrice, Paint, Impostazioni, e web app offline con sfide di programmazione, un quiz e qualche gioco." },
          ],
        },
        {
          type: "prose",
          title: "Una shell costruita da una tabella",
          paragraphs: [
            "I comandi del terminale non sono una catena di if. Ognuno è un valore: un nome, una descrizione, la sintassi, il numero minimo di argomenti e la closure che lo esegue. La shell controlla gli argomenti una volta sola, in modo generico, e help elenca la tabella stessa.",
            "Aggiungere un comando significa aggiungere una voce. Il file system dietro cd, ls e pwd è un piccolo albero di cartelle, quanto basta per spiegare cos’è un percorso.",
          ],
        },
        { type: "code", file: "TerminalEmulatorAppView.swift", language: "swift", code: shell },
        {
          type: "prose",
          paragraphs: [
            "La gestione attività mostra le finestre aperte come processi, ognuno con il suo identificatore, e terminarne uno chiude la sua finestra: il modo più chiaro che conosco per spiegare cos’è un processo. Tutto funziona offline, e niente lascia il dispositivo.",
          ],
        },
      ],
    },
  },
});

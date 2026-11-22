import { defineProject } from "../types";

const storage = `private let steps: [(Range<UInt64>, Int)] = [
    (   1 * .gigaByte ..< 16 * .gigaByte,      1 * .gigaByte),
    (  16 * .gigaByte ..< 32 * .gigaByte,      4 * .gigaByte),
    (  32 * .gigaByte ..< 64 * .gigaByte,      8 * .gigaByte),
    // … doubling at every range …
    (1024 * .gigaByte ..< 10240 * .gigaByte, 512 * .gigaByte)
]

var body: some View {
    HStack {
        Label("field-description-disksize", systemImage: "internaldrive")
        Spacer()

        InformativePopover(
            textWhenNormal: "help-wizard-disk",
            textWhenWarning: "help-wizard-disklow",
            warningIsShown: operatingSystem != .linux && diskSize < 32 * .gigaByte
        )

        ComplexStepper(value: diskSize, steps: steps) { step in
            diskSize = diskSize.advanced(by: step)
        } label: {
            Text(diskSize.byteScaleDescription)
        }
    }
}`;

const patch = `func patchFullScreenOptions(with options: NSApplication.PresentationOptions) {
    guard let delegateObject = self.delegate as? NSObject else { return }
    let delegateClass: AnyClass = type(of: delegateObject)

    let selector = #selector(
        NSWindowDelegate.window(_:willUseFullScreenPresentationOptions:)
    )

    // The new implementation: always answer with the options we were given.
    let block: @convention(block) (AnyObject, NSWindow, NSApplication.PresentationOptions)
        -> NSApplication.PresentationOptions = { _, _, _ in options }
    let imp = imp_implementationWithBlock(block)

    guard let probe = class_getInstanceMethod(FullScreenProbe.self, selector),
          let types = unsafe method_getTypeEncoding(probe) else { return }

    // Add the method if SwiftUI's delegate lacks it, replace it if it has one.
    if unsafe !class_addMethod(delegateClass, selector, imp, types),
       let existing = class_getInstanceMethod(delegateClass, selector) {
        unsafe method_setImplementation(existing, imp)
    }
}`;

const bookmark = `@propertyWrapper
public struct Bookmark: Sendable {

    #if os(macOS)
    private static let creationOptions: URL.BookmarkCreationOptions = [
        .withSecurityScope,
        .securityScopeAllowOnlyReadAccess,
        .withoutImplicitSecurityScope
    ]
    #endif

    private var backingData: Data?   // what gets encoded
    private var resolvedURL: URL?    // resolved once, then cached

    public var wrappedValue: URL? {
        get { resolvedURL }
        set {
            resolvedURL = newValue
            backingData = try? newValue?.bookmarkData(options: Self.creationOptions)
        }
    }
}`;

export default defineProject({
  slug: "tools4swiftui",
  name: "Tools4SwiftUI",
  order: 50,
  layers: ["interface"],
  years: "2024 – 2026",
  stack: ["Swift", "SwiftUI", "AppKit", "Objective-C runtime"],
  repo: "iOmega8561/Tools4SwiftUI",
  links: [{ kind: "source", url: "https://github.com/iOmega8561/Tools4SwiftUI" }],
  accent: { light: "#6a3fd8", dark: "#b29cff" },
  copy: {
    en: {
      tagline: "SwiftUI components I kept writing, written once.",
      summary: "Reusable components for asynchronous work and richer controls, plus macOS behaviour that SwiftUI doesn’t offer yet, reached through AppKit.",
      blocks: [
        {
          type: "video",
          src: "/media/tesseract-stepper.mp4",
          poster: "/media/tesseract-stepper-poster.webp",
          srcDark: "/media/tesseract-stepper-dark.mp4",
          posterDark: "/media/tesseract-stepper-poster-dark.webp",
          alt: "In Tesseract, the disk size stepper jumps by larger amounts as the size grows, and its help popover explains the setting.",
          caption: "ComplexStepper and InformativePopover in Tesseract’s new machine sheet.",
          frame: "window",
        },
        {
          type: "statement",
          text: "A stepper that knows a gigabyte from a terabyte.",
          detail:
            "A disk size stepper that moves by one gigabyte is fine at 8 GB and useless at 1 TB. ComplexStepper takes a list of ranges, each with its own step, so the control stays precise at the bottom and quick at the top.",
        },
        {
          type: "code",
          file: "WizardView.Performance.Storage.swift",
          language: "swift",
          caption: "Tesseract’s disk size field. The popover turns into a warning when a macOS guest gets less than 32 GB; Linux guests can go lower.",
          code: storage,
        },
        {
          type: "prose",
          title: "Reaching under SwiftUI",
          paragraphs: [
            "SwiftUI owns the delegate of the windows it creates, and on macOS 14 offers no way to change how a window behaves in full screen. Replacing the delegate would break SwiftUI; subclassing the window isn’t possible either.",
            "So WindowPresentation goes one level lower. Through the Objective-C runtime, it adds a single method to the class of SwiftUI’s own delegate, or replaces it if one is already there. Everything else the delegate does is untouched.",
          ],
        },
        { type: "code", file: "NSWindow.swift", language: "swift", code: patch },
        {
          type: "prose",
          title: "Files that survive the sandbox",
          paragraphs: [
            "A sandboxed app can only reopen a file the user picked if it kept a security-scoped bookmark. @Bookmark makes that invisible: assign a URL and the bookmark is created; encode the struct and the bookmark is what gets stored; decode it and the URL is resolved once and cached.",
            "It is Sendable, so it can travel inside the value types of a Swift 6 app, such as the templates in which a virtual machine manager remembers its installation images.",
          ],
        },
        { type: "code", file: "Bookmark.swift", language: "swift", code: bookmark },
        {
          type: "features",
          title: "And the everyday pieces",
          items: [
            { title: "Asynchronous by default", body: "AsyncButton, AsyncFileButton and BootstrapTask run async work, show progress and can cancel it, keeping the interface honest while it happens." },
            { title: "Errors, shown once", body: "A shared error presentation: NSAlert on the Mac, UIAlertController on iPhone and iPad." },
            { title: "Made for the Mac", body: "SceneCommands, editor and help commands, open and save panels, wrapped as SwiftUI views and modifiers." },
          ],
        },
      ],
    },
    it: {
      tagline: "I componenti SwiftUI che continuavo a riscrivere, scritti una volta.",
      summary: "Componenti riutilizzabili per il lavoro asincrono e controlli più ricchi, più comportamenti di macOS che SwiftUI ancora non offre, raggiunti tramite AppKit.",
      blocks: [
        {
          type: "video",
          src: "/media/tesseract-stepper.mp4",
          poster: "/media/tesseract-stepper-poster.webp",
          srcDark: "/media/tesseract-stepper-dark.mp4",
          posterDark: "/media/tesseract-stepper-poster-dark.webp",
          alt: "In Tesseract, il controllo della dimensione del disco avanza a passi sempre più grandi, e il suo popover spiega l’impostazione.",
          caption: "ComplexStepper e InformativePopover nella finestra di creazione di Tesseract.",
          frame: "window",
        },
        {
          type: "statement",
          text: "Uno stepper che distingue un gigabyte da un terabyte.",
          detail:
            "Un controllo per la dimensione del disco che avanza di un gigabyte va bene a 8 GB ed è inutile a 1 TB. ComplexStepper accetta un elenco di intervalli, ciascuno con il suo passo: il controllo resta preciso in basso e rapido in alto.",
        },
        {
          type: "code",
          file: "WizardView.Performance.Storage.swift",
          language: "swift",
          caption: "Il campo della dimensione del disco in Tesseract. Il popover diventa un avviso quando un ospite macOS ha meno di 32 GB; gli ospiti Linux possono scendere più in basso.",
          code: storage,
        },
        {
          type: "prose",
          title: "Sotto SwiftUI",
          paragraphs: [
            "SwiftUI possiede il delegate delle finestre che crea, e su macOS 14 non offre modo di cambiare il comportamento di una finestra a schermo intero. Sostituire il delegate romperebbe SwiftUI; creare una sottoclasse della finestra non è possibile.",
            "WindowPresentation scende allora di un livello. Tramite il runtime di Objective-C aggiunge un solo metodo alla classe del delegate di SwiftUI, o lo sostituisce se esiste già. Tutto il resto del delegate resta intatto.",
          ],
        },
        { type: "code", file: "NSWindow.swift", language: "swift", code: patch },
        {
          type: "prose",
          title: "File che sopravvivono alla sandbox",
          paragraphs: [
            "Un’app in sandbox può riaprire un file scelto dall’utente solo se ne ha conservato un segnalibro con ambito di sicurezza. @Bookmark lo rende invisibile: assegni un URL e il segnalibro viene creato; codifichi la struttura e viene salvato il segnalibro; la decodifichi e l’URL viene risolto una volta e tenuto in memoria.",
            "È Sendable, quindi può viaggiare nei tipi valore di un’app Swift 6, come i template in cui un gestore di macchine virtuali ricorda le sue immagini d’installazione.",
          ],
        },
        { type: "code", file: "Bookmark.swift", language: "swift", code: bookmark },
        {
          type: "features",
          title: "E i pezzi di tutti i giorni",
          items: [
            { title: "Asincrono per natura", body: "AsyncButton, AsyncFileButton e BootstrapTask eseguono lavoro asincrono, mostrano l’avanzamento e possono annullarlo, tenendo l’interfaccia coerente nel frattempo." },
            { title: "Errori, mostrati una volta", body: "Una presentazione degli errori condivisa: NSAlert sul Mac, UIAlertController su iPhone e iPad." },
            { title: "Fatto per il Mac", body: "SceneCommands, comandi di modifica e di aiuto, pannelli di apertura e salvataggio, avvolti in viste e modificatori SwiftUI." },
          ],
        },
      ],
    },
  },
});

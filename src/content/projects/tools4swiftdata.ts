import { defineProject } from "../types";

const model = `@Model @DataTransferObject
final class Chat {
    var title: String = ""
    var createdAt: Date = Date.now

    @Relationship(deleteRule: .cascade, inverse: \\Message.chat)
    var messages: [Message] = []

    @IgnoredByDTO
    var cachedPreview: String = ""

    init(title: String) { self.title = title }
}

let chats = await provider.createBackgroundManager(for: Chat.self)
let chat = try await chats.insert(Chat.Configurable(title: "Hello"))`;


const swiftui = `struct ChatList: View {
    @ManagedQuery var chats: [QueryResult<Chat>]

    var body: some View {
        List {
            ForEach(chats) { ChatRow(result: $0) }
                .onDelete { offsets in Task { try await $chats.delete(at: offsets) } }
        }
        .task { try? await $chats.refresh() }
    }
}

struct ChatRow: View {
    @QueryResult var chat: Chat.Configurable

    var body: some View {
        TextField("Title", text: $chat.title)
            .onSubmit { Task { try await $chat.commit() } }
    }
}`;

const validation = `extension Chat.Configurable {
    func validate(for scope: SwiftDataValidationScope) throws {
        guard !title.isEmpty else { throw ChatError.emptyTitle }
    }
}`;

export default defineProject({
  slug: "tools4swiftdata",
  name: "Tools4SwiftData",
  order: 40,
  layers: ["application"],
  years: "2024 – 2026",
  stack: ["Swift 6", "SwiftData", "Swift macros", "Swift Testing"],
  repo: "iOmega8561/Tools4SwiftData",
  links: [{ kind: "source", url: "https://github.com/iOmega8561/Tools4SwiftData" }],
  accent: { light: "#c9430c", dark: "#ff8f5a" },
  copy: {
    en: {
      tagline: "SwiftData, made safe for Swift 6.",
      summary:
        "SwiftData models are not Sendable, so strict concurrency won’t let them cross actors. This toolkit keeps them inside one and generates the value types that travel instead.",
      blocks: [
        {
          type: "statement",
          text: "Models stay inside the actor. Only values cross the boundary.",
          detail:
            "Every model lives in a @ModelActor. The rest of the app exchanges two Sendable value types with it: an immutable snapshot to read, a mutable draft to create and update.",
        },
        {
          type: "diagram",
          name: "dtoFlow",
          caption: "Drafts go in, snapshots come out. The model never leaves its actor.",
        },
        {
          type: "code",
          title: "One macro writes the boilerplate",
          file: "Chat.swift",
          language: "swift",
          caption: "@DataTransferObject generates Chat.Transferable, Chat.Configurable and the code that converts between them and the model.",
          code: model,
        },
        {
          type: "features",
          items: [
            { title: "Errors where they belong", body: "A broken rule, such as a relationship without an explicit attribute, is reported by the macro at compile time, on the offending line." },
            { title: "Relationships without recursion", body: "To-one relationships become persistent identifiers, to-many ones are embedded by value, so bidirectional graphs never loop." },
            { title: "Updates that write only changes", body: "Drafts are validated before being persisted, and an update touches only the properties that actually changed." },
          ],
        },
        {
          type: "code",
          title: "Rules, checked before anything is saved",
          file: "Chat+Validation.swift",
          language: "swift",
          caption: "Drafts are validated before they are persisted, on creation and on update, including the drafts nested in to-many relationships.",
          code: validation,
        },
        {
          type: "prose",
          title: "Drafts in SwiftUI",
          paragraphs: [
            "@ManagedQuery holds the list and exposes insert, commit and delete through its projected value. Each row owns a @QueryResult, which pairs the stored snapshot with an editable draft.",
            "Changes are persisted first and shown only once they succeed. A draft with unsaved edits is kept across refreshes, and it knows when the stored item changed underneath it, so a conflict is something the interface can show rather than something that silently happens.",
          ],
        },
        { type: "code", file: "ChatList.swift", language: "swift", code: swiftui },
        {
          type: "facts",
          items: [
            { value: "71", label: "tests: the macro’s expansion and diagnostics, and the library against a real SwiftData store" },
            { value: "5", label: "platforms, from watchOS to visionOS" },
          ],
        },
      ],
    },
    it: {
      tagline: "SwiftData, reso sicuro per Swift 6.",
      summary:
        "I modelli SwiftData non sono Sendable, e la strict concurrency non li lascia passare tra attori. Questo toolkit li tiene dentro un attore e genera i tipi valore che viaggiano al posto loro.",
      blocks: [
        {
          type: "statement",
          text: "I modelli restano nell’attore. Oltre il confine passano solo valori.",
          detail:
            "Ogni modello vive in un @ModelActor. Il resto dell’app scambia con lui due tipi valore Sendable: un’istantanea immutabile per leggere, una bozza modificabile per creare e aggiornare.",
        },
        {
          type: "diagram",
          name: "dtoFlow",
          caption: "Entrano bozze, escono istantanee. Il modello non lascia mai il suo attore.",
        },
        {
          type: "code",
          title: "Una macro scrive il codice ripetitivo",
          file: "Chat.swift",
          language: "swift",
          caption: "@DataTransferObject genera Chat.Transferable, Chat.Configurable e il codice che li converte da e verso il modello.",
          code: model,
        },
        {
          type: "features",
          items: [
            { title: "Errori dove servono", body: "Una regola violata, come una relazione senza attributo esplicito, viene segnalata dalla macro in compilazione, sulla riga che la causa." },
            { title: "Relazioni senza ricorsione", body: "Le relazioni a uno diventano identificatori persistenti, quelle a molti vengono incluse per valore: i grafi bidirezionali non vanno mai in loop." },
            { title: "Aggiornamenti che scrivono solo le modifiche", body: "Le bozze vengono validate prima del salvataggio, e un aggiornamento tocca solo le proprietà davvero cambiate." },
          ],
        },
        {
          type: "code",
          title: "Regole, verificate prima di salvare",
          file: "Chat+Validation.swift",
          language: "swift",
          caption: "Le bozze vengono validate prima del salvataggio, sia alla creazione sia all’aggiornamento, comprese quelle annidate nelle relazioni a molti.",
          code: validation,
        },
        {
          type: "prose",
          title: "Le bozze in SwiftUI",
          paragraphs: [
            "@ManagedQuery contiene l’elenco ed espone inserimento, salvataggio ed eliminazione attraverso il suo valore proiettato. Ogni riga possiede un @QueryResult, che accoppia l’istantanea salvata a una bozza modificabile.",
            "Le modifiche vengono prima salvate e poi mostrate, solo se il salvataggio riesce. Una bozza con modifiche non salvate sopravvive agli aggiornamenti e sa quando l’elemento salvato è cambiato nel frattempo: un conflitto diventa qualcosa che l’interfaccia può mostrare, invece di qualcosa che accade in silenzio.",
          ],
        },
        { type: "code", file: "ChatList.swift", language: "swift", code: swiftui },
        {
          type: "facts",
          items: [
            { value: "71", label: "test: espansione e diagnostica della macro, e la libreria su un vero archivio SwiftData" },
            { value: "5", label: "piattaforme, da watchOS a visionOS" },
          ],
        },
      ],
    },
  },
});

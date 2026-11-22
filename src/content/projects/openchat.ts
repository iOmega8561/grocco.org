import { defineProject } from "../types";

const stream = `let (bytes, response) = try await session.bytes(for: self.build(for: config))

if let error: HTTPError = .init(from: response) { throw error }

let decoder = JSONDecoder()

// Server-sent events, decoded one line at a time as they arrive.
return try bytes.lines
    .prefix { $0 != "data: [DONE]" }
    .compactMap { line -> ResponseBody? in
        guard line.hasPrefix("data: ") else { return nil }
        guard let data = line.dropFirst(6).data(using: .utf8) else { return nil }
        return try decoder.decode(ResponseBody.self, from: data)
    }`;

const session = `func setCookies(from webKitStore: WKHTTPCookieStore) {
    webKitStore.getAllCookies { [weak self] cookies in
        for cookie in cookies { self?.cookieStorage.setCookie(cookie) }
    }
}

// A redirect means the proxy wants a login: don't follow it, let the request fail.
func urlSession(
    _ session: URLSession,
    task: URLSessionTask,
    willPerformHTTPRedirection response: HTTPURLResponse,
    newRequest request: URLRequest
) async -> URLRequest? {
    return nil
}`;

export default defineProject({
  slug: "openchat",
  name: "OpenChat",
  order: 80,
  layers: ["interface", "application"],
  years: "2026",
  stack: ["SwiftUI", "URLSession", "WebKit", "Swift concurrency"],
  repo: "iOmega8561/OpenChat",
  links: [{ kind: "source", url: "https://github.com/iOmega8561/OpenChat" }],
  accent: { light: "#5b3cc4", dark: "#b6a0ff" },
  cover: "/media/openchat.webp",
  copy: {
    en: {
      tagline: "A native client for the language models you host yourself.",
      summary: "A minimal SwiftUI chat client for macOS, iOS and iPadOS that talks to any OpenAI-compatible server, including one behind single sign-on.",
      blocks: [
        { type: "media", src: "/media/openchat.webp", alt: "OpenChat on macOS, with a conversation streaming in.", frame: "bare" },
        {
          type: "statement",
          text: "Your models, your server, a proper app.",
          detail:
            "A homelab can run a language model behind Open WebUI and protect it with single sign-on. What it rarely has is a native client that can get past the login page. OpenChat is that client.",
        },
        {
          type: "prose",
          title: "A stream is a sequence",
          paragraphs: [
            "Answers arrive as server-sent events, one JSON object per line. Rather than parsing a buffer by hand, OpenChat composes the stream from the standard library: the bytes of the response, split into lines, cut at the end marker, decoded one by one.",
            "The result is a typed AsyncSequence of response chunks. The view model iterates it with for try await, appending text and reasoning to the message as they come.",
          ],
        },
        { type: "code", file: "StreamedRequest.swift", language: "swift", code: stream },
        {
          type: "prose",
          title: "Getting past the login page",
          paragraphs: [
            "With forward authentication, as Traefik and Authelia do it, the proxy answers an anonymous request with a redirect to its login page, which an API client can’t complete.",
            "OpenChat shows that login page in a WebView, lets the user sign in there, and copies the resulting cookies into the session it uses for the API. Its session also refuses to follow redirects: if the login has expired, the request fails with a clear HTTP error instead of handing a login page to the JSON decoder.",
          ],
        },
        { type: "code", file: "SessionManager.swift", language: "swift", code: session },
      ],
    },
    it: {
      tagline: "Un client nativo per i modelli linguistici che ospiti tu.",
      summary: "Un client di chat minimale in SwiftUI per macOS, iOS e iPadOS che parla con qualsiasi server compatibile con OpenAI, anche dietro un single sign-on.",
      blocks: [
        { type: "media", src: "/media/openchat.webp", alt: "OpenChat su macOS, con una risposta in arrivo.", frame: "bare" },
        {
          type: "statement",
          text: "I tuoi modelli, il tuo server, un’app come si deve.",
          detail:
            "Un homelab può far girare un modello linguistico dietro Open WebUI e proteggerlo con un single sign-on. Quello che raramente ha è un client nativo capace di superare la pagina di login. OpenChat è quel client.",
        },
        {
          type: "prose",
          title: "Uno stream è una sequenza",
          paragraphs: [
            "Le risposte arrivano come server-sent events, un oggetto JSON per riga. Invece di analizzare un buffer a mano, OpenChat compone lo stream con la libreria standard: i byte della risposta, divisi in righe, troncati al marcatore di fine, decodificati uno per uno.",
            "Il risultato è una AsyncSequence tipizzata di frammenti di risposta. Il view model la percorre con for try await, aggiungendo testo e ragionamento al messaggio man mano che arrivano.",
          ],
        },
        { type: "code", file: "StreamedRequest.swift", language: "swift", code: stream },
        {
          type: "prose",
          title: "Oltre la pagina di login",
          paragraphs: [
            "Con l’autenticazione inoltrata, come la fanno Traefik e Authelia, il proxy risponde a una richiesta anonima con un reindirizzamento alla pagina di login, che un client API non sa completare.",
            "OpenChat mostra quella pagina in una WebView, lascia che l’utente acceda lì e copia i cookie ottenuti nella sessione che usa per l’API. La sua sessione rifiuta anche di seguire i reindirizzamenti: se l’accesso è scaduto, la richiesta fallisce con un errore HTTP chiaro invece di passare una pagina di login al decodificatore JSON.",
          ],
        },
        { type: "code", file: "SessionManager.swift", language: "swift", code: session },
      ],
    },
  },
});

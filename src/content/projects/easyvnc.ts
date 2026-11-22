import { defineProject } from "../types";

const callback = `void framebuffer_update_callback(rfbClient *cl, int x, int y, int w, int h) {

    ClientService *service = (__bridge ClientService *) rfbClientGetClientData(cl, &kVNCClientTag);

    // There's no point in moving forward if these fail.
    if (!service || !service.delegate || !cl->frameBuffer) {
        return;
    }

    [service.delegate didUpdateFramebuffer:(const uint8_t *)cl->frameBuffer
                                     width:cl->width
                                    height:cl->height
                                    stride:(cl->width * (cl->format.bitsPerPixel / 8))];
}`;

const handshake = `private func performHandshake() throws {
    let version = try read(12)
    guard version.starts(with: Array("RFB ".utf8)) else {
        throw RFBError.protocolViolation("unexpected protocol version")
    }
    try socket.write(Data("RFB 003.008\\n".utf8))

    let typeCount = Int(try readUInt8())
    guard typeCount > 0 else { throw RFBError.refused(try readReason()) }
    guard try read(typeCount).contains(1) else { throw RFBError.unsupportedSecurity }

    // Security type 1: none. The socket never leaves the machine.
    try socket.write(Data([1]))
    guard try readUInt32() == 0 else { throw RFBError.refused(try readReason()) }

    // ClientInit, shared: other views of the same machine may be connected too.
    try socket.write(Data([1]))
    // …
}`;

export default defineProject({
  slug: "easyvnc",
  name: "EasyVNC",
  order: 100,
  layers: ["application", "interface"],
  years: "2025",
  stack: ["SwiftUI", "Objective-C++", "libvncclient", "Core Graphics"],
  repo: "iOmega8561/EasyVNC",
  links: [{ kind: "source", url: "https://github.com/iOmega8561/EasyVNC" }],
  accent: { light: "#08785a", dark: "#63e6be" },
  cover: "/media/easyvnc.webp",
  copy: {
    en: {
      tagline: "A VNC client with nothing extra.",
      summary: "A minimal macOS VNC viewer in SwiftUI, built on libvncclient through an Objective-C++ bridge.",
      blocks: [
        { type: "media", src: "/media/easyvnc.webp", alt: "EasyVNC showing a remote Linux desktop.", frame: "bare" },
        {
          type: "statement",
          text: "It does less, on purpose.",
          detail:
            "EasyVNC connects, draws the remote screen and sends mouse and keyboard. It supports VNC passwords and plain VeNCrypt, and deliberately no encryption of its own: VNC is an old protocol, and the right way to reach a VNC server is through a VPN, never straight from the internet.",
        },
        {
          type: "prose",
          title: "C callbacks, Swift on the other side",
          paragraphs: [
            "libvncclient talks through plain C callbacks: the framebuffer was resized, a region changed, a password is needed. An Objective-C++ layer receives them, finds its way back to the right connection through the client data pointer, and forwards a safe, bounded call to a delegate that SwiftUI can observe.",
            "Memory is handled where C expects it: the framebuffer is reallocated and zeroed on every resize, log lines are bounded before they are copied, and every pointer is checked before it is used.",
          ],
        },
        { type: "code", file: "Callbacks.mm", language: "objc", code: callback },
        {
          type: "prose",
          title: "A rehearsal for something bigger",
          paragraphs: [
            "Twenty months later, the display of VirtualizationKit’s QEMU back-end speaks the same protocol, without libvncclient: a client written from scratch in Swift, reading the handshake, the pixel format and the framebuffer updates itself, and drawing them with Core Graphics.",
            "EasyVNC is where I learned what that client would need.",
          ],
        },
        { type: "code", title: "The same protocol, in Swift", file: "VirtualizationKit/RFBConnection.swift", language: "swift", code: handshake },
      ],
    },
    it: {
      tagline: "Un client VNC senza niente di superfluo.",
      summary: "Un visualizzatore VNC minimale per macOS in SwiftUI, costruito su libvncclient attraverso un ponte in Objective-C++.",
      blocks: [
        { type: "media", src: "/media/easyvnc.webp", alt: "EasyVNC che mostra una scrivania Linux remota.", frame: "bare" },
        {
          type: "statement",
          text: "Fa meno, di proposito.",
          detail:
            "EasyVNC si collega, disegna lo schermo remoto e invia mouse e tastiera. Supporta le password VNC e VeNCrypt in chiaro, e di proposito nessuna cifratura propria: VNC è un protocollo vecchio, e a un server VNC si arriva attraverso una VPN, mai direttamente da internet.",
        },
        {
          type: "prose",
          title: "Callback in C, Swift dall’altra parte",
          paragraphs: [
            "libvncclient comunica con semplici callback in C: il framebuffer è stato ridimensionato, una regione è cambiata, serve una password. Uno strato in Objective-C++ le riceve, ritrova la connessione giusta attraverso il puntatore ai dati del client e inoltra una chiamata sicura e delimitata a un delegate che SwiftUI può osservare.",
            "La memoria è gestita dove il C se lo aspetta: il framebuffer viene riallocato e azzerato a ogni ridimensionamento, le righe di log vengono limitate prima di essere copiate, e ogni puntatore viene controllato prima di essere usato.",
          ],
        },
        { type: "code", file: "Callbacks.mm", language: "objc", code: callback },
        {
          type: "prose",
          title: "La prova generale di qualcosa di più grande",
          paragraphs: [
            "Venti mesi dopo, lo schermo del back-end QEMU di VirtualizationKit parla lo stesso protocollo, senza libvncclient: un client scritto da zero in Swift, che legge da sé l’handshake, il formato dei pixel e gli aggiornamenti del framebuffer, e li disegna con Core Graphics.",
            "EasyVNC è dove ho imparato cosa sarebbe servito a quel client.",
          ],
        },
        { type: "code", title: "Lo stesso protocollo, in Swift", file: "VirtualizationKit/RFBConnection.swift", language: "swift", code: handshake },
      ],
    },
  },
});

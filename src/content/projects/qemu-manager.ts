import { defineProject } from "../types";

const lipo = `merge_lipo_universal() {
    local product_path="\${SCRIPTPATH}/$1"

    find "\${product_path}-arm64" -type f | while read -r src_file; do
        local rel_path="\${src_file#\${product_path}-arm64/}"
        local x86_file="\${product_path}-x86_64/\${rel_path}"
        local dst_file="\${product_path}/\${rel_path}"
        mkdir -p "$(dirname "$dst_file")"

        # Mach-O binaries and libraries are fused; everything else is copied.
        if [[ "$src_file" == *.a || "$src_file" == *.dylib ]] ||
           ([ -x "$src_file" ] && file "$src_file" | grep -q 'Mach-O'); then
            lipo -create "$src_file" "$x86_file" -output "$dst_file"
        else
            cp "$src_file" "$dst_file"
        fi
    done

    # pkg-config files still point at the per-architecture prefix: fix them.
    for pcfile in "\${product_path}/lib/pkgconfig"/*.pc; do
        sed -i '' -e "s|^prefix=.*|prefix=\${product_path}|" "$pcfile"
    done
}`;

const accel = `fileprivate extension QEMU.System {

    /// Asks the bundled emulator itself whether it was built with Hypervisor.framework.
    func hypervisor() -> Bool {
        self.help(
            command: "accel",
            skipLines: ["Accelerators supported in QEMU binary:"]
        ).contains { $0.name == "hvf" }
    }
}`;

export default defineProject({
  slug: "qemu-manager",
  name: "QEMU Manager",
  order: 90,
  layers: ["virtualization", "interface"],
  years: "2025",
  stack: ["Swift", "AppKit", "QEMU 10", "Hypervisor.framework", "Shell"],
  repo: "iOmega8561/QEMU-Manager",
  links: [{ kind: "source", url: "https://github.com/iOmega8561/QEMU-Manager" }],
  accent: { light: "#b8262b", dark: "#ff8a8a" },
  cover: "/media/qemu-manager.webp",
  copy: {
    en: {
      tagline: "From m68k Macs to Windows 11 on ARM.",
      summary: "A modern rework of a QEMU front-end for macOS, with QEMU bundled in as a universal binary and the full set of its options within reach.",
      blocks: [
        { type: "media", src: "/media/qemu-manager.webp", alt: "QEMU Manager with a list of virtual machines for different architectures.", frame: "bare" },
        {
          type: "statement",
          text: "Every QEMU option, nothing hidden.",
          detail:
            "VirtualizationKit hides complexity on purpose. QEMU Manager is its opposite: a power-user tool that favours transparency over abstraction. Building both taught me where each one belongs.",
        },
        {
          type: "facts",
          items: [
            { value: "15", label: "emulated architectures, from m68k to RISC-V" },
            { value: "2", label: "CPU architectures in one bundle: Apple silicon and Intel" },
          ],
        },
        {
          type: "prose",
          title: "One app for every Mac",
          paragraphs: [
            "The original front-end expected QEMU to be installed separately. This one bundles it, so it has to build QEMU 10 and its dependencies (glib, pixman, libslirp, pcre2) twice, once for arm64 and once for x86_64 then fuse each pair of binaries into one.",
            "The merge walks the arm64 tree, fuses every Mach-O file with its Intel twin through lipo, copies everything else, and rewrites the pkg-config prefixes that still point at the per-architecture folders.",
          ],
        },
        { type: "code", file: "Third-Party/setup-functions.sh", language: "shell", code: lipo },
        {
          type: "prose",
          title: "Ask the binary, don’t guess",
          paragraphs: [
            "Whether hardware acceleration is available depends on how QEMU was built and on which architecture it emulates. Instead of a table that can go stale, the app asks each bundled emulator for its list of accelerators and offers Hypervisor.framework only where it is really there.",
          ],
        },
        { type: "code", file: "Accel.swift", language: "swift", code: accel },
        {
          type: "features",
          title: "What I added",
          items: [
            { title: "A rebuilt interface", body: "Every configuration panel reworked in AppKit: system, disks, peripherals, sharing, UEFI boot and raw arguments." },
            { title: "Remote access", body: "A built-in VNC server, reachable over WebSocket too, with its own address and port per machine." },
            { title: "Networking your way", body: "Custom netdev parameters appended to the generated configuration, for setups the interface doesn’t cover." },
          ],
        },
        {
          type: "prose",
          paragraphs: [
            "The project builds on the front-end originally written by Jean-David Gadina (XS-Labs), and keeps its GPLv3 licence.",
          ],
        },
      ],
    },
    it: {
      tagline: "Dai Mac m68k a Windows 11 su ARM.",
      summary: "La rielaborazione moderna di un’interfaccia per QEMU su macOS, con QEMU incluso come binario universale e tutte le sue opzioni a portata di mano.",
      blocks: [
        { type: "media", src: "/media/qemu-manager.webp", alt: "QEMU Manager con un elenco di macchine virtuali per diverse architetture.", frame: "bare" },
        {
          type: "statement",
          text: "Ogni opzione di QEMU, niente di nascosto.",
          detail:
            "VirtualizationKit nasconde la complessità di proposito. QEMU Manager è il suo opposto: uno strumento per utenti esperti che preferisce la trasparenza all’astrazione. Costruirli entrambi mi ha insegnato dove sta bene ciascuno.",
        },
        {
          type: "facts",
          items: [
            { value: "15", label: "architetture emulate, da m68k a RISC-V" },
            { value: "2", label: "architetture di CPU in un solo pacchetto: Apple silicon e Intel" },
          ],
        },
        {
          type: "prose",
          title: "Un’app per ogni Mac",
          paragraphs: [
            "L’interfaccia originale si aspettava QEMU installato a parte. Questa lo include, e quindi deve compilare QEMU 10 e le sue dipendenze (glib, pixman, libslirp, pcre2) due volte, una per arm64 e una per x86_64, per poi fondere ogni coppia di binari in uno solo.",
            "L’unione percorre l’albero arm64, fonde con lipo ogni file Mach-O con il suo gemello Intel, copia tutto il resto e riscrive i prefissi di pkg-config che puntano ancora alle cartelle per architettura.",
          ],
        },
        { type: "code", file: "Third-Party/setup-functions.sh", language: "shell", code: lipo },
        {
          type: "prose",
          title: "Chiedi al binario, non indovinare",
          paragraphs: [
            "La disponibilità dell’accelerazione hardware dipende da come è stato compilato QEMU e da quale architettura emula. Invece di una tabella che può invecchiare, l’app chiede a ogni emulatore incluso l’elenco dei suoi acceleratori, e propone Hypervisor.framework solo dove c’è davvero.",
          ],
        },
        { type: "code", file: "Accel.swift", language: "swift", code: accel },
        {
          type: "features",
          title: "Cosa ho aggiunto",
          items: [
            { title: "Un’interfaccia ricostruita", body: "Tutti i pannelli di configurazione rielaborati in AppKit: sistema, dischi, periferiche, condivisione, avvio UEFI e argomenti diretti." },
            { title: "Accesso remoto", body: "Un server VNC integrato, raggiungibile anche via WebSocket, con indirizzo e porta propri per ogni macchina." },
            { title: "La rete come serve", body: "Parametri netdev personalizzati aggiunti alla configurazione generata, per le configurazioni che l’interfaccia non copre." },
          ],
        },
        {
          type: "prose",
          paragraphs: [
            "Il progetto parte dall’interfaccia scritta originariamente da Jean-David Gadina (XS-Labs), e ne mantiene la licenza GPLv3.",
          ],
        },
      ],
    },
  },
});

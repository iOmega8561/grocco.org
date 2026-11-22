import { useI18n } from "../../i18n/context";
import { pick, type Localized } from "../../i18n/languages";
import { Arrow, Box, DiagramFrame } from "./Frame";

const strings: Localized<Record<string, string>> = {
  en: {
    label: "The app opens files and passes descriptors to an XPC helper that runs QEMU and swtpm; the helper sends display frames back over RFB and receives commands over QMP.",
    app: "Your app",
    appSub: "App Sandbox, holds the bookmarks",
    view: "QEMUFramebufferView",
    helper: "XPC helper",
    helperSub: "Its own process and sandbox",
    qemu: "QEMU",
    qemuSub: "libqemu, from UTM’s fork",
    tpm: "swtpm",
    tpmSub: "patched to accept a descriptor",
    fds: "open file descriptors",
    qmp: "QMP commands",
    rfb: "RFB frames",
  },
  it: {
    label: "L’app apre i file e passa i descrittori a un servizio XPC che esegue QEMU e swtpm; il servizio rimanda i fotogrammi via RFB e riceve comandi via QMP.",
    app: "La tua app",
    appSub: "Sandbox delle app, custodisce i segnalibri",
    view: "QEMUFramebufferView",
    helper: "Servizio XPC",
    helperSub: "Processo e sandbox propri",
    qemu: "QEMU",
    qemuSub: "libqemu, dal fork di UTM",
    tpm: "swtpm",
    tpmSub: "modificato per accettare un descrittore",
    fds: "descrittori già aperti",
    qmp: "comandi QMP",
    rfb: "fotogrammi RFB",
  },
};

export function QemuSandboxDiagram() {
  const { lang } = useI18n();
  const s = pick(strings, lang);
  return (
    <DiagramFrame label={s.label} width={760} height={330}>
      <Box x={10} y={20} w={290} h={290} title={s.app} sub={s.appSub} strong />
      {["disk.img", "efi-vars.fd", "tpm-state"].map((file, i) => (
        <g key={file}>
          <rect x={28 + i * 86} y={92} width={82} height={34} rx={8} className="dg-chip" />
          <text x={69 + i * 86} y={114} textAnchor="middle" className="dg-mono dg-mono--small">
            {file}
          </text>
        </g>
      ))}
      <Box x={28} y={232} w={254} h={60} title={s.view} />

      <Box x={460} y={20} w={290} h={290} title={s.helper} sub={s.helperSub} strong />
      <Box x={478} y={92} w={254} h={92} title={s.qemu} sub={s.qemuSub} />
      <Box x={478} y={200} w={254} h={92} title={s.tpm} sub={s.tpmSub} />

      <Arrow d="M300 66 H456" label={s.fds} lx={378} ly={56} />
      <Arrow d="M300 120 H476" label={s.qmp} lx={388} ly={110} />
      <Arrow d="M476 160 H380 V262 H286" label={s.rfb} lx={368} ly={216} anchor="end" />
    </DiagramFrame>
  );
}

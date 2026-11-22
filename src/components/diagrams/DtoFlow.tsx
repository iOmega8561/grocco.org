import { useI18n } from "../../i18n/context";
import { pick, type Localized } from "../../i18n/languages";
import { Arrow, Box, DiagramFrame } from "./Frame";

const strings: Localized<Record<string, string>> = {
  en: {
    label: "A mutable Configurable draft goes into the model actor through insert and update; an immutable Transferable snapshot comes out through fetch. The model itself stays inside the actor.",
    draft: "Chat.Configurable",
    draftSub: "Mutable draft, Sendable",
    actor: "@ModelActor",
    actorSub: "SwiftDataManager",
    model: "@Model Chat",
    modelSub: "Never leaves the actor",
    snapshot: "Chat.Transferable",
    snapshotSub: "Immutable snapshot, Sendable",
    write: "insert, update",
    read: "fetch",
  },
  it: {
    label: "Una bozza modificabile Configurable entra nell’attore del modello con insert e update; un’istantanea immutabile Transferable esce con fetch. Il modello resta dentro l’attore.",
    draft: "Chat.Configurable",
    draftSub: "Bozza modificabile, Sendable",
    actor: "@ModelActor",
    actorSub: "SwiftDataManager",
    model: "@Model Chat",
    modelSub: "Non lascia mai l’attore",
    snapshot: "Chat.Transferable",
    snapshotSub: "Istantanea immutabile, Sendable",
    write: "insert, update",
    read: "fetch",
  },
};

export function DtoFlowDiagram() {
  const { lang } = useI18n();
  const s = pick(strings, lang);
  return (
    <DiagramFrame label={s.label} width={940} height={220}>
      <Box x={10} y={60} w={250} h={80} title={s.draft} sub={s.draftSub} />
      <Box x={360} y={10} w={220} h={200} title={s.actor} sub={s.actorSub} strong />
      <Box x={378} y={100} w={184} h={86} title={s.model} sub={s.modelSub} />
      <Box x={680} y={60} w={250} h={80} title={s.snapshot} sub={s.snapshotSub} />
      <Arrow d="M260 100 H374" label={s.write} lx={312} ly={88} />
      <Arrow d="M562 100 H676" label={s.read} lx={620} ly={88} />
    </DiagramFrame>
  );
}

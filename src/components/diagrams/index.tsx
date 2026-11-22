import type { DiagramName } from "../../content/types";
import { DtoFlowDiagram } from "./DtoFlow";
import { QemuSandboxDiagram } from "./QemuSandbox";
import { SelfHostedDiagram } from "./SelfHosted";

/** Bespoke diagrams a project page can embed by name. Register new ones here and in `DiagramName`. */
export const diagrams: Record<DiagramName, () => React.JSX.Element> = {
  qemuSandbox: QemuSandboxDiagram,
  dtoFlow: DtoFlowDiagram,
  selfHosted: SelfHostedDiagram,
};

import type { CSSProperties } from "react";
import type { Project } from "../content/types";

/** Inline style that gives an element (with class "accented") the project's colour. */
export function accentStyle(project: Project): CSSProperties {
  return { "--accent-light": project.accent.light, "--accent-dark": project.accent.dark } as CSSProperties;
}

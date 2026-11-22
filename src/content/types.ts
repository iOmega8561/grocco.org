import type { Localized } from "../i18n/languages";

/**
 * The five layers of the stack, from the bottom up.
 * Every project says which layers it touches; the home page uses them to filter.
 */
export const layerIds = ["system", "virtualization", "container", "application", "interface"] as const;
export type LayerId = (typeof layerIds)[number];

/** A link shown on a project page. `kind` decides its wording and its icon-less style. */
export type ProjectLink = {
  kind: "source" | "appStore" | "website" | "docs";
  url: string;
};

/**
 * The building blocks of a project page. A page is a list of these, rendered in order,
 * so a page can be as short as one paragraph or as long as a product page.
 */
export type Block =
  | { type: "statement"; text: string; detail?: string }
  | { type: "prose"; title?: string; paragraphs: string[] }
  | { type: "features"; title?: string; items: { title: string; body: string }[] }
  | { type: "facts"; items: { value: string; label: string }[] }
  | { type: "code"; title?: string; caption?: string; file: string; language: string; code: string }
  | { type: "table"; title?: string; caption?: string; columns: string[]; rows: string[][] }
  | { type: "media"; src: string; srcDark?: string; alt: string; caption?: string; frame?: "bare" | "window" }
  /** Plays muted while on screen (unless the reader asked for reduced motion); shows the poster if the file is missing. */
  | { type: "video"; src: string; poster: string; srcDark?: string; posterDark?: string; alt: string; caption?: string; frame?: "bare" | "window" }
  | { type: "gallery"; title?: string; caption?: string; items: { src: string; srcDark?: string; alt: string; caption?: string }[] }
  /** A real sequence of steps, numbered. */
  | { type: "pipeline"; title?: string; caption?: string; steps: { title: string; detail: string }[] }
  | { type: "diagram"; name: DiagramName; caption?: string };

/** Bespoke illustrations, registered in `components/diagrams`. */
export type DiagramName = "qemuSandbox" | "dtoFlow" | "selfHosted";

export type ProjectCopy = {
  /** One line, shown on cards and under the name. */
  tagline: string;
  /** Two or three sentences, shown on the card when there is room. */
  summary: string;
  blocks: Block[];
};

export type Project = {
  /** URL slug, unique. */
  slug: string;
  name: string;
  /** Lower comes first. Gaps are fine: they leave room to insert projects later. */
  order: number;
  /** A featured project gets the large panel on the home page. Only the first one is used. */
  featured?: boolean;
  /** Hide a project without deleting its file. */
  hidden?: boolean;
  layers: LayerId[];
  /** Years of activity, shown as written: "2024", "2024 – 2026". */
  years: string;
  /** The main technologies, in order of importance. */
  stack: string[];
  /** `owner/name` on GitHub; the build fetches stars and last update for it. */
  repo?: string;
  links: ProjectLink[];
  /** The project's colour: used sparingly, for its marker and its links. Give one for each scheme. */
  accent: { light: string; dark: string };
  icon?: string;
  cover?: string;
  copy: Localized<ProjectCopy>;
};

export function defineProject(project: Project): Project {
  return project;
}

import "./trek.css";
import type { ThemeModule } from "../types";
import { Starfield } from "./props/Starfield";
import { Flagship } from "./props/Flagship";
import { DriftingShuttle, LostShuttle } from "./props/Shuttle";
import { Probe } from "./props/Probe";
import { Planet } from "./props/Planet";

/** What the Star Trek theme puts on the site. Importing this file also loads its CSS. */
export const backdrop: ThemeModule["backdrop"] = Starfield;

export const slots: ThemeModule["slots"] = {
  "hero.stack": Flagship,
  featured: DriftingShuttle,
  timeline: Probe,
  "project.hero": Planet,
  notFound: LostShuttle,
};

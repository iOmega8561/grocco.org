import "./xcode.css";
import type { ThemeModule } from "../types";
import { greet } from "./greeting";
import { Hammer } from "./props/Hammer";
import { Simulator } from "./props/Simulator";
import { Compass } from "./props/Compass";
import { Breakpoint } from "./props/Breakpoint";
import { Duck } from "./props/Duck";
import { FixIt } from "./props/FixIt";
import { Sketch } from "./props/Sketch";

greet();

/** What the Xcode theme puts on the site. The blueprint sheets of the stack are drawn by its CSS. */
export const slots: ThemeModule["slots"] = {
  "hero.stack": Hammer,
  featured: Simulator,
  timeline: Compass,
  "project.hero": Breakpoint,
  footer: Duck,
  notFound: FixIt,
};

export const backdrop: ThemeModule["backdrop"] = Sketch;

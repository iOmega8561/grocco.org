import "./spooky.css";
import type { ThemeModule } from "../types";
import { Pumpkin } from "./props/Pumpkin";
import { PeekingGhost, LostGhost } from "./props/Ghost";
import { Spider } from "./props/Spider";
import { Cat } from "./props/Cat";
import { HangingBat } from "./props/HangingBat";
import { Night } from "./props/Night";

/** What the Halloween theme puts on the site. Importing this file also loads its CSS. */
export const slots: ThemeModule["slots"] = {
  "hero.stack": Pumpkin,
  featured: PeekingGhost,
  timeline: Spider,
  "project.hero": HangingBat,
  footer: Cat,
  notFound: LostGhost,
};

export const overlay: ThemeModule["overlay"] = Night;

import "./xmas.css";
import type { ThemeModule } from "../types";
import { WinterSky } from "./props/WinterSky";
import { Sleigh } from "./props/Sleigh";
import { PeekingReindeer } from "./props/Reindeer";
import { Snowman } from "./props/Snowman";
import { Bauble } from "./props/Bauble";
import { SnowGlobe } from "./props/SnowGlobe";
import { EmptyGift } from "./props/EmptyGift";

/** What the Christmas theme puts on the site. The snow on top of the stack is drawn by its CSS. */
export const backdrop: ThemeModule["backdrop"] = WinterSky;

export const slots: ThemeModule["slots"] = {
  "hero.stack": Sleigh,
  featured: PeekingReindeer,
  timeline: Snowman,
  "project.hero": Bauble,
  footer: SnowGlobe,
  notFound: EmptyGift,
};

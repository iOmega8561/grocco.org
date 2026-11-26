import "./sad.css";
import type { ThemeModule } from "../types";
import { motd } from "./motd";
import { Rack } from "./props/Rack";
import { Cable } from "./props/Cable";
import { ServerRoom } from "./props/ServerRoom";
import { Fan } from "./props/Fan";
import { HardDrive } from "./props/HardDrive";

motd();

/**
 * What the Sysadmin Day theme puts on the site. The screws and LEDs of the slabs and the heartbeat of
 * the live panel are drawn by its CSS.
 */
export const slots: ThemeModule["slots"] = {
  "hero.stack": Rack,
  notFound: Cable,
  timeline: HardDrive,
  footer: Fan,
};

export const backdrop: ThemeModule["backdrop"] = ServerRoom;

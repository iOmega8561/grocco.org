import type { Lang } from "../languages";
import { en, type Messages } from "./en";
import { it } from "./it";

export type { Messages };

/** One entry per language in `languages.ts`; TypeScript reports a missing one. */
export const messages: Record<Lang, Messages> = { en, it };

import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { useI18n } from "../i18n/context";
import { layerIds, type LayerId } from "../content/types";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import { paths } from "../lib/paths";
import { StackHero } from "../components/StackHero";
import { Featured } from "../components/Featured";
import { ProjectIndex } from "../components/ProjectIndex";
import { Principles } from "../components/Principles";
import { Timeline } from "../components/Timeline";

export function Home() {
  const { lang, t } = useI18n();
  const [params, setParams] = useSearchParams();
  const raw = params.get("layer");
  const layer = layerIds.includes(raw as LayerId) ? (raw as LayerId) : null;

  useDocumentMeta({ lang, title: t.meta.title, description: t.meta.description, path: paths.home(lang) });

  // The filter lives in the address (?layer=container), so a filtered list can be shared.
  const select = useCallback(
    (next: LayerId | null) => {
      setParams(next ? { layer: next } : {}, { replace: true, preventScrollReset: true });
      if (next) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        document.getElementById("work")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      }
    },
    [setParams],
  );

  return (
    <>
      <StackHero selected={layer} onSelect={select} />
      <Featured />
      <ProjectIndex layer={layer} onClear={() => select(null)} />
      <Timeline />
      <Principles />
    </>
  );
}

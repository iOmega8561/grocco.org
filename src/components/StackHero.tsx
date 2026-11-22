import type { CSSProperties } from "react";
import { useI18n } from "../i18n/context";
import { pick } from "../i18n/languages";
import { profile } from "../content/profile";
import { projects } from "../content/registry";
import { layerIds, type LayerId } from "../content/types";

type Props = {
  selected: LayerId | null;
  onSelect: (layer: LayerId | null) => void;
};

/**
 * The opening of the home page: the headline, then the five layers of the stack,
 * assembled from the bottom up. Each layer filters the projects below.
 */
export function StackHero({ selected, onSelect }: Props) {
  const { lang, t } = useI18n();
  const copy = pick(profile, lang);
  // Rendered top to bottom, so the system ends up at the base.
  const topDown = [...layerIds].reverse();

  return (
    <section className="hero page" aria-labelledby="hero-title">
      <div className="hero__text">
        <h1 id="hero-title" className="hero__title">
          {copy.headline}
        </h1>
        <p className="hero__intro">{copy.intro}</p>
      </div>

      <div className="hero__stack">
      <div className="stack" role="group" aria-describedby="stack-hint">
        {topDown.map((id) => {
          const layer = copy.layers[id];
          const count = projects.filter((project) => project.layers.includes(id)).length;
          const position = layerIds.indexOf(id);
          return (
            <button
              key={id}
              type="button"
              className={`stack__slab stack__slab--${id}`}
              style={{ "--build": position } as CSSProperties}
              aria-pressed={selected === id}
              data-dimmed={selected !== null && selected !== id ? "" : undefined}
              onClick={() => onSelect(selected === id ? null : id)}
            >
              <span className="stack__name">{layer.name}</span>
              <span className="stack__tech">
                {layer.tech.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </span>
              <span className="stack__count">{t.stack.projects(count)}</span>
            </button>
          );
        })}
      </div>
      <p id="stack-hint" className="stack__hint">
        {t.stack.hint}
      </p>
      </div>
    </section>
  );
}

import { Link } from "react-router";
import { useI18n } from "../i18n/context";
import { pick } from "../i18n/languages";
import { profile } from "../content/profile";
import { projects } from "../content/registry";
import type { LayerId } from "../content/types";
import { paths } from "../lib/paths";
import { accentStyle } from "../lib/accent";

type Props = { layer: LayerId | null; onClear: () => void };

/** Every project, one row each, so the list reads the same with five projects or fifty. */
export function ProjectIndex({ layer, onClear }: Props) {
  const { lang, t } = useI18n();
  const layers = pick(profile, lang).layers;
  const shown = layer ? projects.filter((project) => project.layers.includes(layer)) : projects;

  return (
    <section id="work" className="section page" aria-labelledby="work-title">
      <div className="index-head">
        <h2 id="work-title" className="section-title">
          {t.work.title}
        </h2>
        <div className="index-head__filter" aria-live="polite">
          {layer && (
            <>
              <span>{t.stack.filtered(layers[layer].name)}</span>
              <button type="button" className="chip" onClick={onClear}>
                {t.stack.showAll}
              </button>
            </>
          )}
        </div>
      </div>

      <ul className="index">
        {shown.map((project) => {
          const copy = pick(project.copy, lang);
          return (
            <li key={project.slug} className="accented" style={accentStyle(project)}>
              <Link className="index__row" to={paths.project(lang, project.slug)}>
                <span className="index__name">
                  <span className="index__mark" aria-hidden="true" />
                  {project.name}
                </span>
                <span className="index__tagline">{copy.tagline}</span>
                <span className="index__years">{project.years}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

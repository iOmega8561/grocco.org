import { Link } from "react-router";
import { useI18n } from "../i18n/context";
import { pick } from "../i18n/languages";
import { profile } from "../content/profile";
import { featuredProject } from "../content/registry";
import { paths } from "../lib/paths";
import { accentStyle } from "../lib/accent";

/** The one project that gets a stage of its own on the home page. */
export function Featured() {
  const { lang, t } = useI18n();
  const project = featuredProject;
  if (!project) return null;
  const copy = pick(profile, lang).featured;

  return (
    <section className="featured accented" style={accentStyle(project)} aria-labelledby="featured-title">
      <div className="page featured__inner">
        <p className="featured__name">{project.name}</p>
        <h2 id="featured-title" className="featured__title">
          {copy.headline}
        </h2>
        <p className="featured__body">{copy.body}</p>
        <Link className="featured__cta" to={paths.project(lang, project.slug)}>
          {t.featured.cta}
        </Link>
        {project.cover && <img className="featured__media" src={project.cover} alt="" loading="lazy" width={1800} height={1170} />}
      </div>
    </section>
  );
}

import { Link } from "react-router";
import { useI18n } from "../i18n/context";
import { pick } from "../i18n/languages";
import { profile } from "../content/profile";
import { projectBySlug } from "../content/registry";
import { paths } from "../lib/paths";
import { accentStyle } from "../lib/accent";

/** A real sequence, so it is numbered: each step led to the next. */
export function Timeline() {
  const { lang } = useI18n();
  const copy = pick(profile, lang).timeline;

  return (
    <section className="section page" aria-labelledby="timeline-title">
      <h2 id="timeline-title" className="section-title">
        {copy.title}
      </h2>
      <p className="section-intro">{copy.intro}</p>
      <ol className="timeline">
        {copy.steps.map((step, index) => {
          const project = projectBySlug(step.slug);
          return (
            <li key={index} className={project ? "accented" : undefined} style={project ? accentStyle(project) : undefined}>
              <span className="timeline__step" aria-hidden="true">
                {index + 1}
              </span>
              <p className="timeline__when">{step.when}</p>
              <h3 className="timeline__title">
                {project ? <Link to={paths.project(lang, project.slug)}>{step.title}</Link> : step.title}
              </h3>
              <p className="timeline__body">{step.body}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

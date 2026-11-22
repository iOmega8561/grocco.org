import { Link } from "react-router";
import { useI18n } from "../i18n/context";
import { pick } from "../i18n/languages";
import { cv } from "../content/cv";
import { projectBySlug } from "../content/registry";
import { site } from "../config/site";
import { accentStyle } from "../lib/accent";
import { paths } from "../lib/paths";
import { useDocumentMeta } from "../lib/useDocumentMeta";

export function CvPage() {
  const { lang, t } = useI18n();
  const copy = pick(cv, lang);

  useDocumentMeta({ lang, title: `${t.cv.title}: ${site.name}`, description: copy.summary, path: paths.cv(lang) });

  const sections = [
    { title: t.cv.experience, entries: copy.experience },
    { title: t.cv.education, entries: copy.education },
    { title: t.cv.certifications, entries: copy.certifications },
    { title: t.cv.languages, entries: copy.languages },
  ].filter((section) => section.entries.length > 0);

  return (
    <div className="cv page">
      <header className="cv__head">
        <h1 className="cv__title">{site.name}</h1>
        <p className="cv__summary">{copy.summary}</p>
        {site.cvPdf && (
          <a className="button button--primary" href={site.cvPdf} download>
            {t.cv.download}
          </a>
        )}
      </header>

      {sections.map((section) => (
        <section key={section.title} className="cv__section">
          <h2 className="cv__heading">{section.title}</h2>
          <ul className="cv__entries">
            {section.entries.map((entry) => (
              <li key={entry.title} className="cv__entry">
                <h3>{entry.url ? <a className="text-link" href={entry.url}>{entry.title}</a> : entry.title}</h3>
                {(entry.place || entry.when) && (
                  <p className="cv__where">
                    {entry.place && <span>{entry.place}</span>}
                    {entry.when && <span>{entry.when}</span>}
                  </p>
                )}
                {entry.body && <p className="cv__body">{entry.body}</p>}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="cv__section">
        <h2 className="cv__heading">{t.cv.evidence}</h2>
        <p className="cv__intro">{t.cv.evidenceIntro}</p>
        <ul className="evidence">
          {copy.evidence.map((item) => (
            <li key={item.skill} className="evidence__row">
              <div>
                <h3>{item.skill}</h3>
                <p>{item.detail}</p>
              </div>
              <ul className="evidence__projects">
                {item.projects.length === 0 && <li className="evidence__work">{t.cv.atWork}</li>}
                {item.projects.map((slug) => {
                  const project = projectBySlug(slug);
                  if (!project) return null;
                  return (
                    <li key={slug} className="accented" style={accentStyle(project)}>
                      <Link to={paths.project(lang, slug)}>{project.name}</Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

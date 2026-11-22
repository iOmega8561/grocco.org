import { Link, useParams } from "react-router";
import { useI18n } from "../i18n/context";
import { pick } from "../i18n/languages";
import { projectBySlug, projects } from "../content/registry";
import { profile } from "../content/profile";
import type { ProjectLink } from "../content/types";
import { Blocks } from "../components/blocks/Blocks";
import { accentStyle } from "../lib/accent";
import { paths } from "../lib/paths";
import { relativeTime, repoStats } from "../lib/github";
import { useDocumentMeta } from "../lib/useDocumentMeta";
import { NotFound } from "./NotFound";

/** Stars are shown from this count up: below it they say little. */
const starThreshold = 5;

export function ProjectPage() {
  const { slug } = useParams();
  const project = projectBySlug(slug);
  if (!project) return <NotFound />;
  return <ProjectView key={project.slug} slug={project.slug} />;
}

function ProjectView({ slug }: { slug: string }) {
  const { lang, t, locale } = useI18n();
  const project = projectBySlug(slug)!;
  const copy = pick(project.copy, lang);
  const layers = pick(profile, lang).layers;
  const stats = repoStats(project.repo);
  const next = projects[(projects.indexOf(project) + 1) % projects.length];

  useDocumentMeta({ lang, title: `${project.name}: ${copy.tagline}`, description: copy.summary, path: paths.project(lang, project.slug) });

  const linkLabel = (link: ProjectLink) => t.project[link.kind];

  return (
    <article className="project accented" style={accentStyle(project)}>
      <header className="project-hero page">
        {project.icon && <img className="project-hero__icon" src={project.icon} alt="" width={96} height={96} />}
        <h1 className="project-hero__name">{project.name}</h1>
        <p className="project-hero__tagline">{copy.tagline}</p>
        <p className="project-hero__summary">{copy.summary}</p>
        {project.links.length > 0 && (
          <ul className="project-hero__links">
            {project.links.map((link, i) => (
              <li key={link.url}>
                <a className={i === 0 ? "button button--primary" : "button"} href={link.url}>
                  {linkLabel(link)}
                </a>
              </li>
            ))}
          </ul>
        )}
        <dl className="project-hero__meta">
          <div>
            <dt>{t.project.years}</dt>
            <dd>{project.years}</dd>
          </div>
          <div>
            <dt>{t.project.layers}</dt>
            <dd>{project.layers.map((id) => layers[id].name).join(", ")}</dd>
          </div>
          <div>
            <dt>{t.project.stack}</dt>
            <dd>{project.stack.join(", ")}</dd>
          </div>
          {stats && (
            <div>
              <dt>GitHub</dt>
              <dd>
                {stats.stars >= starThreshold && <span>{t.project.stars(stats.stars)}, </span>}
                {t.project.updated} {relativeTime(new Date(stats.pushedAt), locale)}
              </dd>
            </div>
          )}
        </dl>
      </header>

      <Blocks blocks={copy.blocks} />

      <nav className="project-next page" aria-label={t.project.next}>
        <Link to={paths.project(lang, next.slug)} className="project-next__link accented" style={accentStyle(next)}>
          <span className="project-next__label">{t.project.next}</span>
          <span className="project-next__name">{next.name}</span>
          <span className="project-next__tagline">{pick(next.copy, lang).tagline}</span>
        </Link>
        <Link to={paths.work(lang)} className="text-link">
          {t.project.back}
        </Link>
      </nav>
    </article>
  );
}

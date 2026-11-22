import { useI18n } from "../i18n/context";
import { site } from "../config/site";

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="page site-footer__inner">
        <div>
          <p className="site-footer__name">{site.name}</p>
          <p className="site-footer__note">{t.footer.madeWith}</p>
        </div>
        <ul className="site-footer__links">
          {site.email && (
            <li>
              <a href={`mailto:${site.email}`}>{t.footer.contact}</a>
            </li>
          )}
          <li>
            <a href={site.github} rel="me">GitHub</a>
          </li>
          {site.linkedin && (
            <li>
              <a href={site.linkedin} rel="me">LinkedIn</a>
            </li>
          )}
          {site.sourceRepo && (
            <li>
              <a href={site.sourceRepo}>{t.footer.source}</a>
            </li>
          )}
        </ul>
        <p className="site-footer__copy">© {year} {site.name}</p>
      </div>
    </footer>
  );
}

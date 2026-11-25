import { useI18n } from "../i18n/context";
import { site } from "../config/site";
import { ThemeSlot, useTheme } from "../themes/context";
import { pick } from "../i18n/languages";

export function Footer() {
  const { lang, t } = useI18n();
  const { scheduled, active, setOn } = useTheme();
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
          {scheduled && (
            <li>
              <button type="button" className="site-footer__switch" onClick={() => setOn(!active)}>
                {active ? t.theme.off(pick(scheduled.name, lang)) : t.theme.on(pick(scheduled.name, lang))}
              </button>
            </li>
          )}
        </ul>
        <p className="site-footer__copy">© {year} {site.name}</p>
      </div>
      <ThemeSlot name="footer" />
    </footer>
  );
}

import { Link, NavLink, useLocation } from "react-router";
import { useI18n } from "../i18n/context";
import { languageCodes, languages } from "../i18n/languages";
import { paths, translatePath } from "../lib/paths";
import { site } from "../config/site";

export function Header() {
  const { lang, t } = useI18n();
  const { pathname, hash } = useLocation();
  const others = languageCodes.filter((code) => code !== lang);

  return (
    <header className="site-header">
      <div className="page site-header__bar">
        <Link to={paths.home(lang)} className="site-header__name">
          {site.name}
        </Link>
        <nav className="site-header__nav" aria-label={t.nav.home}>
          <Link to={paths.work(lang)}>{t.nav.work}</Link>
          <NavLink to={paths.cv(lang)}>{t.nav.cv}</NavLink>
          {others.length === 1 ? (
            <Link to={translatePath(pathname, others[0]) + hash} hrefLang={others[0]} lang={others[0]} className="site-header__lang">
              {languages[others[0]].label}
            </Link>
          ) : (
            <details className="site-header__langs">
              <summary>{languages[lang].label}</summary>
              <ul>
                {others.map((code) => (
                  <li key={code}>
                    <Link to={translatePath(pathname, code) + hash} hrefLang={code} lang={code}>
                      {languages[code].label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </nav>
      </div>
    </header>
  );
}

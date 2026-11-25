import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useParams } from "react-router";
import { I18nProvider } from "../i18n/context";
import { defaultLanguage, isLang } from "../i18n/languages";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { messages } from "../i18n/messages";
import { ThemeOverlay } from "../themes/context";

/** Every page lives under a language prefix: /it/…, /en/… */
export function Layout() {
  const { lang } = useParams();
  const { pathname, hash } = useLocation();

  // A new page starts at the top, unless the address points inside it.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);

  if (!isLang(lang)) return <Navigate to={`/${defaultLanguage}`} replace />;

  return (
    <I18nProvider lang={lang}>
      <a className="skip-link" href="#main">
        {messages[lang].nav.skip}
      </a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <ThemeOverlay />
    </I18nProvider>
  );
}

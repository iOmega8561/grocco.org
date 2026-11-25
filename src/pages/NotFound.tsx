import { Link } from "react-router";
import { useI18n } from "../i18n/context";
import { paths } from "../lib/paths";
import { ThemeSlot } from "../themes/context";

export function NotFound() {
  const { lang, t } = useI18n();
  return (
    <section className="not-found page">
      <h1 className="section-title">{t.notFound.title}</h1>
      <p className="section-intro">{t.notFound.body}</p>
      <Link className="button button--primary" to={paths.home(lang)}>
        {t.notFound.home}
      </Link>
      <ThemeSlot name="notFound" />
    </section>
  );
}

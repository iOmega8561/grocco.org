import { useI18n } from "../i18n/context";
import { pick } from "../i18n/languages";
import { profile } from "../content/profile";

export function Principles() {
  const { lang } = useI18n();
  const copy = pick(profile, lang).principles;

  return (
    <section className="section page" aria-labelledby="principles-title">
      <h2 id="principles-title" className="section-title">
        {copy.title}
      </h2>
      <div className="principles">
        {copy.items.map((item) => (
          <div key={item.title} className="principles__item">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

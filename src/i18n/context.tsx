import { createContext, useContext, type ReactNode } from "react";
import { languages, type Lang } from "./languages";
import { messages, type Messages } from "./messages";

type I18n = { lang: Lang; t: Messages; locale: string };

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const value: I18n = { lang, t: messages[lang], locale: languages[lang].locale };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}

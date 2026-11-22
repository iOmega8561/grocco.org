import { useEffect } from "react";
import { languageCodes, type Lang } from "../i18n/languages";
import { site } from "../config/site";
import { translatePath } from "./paths";

/** Keeps <title>, the description, <html lang> and the alternate-language links in step with the page. */
export function useDocumentMeta({ lang, title, description, path }: { lang: Lang; title: string; description: string; path: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = title;
    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", site.url + path);

    document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((node) => node.remove());
    for (const code of languageCodes) {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = code;
      link.href = site.url + translatePath(path, code);
      document.head.appendChild(link);
    }
  }, [lang, title, description, path]);
}

function setMeta(attribute: "name" | "property", key: string, content: string) {
  let node = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute(attribute, key);
    document.head.appendChild(node);
  }
  node.content = content;
}

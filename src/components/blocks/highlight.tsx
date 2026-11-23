import type { ReactNode } from "react";

/**
 * A deliberately small highlighter for the languages the site shows. It marks comments,
 * strings, attributes, keywords and types; everything else stays plain text.
 */
const keywordSets: Record<string, string> = {
  swift: "let var func struct class final enum protocol extension import return try await async throws if else guard for in while switch case default init self Self some any static public private internal fileprivate nonisolated true false nil typealias associatedtype unsafe where lazy",
  objc: "if else for while return void int char const static struct sizeof NULL nil TRUE FALSE true false unsigned self auto va_list double bool",
  ts: "const let var function return if else for of in while new export import from type interface async await throw try catch true false null undefined readonly",
  python: "def return if elif else for in while import from as not and or True False None",
  shell: "local for in do done if then else fi while read return",
  dockerfile: "FROM AS RUN COPY WORKDIR ENV ARG USER EXPOSE ENTRYPOINT CMD LABEL VOLUME",
};
const keywords: Record<string, Set<string>> = Object.fromEntries(Object.entries(keywordSets).map(([k, v]) => [k, new Set(v.split(" "))]));

type Rule = { kind: string; pattern: RegExp };

const cLike = (extra: Rule[] = []): Rule[] => [
  { kind: "comment", pattern: /\/\/[^\n]*/y },
  { kind: "comment", pattern: /\/\*[\s\S]*?\*\//y },
  { kind: "string", pattern: /@?"(?:[^"\\\n]|\\.)*"/y },
  { kind: "string", pattern: /'(?:[^'\\\n]|\\.)*'/y },
  ...extra,
  { kind: "number", pattern: /\b\d[\d_.]*\b/y },
  { kind: "word", pattern: /[A-Za-z_]\w*/y },
];

const rules: Record<string, Rule[]> = {
  swift: cLike([{ kind: "attribute", pattern: /[@#]\w+/y }]),
  objc: cLike([
    { kind: "attribute", pattern: /#\w+/y },
    { kind: "attribute", pattern: /@\w+/y },
  ]),
  ts: cLike([{ kind: "string", pattern: /`(?:[^`\\]|\\.)*`/y }]),
  python: [
    { kind: "comment", pattern: /#[^\n]*/y },
    { kind: "string", pattern: /"""[\s\S]*?"""/y },
    { kind: "string", pattern: /f?"(?:[^"\\\n]|\\.)*"/y },
    { kind: "string", pattern: /f?'(?:[^'\\\n]|\\.)*'/y },
    { kind: "number", pattern: /\b\d+\b/y },
    { kind: "word", pattern: /[A-Za-z_]\w*/y },
  ],
  shell: [
    { kind: "comment", pattern: /#[^\n]*/y },
    { kind: "string", pattern: /"(?:[^"\\]|\\.)*"/y },
    { kind: "string", pattern: /'[^']*'/y },
    { kind: "attribute", pattern: /\$\{?\w+\}?/y },
    { kind: "word", pattern: /[A-Za-z_][\w-]*/y },
  ],
  dockerfile: [
    { kind: "comment", pattern: /#[^\n]*/y },
    { kind: "string", pattern: /"(?:[^"\\]|\\.)*"/y },
    { kind: "attribute", pattern: /\$\{?\w+\}?/y },
    { kind: "word", pattern: /[A-Za-z_][\w-]*/y },
  ],
  yaml: [
    { kind: "comment", pattern: /#[^\n]*/y },
    { kind: "string", pattern: /'[^'\n]*'/y },
    { kind: "string", pattern: /"(?:[^"\\\n]|\\.)*"/y },
    { kind: "attribute", pattern: /\$\{\{[^}]*\}\}/y },
    { kind: "section", pattern: /[\w-]+(?=:)/y },
  ],
  ini: [
    { kind: "comment", pattern: /#[^\n]*/y },
    // Only at the start of a line: brackets in a value (HealthCmd=["…"]) are not a section.
    { kind: "section", pattern: /^\[[^\]\n]+\]/my },
    { kind: "attribute", pattern: /^[A-Za-z]+(?==)/my },
  ],
  /** A terminal session: the prompt and what was typed after it stand out. */
  console: [
    { kind: "prompt", pattern: /^[❯$#] [^\n]*/my },
    { kind: "attribute", pattern: /^[\w ]+:(?= )/my },
  ],
};

export function highlight(code: string, language: string): ReactNode[] {
  const set = rules[language];
  if (!set) return [code];
  const words = keywords[language];
  const out: ReactNode[] = [];
  let plain = "";
  let i = 0;
  while (i < code.length) {
    let matched = false;
    for (const rule of set) {
      rule.pattern.lastIndex = i;
      const m = rule.pattern.exec(code);
      if (!m || m[0].length === 0) continue;
      let kind = rule.kind;
      if (kind === "word") {
        if (words?.has(m[0])) kind = "keyword";
        else if (language !== "shell" && language !== "dockerfile" && /^[A-Z][a-z]/.test(m[0])) kind = "type";
        else kind = "";
      }
      if (kind === "") {
        plain += m[0];
      } else {
        if (plain) out.push(plain), (plain = "");
        out.push(
          <span key={i} className={`tok-${kind}`}>
            {m[0]}
          </span>,
        );
      }
      i += m[0].length;
      matched = true;
      break;
    }
    if (!matched) plain += code[i++];
  }
  if (plain) out.push(plain);
  return out;
}

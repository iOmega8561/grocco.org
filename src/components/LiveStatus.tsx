import { useEffect, useState } from "react";
import { useI18n } from "../i18n/context";
import { site } from "../config/site";
import { duration, relativeTime } from "../lib/github";
import { SelfHostedDiagram } from "./diagrams/SelfHosted";

/** The document written by deploy/status/status-agent.sh. */
export type StatusDocument = {
  generatedAt: string;
  host: { kernel: string; uptimeSeconds: number };
  containers: { name: string; state: string; health: string | null; startedAt: string | null }[];
};

type State = { kind: "loading" } | { kind: "offline" } | { kind: "ready"; status: StatusDocument; readAt: Date };

const pollEvery = 30_000;

function isStatusDocument(value: unknown): value is StatusDocument {
  const v = value as StatusDocument;
  return typeof v === "object" && v !== null && typeof v.generatedAt === "string" && Array.isArray(v.containers) && typeof v.host === "object";
}

/**
 * Reads the state of the server this site runs on. Shown only when VITE_STATUS_URL is set,
 * and polls only while the page is visible.
 */
export function LiveStatus() {
  const { t, locale } = useI18n();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [, tick] = useState(0);

  useEffect(() => {
    if (!site.statusUrl) return;
    let cancelled = false;
    let controller: AbortController | null = null;

    async function load() {
      if (document.visibilityState !== "visible") return;
      controller?.abort();
      controller = new AbortController();
      try {
        const response = await fetch(site.statusUrl, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error(String(response.status));
        const body: unknown = await response.json();
        if (!isStatusDocument(body)) throw new Error("unexpected document");
        if (!cancelled) setState({ kind: "ready", status: body, readAt: new Date() });
      } catch (error) {
        if (!cancelled && (error as Error).name !== "AbortError") setState({ kind: "offline" });
      }
    }

    load();
    const poll = window.setInterval(load, pollEvery);
    const clock = window.setInterval(() => tick((n) => n + 1), 10_000);
    document.addEventListener("visibilitychange", load);
    return () => {
      cancelled = true;
      controller?.abort();
      window.clearInterval(poll);
      window.clearInterval(clock);
      document.removeEventListener("visibilitychange", load);
    };
  }, []);

  if (!site.statusUrl) return null;

  return (
    <section className="section page live" aria-labelledby="live-title">
      <h2 id="live-title" className="section-title">
        {t.status.title}
      </h2>
      <p className="section-intro">{t.status.body}</p>

      <div className="live__panel" aria-live="polite" aria-busy={state.kind === "loading"}>
        {state.kind === "loading" && <p className="live__message">{t.status.loading}</p>}
        {state.kind === "offline" && <p className="live__message">{t.status.offline}</p>}
        {state.kind === "ready" && (
          <>
            <dl className="live__host">
              <div>
                <dt>{t.status.uptime}</dt>
                <dd>{duration(state.status.host.uptimeSeconds, locale)}</dd>
              </div>
              <div>
                <dt>{t.status.kernel}</dt>
                <dd>{state.status.host.kernel}</dd>
              </div>
              <div>
                <dt>{t.status.updated}</dt>
                <dd>{relativeTime(new Date(state.status.generatedAt), locale)}</dd>
              </div>
            </dl>
            <table className="live__containers">
              <caption className="visually-hidden">{t.status.containers}</caption>
              <tbody>
                {state.status.containers.map((container) => {
                  const running = container.state === "running";
                  const healthy = container.health === null || container.health === "healthy";
                  return (
                    <tr key={container.name}>
                      <th scope="row">
                        <span className="live__dot" data-state={running ? (healthy ? "ok" : "warn") : "off"} aria-hidden="true" />
                        {container.name}
                      </th>
                      <td>{running ? t.status.running : t.status.stopped}</td>
                      <td>{container.health === null ? "" : healthy ? t.status.healthy : t.status.unhealthy}</td>
                      <td className="live__since">
                        {running && container.startedAt ? `${t.status.started} ${relativeTime(new Date(container.startedAt), locale)}` : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </div>
      <SelfHostedDiagram />
    </section>
  );
}

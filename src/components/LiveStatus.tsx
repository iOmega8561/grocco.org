import { useEffect, useState } from "react";
import { useI18n } from "../i18n/context";
import { site } from "../config/site";
import { duration, relativeTime } from "../lib/github";
import type { StatusReport, StatusResponse } from "../../server/status/core.ts";
import { SelfHostedDiagram } from "./diagrams/SelfHosted";

type State =
  | { kind: "loading" }
  | { kind: "unreachable" }
  | { kind: "offline"; lastSeen: Date | null }
  | { kind: "ready"; status: StatusReport; receivedAt: Date };

const pollEvery = 60_000;

function isStatusResponse(value: unknown): value is StatusResponse {
  const v = value as StatusResponse;
  return typeof v === "object" && v !== null && typeof v.online === "boolean" && (v.report === null || Array.isArray(v.report?.containers));
}

/** Turns the endpoint's answer into what the panel shows: the server is off when its last report is too old. */
function toState(body: StatusResponse): State {
  const receivedAt = body.receivedAt ? new Date(body.receivedAt) : null;
  if (body.online && body.report && receivedAt) return { kind: "ready", status: body.report, receivedAt };
  return { kind: "offline", lastSeen: receivedAt };
}

/**
 * Shows the last report the server sent to /api/status (see deploy/status). Shown only when
 * VITE_STATUS_URL is set, and polls only while the page is visible.
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
        if (!isStatusResponse(body)) throw new Error("unexpected document");
        if (!cancelled) setState(toState(body));
      } catch (error) {
        if (!cancelled && (error as Error).name !== "AbortError") setState({ kind: "unreachable" });
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
        {state.kind === "unreachable" && <p className="live__message">{t.status.unreachable}</p>}
        {state.kind === "offline" && (
          <p className="live__message">{state.lastSeen ? t.status.offline(relativeTime(state.lastSeen, locale)) : t.status.never}</p>
        )}
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
                <dd>{relativeTime(state.receivedAt, locale)}</dd>
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

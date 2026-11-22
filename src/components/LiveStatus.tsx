import { useEffect, useState } from "react";
import { useI18n } from "../i18n/context";
import { site } from "../config/site";
import { duration, relativeTime } from "../lib/github";
import type { ContainerStatus, StatusReport, StatusResponse } from "../../server/status/core.ts";
import { SelfHostedDiagram } from "./diagrams/SelfHosted";

type State =
  | { kind: "loading" }
  | { kind: "unreachable" }
  | { kind: "offline"; lastSeen: Date | null }
  | { kind: "ready"; status: StatusReport; receivedAt: Date };

const pollEvery = 60_000;

/**
 * Networks that say nothing about how services are grouped: Podman's default network, host and no
 * networking, and the user-mode modes of rootless containers, should a Podman version report them.
 */
const ungroupedNetworks = new Set(["podman", "host", "none", "bridge", "pasta", "slirp4netns"]);

/** Quadlet names the network of `media.network` "systemd-media"; the panel shows "media". */
function networkName(network: string): string | null {
  if (ungroupedNetworks.has(network)) return null;
  return network.replace(/^systemd-/, "") || null;
}

type Group = { network: string | null; containers: ContainerStatus[] };

/**
 * One group per network, by name, with containers on no named network last. A container on
 * several networks appears in each of them. Null, so the panel shows a single list, when no
 * container is on a named network: an agent that sends no networks, or only pasta containers.
 */
function groupByNetwork(containers: ContainerStatus[]): Group[] | null {
  if (!containers.some((container) => container.networks !== undefined)) return null;
  const groups = new Map<string, ContainerStatus[]>();
  const other: ContainerStatus[] = [];
  for (const container of containers) {
    const names = [...new Set((container.networks ?? []).map(networkName).filter((name): name is string => name !== null))];
    if (names.length === 0) other.push(container);
    for (const name of names) groups.set(name, [...(groups.get(name) ?? []), container]);
  }
  if (groups.size === 0) return null;
  const named: Group[] = [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([network, members]) => ({ network, containers: members }));
  const all = other.length ? [...named, { network: null, containers: other }] : named;
  return all.map((group) => ({ ...group, containers: [...group.containers].sort((a, b) => a.name.localeCompare(b.name)) }));
}

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

  const groups = state.kind === "ready" ? groupByNetwork(state.status.containers) : null;

  function describe(container: ContainerStatus) {
    const running = container.state === "running";
    const healthy = container.health === null || container.health === "healthy";
    return {
      dot: running ? (healthy ? "ok" : "warn") : "off",
      state: running ? t.status.running : t.status.stopped,
      health: container.health === null ? "" : healthy ? t.status.healthy : t.status.unhealthy,
      since: running && container.startedAt ? `${t.status.started} ${relativeTime(new Date(container.startedAt), locale)}` : "",
    };
  }

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
            {groups ? (
              <div className="live__groups">
                {groups.map((group) => (
                  <section
                    key={group.network ?? ""}
                    className="live__group"
                    aria-label={group.network ? t.status.network(group.network) : t.status.otherContainers}
                  >
                    <h3 className={`live__group-name${group.network ? "" : " live__group-name--other"}`}>
                      {group.network ?? t.status.otherContainers}
                    </h3>
                    <ul className="live__list">
                      {group.containers.map((container) => {
                        const row = describe(container);
                        return (
                          <li key={container.name} className="live__item">
                            <span className="live__dot" data-state={row.dot} aria-hidden="true" />
                            <span className="live__name">{container.name}</span>
                            <span className="live__state">{row.health ? `${row.state} · ${row.health}` : row.state}</span>
                            {row.since && <span className="live__item-since">{row.since}</span>}
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>
            ) : (
              <table className="live__containers">
                <caption className="visually-hidden">{t.status.containers}</caption>
                <tbody>
                  {state.status.containers.map((container) => {
                    const row = describe(container);
                    return (
                      <tr key={container.name}>
                        <th scope="row">
                          <span className="live__dot" data-state={row.dot} aria-hidden="true" />
                          {container.name}
                        </th>
                        <td>{row.state}</td>
                        <td>{row.health}</td>
                        <td className="live__since">{row.since}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
      <SelfHostedDiagram />
    </section>
  );
}

#!/usr/bin/env bash
#
# Writes the live status document read by the site: kernel, uptime and the state of an
# explicit list of containers. Only the containers named in STATUS_CONTAINERS are published,
# so nothing else about the host leaks.
#
# Run by status-agent.timer as your user; needs podman and jq.
#
set -euo pipefail

STATUS_DIR="${STATUS_DIR:-$HOME/.local/share/status}"
STATUS_CONTAINERS="${STATUS_CONTAINERS:-}"

if [[ -z "$STATUS_CONTAINERS" ]]; then
  echo "status-agent: STATUS_CONTAINERS is empty; nothing to publish" >&2
  exit 1
fi

mkdir -p "$STATUS_DIR"
tmp="$(mktemp "$STATUS_DIR/.status.XXXXXX")"
trap 'rm -f "$tmp"' EXIT

uptime_seconds="$(cut -d' ' -f1 /proc/uptime | cut -d. -f1)"

podman ps --all --format json |
  jq --arg allow "$STATUS_CONTAINERS" \
     --arg kernel "$(uname -r)" \
     --argjson uptime "$uptime_seconds" '
    ($allow | split(" ") | map(select(length > 0))) as $names
    | {
        generatedAt: (now | strftime("%Y-%m-%dT%H:%M:%SZ")),
        host: { kernel: $kernel, uptimeSeconds: $uptime },
        containers: [
          $names[] as $name
          | (map(select(.Names | index($name))) | first) as $c
          | if $c == null then
              { name: $name, state: "missing", health: null, startedAt: null }
            else
              {
                name: $name,
                state: ($c.State // "unknown"),
                health: (
                  ($c.Status // "") as $s
                  | if   ($s | test("\\(healthy\\)"))   then "healthy"
                    elif ($s | test("\\(unhealthy\\)")) then "unhealthy"
                    elif ($s | test("\\(starting\\)"))  then "starting"
                    else null end
                ),
                startedAt: (if ($c.StartedAt // 0) > 0 then ($c.StartedAt | todate) else null end)
              }
            end
        ]
      }' > "$tmp"

chmod 0644 "$tmp"
mv -f "$tmp" "$STATUS_DIR/status.json"
trap - EXIT

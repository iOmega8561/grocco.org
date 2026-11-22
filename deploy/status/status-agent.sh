#!/usr/bin/env bash
#
# Sends the live status report to the site: kernel, uptime and the state of an explicit list of
# containers. Only the containers named in STATUS_CONTAINERS are reported, so nothing else about
# the host leaks.
#
#   STATUS_ENDPOINT     e.g. https://grocco.org/api/status
#   STATUS_CONTAINERS   space-separated container names
#   the token           $CREDENTIALS_DIRECTORY/status-token (systemd LoadCredential), or STATUS_TOKEN_FILE
#
# Run by status-agent.timer as an unprivileged user; needs podman, jq and curl.
#
set -euo pipefail

STATUS_ENDPOINT="${STATUS_ENDPOINT:-}"
STATUS_CONTAINERS="${STATUS_CONTAINERS:-}"
token_file="${STATUS_TOKEN_FILE:-${CREDENTIALS_DIRECTORY:-}/status-token}"

fail() { echo "status-agent: $*" >&2; exit 1; }
[[ -n "$STATUS_ENDPOINT" ]] || fail "STATUS_ENDPOINT is empty"
[[ -n "$STATUS_CONTAINERS" ]] || fail "STATUS_CONTAINERS is empty; nothing to report"
[[ -r "$token_file" ]] || fail "no token at $token_file"

uptime_seconds="$(cut -d' ' -f1 /proc/uptime | cut -d. -f1)"

report="$(
  podman ps --all --format json |
    jq --compact-output \
       --arg allow "$STATUS_CONTAINERS" \
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
                { name: $name, state: "missing", health: null, startedAt: null, networks: [] }
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
                  startedAt: (if ($c.StartedAt // 0) > 0 then ($c.StartedAt | todate) else null end),
                  networks: ($c.Networks // [])
                }
              end
          ]
        }'
)"

# The token goes through a file descriptor, never the command line, so `ps` cannot see it.
curl --silent --show-error --fail-with-body \
  --max-time 20 --retry 2 --retry-delay 5 --retry-connrefused \
  --request PUT \
  --header "Content-Type: application/json" \
  --header @<(printf 'Authorization: Bearer %s\n' "$(tr -d '\r\n' < "$token_file")") \
  --data-binary "$report" \
  "$STATUS_ENDPOINT"

# grocco.org

The source of [grocco.org](https://grocco.org), Giuseppe Rocco's personal site: projects, résumé and a live view
of the server his services run on. React 19 and TypeScript on Vite, no UI framework, no CSS framework.

## Running locally

```sh
npm install
npm run dev                                   # http://localhost:5173
VITE_STATUS_URL=/api/status npm run dev       # with the live panel, seeded from dev/status.sample.json
npm run build                                 # GitHub sync, type check, production build in dist/
npm run build:server && npm start             # the self-hosted server, serving dist/ on port 8080
```

Node 22 or later. Dependencies are pinned to exact versions.

In development, `/api/status` is the real endpoint with an in-memory store and the token `dev`, so the panel's
states can be tried by hand:

```sh
curl -X PUT -H "Authorization: Bearer dev" --data-binary @dev/status.sample.json http://localhost:5173/api/status
```

## Add, change or remove a project

Every file in `src/content/projects/` is a project, discovered automatically.

- **Add:** create a file that default-exports `defineProject({ … })` (see `src/content/types.ts`) with a unique `slug`.
- **Remove:** delete the file, or set `hidden: true` to keep it for later.
- **Reorder:** change `order`. Lower comes first; gaps are fine.
- **Feature:** `featured: true` puts it on the black panel of the home page (the first one wins).

A project page is a list of blocks, rendered in order:

| Block | What it shows |
|---|---|
| `statement` | One large sentence, with an optional paragraph |
| `prose` | Paragraphs, with an optional heading |
| `features` | Two to four short items with titles |
| `facts` | Large numbers with a label |
| `code` | An editor window with light syntax highlighting: Swift, Objective-C++, TypeScript, Python, shell, Dockerfile, YAML, INI/Quadlet and terminal sessions (`console`) |
| `table` | A comparison table |
| `media` | An image from `public/media/`, with an optional `srcDark` variant |
| `video` | A silent MP4 that plays while on screen, with a poster; respects reduced motion and falls back to the poster |
| `gallery` | Several images side by side, each with an optional dark variant |
| `pipeline` | A numbered sequence of steps |
| `diagram` | A bespoke SVG from `src/components/diagrams/` |

`layers` decides which slabs of the home page stack lead to the project.
`repo` makes the build fetch its stars and last update from GitHub.

Videos are H.264 MP4 with `+faststart` and no audio track. A screen recording can be prepared with:

```sh
ffmpeg -i input.mov -vf "crop=W:H:X:Y,scale=1212:-2,fps=30,format=yuv420p" -an \
  -c:v libx264 -preset slow -crf 25 -movflags +faststart public/media/name.mp4
```

## Languages

English and Italian today. To add one:

1. register it in `src/i18n/languages.ts`;
2. add `src/i18n/messages/<code>.ts` (TypeScript lists any missing string);
3. register it in `src/i18n/messages/index.ts`.

Projects, profile and résumé can be translated independently: a missing language falls back to English.
Routes are `/<lang>/…`; `/` sends visitors to the language their browser prefers.

## Seasonal themes

For a few days around an occasion, the site can wear a theme. Every folder in `src/themes/` with a `theme.ts` is
one, discovered automatically. Only the definitions are bundled up front: a theme's code and CSS are a separate
chunk, loaded before the first render only while the theme is on, so on every other day they cost nothing.

- **Add:** create `src/themes/<id>/theme.ts`, default-exporting `defineTheme({ … })` (see `src/themes/types.ts`),
  and an `index.tsx` that imports the theme's CSS and exports what it adds.
- **Remove:** delete the folder.
- **Preview:** `?skin=<id>` shows a theme on any day, `?skin=none` shows the site without themes, `?skin=auto`
  goes back to the calendar. The preview lasts for the browser tab.

A theme can do any of these, all optional:

| Part | What it is |
|---|---|
| `when` | `{ from: "10-30", to: "10-31" }`, repeated every year (a window may wrap over the new year), or a function of the date for occasions that move |
| `scheme` | Forces light or dark while the theme is on; images and videos with a dark variant follow it |
| CSS | Scoped to `:root[data-skin="<id>"]`: redefine the tokens of `src/styles/tokens.css`, restyle components by class |
| `slots` | Components placed in the named slots of the pages (`hero.stack`, `featured`, `timeline`, `project.hero`, `footer`, `notFound`) |
| `overlay` | One component over the whole viewport, for weather, fog and the like |
| `backdrop` | One component behind the whole site, for a sky or a starfield; sections with their own background cover it |

A slot covers its host element and lets clicks through, so decorations position themselves inside it and never
move the content. They are hidden from assistive technology and from print, and should stay still when the
reader asks for reduced motion (`useReducedMotion` in `src/themes/hooks.ts`). Content, links and wording are never
replaced by a theme. While a theme is on, the footer offers to turn it off; the choice is remembered until the
occasion comes round again.

## Personal details

Everything specific to one person lives in three places:

- `src/config/site.ts`: e-mail, LinkedIn, PDF résumé, source link. Empty values are hidden.
- `src/content/cv.ts`: experience, education, certifications. Fields marked `TODO` are hidden while empty.
- `src/content/profile.ts`: headline, the five layers, the timeline, the principles.

## GitHub stats

`npm run build` runs `scripts/sync-github.mjs` first. It updates `src/generated/github.json` and never fails
the build: if GitHub can't be reached or rate-limits it, the committed file is used. Set `GITHUB_TOKEN` for a
higher rate limit. Stars are shown from 5 upwards.

## Deployment

The site is static, apart from one endpoint: `/api/status`. A server sends it a report every few minutes, and
the live panel shows the last one. When no report has arrived for `STATUS_STALE_AFTER` seconds (15 minutes by
default), the panel shows the server as off. The endpoint's logic lives in `server/status/core.ts`, written
against the web-standard `Request` and `Response`, so the same code runs on both targets below.

| | Reads | Writes |
|---|---|---|
| `GET /api/status` | anyone | — |
| `PUT /api/status` | — | `Authorization: Bearer <token>`, a JSON report of at most 16 kB |

The time of a report is when the endpoint received it, not the sender's clock. Only known fields are kept.
While no token is configured, every update is refused.

### Option 1: Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: `NODE_VERSION=22`, `VITE_STATUS_URL=/api/status`, optionally `GITHUB_TOKEN` and
  `STATUS_STALE_AFTER` in seconds
- Bindings: a Workers KV namespace bound as `STATUS`
- Secrets: `STATUS_TOKEN` (see [Setting up the token](#setting-up-the-token))

`functions/api/status.ts` becomes the endpoint automatically. `public/_redirects` routes every other path to
the app, and `public/_headers` sets the security headers.

The free Workers KV plan allows 1,000 writes a day: one report every 5 minutes uses 288 of them.

### Option 2: self-hosted, rootless Podman behind Traefik

`deploy/site/Containerfile` builds the site and a dependency-free Node server (`server/node/`) that serves it,
applies the same `public/_headers` rules and answers `/api/status`, keeping the last report in a file. The
final image is distroless: no shell, no package manager, a non-root user, nothing writable but `/data`.

```sh
podman build -f deploy/site/Containerfile -t localhost/grocco-site:latest .
podman secret create site-status-token -    # paste the token, then Ctrl-D; see below
install -Dm644 deploy/site/site.container -t ~/.config/containers/systemd/
systemctl --user daemon-reload
systemctl --user start site
```

`site.container` runs it read-only, with no capabilities, no privilege escalation and bounded memory and
processes; the token arrives as a Podman secret readable only by the server's user. It expects:

- a `traefik.network` Quadlet unit shared with Traefik (Podman names it `systemd-traefik`);
- Traefik's Docker provider reading the rootless Podman socket, with a `websecure` entrypoint and a
  `letsencrypt` certificate resolver. Adjust the `Label=` lines to match a different setup.

Traefik terminates TLS and compresses responses; the container publishes no port on the host.

Host the site on a machine other than the one it monitors: if they are the same, the panel goes down with
the server it is meant to report on.

### The status agent

On the monitored server, a systemd timer runs `deploy/status/status-agent.sh` every 5 minutes. It reads
`podman ps`, keeps only the containers named in `STATUS_CONTAINERS`, and sends the report with curl. Each
container carries the networks it is attached to, and the panel groups containers by network: one group per
network, a container repeated in every network it joins, Quadlet's `systemd-` prefix left out, and containers
on no named network (pasta, host networking, or only Podman's default network) shown last. When no container
is on a named network, the panel shows a single list, as before. It needs
podman, jq and curl, and makes no inbound connection possible. Create the token first (see
[Setting up the token](#setting-up-the-token)).

```sh
install -Dm755 deploy/status/status-agent.sh ~/.local/bin/status-agent.sh
install -Dm644 deploy/status/status-agent.{service,timer} -t ~/.config/systemd/user/

systemctl --user daemon-reload
systemctl --user enable --now status-agent.timer
loginctl enable-linger "$USER"
```

Set `STATUS_ENDPOINT` and `STATUS_CONTAINERS` in `status-agent.service`. The token reaches the script through
systemd's `LoadCredential=`, never through the environment or the command line. On a systemd too old for
credentials in user services, replace that line with `Environment=STATUS_TOKEN_FILE=%h/.config/status-agent/token`.

### Setting up the token

The same token goes in two places: on the site, which checks it, and on the monitored server, where the agent
sends it. Any long random string works; surrounding whitespace is ignored.

**1. Generate it** on the monitored server, straight into the agent's file, so it never reaches the shell
history:

```sh
install -Dm600 /dev/null ~/.config/status-agent/token
openssl rand -hex 32 > ~/.config/status-agent/token
cat ~/.config/status-agent/token     # to copy it for step 2
```

The agent is now configured: `LoadCredential=` in `status-agent.service` reads this file.

**2. Give the same value to the site.**

- *Cloudflare Pages:* in the project, Settings → Variables and Secrets → Add, type *Secret*, name
  `STATUS_TOKEN`. Or from a terminal: `npx wrangler pages secret put STATUS_TOKEN --project-name <project>`.
  Secrets apply from the next deployment, so redeploy once.
- *Self-hosted Podman:* on the machine running the site container, run
  `podman secret create site-status-token -`, paste the token, press Ctrl-D, then
  `systemctl --user restart site`. The server reads the secret at startup.
- *Node without a container:* `STATUS_TOKEN_FILE=/path/to/file npm start`, or `STATUS_TOKEN=…` for a quick test.
- *Development:* nothing to set; the token is always `dev`.

**3. Check it** from the monitored server:

```sh
systemctl --user start status-agent && journalctl --user -u status-agent -n 5
```

No error means the report was accepted; the panel shows it within a couple of minutes.

| Response | Meaning |
|---|---|
| `401` | The two tokens differ |
| `503` | The site has no token configured, or on Cloudflare the `STATUS` KV binding is missing |
| `422` | The token is right, but the report is malformed (usually an outdated agent script) |

**Rotating it:** write a new value into `~/.config/status-agent/token`, then replace it on the site. On
Cloudflare, edit the secret and redeploy; on Podman, `podman secret rm site-status-token`, create it again and
restart the container. Reports sent in between are refused, which only shows on the panel if the gap
outlasts the offline threshold.

## Forking

Forks are welcome. Before publishing one:

- replace the files listed in `LICENSE-CONTENT.md` (profile, résumé, projects, media) with your own;
- update `src/config/site.ts` and the `<title>` and description in `index.html`;
- point `STATUS_ENDPOINT` in `deploy/status/status-agent.service` and the `Host()` rule in
  `deploy/site/site.container` at your own domain.

## License

The source code is released under the [Mozilla Public License 2.0](LICENSE): it can be used in any project,
open or closed, but changes to files of this repository must be shared under the same license.

The personal content (texts, résumé, images and videos) is not open source and stays all rights reserved.
See [LICENSE-CONTENT.md](LICENSE-CONTENT.md) for the exact list of files.

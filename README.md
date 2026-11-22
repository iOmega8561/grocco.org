# grocco.org

The source of [grocco.org](https://grocco.org), Giuseppe Rocco's personal site: projects, résumé and a live view
of the server his services run on. React 19 and TypeScript on Vite, no UI framework, no CSS framework.

## Running locally

```sh
npm install
npm run dev                                   # http://localhost:5173
VITE_STATUS_URL=/__status.json npm run dev    # with the live panel, fed by dev/status.sample.json
npm run build                                 # GitHub sync, type check, production build in dist/
```

Node 22 or later. Dependencies are pinned to exact versions.

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

### The site: Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Environment: `NODE_VERSION=22`, `VITE_STATUS_URL=https://status.grocco.org/status.json`, optionally `GITHUB_TOKEN`

`public/_redirects` routes every path to the app; `public/_headers` sets the security headers. If the
status endpoint is not on `status.grocco.org`, update `connect-src` there.

### The live status: a home server

No port is opened on the server. A systemd timer writes a small JSON file; a Caddy container serves it on a private
Podman network; cloudflared carries it out through a Cloudflare Tunnel.

```
deploy/status/
  status-agent.sh         reads `podman ps`, writes status.json atomically (needs jq)
  status-agent.service    STATUS_CONTAINERS: the only containers that are published
  status-agent.timer      every 30 seconds
  status.network          private network, no published ports
  Caddyfile               serves /status.json only, with CORS for the site's origin
  status-web.container    Caddy, read-only, no capabilities
  cloudflared.container   the tunnel; its token is a Podman secret
```

```sh
install -Dm755 deploy/status/status-agent.sh ~/.local/bin/status-agent.sh
install -Dm644 deploy/status/status-agent.{service,timer} -t ~/.config/systemd/user/
install -Dm644 deploy/status/{status.network,status-web.container,cloudflared.container} -t ~/.config/containers/systemd/
install -Dm644 deploy/status/Caddyfile ~/.config/status-web/Caddyfile
printf '%s' "<tunnel token>" | podman secret create cloudflared-token -

systemctl --user daemon-reload
systemctl --user enable --now status-agent.timer
systemctl --user start status-web cloudflared
loginctl enable-linger "$USER"
```

In the Cloudflare dashboard, route the tunnel's public hostname `status.grocco.org` to `http://status-web:8080`.

If the server is off, the panel says so and the rest of the site is unaffected.

### Self-hosting the whole site (optional)

`deploy/site/` builds the site into a Caddy image and runs it with Quadlet on the same private network, so
the tunnel can serve the whole site too.

## Forking

Forks are welcome. Before publishing one:

- replace the files listed in `LICENSE-CONTENT.md` (profile, résumé, projects, media) with your own;
- update `src/config/site.ts`, the `<title>` and description in `index.html`, and every `grocco.org` hostname
  in `public/_headers` and `deploy/`.

## License

The source code is released under the [Mozilla Public License 2.0](LICENSE): it can be used in any project,
open or closed, but changes to files of this repository must be shared under the same license.

The personal content (texts, résumé, images and videos) is not open source and stays all rights reserved.
See [LICENSE-CONTENT.md](LICENSE-CONTENT.md) for the exact list of files.

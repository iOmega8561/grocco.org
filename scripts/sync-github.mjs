#!/usr/bin/env node
// Fetches stars, last push and main language of every repository named in
// src/content/projects/*.ts (the `repo: "owner/name"` field) and writes them to
// src/generated/github.json, which the site reads at build time.
//
// It never breaks a build: if GitHub can't be reached, or rate-limits the request,
// the previous file is kept. Set GITHUB_TOKEN for a higher rate limit.

import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const projectsDir = join(root, "src/content/projects");
const output = join(root, "src/generated/github.json");

const files = (await readdir(projectsDir)).filter((file) => file.endsWith(".ts"));
const repos = new Set();
for (const file of files) {
  const source = await readFile(join(projectsDir, file), "utf8");
  const match = source.match(/\brepo:\s*["']([\w.-]+\/[\w.-]+)["']/);
  if (match) repos.add(match[1]);
}

let previous = { fetchedAt: null, repos: {} };
try {
  previous = JSON.parse(await readFile(output, "utf8"));
} catch {
  // first run
}

const headers = { Accept: "application/vnd.github+json", "User-Agent": "grocco-site-build" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const result = { fetchedAt: new Date().toISOString(), repos: { ...previous.repos } };
let fetched = 0;

for (const repo of repos) {
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}`, { headers, signal: AbortSignal.timeout(8000) });
    if (!response.ok) {
      console.warn(`sync-github: ${repo}: HTTP ${response.status}, keeping the previous values`);
      continue;
    }
    const body = await response.json();
    result.repos[repo] = { stars: body.stargazers_count, pushedAt: body.pushed_at, language: body.language };
    fetched += 1;
  } catch (error) {
    console.warn(`sync-github: ${repo}: ${error.message}, keeping the previous values`);
  }
}

if (fetched === 0) {
  console.warn("sync-github: nothing fetched; src/generated/github.json left as it was");
} else {
  await writeFile(output, JSON.stringify(result, null, 2) + "\n");
  console.log(`sync-github: ${fetched} of ${repos.size} repositories updated`);
}

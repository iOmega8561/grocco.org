import type { Project } from "./types";

/**
 * Every file in `content/projects/` that default-exports a project is on the site.
 * Add a file to add a project, delete it (or set `hidden: true`) to remove one.
 */
const modules = import.meta.glob<{ default: Project }>("./projects/*.ts", { eager: true });

export const projects: Project[] = Object.values(modules)
  .map((module) => module.default)
  .filter((project) => !project.hidden)
  .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

const seen = new Set<string>();
for (const project of projects) {
  if (seen.has(project.slug)) throw new Error(`Two projects use the slug "${project.slug}"`);
  seen.add(project.slug);
}

export function projectBySlug(slug: string | undefined): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export const featuredProject: Project | undefined = projects.find((project) => project.featured);

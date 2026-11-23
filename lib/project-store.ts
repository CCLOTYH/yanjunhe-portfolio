import { promises as fs } from "fs";
import path from "path";

import type { Project, ProjectDetails } from "./projects";

function dataDir(): string {
  return process.env.PROJECTS_DATA_DIR ?? path.join(process.cwd(), "data");
}

function dataFile(): string {
  return path.join(dataDir(), "projects.json");
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isValidProject(value: unknown): value is Project {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const entry = value as Record<string, unknown>;
  const details = entry.details as Record<string, unknown> | undefined;
  return (
    typeof entry.slug === "string" &&
    entry.slug.length > 0 &&
    typeof entry.number === "string" &&
    typeof entry.category === "string" &&
    typeof entry.title === "string" &&
    entry.title.length > 0 &&
    typeof entry.description === "string" &&
    isStringArray(entry.focusAreas) &&
    typeof entry.href === "string" &&
    typeof details === "object" &&
    details !== null &&
    typeof details.background === "string" &&
    isStringArray(details.objectives) &&
    isStringArray(details.approach)
  );
}

async function readProjects(): Promise<Project[]> {
  let raw: string;
  try {
    raw = await fs.readFile(dataFile(), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw new Error(`Project storage is unreadable: ${String(error)}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Project storage contains malformed JSON.");
  }

  if (!Array.isArray(parsed) || !parsed.every(isValidProject)) {
    throw new Error("Project storage contains invalid entries.");
  }

  const slugs = parsed.map((project) => project.slug);
  if (new Set(slugs).size !== slugs.length) {
    throw new Error("Project storage contains duplicate slugs.");
  }

  return parsed;
}

async function writeProjects(projects: Project[]): Promise<void> {
  const dir = dataDir();
  await fs.mkdir(dir, { recursive: true });
  const tempFile = path.join(
    dir,
    `.projects-${process.pid}-${crypto.randomUUID()}.tmp`,
  );

  try {
    await fs.writeFile(tempFile, JSON.stringify(projects, null, 2), "utf8");
    await fs.rename(tempFile, dataFile());
  } catch (error) {
    await fs.rm(tempFile, { force: true });
    throw error;
  }
}

let writeQueue: Promise<unknown> = Promise.resolve();

function queued<T>(operation: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(operation);
  writeQueue = run.catch(() => {});
  return run;
}

function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "project";
}

export async function listProjects(): Promise<Project[]> {
  const projects = await readProjects();
  return projects.sort((a, b) =>
    a.number.localeCompare(b.number, undefined, { numeric: true }),
  );
}

export async function createProject(
  input: Omit<Project, "slug" | "href" | "updatedAt">,
): Promise<Project> {
  return queued(async () => {
    const projects = await readProjects();

    const takenSlugs = new Set(projects.map((project) => project.slug));
    const base = slugify(input.title);
    let slug = base;
    for (let n = 2; takenSlugs.has(slug); n += 1) {
      slug = `${base}-${n}`;
    }

    const project: Project = {
      ...input,
      slug,
      href: `/projects/${slug}`,
      updatedAt: new Date().toISOString(),
    };

    await writeProjects([project, ...projects]);
    return project;
  });
}

type ProjectPatch = Partial<Omit<Project, "slug" | "href" | "details">> & {
  details?: Partial<ProjectDetails>;
};

export async function updateProject(
  slug: string,
  patch: ProjectPatch,
): Promise<Project | null> {
  return queued(async () => {
    const projects = await readProjects();
    const index = projects.findIndex((project) => project.slug === slug);
    if (index === -1) {
      return null;
    }
    const current = projects[index];
    const merged: Project = {
      ...current,
      ...patch,
      details: patch.details
        ? { ...current.details, ...patch.details }
        : current.details,
      updatedAt: new Date().toISOString(),
    };
    projects[index] = merged;
    await writeProjects(projects);
    return merged;
  });
}

export async function deleteProject(slug: string): Promise<boolean> {
  return queued(async () => {
    const projects = await readProjects();
    const remaining = projects.filter((project) => project.slug !== slug);
    if (remaining.length === projects.length) {
      return false;
    }
    await writeProjects(remaining);
    return true;
  });
}

export type { ProjectDetails };

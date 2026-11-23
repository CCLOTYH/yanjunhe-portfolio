import {
  createProject,
  deleteProject,
  listProjects,
  updateProject,
} from "./project-store.ts";
import { validateProject, validateProjectPatch } from "./project-validation.ts";

const SAVE_FAILURE_MESSAGE =
  "The project could not be saved. Please try again in a moment.";

export async function handleProjectsGet(): Promise<Response> {
  try {
    const projects = await listProjects();
    return Response.json(projects, { status: 200 });
  } catch {
    return Response.json(
      { ok: false, error: "Project storage is unavailable." },
      { status: 500 },
    );
  }
}

export async function handleProjectsPost(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const result = validateProject((body ?? {}) as Record<string, unknown>);
  if (!result.ok) {
    return Response.json({ ok: false, errors: result.errors }, { status: 422 });
  }

  try {
    const project = await createProject(result.data);
    return Response.json({ ok: true, project }, { status: 201 });
  } catch {
    return Response.json(
      { ok: false, error: SAVE_FAILURE_MESSAGE },
      { status: 500 },
    );
  }
}

export async function handleProjectsPatch(request: Request): Promise<Response> {
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) {
    return Response.json(
      { ok: false, error: "A project slug query parameter is required." },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const result = validateProjectPatch((body ?? {}) as Record<string, unknown>);
  if (!result.ok) {
    return Response.json({ ok: false, errors: result.errors }, { status: 422 });
  }

  try {
    const project = await updateProject(slug, result.data ?? {});
    if (!project) {
      return Response.json(
        { ok: false, error: `No project exists with slug ${slug}.` },
        { status: 404 },
      );
    }
    return Response.json({ ok: true, project }, { status: 200 });
  } catch {
    return Response.json(
      { ok: false, error: SAVE_FAILURE_MESSAGE },
      { status: 500 },
    );
  }
}

export async function handleProjectsDelete(request: Request): Promise<Response> {
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) {
    return Response.json(
      { ok: false, error: "A project slug query parameter is required." },
      { status: 400 },
    );
  }

  try {
    const deleted = await deleteProject(slug);
    if (!deleted) {
      return Response.json(
        { ok: false, error: `No project exists with slug ${slug}.` },
        { status: 404 },
      );
    }
    return Response.json({ ok: true, slug }, { status: 200 });
  } catch {
    return Response.json(
      { ok: false, error: SAVE_FAILURE_MESSAGE },
      { status: 500 },
    );
  }
}

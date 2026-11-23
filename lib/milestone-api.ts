import {
  createMilestone,
  deleteMilestone,
  listMilestones,
  updateMilestone,
} from "./milestone-store.ts";
import {
  validateMilestone,
  validateMilestonePatch,
} from "./milestone-validation.ts";

const SAVE_FAILURE_MESSAGE =
  "The milestone could not be saved. Please try again in a moment.";

function milestoneIdFrom(request: Request): string | null {
  return new URL(request.url).searchParams.get("id");
}

export async function handleMilestonesGet(): Promise<Response> {
  try {
    const milestones = await listMilestones();
    return Response.json(milestones, { status: 200 });
  } catch {
    return Response.json(
      { ok: false, error: "Milestone storage is unavailable." },
      { status: 500 },
    );
  }
}

export async function handleMilestonesPost(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const raw = body as Record<string, unknown> | null;
  const result = validateMilestone({
    title: raw?.title,
    description: raw?.description,
    dueDate: raw?.dueDate,
    priority: raw?.priority,
    status: raw?.status,
  });
  if (!result.ok) {
    return Response.json({ ok: false, errors: result.errors }, { status: 422 });
  }

  try {
    const milestone = await createMilestone(result.data);
    return Response.json({ ok: true, milestone }, { status: 201 });
  } catch {
    return Response.json(
      { ok: false, error: SAVE_FAILURE_MESSAGE },
      { status: 500 },
    );
  }
}

async function handleUpdate(
  request: Request,
  mode: "full" | "partial",
): Promise<Response> {
  const id = milestoneIdFrom(request);
  if (!id) {
    return Response.json(
      { ok: false, error: "A milestone id query parameter is required." },
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
  const raw = body as Record<string, unknown> | null;

  let patch: Partial<import("./milestone-validation").MilestoneInput>;
  if (mode === "full") {
    const result = validateMilestone({
      title: raw?.title,
      description: raw?.description,
      dueDate: raw?.dueDate,
      priority: raw?.priority,
      status: raw?.status,
    });
    if (!result.ok) {
      return Response.json({ ok: false, errors: result.errors }, { status: 422 });
    }
    patch = result.data;
  } else {
    const result = validateMilestonePatch(raw ?? {});
    if (!result.ok) {
      return Response.json({ ok: false, errors: result.errors }, { status: 422 });
    }
    patch = result.data ?? {};
  }

  try {
    const milestone = await updateMilestone(id, patch);
    if (!milestone) {
      return Response.json(
        { ok: false, error: `No milestone exists with id ${id}.` },
        { status: 404 },
      );
    }
    return Response.json({ ok: true, milestone }, { status: 200 });
  } catch {
    return Response.json(
      { ok: false, error: SAVE_FAILURE_MESSAGE },
      { status: 500 },
    );
  }
}

export async function handleMilestonesPut(request: Request): Promise<Response> {
  return handleUpdate(request, "full");
}

export async function handleMilestonesPatch(request: Request): Promise<Response> {
  return handleUpdate(request, "partial");
}

export async function handleMilestonesDelete(request: Request): Promise<Response> {
  const id = milestoneIdFrom(request);
  if (!id) {
    return Response.json(
      { ok: false, error: "A milestone id query parameter is required." },
      { status: 400 },
    );
  }

  try {
    const deleted = await deleteMilestone(id);
    if (!deleted) {
      return Response.json(
        { ok: false, error: `No milestone exists with id ${id}.` },
        { status: 404 },
      );
    }
    return Response.json({ ok: true, id }, { status: 200 });
  } catch {
    return Response.json(
      { ok: false, error: SAVE_FAILURE_MESSAGE },
      { status: 500 },
    );
  }
}

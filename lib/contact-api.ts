import { saveContact, listContacts, updateContact, deleteContact } from "./contact-store.ts";
import { validateContact, validateContactPatch } from "./contact-validation.ts";

const SUCCESS_MESSAGE =
  "Thanks, your message has been sent. I will get back to you soon.";
const SAVE_FAILURE_MESSAGE =
  "Sorry, your message could not be saved. Please try again in a moment.";

export async function handleContactPost(request: Request): Promise<Response> {
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
  const result = validateContact({
    name: raw?.name,
    email: raw?.email,
    message: raw?.message,
  });

  if (!result.ok) {
    return Response.json({ ok: false, errors: result.errors }, { status: 422 });
  }

  const saved = await saveContact(result.data);
  if (!saved) {
    return Response.json(
      { ok: false, error: SAVE_FAILURE_MESSAGE },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, message: SUCCESS_MESSAGE }, { status: 201 });
}

export async function handleContactsGet(): Promise<Response> {
  try {
    const contacts = await listContacts();
    return Response.json(contacts, { status: 200 });
  } catch {
    return Response.json(
      { ok: false, error: "Contact storage is unavailable." },
      { status: 500 },
    );
  }
}

export async function handleContactsPatch(request: Request): Promise<Response> {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return Response.json(
      { ok: false, error: "A contact id query parameter is required." },
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

  const result = validateContactPatch((body ?? {}) as Record<string, unknown>);
  if (!result.ok) {
    return Response.json({ ok: false, errors: result.errors }, { status: 422 });
  }

  try {
    const contact = await updateContact(id, result.data ?? {});
    if (!contact) {
      return Response.json(
        { ok: false, error: `No contact exists with id ${id}.` },
        { status: 404 },
      );
    }
    return Response.json({ ok: true, contact }, { status: 200 });
  } catch {
    return Response.json(
      { ok: false, error: SAVE_FAILURE_MESSAGE },
      { status: 500 },
    );
  }
}

export async function handleContactsDelete(request: Request): Promise<Response> {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return Response.json(
      { ok: false, error: "A contact id query parameter is required." },
      { status: 400 },
    );
  }

  try {
    const deleted = await deleteContact(id);
    if (!deleted) {
      return Response.json(
        { ok: false, error: `No contact exists with id ${id}.` },
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

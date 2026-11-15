import { saveContact } from "./contact-store.ts";
import { validateContact } from "./contact-validation.ts";

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

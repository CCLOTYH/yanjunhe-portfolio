import {
  createBlogPost,
  getBlogs,
  type BlogPostInput,
} from "./blog-store.ts";

type BlogFieldErrors = {
  title?: string;
  content?: string;
};

function validateBlogPost(raw: {
  title: unknown;
  content: unknown;
}): { ok: true; data: BlogPostInput } | { ok: false; errors: BlogFieldErrors } {
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const content = typeof raw.content === "string" ? raw.content.trim() : "";

  const errors: BlogFieldErrors = {};
  if (!title) {
    errors.title = "Please enter a title.";
  }
  if (!content) {
    errors.content = "Please enter content.";
  }

  if (errors.title || errors.content) {
    return { ok: false, errors };
  }
  return { ok: true, data: { title, content } };
}

export async function handleBlogsGet(): Promise<Response> {
  try {
    const blogs = await getBlogs();
    return Response.json(blogs, { status: 200 });
  } catch {
    return Response.json(
      { ok: false, error: "Blog storage is unavailable." },
      { status: 500 },
    );
  }
}

export async function handleBlogsPost(request: Request): Promise<Response> {
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
  const result = validateBlogPost({ title: raw?.title, content: raw?.content });
  if (!result.ok) {
    return Response.json({ ok: false, errors: result.errors }, { status: 422 });
  }

  try {
    const post = await createBlogPost(result.data);
    return Response.json({ ok: true, blog: post }, { status: 201 });
  } catch {
    return Response.json(
      { ok: false, error: "Blog could not be saved. Storage may be unavailable." },
      { status: 500 },
    );
  }
}

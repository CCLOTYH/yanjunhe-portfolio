import {
  createBlogPost,
  deleteBlogPost,
  getBlogs,
  updateBlogPost,
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

const BLOG_SAVE_FAILURE_MESSAGE =
  "The blog post could not be saved. Please try again in a moment.";

function validateBlogPatch(raw: Record<string, unknown>): {
  ok: boolean;
  data?: Partial<BlogPostInput>;
  errors?: BlogFieldErrors;
} {
  const errors: BlogFieldErrors = {};
  const data: Partial<BlogPostInput> = {};

  if ("title" in raw) {
    const title = typeof raw.title === "string" ? raw.title.trim() : "";
    if (!title) {
      errors.title = "Please enter a title.";
    } else {
      data.title = title;
    }
  }
  if ("content" in raw) {
    const content = typeof raw.content === "string" ? raw.content.trim() : "";
    if (!content) {
      errors.content = "Please enter content.";
    } else {
      data.content = content;
    }
  }

  if (errors.title || errors.content) {
    return { ok: false, errors };
  }
  if (Object.keys(data).length === 0) {
    return {
      ok: false,
      errors: {
        content: "Provide at least one field to update: title or content.",
      },
    };
  }
  return { ok: true, data };
}

function blogSlugFrom(request: Request): string | null {
  return new URL(request.url).searchParams.get("slug");
}

export async function handleBlogsPatch(request: Request): Promise<Response> {
  const slug = blogSlugFrom(request);
  if (!slug) {
    return Response.json(
      { ok: false, error: "A blog slug query parameter is required." },
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

  const result = validateBlogPatch((body ?? {}) as Record<string, unknown>);
  if (!result.ok) {
    return Response.json({ ok: false, errors: result.errors }, { status: 422 });
  }

  try {
    const post = await updateBlogPost(slug, result.data ?? {});
    if (!post) {
      return Response.json(
        { ok: false, error: `No blog post exists with slug ${slug}.` },
        { status: 404 },
      );
    }
    return Response.json({ ok: true, blog: post }, { status: 200 });
  } catch {
    return Response.json(
      { ok: false, error: BLOG_SAVE_FAILURE_MESSAGE },
      { status: 500 },
    );
  }
}

export async function handleBlogsDelete(request: Request): Promise<Response> {
  const slug = blogSlugFrom(request);
  if (!slug) {
    return Response.json(
      { ok: false, error: "A blog slug query parameter is required." },
      { status: 400 },
    );
  }

  try {
    const deleted = await deleteBlogPost(slug);
    if (!deleted) {
      return Response.json(
        { ok: false, error: `No blog post exists with slug ${slug}.` },
        { status: 404 },
      );
    }
    return Response.json({ ok: true, slug }, { status: 200 });
  } catch {
    return Response.json(
      { ok: false, error: BLOG_SAVE_FAILURE_MESSAGE },
      { status: 500 },
    );
  }
}

"use client";

import { useCallback, useEffect, useState } from "react";

import { RacingStripes } from "@/components/racing-stripes";

const inputClasses =
  "w-full rounded-lg border border-navy/20 bg-white px-4 py-2.5 text-charcoal placeholder:text-zinc-400 focus:border-racing-orange focus:outline-none focus:ring-2 focus:ring-racing-orange/30";

const errorClasses = "text-sm font-semibold text-racing-red";

type FieldErrors = { title?: string; content?: string };

type Post = {
  slug: string;
  title: string;
  content: string;
  createdAt: string;
};

const initialForm = { title: "", content: "" };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function BlogAdmin() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [published, setPublished] = useState<{ title: string; slug: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/blogs", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`status ${res.status}`);
      }
      setPosts(await res.json());
      setListError(null);
    } catch {
      setPosts(null);
      setListError("Could not load posts from /api/blogs.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadPosts();
    })();
  }, [loadPosts]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    setFormError(null);
    setPublished(null);

    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();

      if (res.status === 201 && body.ok) {
        setPublished({ title: body.blog.title, slug: body.blog.slug });
        setForm(initialForm);
        await loadPosts();
      } else if (res.status === 422 && body.errors) {
        setErrors(body.errors);
      } else {
        setFormError(body.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setFormError(
        "The post could not be published. Please check your connection and try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-navy/10 bg-white p-8 lg:col-span-2">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="block h-3 w-1.5 -skew-x-12 bg-racing-red"
            />
            <h2 className="text-sm font-bold uppercase tracking-widest text-charcoal">
              Write a post
            </h2>
          </div>
          <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-5">
            {published && (
              <div className="rounded-2xl bg-navy p-6" role="status">
                <p className="font-semibold text-white">
                  Published &ldquo;{published.title}&rdquo;
                </p>
                <p className="mt-1 text-sm text-white/70">
                  Saved with slug <span className="font-mono">{published.slug}</span>
                </p>
              </div>
            )}
            {formError && (
              <div
                role="alert"
                className="rounded-2xl border-l-4 border-racing-red bg-racing-red/5 p-6"
              >
                <p className="text-sm font-medium text-charcoal">{formError}</p>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="blog-title" className="text-sm font-semibold text-charcoal">
                Title
              </label>
              <input
                id="blog-title"
                name="title"
                type="text"
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
                aria-invalid={errors.title ? true : undefined}
                aria-describedby={errors.title ? "blog-title-error" : undefined}
                className={inputClasses}
              />
              {errors.title && (
                <p id="blog-title-error" className={errorClasses}>
                  {errors.title}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="blog-content" className="text-sm font-semibold text-charcoal">
                Content
              </label>
              <textarea
                id="blog-content"
                name="content"
                rows={8}
                value={form.content}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, content: event.target.value }))
                }
                aria-invalid={errors.content ? true : undefined}
                aria-describedby={errors.content ? "blog-content-error" : undefined}
                className={inputClasses}
              />
              {errors.content && (
                <p id="blog-content-error" className={errorClasses}>
                  {errors.content}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-11 w-fit items-center justify-center rounded-full bg-racing-orange px-6 text-sm font-semibold text-charcoal transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-racing-orange"
            >
              {pending ? "Publishing" : "Publish"}
            </button>
          </form>
        </div>

        <aside className="rounded-2xl bg-navy p-8">
          <RacingStripes dark className="mb-4" />
          <h2 className="text-lg font-semibold text-white">Publishing notes</h2>
          <ul className="mt-4 space-y-3">
            {[
              "Publishing posts with fetch() to /api/blogs.",
              "The server generates a unique slug from the title.",
              "Empty titles or content are rejected.",
              "Posts are stored in data/blogs.json, outside the public site.",
            ].map((item) => (
              <li key={item} className="flex gap-3 leading-7 text-white/70">
                <span
                  aria-hidden
                  className="mt-2.5 block h-1.5 w-3 shrink-0 -skew-x-12 bg-racing-orange"
                />
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <div className="mt-6 rounded-2xl border border-navy/10 bg-white p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="block h-3 w-1.5 -skew-x-12 bg-racing-red"
            />
            <h2 className="text-sm font-bold uppercase tracking-widest text-charcoal">
              Existing posts
            </h2>
          </div>
          <button
            type="button"
            onClick={loadPosts}
            className="text-sm font-semibold text-racing-red transition-colors hover:text-racing-orange"
          >
            Refresh
          </button>
        </div>
        <div className="mt-6">
          {listError ? (
            <p className="text-sm font-medium text-zinc-600">{listError}</p>
          ) : posts === null ? (
            <p className="text-sm text-zinc-500">Loading posts…</p>
          ) : posts.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No posts yet — publish the first one above.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-navy/10">
              {posts.map((post) => (
                <li key={post.slug} className="py-5 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-semibold text-charcoal">{post.title}</h3>
                    <p className="text-xs text-zinc-500">
                      {formatDate(post.createdAt)}
                    </p>
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-racing-red">
                    /{post.slug}
                  </p>
                  <p className="mt-2 leading-7 text-zinc-700">{post.content}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

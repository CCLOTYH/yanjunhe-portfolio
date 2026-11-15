"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Post = {
  slug: string;
  title: string;
  content: string;
  createdAt: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function BlogList() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/blogs", { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`status ${res.status}`);
        }
        if (!cancelled) {
          setPosts(await res.json());
        }
      } catch {
        if (!cancelled) {
          setError("Could not load posts from /api/blogs.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl border border-navy/10 bg-white p-8">
        <p className="text-sm font-medium text-zinc-600">{error}</p>
      </div>
    );
  }

  if (posts === null) {
    return (
      <div className="rounded-2xl border border-navy/10 bg-white p-8">
        <p className="text-sm text-zinc-500">Loading posts…</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-navy/10 bg-white p-8">
        <p className="text-sm text-zinc-500">No posts published yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {posts.map((post) => (
        <article
          key={post.slug}
          className="flex flex-col rounded-2xl border border-navy/10 bg-white p-8"
        >
          <p className="text-xs text-zinc-500">{formatDate(post.createdAt)}</p>
          <h2 className="mt-2 text-xl font-semibold text-charcoal">
            {post.title}
          </h2>
          <p className="mt-1 font-mono text-xs text-racing-red">/{post.slug}</p>
          <p className="mt-4 flex-1 leading-7 text-zinc-700">{post.content}</p>
          <Link
            href={`/blogs/${post.slug}`}
            className="mt-6 inline-flex w-fit items-center gap-1 text-sm font-semibold text-racing-red transition-colors hover:text-racing-orange"
          >
            Read post <span aria-hidden>&rarr;</span>
          </Link>
        </article>
      ))}
    </div>
  );
}

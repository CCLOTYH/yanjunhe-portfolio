import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RacingStripes } from "@/components/racing-stripes";
import { getBlogs } from "@/lib/blog-store.ts";

type Params = { params: Promise<{ slug: string }> };

export const metadata: Metadata = {
  title: "Blog — Yanjun He",
  description:
    "Notes and reflections on cloud computing, analytics, and hands-on projects.",
};

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = (await getBlogs()).find((p) => p.slug === slug);
  if (!post) {
    notFound();
  }

  const published = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <section className="relative overflow-hidden bg-navy">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-80 xl:block"
        >
          <span className="absolute -top-24 -bottom-24 right-24 w-14 -skew-x-12 bg-racing-orange" />
          <span className="absolute -top-24 -bottom-24 right-10 w-8 -skew-x-12 bg-racing-red" />
          <span className="absolute -top-24 -bottom-24 right-0 w-3 -skew-x-12 bg-white/40" />
        </div>
        <div className="relative mx-auto w-full max-w-5xl px-6 pb-20 pt-12">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1 text-sm font-medium text-white/70 transition-colors hover:text-racing-orange"
          >
            <span aria-hidden>&larr;</span> Back to Blog
          </Link>
          <p className="mt-10 text-sm text-white/70">{published}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 font-mono text-sm text-racing-orange">
            /{post.slug}
          </p>
          <RacingStripes dark className="mt-8" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-6 py-16">
        <article className="rounded-2xl border border-navy/10 bg-white p-8 sm:p-10">
          {post.content.split(/\n{2,}/).map((paragraph) => (
            <p
              key={paragraph.slice(0, 32)}
              className="leading-8 text-zinc-700 [&:not(:first-child)]:mt-5"
            >
              {paragraph}
            </p>
          ))}
        </article>

        <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl bg-navy p-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Want more like this?
            </h2>
            <p className="mt-1 text-white/70">Browse the rest of the blog.</p>
          </div>
          <Link
            href="/blogs"
            className="inline-flex h-11 shrink-0 items-center rounded-full bg-racing-orange px-6 text-sm font-semibold text-charcoal transition-colors hover:bg-white"
          >
            All posts
          </Link>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { BlogList } from "@/components/blog-list";
import { RacingStripes } from "@/components/racing-stripes";

export const metadata: Metadata = {
  title: "Blog — Yanjun He",
  description:
    "Notes and reflections on cloud computing, analytics, and hands-on projects.",
};

export default function BlogsPage() {
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
        <div className="relative mx-auto w-full max-w-5xl px-6 pb-20 pt-20">
          <p className="inline-flex w-fit items-center rounded-full bg-racing-orange px-3 py-1 text-xs font-semibold text-charcoal">
            Blog
          </p>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Notes &amp; writes.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
            Course notes, project reflections, and things learned along the
            way — loaded live from /api/blogs.
          </p>
          <RacingStripes dark className="mt-8" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <BlogList />
      </section>
    </>
  );
}

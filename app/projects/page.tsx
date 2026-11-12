import type { Metadata } from "next";
import Link from "next/link";
import { RacingStripes } from "@/components/racing-stripes";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects — Yanjun He",
  description:
    "Portfolio projects by Yanjun He: last-mile delivery network optimization and AI-assisted website development.",
};

const numberColorBySlug: Record<string, string> = {
  "c103-last-mile-delivery": "text-racing-orange",
  "cc-lot-website": "text-racing-red",
};

export default function Projects() {
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
            Projects
          </p>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Selected work, on the record.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
            Two projects across analytics and web development — from optimizing
            a last-mile delivery network to steering an AI-assisted website
            build. Detailed case studies for each project are below.
          </p>
          <RacingStripes dark className="mt-8" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          {projects.map((project) => (
            <article
              key={project.slug}
              className="flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white transition-colors hover:border-racing-orange/60 hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 bg-navy px-8 py-4">
                <span
                  className={`font-mono text-xl font-bold ${numberColorBySlug[project.slug] ?? "text-racing-orange"}`}
                >
                  {project.number}
                </span>
                <span className="text-xs font-medium uppercase tracking-widest text-white/80">
                  {project.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-4 p-8">
                <h2 className="text-xl font-semibold text-charcoal">
                  {project.title}
                </h2>
                <p className="leading-7 text-zinc-600">{project.description}</p>
                <ul className="flex flex-wrap gap-2 pt-1">
                  {project.focusAreas.map((area) => (
                    <li
                      key={area}
                      className="rounded-full border border-navy/15 px-3 py-1 text-xs text-charcoal"
                    >
                      {area}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-2">
                  <Link
                    href={project.href}
                    className="inline-flex w-fit items-center gap-1 rounded-full border border-navy/20 px-4 py-1.5 text-sm font-semibold text-charcoal transition-colors hover:border-racing-red hover:bg-racing-red/5"
                  >
                    View case study
                    <span aria-hidden className="text-racing-red">&rarr;</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start gap-4 rounded-2xl bg-navy p-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <RacingStripes dark className="mb-3" />
            <h2 className="text-xl font-semibold text-white">
              Want the person behind the work?
            </h2>
            <p className="mt-1 text-white/70">
              Background, education, and interests — all on the About page.
            </p>
          </div>
          <Link
            href="/about-me"
            className="inline-flex h-11 shrink-0 items-center rounded-full bg-racing-orange px-6 text-sm font-semibold text-charcoal transition-colors hover:bg-white"
          >
            About me
          </Link>
        </div>
      </section>
    </>
  );
}

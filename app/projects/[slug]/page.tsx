import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RacingStripes } from "@/components/racing-stripes";
import { projects } from "@/lib/projects";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) {
    return { title: "Project Not Found — Yanjun He" };
  }
  return {
    title: `${project.title} — Yanjun He`,
    description: project.description,
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) {
    notFound();
  }

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
            href="/projects"
            className="inline-flex items-center gap-1 text-sm font-medium text-white/70 transition-colors hover:text-racing-orange"
          >
            <span aria-hidden>&larr;</span> Back to Projects
          </Link>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <span className="font-mono text-xl font-bold text-racing-orange">
              {project.number}
            </span>
            <span className="rounded-full bg-racing-orange px-3 py-1 text-xs font-semibold text-charcoal">
              {project.category}
            </span>
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {project.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
            {project.description}
          </p>
          <RacingStripes dark className="mt-8" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-navy/10 bg-white p-8">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="block h-3 w-1.5 -skew-x-12 bg-racing-red"
              />
              <h2 className="text-sm font-bold uppercase tracking-widest text-charcoal">
                Background
              </h2>
            </div>
            <p className="mt-4 leading-7 text-zinc-700">
              {project.details.background}
            </p>
          </article>
          <article className="rounded-2xl border border-navy/10 bg-white p-8">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="block h-3 w-1.5 -skew-x-12 bg-racing-red"
              />
              <h2 className="text-sm font-bold uppercase tracking-widest text-charcoal">
                Objectives
              </h2>
            </div>
            <ul className="mt-4 space-y-3">
              {project.details.objectives.map((objective) => (
                <li
                  key={objective}
                  className="flex gap-3 leading-7 text-zinc-700"
                >
                  <span
                    aria-hidden
                    className="mt-2.5 block h-1.5 w-3 shrink-0 -skew-x-12 bg-racing-orange"
                  />
                  {objective}
                </li>
              ))}
            </ul>
          </article>
        </div>

        <article className="mt-6 rounded-2xl border border-navy/10 bg-white p-8">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="block h-3 w-1.5 -skew-x-12 bg-racing-red"
            />
            <h2 className="text-sm font-bold uppercase tracking-widest text-charcoal">
              Approach
            </h2>
          </div>
          <ol className="mt-4 grid gap-6 sm:grid-cols-3">
            {project.details.approach.map((step, index) => (
              <li key={step} className="flex flex-col gap-2">
                <span className="font-mono text-xl font-bold text-racing-red">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="leading-7 text-zinc-700">{step}</p>
              </li>
            ))}
          </ol>
        </article>

        <div className="mt-6 rounded-2xl border border-navy/10 bg-white p-8">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="block h-3 w-1.5 -skew-x-12 bg-racing-red"
            />
            <h2 className="text-sm font-bold uppercase tracking-widest text-charcoal">
              Key focus areas
            </h2>
          </div>
          <ul className="mt-4 flex flex-wrap gap-2">
            {project.focusAreas.map((area) => (
              <li
                key={area}
                className="rounded-full border border-navy/15 px-3 py-1 text-xs text-charcoal"
              >
                {area}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-24">
        <div className="flex flex-col items-start gap-4 rounded-2xl bg-navy p-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <RacingStripes dark className="mb-3" />
            <h2 className="text-xl font-semibold text-white">
              Back to all projects
            </h2>
            <p className="mt-1 text-white/70">
              Explore the rest of the portfolio.
            </p>
          </div>
          <Link
            href="/projects"
            className="inline-flex h-11 shrink-0 items-center rounded-full bg-racing-orange px-6 text-sm font-semibold text-charcoal transition-colors hover:bg-white"
          >
            Back to Projects
          </Link>
        </div>
      </section>
    </>
  );
}

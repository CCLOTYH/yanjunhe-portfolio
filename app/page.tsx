import Link from "next/link";
import { RacingStripes } from "@/components/racing-stripes";
import { projects } from "@/lib/projects";

const toolbox = [
  "SQL",
  "Python",
  "Excel",
  "Tableau",
  "Power BI",
  "RStudio",
  "Data Visualization",
];

export default function Home() {
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
        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-start gap-6 px-6 pb-20 pt-20 sm:pt-28">
          <p className="inline-flex w-fit items-center rounded-full bg-racing-orange px-3 py-1 text-xs font-semibold text-charcoal">
            Business Analytics &middot; Santa Clara University
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-6xl sm:leading-[1.1]">
            Hi, I&apos;m Yanjun He. I turn data into decisions.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-white/70">
            I&apos;m a Business Analytics graduate student at Santa Clara
            University. I enjoy working at the intersection of business and
            data — cleaning messy datasets, building models, and turning
            findings into clear stories that support real decisions.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/about-me"
              className="inline-flex h-11 items-center rounded-full bg-racing-orange px-6 text-sm font-semibold text-charcoal transition-colors hover:bg-white"
            >
              About me
            </Link>
            <Link
              href="/projects"
              className="inline-flex h-11 items-center rounded-full border border-white/40 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              See my work
            </Link>
          </div>
          <RacingStripes dark className="mt-2" />
        </div>
      </section>

      <section
        id="about"
        className="mx-auto w-full max-w-5xl scroll-mt-24 px-6 py-16"
      >
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="block h-3 w-1.5 -skew-x-12 bg-racing-red"
          />
          <h2 className="text-3xl font-semibold tracking-tight text-charcoal">
            About
          </h2>
        </div>
        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          <p className="text-lg leading-8 text-zinc-700">
            I&apos;m pursuing my master&apos;s degree in Business Analytics at
            Santa Clara University in the heart of Silicon Valley. My work
            focuses on using statistics, machine learning, and data
            visualization to answer practical business questions.
          </p>
          <p className="text-lg leading-8 text-zinc-700">
            Before analytics, I built a strong foundation in business and
            economics, which helps me connect technical results to the
            decisions they inform. I&apos;m always looking for projects where
            data can make something simpler, clearer, or fairer.
          </p>
        </div>
        <Link
          href="/about-me"
          className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-charcoal transition-colors hover:text-racing-red hover:underline"
        >
          More about me
          <span aria-hidden className="text-racing-red">&rarr;</span>
        </Link>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-4">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="block h-3 w-1.5 -skew-x-12 bg-racing-red"
          />
          <h2 className="text-3xl font-semibold tracking-tight text-charcoal">
            Toolbox
          </h2>
        </div>
        <ul className="mt-6 flex flex-wrap gap-2">
          {toolbox.map((item) => (
            <li
              key={item}
              className="rounded-full border border-navy/15 bg-white px-4 py-1.5 text-sm text-charcoal"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section
        id="projects"
        className="mx-auto w-full max-w-5xl scroll-mt-24 px-6 py-16"
      >
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="block h-3 w-1.5 -skew-x-12 bg-racing-red"
          />
          <h2 className="text-3xl font-semibold tracking-tight text-charcoal">
            Featured Work
          </h2>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {projects.map((project) => (
            <article
              key={project.slug}
              className="flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white transition-colors hover:border-racing-orange/60 hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 bg-navy px-8 py-4">
                <span className="font-mono text-xl font-bold text-racing-orange">
                  {project.number}
                </span>
                <span className="text-xs font-medium uppercase tracking-widest text-white/80">
                  {project.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-8">
                <h3 className="text-xl font-semibold text-charcoal">
                  {project.title}
                </h3>
                <p className="leading-7 text-zinc-600">{project.description}</p>
                <div className="mt-auto pt-2">
                  <Link
                    href={project.href}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-charcoal transition-colors hover:text-racing-red hover:underline"
                  >
                    View case study
                    <span aria-hidden className="text-racing-red">&rarr;</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="contact"
        className="mx-auto w-full max-w-5xl scroll-mt-24 px-6 pb-24"
      >
        <div className="flex flex-col items-start gap-4 rounded-2xl bg-navy p-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <RacingStripes dark className="mb-3" />
            <h2 className="text-xl font-semibold text-white">Get in touch</h2>
            <p className="mt-1 text-white/70">
              Questions, opportunities, or a dataset worth talking about — send
              me a message.
            </p>
          </div>
          <Link
            href="/contact-me-server-form"
            className="inline-flex h-11 shrink-0 items-center rounded-full bg-racing-orange px-6 text-sm font-semibold text-charcoal transition-colors hover:bg-white"
          >
            Open the contact form
          </Link>
        </div>
      </section>
    </>
  );
}

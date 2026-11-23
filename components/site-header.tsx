import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-white/85 backdrop-blur">
      <div
        aria-hidden
        className="h-1 w-full bg-gradient-to-r from-racing-orange via-racing-red to-navy"
      />
      <div className="mx-auto flex min-h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <Link
          href="/"
          className="text-sm font-bold uppercase tracking-widest text-charcoal transition-colors hover:text-racing-red"
        >
          Yanjun He
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-x-3.5 gap-y-1 text-xs text-zinc-600 sm:gap-x-6 sm:text-sm">
          <Link
            href="/about-me"
            className="transition-colors hover:text-racing-red"
          >
            About
          </Link>
          <Link
            href="/projects"
            className="transition-colors hover:text-racing-red"
          >
            Projects
          </Link>
          <Link
            href="/blogs"
            className="transition-colors hover:text-racing-red"
          >
            Blogs
          </Link>
          <Link
            href="/contact-me-server-form"
            className="transition-colors hover:text-racing-red"
          >
            Contact
          </Link>
          <Link
            href="/contact-me"
            className="transition-colors hover:text-racing-red"
          >
            Contact (API)
          </Link>
          <Link
            href="/job-tracker"
            className="font-semibold text-racing-red transition-colors hover:text-racing-orange"
          >
            Job Tracker
          </Link>
          <Link
            href="/milestones"
            className="font-semibold text-racing-red transition-colors hover:text-racing-orange"
          >
            Milestones
          </Link>
        </nav>
      </div>
    </header>
  );
}

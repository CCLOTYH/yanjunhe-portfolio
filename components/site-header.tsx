import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-white/85 backdrop-blur">
      <div
        aria-hidden
        className="h-1 w-full bg-gradient-to-r from-racing-orange via-racing-red to-navy"
      />
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-sm font-bold uppercase tracking-widest text-charcoal transition-colors hover:text-racing-red"
        >
          Yanjun He
        </Link>
        <nav className="flex items-center gap-6 text-sm text-zinc-600">
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
            href="/contact-me-server-form"
            className="transition-colors hover:text-racing-red"
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}

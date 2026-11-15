import type { Metadata } from "next";
import Link from "next/link";
import { ContactFormFetch } from "@/components/contact-form-fetch";
import { RacingStripes } from "@/components/racing-stripes";

export const metadata: Metadata = {
  title: "Contact Me (API) — Yanjun He",
  description:
    "Send Yanjun He a message through the fetch-based contact form. Submissions are validated on the server and stored securely.",
};

export default function ContactMe() {
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
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-20">
          <p className="inline-flex w-fit items-center rounded-full bg-racing-orange px-3 py-1 text-xs font-semibold text-charcoal">
            Contact · API console
          </p>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Talk to the API.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
            This page posts your message to the contact API with{" "}
            <span className="font-mono text-white/85">fetch()</span>. Submit the
            form and the live request and response appear in the console — no
            guessing about what the server said.
          </p>
          <p className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 font-mono text-xs text-white/85">
            <span aria-hidden className="h-2 w-2 animate-pulse rounded-full bg-racing-orange" />
            POST /api/contacts
          </p>
          <RacingStripes dark className="mt-8" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <ContactFormFetch />

        <div className="mt-16 flex flex-col items-start gap-4 rounded-2xl bg-navy p-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Prefer the server-rendered form?
            </h2>
            <p className="mt-1 text-white/70">
              The classic contact form processes your message with a Server
              Action instead.
            </p>
          </div>
          <Link
            href="/contact-me-server-form"
            className="inline-flex h-11 shrink-0 items-center rounded-full bg-racing-orange px-6 text-sm font-semibold text-charcoal transition-colors hover:bg-white"
          >
            Server form
          </Link>
        </div>
      </section>
    </>
  );
}

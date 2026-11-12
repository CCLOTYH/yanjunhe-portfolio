import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { RacingStripes } from "@/components/racing-stripes";

export const metadata: Metadata = {
  title: "Contact Me — Yanjun He",
  description:
    "Send Yanjun He a message through the contact form. Submissions are validated on the server and stored securely.",
};

const howItWorks = [
  "Your message is validated on the server before anything is saved.",
  "Submissions are stored outside the public site and excluded from version control.",
  "I will follow up using the email address you provide.",
];

export default function ContactMeServerForm() {
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
            Contact
          </p>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Get in touch.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
            Have a question, an opportunity, or a dataset worth talking about?
            Send me a message — the form is processed on the server.
          </p>
          <RacingStripes dark className="mt-8" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-navy/10 bg-white p-8 lg:col-span-2">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="block h-3 w-1.5 -skew-x-12 bg-racing-red"
              />
              <h2 className="text-sm font-bold uppercase tracking-widest text-charcoal">
                Send a message
              </h2>
            </div>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
          <aside className="rounded-2xl bg-navy p-8">
            <RacingStripes dark className="mb-4" />
            <h2 className="text-lg font-semibold text-white">How it works</h2>
            <ul className="mt-4 space-y-3">
              {howItWorks.map((item) => (
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

        <div className="mt-16 flex flex-col items-start gap-4 rounded-2xl bg-navy p-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Want to know who you are writing to?
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

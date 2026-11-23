import type { Metadata } from "next";
import { ContactAdmin } from "@/components/contact-admin";
import { RacingStripes } from "@/components/racing-stripes";

export const metadata: Metadata = {
  title: "Contact Admin — Yanjun He",
  description:
    "Admin page for reviewing, editing, and deleting contact submissions through the /api/contacts CRUD API.",
  robots: { index: false, follow: false },
};

export default function ContactAdminPage() {
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
            Admin
          </p>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Contact admin.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
            Review, edit, and delete every contact submission. Both contact
            forms write to <span className="font-mono text-white/85">data/contacts.json</span>{" "}
            through the /api/contacts CRUD API — GET, POST, PATCH, and DELETE.
          </p>
          <RacingStripes dark className="mt-8" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <ContactAdmin />
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { JobTracker } from "@/components/job-tracker";
import { RacingStripes } from "@/components/racing-stripes";

export const metadata: Metadata = {
  title: "Job Application Tracker — Yanjun He",
  description:
    "Track job applications by company, title, status, and notes. Entries are saved in your browser with LocalStorage and survive a refresh.",
};

export default function JobTrackerPage() {
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
            Midterm · LocalStorage
          </p>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Job Application Tracker.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
            Keep every application in the pit wall: company, title, status, and
            notes are stored in your browser&apos;s{" "}
            <span className="font-mono text-white/85">LocalStorage</span> — no
            account needed. Refresh the page and your saved entries are still on
            the grid.
          </p>
          <p className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 font-mono text-xs text-white/85">
            <span aria-hidden className="h-2 w-2 animate-pulse rounded-full bg-racing-orange" />
            localStorage: job-tracker.applications.v1
          </p>
          <RacingStripes dark className="mt-8" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <JobTracker />
      </section>
    </>
  );
}

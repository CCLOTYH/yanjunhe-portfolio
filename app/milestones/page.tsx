import type { Metadata } from "next";
import { MilestoneManager } from "@/components/milestone-manager";
import { RacingStripes } from "@/components/racing-stripes";

export const metadata: Metadata = {
  title: "Project Milestone Manager — Yanjun He",
  description:
    "Plan, edit, and delete project milestones with due dates, priorities, and statuses. Managed through the /api/milestones API and persisted server-side.",
};

export default function MilestonesPage() {
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
            Midterm · REST API
          </p>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Project Milestone Manager.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
            Run your project like a race weekend: every milestone gets a title,
            description, due date, priority, and status. Entries are stored
            server-side in <span className="font-mono text-white/85">data/milestones.json</span>{" "}
            through a full REST API — GET, POST, PUT, PATCH, and DELETE.
          </p>
          <p className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 font-mono text-xs text-white/85">
            <span aria-hidden className="h-2 w-2 animate-pulse rounded-full bg-racing-orange" />
            /api/milestones
          </p>
          <RacingStripes dark className="mt-8" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <MilestoneManager />
      </section>
    </>
  );
}

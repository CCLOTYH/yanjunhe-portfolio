import { RacingStripes } from "@/components/racing-stripes";
import type { Milestone } from "./milestone-types";

const STATUS_PILL_CLASSES: Record<Milestone["status"], string> = {
  Planned: "bg-navy text-white",
  "In Progress": "bg-racing-orange text-charcoal",
  Blocked: "bg-racing-red text-white",
  Done: "bg-white text-charcoal border border-navy/20",
};

const PRIORITY_DOT_CLASSES: Record<Milestone["priority"], string> = {
  Low: "bg-rpm-1",
  Medium: "bg-rpm-2",
  High: "bg-rpm-4",
  Critical: "bg-rpm-5",
};

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function MilestoneList({
  milestones,
  listError,
  pending,
  onEdit,
  onDelete,
}: {
  milestones: Milestone[] | null;
  listError: string | null;
  pending: boolean;
  onEdit: (milestone: Milestone) => void;
  onDelete: (id: string) => void;
}) {
  const openCount = milestones?.filter(
    (milestone) => milestone.status !== "Done",
  ).length ?? 0;

  return (
    <div className="overflow-hidden rounded-2xl bg-navy shadow-sm">
      <div className="flex items-center gap-2 bg-white/5 px-4 py-3">
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-racing-red" />
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-racing-orange" />
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-white/40" />
        <span className="ml-2 font-mono text-xs text-white/70">
          race board — {milestones?.length ?? 0} milestone
          {milestones?.length === 1 ? "" : "s"} · {openCount} still running
        </span>
      </div>
      <div aria-live="polite" className="p-6">
        {milestones === null ? (
          <p className="font-mono text-sm text-white/60">
            {listError ?? "// Loading milestones from the server…"}
          </p>
        ) : milestones.length === 0 ? (
          <p className="font-mono text-sm text-white/60">
            {"// No milestones yet. Add one from the paddock\n// and it will persist in data/milestones.json."}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {milestones.map((milestone) => (
              <li
                key={milestone.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_PILL_CLASSES[milestone.status]}`}
                    >
                      {milestone.status}
                    </span>
                    <span
                      aria-hidden
                      className={`h-2 w-2 rounded-full ${PRIORITY_DOT_CLASSES[milestone.priority]}`}
                    />
                    <span className="font-mono text-xs text-white/70">
                      {milestone.priority} priority
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(milestone)}
                      className="rounded-full px-3 py-1 text-xs font-semibold text-white/60 transition-colors hover:bg-white hover:text-charcoal"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(milestone.id)}
                      disabled={pending}
                      className="rounded-full px-3 py-1 text-xs font-semibold text-white/60 transition-colors hover:bg-racing-red hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm font-semibold text-white">
                  {milestone.title}
                </p>
                {milestone.description && (
                  <p className="mt-2 text-sm leading-relaxed text-white/75">
                    {milestone.description}
                  </p>
                )}
                <p className="mt-2 font-mono text-xs text-white/50">
                  Due {formatDate(milestone.dueDate)} · updated{" "}
                  {new Date(milestone.updatedAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
        <RacingStripes dark className="mt-6" />
      </div>
    </div>
  );
}

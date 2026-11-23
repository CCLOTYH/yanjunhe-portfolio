"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  APPLICATION_STATUSES,
  addApplication,
  getApplicationsServerSnapshot,
  getApplicationsSnapshot,
  removeApplication,
  subscribeToApplications,
  type JobApplicationStatus,
} from "@/lib/job-tracker-storage";

const inputClasses =
  "w-full rounded-lg border border-navy/20 bg-white px-4 py-2.5 text-charcoal placeholder:text-zinc-400 focus:border-racing-orange focus:outline-none focus:ring-2 focus:ring-racing-orange/30";

const errorClasses = "text-sm font-semibold text-racing-red";

const STATUS_PILL_CLASSES: Record<JobApplicationStatus, string> = {
  Saved: "bg-navy text-white",
  Applied: "bg-racing-orange text-charcoal",
  Interview: "bg-rpm-2 text-charcoal",
  Offer: "bg-white text-charcoal border border-navy/20",
  Rejected: "bg-racing-red text-white",
};

const initialForm = {
  company: "",
  jobTitle: "",
  status: "Applied" as JobApplicationStatus,
  notes: "",
};

export function JobTracker() {
  const [form, setForm] = useState(initialForm);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const { applications, healthy: storageHealthy } = useSyncExternalStore(
    subscribeToApplications,
    getApplicationsSnapshot,
    getApplicationsServerSnapshot,
  );

  const statusCounts = useMemo(() => {
    const counts: Record<JobApplicationStatus, number> = {
      Saved: 0,
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
    };
    for (const application of applications) {
      counts[application.status] += 1;
    }
    return counts;
  }, [applications]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavedNotice(null);
    setStorageError(null);

    if (form.company.trim() === "" || form.jobTitle.trim() === "") {
      setFormError("Company name and job title are both required.");
      return;
    }
    setFormError(null);

    const result = addApplication({
      company: form.company,
      jobTitle: form.jobTitle,
      status: form.status,
      notes: form.notes,
    });

    if (!result.ok) {
      setStorageError(
        "Your browser blocked saving to LocalStorage (private mode or full storage). The entry was not saved.",
      );
      return;
    }

    setSavedNotice(`Application at ${result.application.company} saved on your device.`);
    setForm(initialForm);
  }

  function handleDelete(id: string) {
    setSavedNotice(null);
    setStorageError(null);
    if (!removeApplication(id)) {
      setStorageError(
        "Your browser blocked saving to LocalStorage, so the entry could not be removed.",
      );
    }
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm">
        <div className="flex items-center gap-2 bg-navy px-4 py-3">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-racing-red" />
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-racing-orange" />
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-white/40" />
          <span className="ml-2 font-mono text-xs text-white/70">
            pit-wall — new application
          </span>
        </div>
        <div className="p-6 sm:p-8">
          {!storageHealthy && (
            <div
              role="alert"
              className="mb-6 rounded-2xl border-l-4 border-rpm-3 bg-rpm-3/5 p-6"
            >
              <p className="text-sm font-medium text-charcoal">
                The data stored in your browser was unreadable, so the tracker
                started from an empty garage. Saved entries could not be
                recovered.
              </p>
            </div>
          )}
          {storageError && (
            <div
              role="alert"
              className="mb-6 rounded-2xl border-l-4 border-racing-red bg-racing-red/5 p-6"
            >
              <p className="text-sm font-medium text-charcoal">{storageError}</p>
            </div>
          )}
          {savedNotice && (
            <div className="mb-6 rounded-2xl bg-navy p-6" role="status">
              <p className="font-semibold text-white">Saved</p>
              <p className="mt-1 text-sm text-white/70">{savedNotice}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="job-company" className="text-sm font-semibold text-charcoal">
                Company name
              </label>
              <input
                id="job-company"
                name="company"
                type="text"
                required
                value={form.company}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, company: event.target.value }))
                }
                placeholder="Acme Racing Analytics"
                className={inputClasses}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="job-title" className="text-sm font-semibold text-charcoal">
                Job title
              </label>
              <input
                id="job-title"
                name="jobTitle"
                type="text"
                required
                value={form.jobTitle}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, jobTitle: event.target.value }))
                }
                placeholder="Junior Data Analyst"
                className={inputClasses}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="job-status" className="text-sm font-semibold text-charcoal">
                Application status
              </label>
              <select
                id="job-status"
                name="status"
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    status: event.target.value as JobApplicationStatus,
                  }))
                }
                className={inputClasses}
              >
                {APPLICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="job-notes" className="text-sm font-semibold text-charcoal">
                Notes
              </label>
              <textarea
                id="job-notes"
                name="notes"
                rows={4}
                value={form.notes}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, notes: event.target.value }))
                }
                placeholder="Referral from Maria. Hiring manager responds fast — follow up Friday."
                className={inputClasses}
              />
            </div>
            {formError && <p className={errorClasses}>{formError}</p>}
            <button
              type="submit"
              className="inline-flex h-11 w-fit items-center justify-center rounded-full bg-racing-orange px-6 text-sm font-semibold text-charcoal transition-colors hover:bg-white"
            >
              Save application
            </button>
          </form>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-navy shadow-sm">
        <div className="flex items-center gap-2 bg-white/5 px-4 py-3">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-racing-red" />
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-racing-orange" />
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-white/40" />
          <span className="ml-2 font-mono text-xs text-white/70">
            garage — {applications.length} application
            {applications.length === 1 ? "" : "s"} on this device
          </span>
        </div>
        <div aria-live="polite" className="p-6">
          <div className="flex flex-wrap gap-2">
            {APPLICATION_STATUSES.map((status) => (
              <span
                key={status}
                className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_PILL_CLASSES[status]}`}
              >
                {status} · {statusCounts[status]}
              </span>
            ))}
          </div>
          {applications.length === 0 ? (
            <p className="mt-6 font-mono text-sm text-white/60">
              {"// Empty grid. Log your first application\n// and it will appear here on every refresh."}
            </p>
          ) : (
            <ul className="mt-6 flex flex-col gap-3">
              {applications.map((application) => (
                <li
                  key={application.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_PILL_CLASSES[application.status]}`}
                    >
                      {application.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(application.id)}
                      className="rounded-full px-3 py-1 text-xs font-semibold text-white/60 transition-colors hover:bg-racing-red hover:text-white"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-white">
                    {application.jobTitle} · {application.company}
                  </p>
                  <p className="mt-1 font-mono text-xs text-white/50">
                    Saved {new Date(application.savedAt).toLocaleString()}
                  </p>
                  {application.notes && (
                    <p className="mt-2 text-sm leading-relaxed text-white/75">
                      {application.notes}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

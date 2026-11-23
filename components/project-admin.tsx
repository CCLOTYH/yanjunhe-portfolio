"use client";

import { useCallback, useEffect, useState } from "react";

import { RacingStripes } from "@/components/racing-stripes";

const inputClasses =
  "w-full rounded-lg border border-navy/20 bg-white px-4 py-2.5 text-charcoal placeholder:text-zinc-400 focus:border-racing-orange focus:outline-none focus:ring-2 focus:ring-racing-orange/30";

const errorClasses = "text-sm font-semibold text-racing-red";

type Project = {
  slug: string;
  number: string;
  category: string;
  title: string;
  description: string;
  focusAreas: string[];
  href: string;
  details: {
    background: string;
    objectives: string[];
    approach: string[];
  };
  updatedAt?: string;
};

type FieldErrors = {
  number?: string;
  category?: string;
  title?: string;
  description?: string;
  focusAreas?: string;
  background?: string;
  objectives?: string;
  approach?: string;
  details?: string;
};

type FormState = {
  number: string;
  category: string;
  title: string;
  description: string;
  focusAreas: string;
  background: string;
  objectives: string;
  approach: string;
};

const initialForm: FormState = {
  number: "",
  category: "",
  title: "",
  description: "",
  focusAreas: "",
  background: "",
  objectives: "",
  approach: "",
};

function toForm(project: Project): FormState {
  return {
    number: project.number,
    category: project.category,
    title: project.title,
    description: project.description,
    focusAreas: project.focusAreas.join(", "),
    background: project.details.background,
    objectives: project.details.objectives.join("\n"),
    approach: project.details.approach.join("\n"),
  };
}

function toPayload(form: FormState) {
  const lines = (value: string) =>
    value
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  return {
    number: form.number,
    category: form.category,
    title: form.title,
    description: form.description,
    focusAreas: form.focusAreas
      .split(",")
      .map((area) => area.trim())
      .filter((area) => area.length > 0),
    details: {
      background: form.background,
      objectives: lines(form.objectives),
      approach: lines(form.approach),
    },
  };
}

function errorFor(errors: FieldErrors, key: keyof FieldErrors) {
  return errors[key] ? (
    <p className={errorClasses}>{errors[key]}</p>
  ) : null;
}

export function ProjectAdmin() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`status ${res.status}`);
      }
      setProjects(await res.json());
      setListError(null);
    } catch {
      setProjects(null);
      setListError("Could not load projects from /api/projects.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadProjects();
    })();
  }, [loadProjects]);

  function startEdit(project: Project) {
    setEditingSlug(project.slug);
    setForm(toForm(project));
    setErrors({});
    setFormError(null);
    setNotice(null);
  }

  function cancelEdit() {
    setEditingSlug(null);
    setForm(initialForm);
    setErrors({});
    setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    setFormError(null);
    setNotice(null);

    try {
      const res = await fetch(
        editingSlug
          ? `/api/projects?slug=${encodeURIComponent(editingSlug)}`
          : "/api/projects",
        {
          method: editingSlug ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(toPayload(form)),
        },
      );
      const body = await res.json();

      if ((editingSlug ? res.status === 200 : res.status === 201) && body.ok) {
        setNotice(
          editingSlug
            ? `Project "${body.project.title}" updated. URL /projects/${body.project.slug} is unchanged.`
            : `Project "${body.project.title}" created at /projects/${body.project.slug}.`,
        );
        if (editingSlug) {
          cancelEdit();
        } else {
          setForm(initialForm);
        }
        await loadProjects();
      } else if (res.status === 422 && body.errors) {
        setErrors(body.errors);
      } else {
        setFormError(body.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setFormError(
        "The project could not be saved. Please check your connection and try again.",
      );
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(slug: string) {
    setPending(true);
    setFormError(null);
    setNotice(null);

    try {
      const res = await fetch(`/api/projects?slug=${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
      const body = await res.json();

      if (res.status === 200 && body.ok) {
        setNotice(`Project /${slug} deleted from the server.`);
        if (editingSlug === slug) {
          cancelEdit();
        }
        await loadProjects();
      } else {
        setFormError(body.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setFormError(
        "The project could not be deleted. Please check your connection and try again.",
      );
    } finally {
      setPending(false);
    }
  }

  const sortedProjects = projects ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm">
        <div className="flex items-center gap-2 bg-navy px-4 py-3">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-racing-red" />
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-racing-orange" />
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-white/40" />
          <span className="ml-2 font-mono text-xs text-white/70">
            {editingSlug
              ? `workshop — editing /${editingSlug}`
              : "workshop — new project"}
          </span>
        </div>
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-5 p-6 sm:p-8"
        >
          {notice && (
            <div className="rounded-2xl bg-navy p-6" role="status">
              <p className="font-semibold text-white">Saved server-side</p>
              <p className="mt-1 text-sm text-white/70">{notice}</p>
            </div>
          )}
          {formError && (
            <div
              role="alert"
              className="rounded-2xl border-l-4 border-racing-red bg-racing-red/5 p-6"
            >
              <p className="text-sm font-medium text-charcoal">{formError}</p>
            </div>
          )}
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="project-number" className="text-sm font-semibold text-charcoal">
                Number
              </label>
              <input
                id="project-number"
                name="number"
                type="text"
                value={form.number}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, number: event.target.value }))
                }
                placeholder="03"
                aria-invalid={errors.number ? true : undefined}
                aria-describedby={errors.number ? "project-number-error" : undefined}
                className={inputClasses}
              />
              {errorFor(errors, "number")}
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="project-category" className="text-sm font-semibold text-charcoal">
                Category
              </label>
              <input
                id="project-category"
                name="category"
                type="text"
                value={form.category}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, category: event.target.value }))
                }
                placeholder="Academic Analytics Project"
                aria-invalid={errors.category ? true : undefined}
                aria-describedby={errors.category ? "project-category-error" : undefined}
                className={inputClasses}
              />
              {errorFor(errors, "category")}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="project-title" className="text-sm font-semibold text-charcoal">
              Title
            </label>
            <input
              id="project-title"
              name="title"
              type="text"
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="New Capstone Project Title"
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={errors.title ? "project-title-error" : undefined}
              className={inputClasses}
            />
            {errorFor(errors, "title")}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="project-description" className="text-sm font-semibold text-charcoal">
              Description
            </label>
            <textarea
              id="project-description"
              name="description"
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
              aria-invalid={errors.description ? true : undefined}
              aria-describedby={errors.description ? "project-description-error" : undefined}
              className={inputClasses}
            />
            {errorFor(errors, "description")}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="project-focus" className="text-sm font-semibold text-charcoal">
              Focus areas (comma-separated)
            </label>
            <input
              id="project-focus"
              name="focusAreas"
              type="text"
              value={form.focusAreas}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, focusAreas: event.target.value }))
              }
              placeholder="Logistics, Cost Efficiency, Dashboards"
              aria-invalid={errors.focusAreas ? true : undefined}
              aria-describedby={errors.focusAreas ? "project-focus-error" : undefined}
              className={inputClasses}
            />
            {errorFor(errors, "focusAreas")}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="project-background" className="text-sm font-semibold text-charcoal">
              Background
            </label>
            <textarea
              id="project-background"
              name="background"
              rows={3}
              value={form.background}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, background: event.target.value }))
              }
              aria-invalid={errors.background ? true : undefined}
              aria-describedby={errors.background ? "project-background-error" : undefined}
              className={inputClasses}
            />
            {errorFor(errors, "background")}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="project-objectives" className="text-sm font-semibold text-charcoal">
                Objectives (one per line)
              </label>
              <textarea
                id="project-objectives"
                name="objectives"
                rows={4}
                value={form.objectives}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, objectives: event.target.value }))
                }
                aria-invalid={errors.objectives ? true : undefined}
                aria-describedby={errors.objectives ? "project-objectives-error" : undefined}
                className={inputClasses}
              />
              {errorFor(errors, "objectives")}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="project-approach" className="text-sm font-semibold text-charcoal">
                Approach (one per line)
              </label>
              <textarea
                id="project-approach"
                name="approach"
                rows={4}
                value={form.approach}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, approach: event.target.value }))
                }
                aria-invalid={errors.approach ? true : undefined}
                aria-describedby={errors.approach ? "project-approach-error" : undefined}
                className={inputClasses}
              />
              {errorFor(errors, "approach")}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-11 w-fit items-center justify-center rounded-full bg-racing-orange px-6 text-sm font-semibold text-charcoal transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-racing-orange"
            >
              {pending ? "Saving" : editingSlug ? "Save changes" : "Create project"}
            </button>
            {editingSlug && (
              <button
                type="button"
                onClick={cancelEdit}
                disabled={pending}
                className="inline-flex h-11 items-center justify-center rounded-full border border-navy/20 px-5 text-sm font-semibold text-charcoal transition-colors hover:border-racing-orange disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl bg-navy shadow-sm">
        <div className="flex items-center gap-2 bg-white/5 px-4 py-3">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-racing-red" />
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-racing-orange" />
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-white/40" />
          <span className="ml-2 font-mono text-xs text-white/70">
            garage — {sortedProjects.length} project
            {sortedProjects.length === 1 ? "" : "s"} · GET /api/projects
          </span>
        </div>
        <div aria-live="polite" className="p-6">
          {projects === null ? (
            <p className="font-mono text-sm text-white/60">
              {listError ?? "// Loading projects from the server…"}
            </p>
          ) : sortedProjects.length === 0 ? (
            <p className="font-mono text-sm text-white/60">
              {"// No projects in storage. Create one above\n// or seed data/projects.json."}
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {sortedProjects.map((project) => (
                <li
                  key={project.slug}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-lg font-bold text-racing-orange">
                        {project.number}
                      </span>
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium uppercase tracking-widest text-white/80">
                        {project.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(project)}
                        disabled={pending}
                        className="rounded-full px-3 py-1 text-xs font-semibold text-white/60 transition-colors hover:bg-white hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(project.slug)}
                        disabled={pending}
                        className="rounded-full px-3 py-1 text-xs font-semibold text-white/60 transition-colors hover:bg-racing-red hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-white">
                    {project.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">
                    {project.description}
                  </p>
                  <p className="mt-2 font-mono text-xs text-white/50">
                    /projects/{project.slug}
                    {project.updatedAt
                      ? ` · updated ${new Date(project.updatedAt).toLocaleString()}`
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <RacingStripes dark className="mt-6" />
        </div>
      </div>
    </div>
  );
}

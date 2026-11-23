import type { MilestoneFieldErrors, MilestoneFormState } from "./milestone-types";

const inputClasses =
  "w-full rounded-lg border border-navy/20 bg-white px-4 py-2.5 text-charcoal placeholder:text-zinc-400 focus:border-racing-orange focus:outline-none focus:ring-2 focus:ring-racing-orange/30";

const errorClasses = "text-sm font-semibold text-racing-red";

export function MilestoneForm({
  form,
  errors,
  pending,
  editing,
  savedNotice,
  formError,
  onFieldChange,
  onSubmit,
  onCancel,
}: {
  form: MilestoneFormState;
  errors: MilestoneFieldErrors;
  pending: boolean;
  editing: boolean;
  savedNotice: string | null;
  formError: string | null;
  onFieldChange: (field: keyof MilestoneFormState, value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm">
      <div className="flex items-center gap-2 bg-navy px-4 py-3">
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-racing-red" />
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-racing-orange" />
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-white/40" />
        <span className="ml-2 font-mono text-xs text-white/70">
          {editing ? "paddock — edit milestone" : "paddock — new milestone"}
        </span>
      </div>
      <div className="p-6 sm:p-8">
        {savedNotice && (
          <div className="mb-6 rounded-2xl bg-navy p-6" role="status">
            <p className="font-semibold text-white">Saved server-side</p>
            <p className="mt-1 text-sm text-white/70">{savedNotice}</p>
          </div>
        )}
        {formError && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border-l-4 border-racing-red bg-racing-red/5 p-6"
          >
            <p className="text-sm font-medium text-charcoal">{formError}</p>
          </div>
        )}
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="milestone-title" className="text-sm font-semibold text-charcoal">
              Title
            </label>
            <input
              id="milestone-title"
              name="title"
              type="text"
              value={form.title}
              onChange={(event) => onFieldChange("title", event.target.value)}
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={errors.title ? "milestone-title-error" : undefined}
              placeholder="Ship the analytics dashboard"
              className={inputClasses}
            />
            {errors.title && (
              <p id="milestone-title-error" className={errorClasses}>
                {errors.title}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="milestone-description" className="text-sm font-semibold text-charcoal">
              Description
            </label>
            <textarea
              id="milestone-description"
              name="description"
              rows={3}
              value={form.description}
              onChange={(event) => onFieldChange("description", event.target.value)}
              aria-invalid={errors.description ? true : undefined}
              aria-describedby={errors.description ? "milestone-description-error" : undefined}
              placeholder="What does finished look like for this milestone?"
              className={inputClasses}
            />
            {errors.description && (
              <p id="milestone-description-error" className={errorClasses}>
                {errors.description}
              </p>
            )}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="milestone-due" className="text-sm font-semibold text-charcoal">
                Due date
              </label>
              <input
                id="milestone-due"
                name="dueDate"
                type="date"
                value={form.dueDate}
                onChange={(event) => onFieldChange("dueDate", event.target.value)}
                aria-invalid={errors.dueDate ? true : undefined}
                aria-describedby={errors.dueDate ? "milestone-due-error" : undefined}
                className={inputClasses}
              />
              {errors.dueDate && (
                <p id="milestone-due-error" className={errorClasses}>
                  {errors.dueDate}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="milestone-priority" className="text-sm font-semibold text-charcoal">
                Priority
              </label>
              <select
                id="milestone-priority"
                name="priority"
                value={form.priority}
                onChange={(event) => onFieldChange("priority", event.target.value)}
                className={inputClasses}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="milestone-status" className="text-sm font-semibold text-charcoal">
              Status
            </label>
            <select
              id="milestone-status"
              name="status"
              value={form.status}
              onChange={(event) => onFieldChange("status", event.target.value)}
              className={inputClasses}
            >
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Blocked">Blocked</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-11 w-fit items-center justify-center rounded-full bg-racing-orange px-6 text-sm font-semibold text-charcoal transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-racing-orange"
            >
              {pending ? "Saving" : editing ? "Save changes" : "Add milestone"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={onCancel}
                disabled={pending}
                className="inline-flex h-11 items-center justify-center rounded-full border border-navy/20 px-5 text-sm font-semibold text-charcoal transition-colors hover:border-racing-orange disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

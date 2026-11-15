"use client";

import { useState } from "react";

const inputClasses =
  "w-full rounded-lg border border-navy/20 bg-white px-4 py-2.5 text-charcoal placeholder:text-zinc-400 focus:border-racing-orange focus:outline-none focus:ring-2 focus:ring-racing-orange/30";

const errorClasses = "text-sm font-semibold text-racing-red";

type FieldErrors = { name?: string; email?: string; message?: string };

type ApiSnapshot = {
  status: number;
  body: unknown;
  requestBody: { name: string; email: string; message: string };
  at: string;
};

const STATUS_LABELS: Record<number, string> = {
  201: "201 Created",
  400: "400 Bad Request",
  422: "422 Unprocessable Entity",
  500: "500 Internal Server Error",
};

const initialForm = { name: "", email: "", message: "" };

function JsonValue({ value }: { value: unknown }) {
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    const open = Array.isArray(value) ? "[" : "{";
    const close = Array.isArray(value) ? "]" : "}";
    if (entries.length === 0) {
      return <span className="text-white/50">{open + close}</span>;
    }
    return (
      <span>
        <span className="text-white/50">{open}</span>
        {entries.map(([key, child], index) => (
          <div key={key} className="pl-4">
            <span className="text-racing-orange">&quot;{key}&quot;</span>
            <span className="text-white/50">: </span>
            <JsonValue value={child} />
            {index < entries.length - 1 ? (
              <span className="text-white/50">,</span>
            ) : null}
          </div>
        ))}
        <span className="text-white/50">{close}</span>
      </span>
    );
  }
  if (typeof value === "string") {
    return <span className="text-white/85">&quot;{value}&quot;</span>;
  }
  return <span className="text-racing-red">{String(value)}</span>;
}

function statusPillClass(status: number | null): string {
  if (status === 201) {
    return "bg-racing-orange text-charcoal";
  }
  if (status === null) {
    return "bg-white/10 text-white/60";
  }
  return "bg-racing-red text-white";
}

export function ContactFormFetch() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [snapshot, setSnapshot] = useState<ApiSnapshot | null>(null);

  const update = (field: keyof typeof initialForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    setFormError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      setSnapshot({
        status: res.status,
        body,
        requestBody: { ...form },
        at: new Date().toLocaleTimeString(),
      });

      if (res.status === 201 && body.ok) {
        setSuccess(body.message);
        setForm(initialForm);
      } else if (res.status === 422 && body.errors) {
        setErrors(body.errors);
      } else {
        setFormError(body.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setFormError(
        "The message could not be sent. Please check your connection and try again.",
      );
    } finally {
      setPending(false);
    }
  }

  const fields = [
    { id: "fetch-name", label: "Name", key: "name" as const, type: "text", autoComplete: "name" },
    { id: "fetch-email", label: "Email", key: "email" as const, type: "email", autoComplete: "email" },
  ];

  const statusLabel = pending
    ? "···"
    : snapshot
      ? (STATUS_LABELS[snapshot.status] ?? `${snapshot.status} Response`)
      : "idle";

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm">
        <div className="flex items-center gap-2 bg-navy px-4 py-3">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-racing-red" />
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-racing-orange" />
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-white/40" />
          <span className="ml-2 font-mono text-xs text-white/70">
            contact — POST /api/contacts
          </span>
        </div>
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {success && (
              <div className="rounded-2xl bg-navy p-6" role="status">
                <p className="font-semibold text-white">Message sent</p>
                <p className="mt-1 text-sm text-white/70">{success}</p>
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
            {fields.map(({ id, label, key, type, autoComplete }) => (
              <div key={id} className="flex flex-col gap-1.5">
                <label htmlFor={id} className="text-sm font-semibold text-charcoal">
                  {label}
                </label>
                <input
                  id={id}
                  name={key}
                  type={type}
                  autoComplete={autoComplete}
                  value={form[key]}
                  onChange={(event) => update(key)(event.target.value)}
                  aria-invalid={errors[key] ? true : undefined}
                  aria-describedby={errors[key] ? `${id}-error` : undefined}
                  className={inputClasses}
                />
                {errors[key] && (
                  <p id={`${id}-error`} className={errorClasses}>
                    {errors[key]}
                  </p>
                )}
              </div>
            ))}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fetch-message" className="text-sm font-semibold text-charcoal">
                Message
              </label>
              <textarea
                id="fetch-message"
                name="message"
                rows={5}
                value={form.message}
                onChange={(event) => update("message")(event.target.value)}
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={errors.message ? "fetch-message-error" : undefined}
                className={inputClasses}
              />
              {errors.message && (
                <p id="fetch-message-error" className={errorClasses}>
                  {errors.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-11 w-fit items-center justify-center rounded-full bg-racing-orange px-6 text-sm font-semibold text-charcoal transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-racing-orange"
            >
              {pending ? "Sending" : "Send message"}
            </button>
          </form>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-navy shadow-sm">
        <div className="flex items-center gap-2 bg-white/5 px-4 py-3">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-racing-red" />
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-racing-orange" />
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-white/40" />
          <span className="ml-2 font-mono text-xs text-white/70">api-response</span>
        </div>
        <div aria-live="polite" className="p-6 font-mono text-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2">
              <span className="rounded bg-racing-orange px-2 py-0.5 text-xs font-bold text-charcoal">
                POST
              </span>
              <span className="text-white/85">/api/contacts</span>
            </p>
            <span
              data-testid="api-status"
              className={`rounded-full px-3 py-1 text-xs font-bold ${statusPillClass(pending ? null : snapshot?.status ?? null)}`}
            >
              {statusLabel}
            </span>
          </div>
          {pending ? (
            <p className="mt-4 text-white/60">Sending request…</p>
          ) : snapshot ? (
            <div className="mt-4">
              <p className="text-white/50">{"// request · "}{snapshot.at}</p>
              <div className="mt-1 leading-relaxed">
                <JsonValue value={snapshot.requestBody} />
              </div>
              <p
                className={`mt-4 font-bold ${snapshot.status === 201 ? "text-racing-orange" : "text-racing-red"}`}
              >
                → {STATUS_LABELS[snapshot.status] ?? `${snapshot.status} Response`}
              </p>
              <div className="mt-1 leading-relaxed">
                <JsonValue value={snapshot.body} />
              </div>
            </div>
          ) : (
            <pre className="mt-4 whitespace-pre-wrap text-white/60">
              {"// Submit the form to see the live\n// request and response here."}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

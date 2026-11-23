"use client";

import { useCallback, useEffect, useState } from "react";

import { RacingStripes } from "@/components/racing-stripes";

const inputClasses =
  "w-full rounded-lg border border-navy/20 bg-white px-4 py-2.5 text-charcoal placeholder:text-zinc-400 focus:border-racing-orange focus:outline-none focus:ring-2 focus:ring-racing-orange/30";

const errorClasses = "text-sm font-semibold text-racing-red";

type Contact = {
  id: string;
  name: string;
  email: string;
  message: string;
  submittedAt: string;
  updatedAt?: string;
};

type FieldErrors = { name?: string; email?: string; message?: string };

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ContactAdmin() {
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const loadContacts = useCallback(async () => {
    try {
      const res = await fetch("/api/contacts", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`status ${res.status}`);
      }
      setContacts(await res.json());
      setListError(null);
    } catch {
      setContacts(null);
      setListError("Could not load contacts from /api/contacts.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadContacts();
    })();
  }, [loadContacts]);

  function startEdit(contact: Contact) {
    setEditing(contact);
    setForm({
      name: contact.name,
      email: contact.email,
      message: contact.message,
    });
    setErrors({});
    setFormError(null);
    setNotice(null);
  }

  function cancelEdit() {
    setEditing(null);
    setForm({ name: "", email: "", message: "" });
    setErrors({});
    setFormError(null);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) {
      return;
    }
    setPending(true);
    setErrors({});
    setFormError(null);
    setNotice(null);

    try {
      const res = await fetch(
        `/api/contacts?id=${encodeURIComponent(editing.id)}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const body = await res.json();

      if (res.status === 200 && body.ok) {
        setNotice(`Message from ${body.contact.name} updated on the server.`);
        cancelEdit();
        await loadContacts();
      } else if (res.status === 422 && body.errors) {
        setErrors(body.errors);
      } else {
        setFormError(body.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setFormError(
        "The update could not be saved. Please check your connection and try again.",
      );
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(id: string) {
    setPending(true);
    setFormError(null);
    setNotice(null);

    try {
      const res = await fetch(`/api/contacts?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const body = await res.json();

      if (res.status === 200 && body.ok) {
        setNotice("Message deleted from the server.");
        if (editing?.id === id) {
          cancelEdit();
        }
        await loadContacts();
      } else {
        setFormError(body.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setFormError(
        "The message could not be deleted. Please check your connection and try again.",
      );
    } finally {
      setPending(false);
    }
  }

  const sortedContacts = contacts ?? [];

  return (
    <div className="flex flex-col gap-6">
      {editing && (
        <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm">
          <div className="flex items-center gap-2 bg-navy px-4 py-3">
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-racing-red" />
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-racing-orange" />
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-white/40" />
            <span className="ml-2 font-mono text-xs text-white/70">
              editing — {editing.id.slice(0, 8)}…
            </span>
          </div>
          <form
            onSubmit={handleSave}
            noValidate
            className="flex flex-col gap-5 p-6 sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-name" className="text-sm font-semibold text-charcoal">
                  Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? "contact-name-error" : undefined}
                  className={inputClasses}
                />
                {errors.name && (
                  <p id="contact-name-error" className={errorClasses}>
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-email" className="text-sm font-semibold text-charcoal">
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? "contact-email-error" : undefined}
                  className={inputClasses}
                />
                {errors.email && (
                  <p id="contact-email-error" className={errorClasses}>
                    {errors.email}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact-message" className="text-sm font-semibold text-charcoal">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                value={form.message}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, message: event.target.value }))
                }
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={errors.message ? "contact-message-error" : undefined}
                className={inputClasses}
              />
              {errors.message && (
                <p id="contact-message-error" className={errorClasses}>
                  {errors.message}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-11 w-fit items-center justify-center rounded-full bg-racing-orange px-6 text-sm font-semibold text-charcoal transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-racing-orange"
              >
                {pending ? "Saving" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={pending}
                className="inline-flex h-11 items-center justify-center rounded-full border border-navy/20 px-5 text-sm font-semibold text-charcoal transition-colors hover:border-racing-orange disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-navy shadow-sm">
        <div className="flex items-center gap-2 bg-white/5 px-4 py-3">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-racing-red" />
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-racing-orange" />
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-white/40" />
          <span className="ml-2 font-mono text-xs text-white/70">
            inbox — {sortedContacts.length} submission
            {sortedContacts.length === 1 ? "" : "s"} · GET /api/contacts
          </span>
        </div>
        <div aria-live="polite" className="p-6">
          {notice && (
            <div className="mb-6 rounded-2xl bg-white/10 p-6" role="status">
              <p className="text-sm font-medium text-white">{notice}</p>
            </div>
          )}
          {formError && (
            <div
              role="alert"
              className="mb-6 rounded-2xl border-l-4 border-racing-red bg-racing-red/10 p-6"
            >
              <p className="text-sm font-medium text-white">{formError}</p>
            </div>
          )}
          {contacts === null ? (
            <p className="font-mono text-sm text-white/60">
              {listError ?? "// Loading submissions from the server…"}
            </p>
          ) : sortedContacts.length === 0 ? (
            <p className="font-mono text-sm text-white/60">
              {"// Inbox is empty. Submissions from either contact\n// form will appear here with a stable id."}
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {sortedContacts.map((contact) => (
                <li
                  key={contact.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">
                      {contact.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(contact)}
                        className="rounded-full px-3 py-1 text-xs font-semibold text-white/60 transition-colors hover:bg-white hover:text-charcoal"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(contact.id)}
                        disabled={pending}
                        className="rounded-full px-3 py-1 text-xs font-semibold text-white/60 transition-colors hover:bg-racing-red hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 font-mono text-xs text-racing-orange">
                    {contact.email}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/80">
                    {contact.message}
                  </p>
                  <p className="mt-2 font-mono text-xs text-white/50">
                    Received {formatDateTime(contact.submittedAt)}
                    {contact.updatedAt
                      ? ` · edited ${formatDateTime(contact.updatedAt)}`
                      : ""}{" "}
                    · id <span className="text-white/70">{contact.id.slice(0, 8)}…</span>
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

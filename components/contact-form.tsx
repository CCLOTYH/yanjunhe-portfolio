"use client";

import { useActionState } from "react";

import {
  submitContact,
  type ContactFormState,
} from "@/app/contact-me-server-form/actions";

const initialState: ContactFormState = { status: "idle" };

const inputClasses =
  "w-full rounded-lg border border-navy/20 bg-white px-4 py-2.5 text-charcoal placeholder:text-zinc-400 focus:border-racing-orange focus:outline-none focus:ring-2 focus:ring-racing-orange/30";

const errorClasses = "text-sm font-semibold text-racing-red";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContact,
    initialState,
  );

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {state.status === "success" && state.message && (
        <div className="rounded-2xl bg-navy p-6" role="status">
          <p className="font-semibold text-white">Message sent</p>
          <p className="mt-1 text-sm text-white/70">{state.message}</p>
        </div>
      )}
      {state.errors?.form && (
        <div
          role="alert"
          className="rounded-2xl border-l-4 border-racing-red bg-racing-red/5 p-6"
        >
          <p className="text-sm font-medium text-charcoal">
            {state.errors.form}
          </p>
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-semibold text-charcoal">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          defaultValue={state.values?.name}
          aria-invalid={state.errors?.name ? true : undefined}
          aria-describedby={state.errors?.name ? "name-error" : undefined}
          className={inputClasses}
        />
        {state.errors?.name && (
          <p id="name-error" className={errorClasses}>
            {state.errors.name}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold text-charcoal">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.values?.email}
          aria-invalid={state.errors?.email ? true : undefined}
          aria-describedby={state.errors?.email ? "email-error" : undefined}
          className={inputClasses}
        />
        {state.errors?.email && (
          <p id="email-error" className={errorClasses}>
            {state.errors.email}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="message"
          className="text-sm font-semibold text-charcoal"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          defaultValue={state.values?.message}
          aria-invalid={state.errors?.message ? true : undefined}
          aria-describedby={state.errors?.message ? "message-error" : undefined}
          className={inputClasses}
        />
        {state.errors?.message && (
          <p id="message-error" className={errorClasses}>
            {state.errors.message}
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
  );
}

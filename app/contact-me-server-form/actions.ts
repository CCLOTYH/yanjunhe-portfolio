"use server";

import { saveContact } from "@/lib/contact-store";
import { validateContact } from "@/lib/contact-validation";

export type ContactFormErrors = {
  name?: string;
  email?: string;
  message?: string;
  form?: string;
};

export type ContactFormState = {
  status: "idle" | "success" | "error";
  errors?: ContactFormErrors;
  values?: { name?: string; email?: string; message?: string };
  message?: string;
};

export async function submitContact(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  };

  const result = validateContact(raw);
  if (!result.ok) {
    return {
      status: "error",
      errors: result.errors,
      values: {
        name: typeof raw.name === "string" ? raw.name : "",
        email: typeof raw.email === "string" ? raw.email : "",
        message: typeof raw.message === "string" ? raw.message : "",
      },
    };
  }

  const saved = await saveContact(result.data);
  if (!saved) {
    return {
      status: "error",
      errors: {
        form: "Sorry, your message could not be saved. Please try again in a moment.",
      },
      values: result.data,
    };
  }

  return {
    status: "success",
    message: "Thanks, your message has been sent. I will get back to you soon.",
  };
}

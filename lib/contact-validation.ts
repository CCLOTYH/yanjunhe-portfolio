export type ContactInput = {
  name: string;
  email: string;
  message: string;
};

export type ContactFieldErrors = {
  name?: string;
  email?: string;
  message?: string;
};

export type ContactValidationResult =
  | { ok: true; data: ContactInput }
  | { ok: false; errors: ContactFieldErrors };

export function validateContact(raw: {
  name: unknown;
  email: unknown;
  message: unknown;
}): ContactValidationResult {
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const email = typeof raw.email === "string" ? raw.email.trim() : "";
  const message = typeof raw.message === "string" ? raw.message.trim() : "";

  const errors: ContactFieldErrors = {};

  if (!name) {
    errors.name = "Please enter your name.";
  }

  const emailError = validateEmail(email);
  if (emailError) {
    errors.email = emailError;
  }

  if (!message) {
    errors.message = "Please enter a message.";
  }

  if (errors.name || errors.email || errors.message) {
    return { ok: false, errors };
  }
  return { ok: true, data: { name, email, message } };
}

export type ContactPatchInput = Partial<ContactInput>;

export function validateContactPatch(raw: Record<string, unknown>): {
  ok: boolean;
  data?: ContactPatchInput;
  errors?: ContactFieldErrors;
} {
  const errors: ContactFieldErrors = {};
  const data: ContactPatchInput = {};

  const keys = Object.keys(raw).filter((key) =>
    ["name", "email", "message"].includes(key),
  );

  for (const key of keys) {
    const value = typeof raw[key] === "string" ? raw[key].trim() : "";
    if (key === "name") {
      if (!value) {
        errors.name = "Please enter your name.";
      } else {
        data.name = value;
      }
    } else if (key === "email") {
      const emailError = validateEmail(value);
      if (emailError) {
        errors.email = emailError;
      } else {
        data.email = value;
      }
    } else if (key === "message") {
      if (!value) {
        errors.message = "Please enter a message.";
      } else {
        data.message = value;
      }
    }
  }

  if (errors.name || errors.email || errors.message) {
    return { ok: false, errors };
  }
  if (keys.length === 0) {
    return {
      ok: false,
      errors: {
        message:
          "Provide at least one field to update: name, email, or message.",
      },
    };
  }
  return { ok: true, data };
}

function validateEmail(email: string): string | undefined {
  if (!email) {
    return "Please enter your email address.";
  }
  if (/\s/.test(email)) {
    return "Email addresses cannot contain whitespace.";
  }
  const atCount = (email.match(/@/g) ?? []).length;
  if (atCount !== 1) {
    return "Email must contain exactly one @ symbol.";
  }
  const [local, domain] = email.split("@");
  if (!local) {
    return "Email must have a nonempty part before the @.";
  }
  if (!domain.includes(".")) {
    return "Email domain must contain a dot (e.g. name@example.com).";
  }
  const labels = domain.split(".");
  if (labels.some((label) => label.length === 0)) {
    return "Email domain labels must be nonempty (e.g. name@example.com).";
  }
  return undefined;
}

import { promises as fs } from "fs";
import path from "path";

import type { ContactInput } from "./contact-validation";

export type ContactEntry = ContactInput & {
  id: string;
  submittedAt: string;
  updatedAt?: string;
};

function dataDir(): string {
  return process.env.CONTACTS_DATA_DIR ?? path.join(process.cwd(), "data");
}

function dataFile(): string {
  return path.join(dataDir(), "contacts.json");
}

function isValidEntry(value: unknown): value is ContactEntry {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === "string" &&
    typeof entry.submittedAt === "string" &&
    typeof entry.name === "string" &&
    typeof entry.email === "string" &&
    typeof entry.message === "string"
  );
}

async function readContacts(): Promise<ContactEntry[]> {
  let raw: string;
  try {
    raw = await fs.readFile(dataFile(), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw new Error(`Contact storage is unreadable: ${String(error)}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Contact storage contains malformed JSON.");
  }

  if (!Array.isArray(parsed) || !parsed.every(isValidEntry)) {
    throw new Error("Contact storage contains invalid entries.");
  }

  return parsed;
}

let saveQueue: Promise<unknown> = Promise.resolve();

function queued<T>(operation: () => Promise<T>): Promise<T> {
  const run = saveQueue.then(operation);
  saveQueue = run.catch(() => {});
  return run;
}

async function writeContacts(contacts: ContactEntry[]): Promise<void> {
  const dir = dataDir();
  await fs.mkdir(dir, { recursive: true });
  const tempFile = path.join(
    dir,
    `.contacts-${process.pid}-${crypto.randomUUID()}.tmp`,
  );

  try {
    await fs.writeFile(
      tempFile,
      JSON.stringify(contacts, null, 2),
      "utf8",
    );
    await fs.rename(tempFile, dataFile());
  } catch (error) {
    await fs.rm(tempFile, { force: true });
    throw error;
  }
}

export async function saveContact(input: ContactInput): Promise<boolean> {
  const run = queued(async () => {
    const contacts = await readContacts();

    const entry: ContactEntry = {
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
      ...input,
    };

    await writeContacts([entry, ...contacts]);
  });

  try {
    await run;
    return true;
  } catch {
    return false;
  }
}

export async function listContacts(): Promise<ContactEntry[]> {
  const contacts = await readContacts();
  return contacts.sort((a, b) => {
    if (a.submittedAt === b.submittedAt) {
      return a.id.localeCompare(b.id);
    }
    return b.submittedAt.localeCompare(a.submittedAt);
  });
}

export async function updateContact(
  id: string,
  patch: Partial<ContactInput>,
): Promise<ContactEntry | null> {
  return queued(async () => {
    const contacts = await readContacts();
    const index = contacts.findIndex((contact) => contact.id === id);
    if (index === -1) {
      return null;
    }
    const updated: ContactEntry = {
      ...contacts[index],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    contacts[index] = updated;
    await writeContacts(contacts);
    return updated;
  });
}

export async function deleteContact(id: string): Promise<boolean> {
  return queued(async () => {
    const contacts = await readContacts();
    const remaining = contacts.filter((contact) => contact.id !== id);
    if (remaining.length === contacts.length) {
      return false;
    }
    await writeContacts(remaining);
    return true;
  });
}

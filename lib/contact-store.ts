import { promises as fs } from "fs";
import path from "path";

import type { ContactInput } from "./contact-validation";

export type ContactEntry = ContactInput & {
  id: string;
  submittedAt: string;
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

export async function saveContact(input: ContactInput): Promise<boolean> {
  const run = saveQueue.then(async () => {
    const contacts = await readContacts();

    const entry: ContactEntry = {
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
      ...input,
    };

    const dir = dataDir();
    await fs.mkdir(dir, { recursive: true });
    const tempFile = path.join(
      dir,
      `.contacts-${process.pid}-${crypto.randomUUID()}.tmp`,
    );

    try {
      await fs.writeFile(
        tempFile,
        JSON.stringify([entry, ...contacts], null, 2),
        "utf8",
      );
      await fs.rename(tempFile, dataFile());
    } catch (error) {
      await fs.rm(tempFile, { force: true });
      throw error;
    }
  });

  saveQueue = run.catch(() => {});

  try {
    await run;
    return true;
  } catch {
    return false;
  }
}

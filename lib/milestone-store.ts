import { promises as fs } from "fs";
import path from "path";

import type {
  MilestoneInput,
  MilestonePriority,
  MilestoneStatus,
} from "./milestone-validation";
import { isMilestonePriority, isMilestoneStatus } from "./milestone-validation.ts";

export type Milestone = MilestoneInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

function dataDir(): string {
  return process.env.MILESTONES_DATA_DIR ?? path.join(process.cwd(), "data");
}

function dataFile(): string {
  return path.join(dataDir(), "milestones.json");
}

function isValidMilestone(value: unknown): value is Milestone {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === "string" &&
    typeof entry.createdAt === "string" &&
    typeof entry.updatedAt === "string" &&
    typeof entry.title === "string" &&
    typeof entry.description === "string" &&
    typeof entry.dueDate === "string" &&
    isMilestonePriority(entry.priority) &&
    isMilestoneStatus(entry.status)
  );
}

async function readMilestones(): Promise<Milestone[]> {
  let raw: string;
  try {
    raw = await fs.readFile(dataFile(), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw new Error(`Milestone storage is unreadable: ${String(error)}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Milestone storage contains malformed JSON.");
  }

  if (!Array.isArray(parsed) || !parsed.every(isValidMilestone)) {
    throw new Error("Milestone storage contains invalid entries.");
  }

  return parsed;
}

function tempFileFor(): string {
  return path.join(
    dataDir(),
    `.milestones-${process.pid}-${crypto.randomUUID()}.tmp`,
  );
}

async function writeMilestones(milestones: Milestone[]): Promise<void> {
  const dir = dataDir();
  await fs.mkdir(dir, { recursive: true });
  const tempFile = tempFileFor();
  try {
    await fs.writeFile(
      tempFile,
      JSON.stringify(milestones, null, 2),
      "utf8",
    );
    await fs.rename(tempFile, dataFile());
  } catch (error) {
    await fs.rm(tempFile, { force: true });
    throw error;
  }
}

let saveQueue: Promise<unknown> = Promise.resolve();

function queued<T>(operation: () => Promise<T>): Promise<T> {
  const run = saveQueue.then(operation);
  saveQueue = run.catch(() => {});
  return run;
}

export async function listMilestones(): Promise<Milestone[]> {
  const milestones = await readMilestones();
  return milestones.sort((a, b) => {
    if (a.createdAt === b.createdAt) {
      return a.id.localeCompare(b.id);
    }
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export async function createMilestone(input: MilestoneInput): Promise<Milestone> {
  return queued(async () => {
    const milestones = await readMilestones();
    const now = new Date().toISOString();
    const milestone: Milestone = {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      ...input,
    };
    await writeMilestones([milestone, ...milestones]);
    return milestone;
  });
}

export async function updateMilestone(
  id: string,
  patch: Partial<MilestoneInput>,
): Promise<Milestone | null> {
  return queued(async () => {
    const milestones = await readMilestones();
    const index = milestones.findIndex((milestone) => milestone.id === id);
    if (index === -1) {
      return null;
    }
    const updated: Milestone = {
      ...milestones[index],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    milestones[index] = updated;
    await writeMilestones(milestones);
    return updated;
  });
}

export async function deleteMilestone(id: string): Promise<boolean> {
  return queued(async () => {
    const milestones = await readMilestones();
    const remaining = milestones.filter((milestone) => milestone.id !== id);
    if (remaining.length === milestones.length) {
      return false;
    }
    await writeMilestones(remaining);
    return true;
  });
}

export type MilestonePriorityValue = MilestonePriority;
export type MilestoneStatusValue = MilestoneStatus;

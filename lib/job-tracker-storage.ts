export type JobApplicationStatus =
  | "Saved"
  | "Applied"
  | "Interview"
  | "Offer"
  | "Rejected";

export const APPLICATION_STATUSES: readonly JobApplicationStatus[] = [
  "Saved",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
];

export type JobApplication = {
  id: string;
  company: string;
  jobTitle: string;
  status: JobApplicationStatus;
  notes: string;
  savedAt: string;
};

export const STORAGE_KEY = "job-tracker.applications.v1";

export type LoadApplicationsResult = {
  applications: JobApplication[];
  healthy: boolean;
};

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

function getBrowserStorage(): StorageLike | null {
  try {
    if (typeof window === "undefined") {
      return null;
    }
    const storage = window.localStorage;
    const probe = "job-tracker:probe";
    storage.setItem(probe, probe);
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

function isStatus(value: unknown): value is JobApplicationStatus {
  return APPLICATION_STATUSES.includes(value as JobApplicationStatus);
}

function sanitizeApplication(value: unknown): JobApplication | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.id !== "string" ||
    record.id.length === 0 ||
    typeof record.company !== "string" ||
    record.company.length === 0 ||
    typeof record.jobTitle !== "string" ||
    record.jobTitle.length === 0
  ) {
    return null;
  }
  const savedAt =
    typeof record.savedAt === "string" && !Number.isNaN(Date.parse(record.savedAt))
      ? record.savedAt
      : new Date(0).toISOString();
  return {
    id: record.id,
    company: record.company,
    jobTitle: record.jobTitle,
    status: isStatus(record.status) ? record.status : "Saved",
    notes: typeof record.notes === "string" ? record.notes : "",
    savedAt,
  };
}

export function loadApplications(
  storage: StorageLike | null = getBrowserStorage(),
): LoadApplicationsResult {
  if (!storage) {
    return { applications: [], healthy: false };
  }
  let raw: string | null = null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { applications: [], healthy: false };
  }
  if (raw === null || raw.trim() === "") {
    return { applications: [], healthy: true };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { applications: [], healthy: false };
  }
  if (!Array.isArray(parsed)) {
    return { applications: [], healthy: false };
  }
  const applications: JobApplication[] = [];
  let healthy = true;
  for (const entry of parsed) {
    const sanitized = sanitizeApplication(entry);
    if (sanitized === null) {
      healthy = false;
      continue;
    }
    applications.push(sanitized);
  }
  return { applications, healthy };
}

function createId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    return "";
  }
  return `app-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function buildApplication(input: {
  company: string;
  jobTitle: string;
  status: JobApplicationStatus;
  notes: string;
}): JobApplication {
  return {
    id: createId() || `app-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    company: input.company.trim(),
    jobTitle: input.jobTitle.trim(),
    status: input.status,
    notes: input.notes.trim(),
    savedAt: new Date().toISOString(),
  };
}

export function persistApplications(
  applications: JobApplication[],
  storage: StorageLike | null = getBrowserStorage(),
): boolean {
  if (!storage) {
    return false;
  }
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(applications));
    return true;
  } catch {
    return false;
  }
}

const emptySnapshot: LoadApplicationsResult = {
  applications: [],
  healthy: true,
};

let cache: LoadApplicationsResult | null = null;
const listeners = new Set<() => void>();

function readSnapshot(): LoadApplicationsResult {
  if (cache === null) {
    const result = loadApplications();
    result.applications.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
    cache = result;
  }
  return cache;
}

export function getApplicationsSnapshot(): LoadApplicationsResult {
  if (typeof window === "undefined") {
    return emptySnapshot;
  }
  return readSnapshot();
}

export function getApplicationsServerSnapshot(): LoadApplicationsResult {
  return emptySnapshot;
}

export function subscribeToApplications(listener: () => void): () => void {
  listeners.add(listener);
  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STORAGE_KEY) {
      cache = null;
      listener();
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

export function addApplication(input: {
  company: string;
  jobTitle: string;
  status: JobApplicationStatus;
  notes: string;
}): { ok: boolean; application: JobApplication } {
  const application = buildApplication(input);
  const current = readSnapshot().applications;
  if (!persistApplications([application, ...current])) {
    return { ok: false, application };
  }
  cache = null;
  for (const listener of listeners) {
    listener();
  }
  return { ok: true, application };
}

export function removeApplication(id: string): boolean {
  const next = readSnapshot().applications.filter(
    (application) => application.id !== id,
  );
  if (!persistApplications(next)) {
    return false;
  }
  cache = null;
  for (const listener of listeners) {
    listener();
  }
  return true;
}

export function resetApplicationsCache(): void {
  cache = null;
}

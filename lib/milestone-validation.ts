export const MILESTONE_PRIORITIES = [
  "Low",
  "Medium",
  "High",
  "Critical",
] as const;

export const MILESTONE_STATUSES = [
  "Planned",
  "In Progress",
  "Blocked",
  "Done",
] as const;

export type MilestonePriority = (typeof MILESTONE_PRIORITIES)[number];
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];

export type MilestoneInput = {
  title: string;
  description: string;
  dueDate: string;
  priority: MilestonePriority;
  status: MilestoneStatus;
};

export type MilestoneFieldErrors = {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  status?: string;
};

export type MilestoneValidationResult =
  | { ok: true; data: MilestoneInput }
  | { ok: false; errors: MilestoneFieldErrors };

export function isMilestonePriority(value: unknown): value is MilestonePriority {
  return MILESTONE_PRIORITIES.includes(value as MilestonePriority);
}

export function isMilestoneStatus(value: unknown): value is MilestoneStatus {
  return MILESTONE_STATUSES.includes(value as MilestoneStatus);
}

function validateDueDate(value: string): string | undefined {
  if (!value) {
    return "Please choose a due date.";
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "Due date must use the YYYY-MM-DD format.";
  }
  if (Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
    return "Due date must be a real calendar date.";
  }
  return undefined;
}

function validateSingleField(
  field: string,
  value: unknown,
): { field: string; error: string } | null {
  switch (field) {
    case "title": {
      const title = typeof value === "string" ? value.trim() : "";
      return title ? null : { field, error: "Please enter a milestone title." };
    }
    case "description": {
      return typeof value === "string"
        ? null
        : { field, error: "Description must be text." };
    }
    case "dueDate": {
      const dueDate = typeof value === "string" ? value.trim() : "";
      const error = validateDueDate(dueDate);
      return error ? { field, error } : null;
    }
    case "priority": {
      return isMilestonePriority(value)
        ? null
        : { field, error: "Priority must be Low, Medium, High, or Critical." };
    }
    case "status": {
      return isMilestoneStatus(value)
        ? null
        : {
            field,
            error: "Status must be Planned, In Progress, Blocked, or Done.",
          };
    }
    default:
      return null;
  }
}

export function validateMilestone(raw: {
  title: unknown;
  description: unknown;
  dueDate: unknown;
  priority: unknown;
  status: unknown;
}): MilestoneValidationResult {
  const errors: MilestoneFieldErrors = {};
  const checks: Array<[keyof MilestoneInput, unknown]> = [
    ["title", raw.title],
    ["description", raw.description],
    ["dueDate", raw.dueDate],
    ["priority", raw.priority],
    ["status", raw.status],
  ];

  for (const [field, value] of checks) {
    const problem = validateSingleField(field, value);
    if (problem) {
      errors[field] = problem.error;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      title: (raw.title as string).trim(),
      description: (raw.description as string).trim(),
      dueDate: (raw.dueDate as string).trim(),
      priority: raw.priority as MilestonePriority,
      status: raw.status as MilestoneStatus,
    },
  };
}

export function validateMilestonePatch(raw: Record<string, unknown>): {
  ok: boolean;
  data?: Partial<MilestoneInput>;
  errors?: MilestoneFieldErrors;
} {
  const errors: MilestoneFieldErrors = {};
  const data: Partial<MilestoneInput> = {};

  for (const field of Object.keys(raw)) {
    if (
      field !== "title" &&
      field !== "description" &&
      field !== "dueDate" &&
      field !== "priority" &&
      field !== "status"
    ) {
      continue;
    }
    const problem = validateSingleField(field, raw[field]);
    if (problem) {
      errors[field] = problem.error;
      continue;
    }
    if (field === "title") {
      data.title = (raw[field] as string).trim();
    } else if (field === "description") {
      data.description = (raw[field] as string).trim();
    } else if (field === "dueDate") {
      data.dueDate = (raw[field] as string).trim();
    } else if (field === "priority") {
      data.priority = raw[field] as MilestonePriority;
    } else if (field === "status") {
      data.status = raw[field] as MilestoneStatus;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  if (Object.keys(data).length === 0) {
    return {
      ok: false,
      errors: {
        description:
          "Provide at least one field to update: title, description, dueDate, priority, or status.",
      },
    };
  }
  return { ok: true, data };
}

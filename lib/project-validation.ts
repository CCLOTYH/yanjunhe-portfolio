import type { Project, ProjectDetails } from "./projects";

export type ProjectInput = Omit<Project, "slug" | "href" | "updatedAt">;

export type ProjectDetailsInput = ProjectDetails;

export type ProjectFieldErrors = {
  number?: string;
  category?: string;
  title?: string;
  description?: string;
  focusAreas?: string;
  background?: string;
  objectives?: string;
  approach?: string;
  details?: string;
};

export type ProjectValidationResult =
  | { ok: true; data: ProjectInput }
  | { ok: false; errors: ProjectFieldErrors };

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function cleanStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }
  const items: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") {
      return null;
    }
    const trimmed = item.trim();
    if (!trimmed) {
      return null;
    }
    items.push(trimmed);
  }
  return items;
}

function validateDetails(
  raw: unknown,
  errors: ProjectFieldErrors,
): ProjectDetailsInput | null {
  if (typeof raw !== "object" || raw === null) {
    errors.details = "Project details are required.";
    return null;
  }
  const record = raw as Record<string, unknown>;

  const background = cleanString(record.background);
  const objectives = cleanStringArray(record.objectives);
  const approach = cleanStringArray(record.approach);

  if (!background) {
    errors.background = "Please enter the project background.";
  }
  if (objectives === null) {
    errors.objectives = "Objectives must be a nonempty list of nonempty strings.";
  }
  if (approach === null) {
    errors.approach = "Approach steps must be a nonempty list of nonempty strings.";
  }

  if (errors.background || errors.objectives || errors.approach || errors.details) {
    return null;
  }
  return {
    background,
    objectives: objectives as string[],
    approach: approach as string[],
  };
}

export function validateProject(raw: Record<string, unknown>): ProjectValidationResult {
  const errors: ProjectFieldErrors = {};

  const number = cleanString(raw.number);
  const category = cleanString(raw.category);
  const title = cleanString(raw.title);
  const description = cleanString(raw.description);
  const focusAreas = cleanStringArray(raw.focusAreas);
  const details = validateDetails(raw.details, errors);

  if (!number) {
    errors.number = "Please enter a project number.";
  }
  if (!category) {
    errors.category = "Please enter a category.";
  }
  if (!title) {
    errors.title = "Please enter a project title.";
  }
  if (!description) {
    errors.description = "Please enter a description.";
  }
  if (focusAreas === null) {
    errors.focusAreas = "Focus areas must be a nonempty list of nonempty strings.";
  }

  if (
    errors.number ||
    errors.category ||
    errors.title ||
    errors.description ||
    errors.focusAreas ||
    errors.background ||
    errors.objectives ||
    errors.approach ||
    errors.details
  ) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      number,
      category,
      title,
      description,
      focusAreas: focusAreas as string[],
      details: details as ProjectDetailsInput,
    },
  };
}

export type ProjectPatchInput = Partial<Omit<ProjectInput, "details">> & {
  details?: Partial<ProjectDetailsInput>;
};

export function validateProjectPatch(raw: Record<string, unknown>): {
  ok: boolean;
  data?: ProjectPatchInput;
  errors?: ProjectFieldErrors;
} {
  const errors: ProjectFieldErrors = {};
  const data: ProjectPatchInput = {};
  let touched = false;

  if ("number" in raw) {
    const number = cleanString(raw.number);
    if (!number) {
      errors.number = "Please enter a project number.";
    } else {
      data.number = number;
      touched = true;
    }
  }
  if ("category" in raw) {
    const category = cleanString(raw.category);
    if (!category) {
      errors.category = "Please enter a category.";
    } else {
      data.category = category;
      touched = true;
    }
  }
  if ("title" in raw) {
    const title = cleanString(raw.title);
    if (!title) {
      errors.title = "Please enter a project title.";
    } else {
      data.title = title;
      touched = true;
    }
  }
  if ("description" in raw) {
    const description = cleanString(raw.description);
    if (!description) {
      errors.description = "Please enter a description.";
    } else {
      data.description = description;
      touched = true;
    }
  }
  if ("focusAreas" in raw) {
    const focusAreas = cleanStringArray(raw.focusAreas);
    if (focusAreas === null) {
      errors.focusAreas = "Focus areas must be a nonempty list of nonempty strings.";
    } else {
      data.focusAreas = focusAreas;
      touched = true;
    }
  }
  if ("details" in raw) {
    const record = (raw.details ?? {}) as Record<string, unknown>;
    const details: Partial<ProjectDetailsInput> = {};
    let detailsTouched = false;

    if ("background" in record) {
      const background = cleanString(record.background);
      if (!background) {
        errors.background = "Please enter the project background.";
      } else {
        details.background = background;
        detailsTouched = true;
      }
    }
    if ("objectives" in record) {
      const objectives = cleanStringArray(record.objectives);
      if (objectives === null) {
        errors.objectives = "Objectives must be a nonempty list of nonempty strings.";
      } else {
        details.objectives = objectives;
        detailsTouched = true;
      }
    }
    if ("approach" in record) {
      const approach = cleanStringArray(record.approach);
      if (approach === null) {
        errors.approach = "Approach steps must be a nonempty list of nonempty strings.";
      } else {
        details.approach = approach;
        detailsTouched = true;
      }
    }
    if (detailsTouched) {
      data.details = details;
      touched = true;
    }
  }

  if (
    errors.number ||
    errors.category ||
    errors.title ||
    errors.description ||
    errors.focusAreas ||
    errors.background ||
    errors.objectives ||
    errors.approach
  ) {
    return { ok: false, errors };
  }
  if (!touched) {
    return {
      ok: false,
      errors: {
        details:
          "Provide at least one field to update: number, category, title, description, focusAreas, or details.",
      },
    };
  }
  return { ok: true, data };
}

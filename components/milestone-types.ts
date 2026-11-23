export type Milestone = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Planned" | "In Progress" | "Blocked" | "Done";
  createdAt: string;
  updatedAt: string;
};

export type MilestoneFormState = {
  title: string;
  description: string;
  dueDate: string;
  priority: Milestone["priority"];
  status: Milestone["status"];
};

export type MilestoneFieldErrors = {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  status?: string;
};

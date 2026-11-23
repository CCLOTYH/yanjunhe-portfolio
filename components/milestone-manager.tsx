"use client";

import { useCallback, useEffect, useState } from "react";

import { MilestoneForm } from "@/components/milestone-form";
import { MilestoneList } from "@/components/milestone-list";
import type {
  Milestone,
  MilestoneFieldErrors,
  MilestoneFormState,
} from "@/components/milestone-types";

const initialForm: MilestoneFormState = {
  title: "",
  description: "",
  dueDate: "",
  priority: "Medium",
  status: "Planned",
};

export function MilestoneManager() {
  const [form, setForm] = useState<MilestoneFormState>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<MilestoneFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const loadMilestones = useCallback(async () => {
    try {
      const res = await fetch("/api/milestones", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`status ${res.status}`);
      }
      setMilestones(await res.json());
      setListError(null);
    } catch {
      setMilestones(null);
      setListError("Could not load milestones from /api/milestones.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadMilestones();
    })();
  }, [loadMilestones]);

  function startEdit(milestone: Milestone) {
    setEditingId(milestone.id);
    setForm({
      title: milestone.title,
      description: milestone.description,
      dueDate: milestone.dueDate,
      priority: milestone.priority,
      status: milestone.status,
    });
    setErrors({});
    setFormError(null);
    setSavedNotice(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(initialForm);
    setErrors({});
    setFormError(null);
  }

  function handleFieldChange(field: keyof MilestoneFormState, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    setFormError(null);
    setSavedNotice(null);

    try {
      const res = await fetch(
        editingId ? `/api/milestones?id=${encodeURIComponent(editingId)}` : "/api/milestones",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const body = await res.json();

      if ((editingId ? res.status === 200 : res.status === 201) && body.ok) {
        setSavedNotice(
          editingId
            ? `Milestone "${body.milestone.title}" updated on the server.`
            : `Milestone "${body.milestone.title}" saved on the server.`,
        );
        setForm(initialForm);
        setEditingId(null);
        await loadMilestones();
      } else if (res.status === 422 && body.errors) {
        setErrors(body.errors);
      } else {
        setFormError(body.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setFormError(
        "The milestone could not be saved. Please check your connection and try again.",
      );
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(id: string) {
    setPending(true);
    setFormError(null);
    setSavedNotice(null);

    try {
      const res = await fetch(`/api/milestones?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const body = await res.json();

      if (res.status === 200 && body.ok) {
        setSavedNotice("Milestone deleted from the server.");
        if (editingId === id) {
          cancelEdit();
        }
        await loadMilestones();
      } else {
        setFormError(body.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setFormError(
        "The milestone could not be deleted. Please check your connection and try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <MilestoneForm
        form={form}
        errors={errors}
        pending={pending}
        editing={Boolean(editingId)}
        savedNotice={savedNotice}
        formError={formError}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
        onCancel={cancelEdit}
      />
      <MilestoneList
        milestones={milestones}
        listError={listError}
        pending={pending}
        onEdit={startEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

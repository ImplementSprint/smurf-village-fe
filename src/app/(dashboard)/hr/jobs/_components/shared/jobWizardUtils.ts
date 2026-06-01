import { authFetch, listSfiaSkills, suggestJobSfiaSkills, updateJobSfiaSkills, type SfiaSkill } from "@/lib/authApi";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "sonner";
import type { DepartmentOption, JobFormState, JobQuestion } from "./jobWizardTypes";

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await authFetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string })?.message || "Request failed");
  return data as T;
}

export async function loadDepartments(setDepartments: (departments: DepartmentOption[]) => void) {
  try {
    setDepartments(await apiFetch<DepartmentOption[]>("/users/departments"));
  } catch {
    // Keep the form usable even if the department list fails to load.
  }
}

export async function loadMasterSkills(setMasterSkills: (skills: SfiaSkill[]) => void) {
  try {
    setMasterSkills(await listSfiaSkills());
  } catch {
    // The SFIA step still works without suggestions.
  }
}

export function filterSfiaSkills(masterSkills: SfiaSkill[], search: string) {
  const normalized = search.toLowerCase();
  return masterSkills.filter(
    (skill) => skill.skill.toLowerCase().includes(normalized) || (skill.category ?? "").toLowerCase().includes(normalized),
  );
}

export function toggleSfiaSkill(prev: Map<string, number>, skillId: string) {
  const next = new Map(prev);
  if (next.has(skillId)) next.delete(skillId);
  else next.set(skillId, 3);
  return next;
}

export function setSfiaLevel(prev: Map<string, number>, skillId: string, level: number) {
  const next = new Map(prev);
  next.set(skillId, level);
  return next;
}

export function normalizeQuestions(questions: JobQuestion[]) {
  return questions
    .filter((question) => question.question_text.trim())
    .map((question, index) => ({
      question_text: question.question_text.trim(),
      question_type: question.question_type,
      options: question.question_type !== "text" && question.options.length ? question.options.filter(Boolean) : undefined,
      is_required: question.is_required,
      sort_order: index,
    }));
}

export function buildCreateJobPayload(form: JobFormState, asDraft: boolean) {
  const payload: Record<string, string> = {
    title: form.title,
    description: form.description,
    status: asDraft ? "draft" : "open",
  };

  if (form.location.trim()) payload.location = form.location.trim();
  if (form.employment_type) payload.employment_type = form.employment_type;
  if (form.salary_range.trim()) payload.salary_range = form.salary_range.trim();
  if (form.closes_at) payload.closes_at = new Date(form.closes_at).toISOString();
  if (form.department_id) payload.department_id = form.department_id;

  return payload;
}

export function buildEditJobPayload(form: JobFormState & { status: "open" | "closed" | "draft" }) {
  return {
    title: form.title,
    description: form.description,
    location: form.location.trim() || null,
    employment_type: form.employment_type || null,
    salary_range: form.salary_range.trim() || null,
    closes_at: form.closes_at ? new Date(form.closes_at).toISOString() : null,
    department_id: form.department_id || null,
    status: form.status,
  };
}

export async function suggestSkills(jobPostingId: string, setSelected: (updater: (prev: Map<string, number>) => Map<string, number>) => void) {
  const suggestions = await suggestJobSfiaSkills(jobPostingId);
  if (suggestions.length === 0) {
    toast.info("No skill matches found in job description.");
    return 0;
  }
  setSelected((prev) => {
    const next = new Map(prev);
    for (const suggestion of suggestions) {
      if (!next.has(suggestion.skill_id)) next.set(suggestion.skill_id, suggestion.suggested_level);
    }
    return next;
  });
  return suggestions.length;
}

export async function saveSfiaSkills(jobPostingId: string, selected: Map<string, number>) {
  const skills = Array.from(selected.entries()).map(([skill_id, required_level]) => ({ skill_id, required_level }));
  await updateJobSfiaSkills(jobPostingId, skills);
}

"use client";

import type { SyntheticEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getJobSfiaSkills, listSfiaSkills, type SfiaSkill } from "@/lib/authApi";
import { apiFetch, buildEditJobPayload, filterSfiaSkills, loadDepartments, normalizeQuestions, saveSfiaSkills, setSfiaLevel, suggestSkills, toggleSfiaSkill } from "../shared/jobWizardUtils";
import type { JobFormState, JobQuestion } from "../shared/jobWizardTypes";

export interface EditJobPosting {
  job_posting_id: string;
  title: string;
  description: string;
  location: string | null;
  employment_type: string | null;
  salary_range: string | null;
  status: "open" | "closed" | "draft";
  posted_at: string;
  closes_at: string | null;
  department_id: string | null;
  applicant_count?: number;
}

interface StoredQuestion {
  question_id: string;
  question_text: string;
  question_type: "text" | "multiple_choice" | "checkbox";
  options: string[] | null;
  is_required: boolean;
}

export function useEditJobWizard({
  job,
  onSave,
}: Readonly<{
  job: EditJobPosting;
  onSave: (updated: EditJobPosting) => void;
}>) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saving, setSaving] = useState(false);
  const [savingQuestions, setSavingQuestions] = useState(false);
  const [savingSfia, setSavingSfia] = useState(false);
  const [suggestingSfia, setSuggestingSfia] = useState(false);
  const [departments, setDepartments] = useState<{ department_id: string; department_name: string }[]>([]);

  const [savedJob, setSavedJob] = useState<EditJobPosting>(job);
  const [form, setForm] = useState<JobFormState & { status: "open" | "closed" | "draft" }>({
    title: job.title,
    description: job.description,
    location: job.location ?? "",
    employment_type: job.employment_type ?? "",
    salary_range: job.salary_range ?? "",
    closes_at: job.closes_at ? job.closes_at.slice(0, 10) : "",
    department_id: job.department_id ?? "",
    status: job.status,
  });

  const [questions, setQuestions] = useState<JobQuestion[]>([]);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  const [masterSkills, setMasterSkills] = useState<SfiaSkill[]>([]);
  const [sfiaSelected, setSfiaSelected] = useState<Map<string, number>>(new Map());
  const [sfiaSearch, setSfiaSearch] = useState("");
  const [sfiaLoading, setSfiaLoading] = useState(false);
  const [sfiaLoaded, setSfiaLoaded] = useState(false);

  useEffect(() => {
    void loadDepartments(setDepartments);
  }, []);

  useEffect(() => {
    if (step !== 2 || questionsLoaded) return;
    setQuestionsLoading(true);
    apiFetch<StoredQuestion[]>(`/jobs/${job.job_posting_id}/questions`)
      .then((existing) =>
        setQuestions(
          existing.map((question) => ({
            id: question.question_id,
            question_text: question.question_text,
            question_type: question.question_type,
            options: question.options?.length ? question.options : [""],
            is_required: question.is_required,
          })),
        ),
      )
      .catch(() => toast.error("Failed to load questions"))
      .finally(() => {
        setQuestionsLoading(false);
        setQuestionsLoaded(true);
      });
  }, [step, questionsLoaded, job.job_posting_id]);

  useEffect(() => {
    if (step !== 3 || sfiaLoaded) return;
    setSfiaLoading(true);
    Promise.all([listSfiaSkills(), getJobSfiaSkills(job.job_posting_id)])
      .then(([master, current]) => {
        setMasterSkills(master);
        const map = new Map<string, number>();
        for (const skill of current) map.set(skill.skill_id, skill.required_level);
        setSfiaSelected(map);
      })
      .catch(() => {})
      .finally(() => {
        setSfiaLoading(false);
        setSfiaLoaded(true);
      });
  }, [step, sfiaLoaded, job.job_posting_id]);

  const handleSaveDetails = async (e?: SyntheticEvent, andClose = false) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const updated = await apiFetch<EditJobPosting>(`/jobs/${job.job_posting_id}`, {
        method: "PATCH",
        body: JSON.stringify(buildEditJobPayload(form)),
      });
      setSavedJob(updated);
      if (andClose) {
        toast.success("Job posting updated!");
        onSave(updated);
      } else {
        setStep(2);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update job posting";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveQuestions = async () => {
    setSavingQuestions(true);
    try {
      await apiFetch(`/jobs/${job.job_posting_id}/questions`, {
        method: "PUT",
        body: JSON.stringify({ questions: normalizeQuestions(questions) }),
      });
      setStep(3);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save questions";
      toast.error(message);
    } finally {
      setSavingQuestions(false);
    }
  };

  const handleSuggestSfia = async () => {
    setSuggestingSfia(true);
    try {
      const count = await suggestSkills(job.job_posting_id, setSfiaSelected);
      if (count > 0) {
        toast.success(`${count} skill${count !== 1 ? "s" : ""} suggested from job description.`);
      }
    } catch {
      toast.error("Failed to fetch suggestions.");
    } finally {
      setSuggestingSfia(false);
    }
  };

  const handleSaveSfia = async () => {
    setSavingSfia(true);
    try {
      await saveSfiaSkills(job.job_posting_id, sfiaSelected);
      toast.success("Job posting updated!");
      onSave(savedJob);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save SFIA skills";
      toast.error(message);
    } finally {
      setSavingSfia(false);
    }
  };

  const handleSkipSfia = () => {
    toast.success("Job posting updated!");
    onSave(savedJob);
  };

  const toggleSfiaSkillSelection = (skillId: string) => {
    setSfiaSelected((prev) => toggleSfiaSkill(prev, skillId));
  };

  const setSfiaLevelSelection = (skillId: string, level: number) => {
    setSfiaSelected((prev) => setSfiaLevel(prev, skillId, level));
  };

  const sfiaFiltered = useMemo(() => filterSfiaSkills(masterSkills, sfiaSearch), [masterSkills, sfiaSearch]);

  return {
    step,
    setStep,
    saving,
    savingQuestions,
    savingSfia,
    suggestingSfia,
    departments,
    form,
    setForm,
    questions,
    setQuestions,
    questionsLoading,
    sfiaSearch,
    setSfiaSearch,
    sfiaLoading,
    sfiaSelected,
    sfiaFiltered,
    handleSaveDetails,
    handleSaveQuestions,
    handleSuggestSfia,
    handleSaveSfia,
    handleSkipSfia,
    toggleSfiaSkill: toggleSfiaSkillSelection,
    setSfiaLevel: setSfiaLevelSelection,
  };
}

"use client";

import type { SyntheticEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiFetch, buildCreateJobPayload, filterSfiaSkills, loadDepartments, loadMasterSkills, normalizeQuestions, saveSfiaSkills, setSfiaLevel, suggestSkills, toggleSfiaSkill } from "../shared/jobWizardUtils";
import type { JobFormState, JobQuestion } from "../shared/jobWizardTypes";
import type { SfiaSkill } from "@/lib/authApi";

export interface CreateJobPosting {
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

export function useCreateJobWizard(onCreate: (job: CreateJobPosting) => void) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [createdJob, setCreatedJob] = useState<CreateJobPosting | null>(null);
  const [questions, setQuestions] = useState<JobQuestion[]>([]);
  const [saving, setSaving] = useState(false);
  const [savingQuestions, setSavingQuestions] = useState(false);
  const [departments, setDepartments] = useState<{ department_id: string; department_name: string }[]>([]);
  const [masterSkills, setMasterSkills] = useState<SfiaSkill[]>([]);
  const [sfiaSelected, setSfiaSelected] = useState<Map<string, number>>(new Map());
  const [sfiaSearch, setSfiaSearch] = useState("");
  const [savingSfia, setSavingSfia] = useState(false);
  const [sfiaLoading, setSfiaLoading] = useState(false);
  const [suggestingSfia, setSuggestingSfia] = useState(false);

  const [form, setForm] = useState<JobFormState>({
    title: "",
    description: "",
    location: "",
    employment_type: "",
    salary_range: "",
    closes_at: "",
    department_id: "",
  });

  useEffect(() => {
    void loadDepartments(setDepartments);
  }, []);

  const goToSfiaStep = () => {
    setSfiaLoading(true);
    void loadMasterSkills(setMasterSkills).finally(() => {
      setSfiaLoading(false);
    });
    setStep(3);
  };

  const handleCreatePosting = async (e: SyntheticEvent<HTMLFormElement>, asDraft = false) => {
    e.preventDefault();
    setSaving(true);
    try {
      const job = await apiFetch<CreateJobPosting>("/jobs", {
        method: "POST",
        body: JSON.stringify(buildCreateJobPayload(form, asDraft)),
      });
      setCreatedJob(job);
      if (asDraft) {
        toast.success("Job saved as draft.");
        onCreate(job);
      } else {
        setStep(2);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create job posting";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveQuestions = async () => {
    if (!createdJob) return;
    setSavingQuestions(true);
    try {
      await apiFetch(`/jobs/${createdJob.job_posting_id}/questions`, {
        method: "PUT",
        body: JSON.stringify({ questions: normalizeQuestions(questions) }),
      });
      goToSfiaStep();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save questions";
      toast.error(message);
    } finally {
      setSavingQuestions(false);
    }
  };

  const handleSkipQuestions = () => {
    if (!createdJob) return;
    goToSfiaStep();
  };

  const handleSuggestSfia = async () => {
    if (!createdJob) return;
    setSuggestingSfia(true);
    try {
      const count = await suggestSkills(createdJob.job_posting_id, setSfiaSelected);
      if (count === 0) return;
      toast.success(`${count} skill${count !== 1 ? "s" : ""} suggested from job description.`);
    } catch {
      toast.error("Failed to fetch suggestions.");
    } finally {
      setSuggestingSfia(false);
    }
  };

  const sfiaFiltered = useMemo(() => filterSfiaSkills(masterSkills, sfiaSearch), [masterSkills, sfiaSearch]);

  const toggleSfiaSkillSelection = (skillId: string) => {
    setSfiaSelected((prev) => toggleSfiaSkill(prev, skillId));
  };

  const setSfiaLevelSelection = (skillId: string, level: number) => {
    setSfiaSelected((prev) => setSfiaLevel(prev, skillId, level));
  };

  const handleSaveSfia = async () => {
    if (!createdJob) return;
    setSavingSfia(true);
    try {
      await saveSfiaSkills(createdJob.job_posting_id, sfiaSelected);
      toast.success("Job posting created!");
      onCreate(createdJob);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save SFIA skills";
      toast.error(message);
    } finally {
      setSavingSfia(false);
    }
  };

  const handleSkipSfia = () => {
    if (!createdJob) return;
    toast.success("Job posting created!");
    onCreate(createdJob);
  };

  return {
    step,
    setStep,
    createdJob,
    questions,
    setQuestions,
    saving,
    savingQuestions,
    departments,
    masterSkills,
    sfiaSelected,
    sfiaSearch,
    setSfiaSearch,
    savingSfia,
    sfiaLoading,
    suggestingSfia,
    form,
    setForm,
    sfiaFiltered,
    handleCreatePosting,
    handleSaveQuestions,
    handleSkipQuestions,
    goToSfiaStep,
    handleSuggestSfia,
    toggleSfiaSkill: toggleSfiaSkillSelection,
    setSfiaLevel: setSfiaLevelSelection,
    handleSaveSfia,
    handleSkipSfia,
  };
}

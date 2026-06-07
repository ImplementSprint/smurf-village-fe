"use client";

import type { SyntheticEvent } from "react";
import { JobWizardModalShell } from "../shared/JobWizardModalShell";
import { Step1JobDetails } from "./Step1JobDetails";
import { Step2Questions } from "./Step2Questions";
import { Step3SfiaSkills } from "./Step3SfiaSkills";
import { useCreateJobWizard, type CreateJobPosting } from "./useCreateJobWizard";

const stepLabels = {
  title: (step: 1 | 2 | 3) => (step === 1 ? "Create Job Posting" : step === 2 ? "Build Application Form" : "Configure SFIA Skills"),
  subtitle: (step: 1 | 2 | 3) =>
    step === 1 ? "Fill in the details for the new position" : step === 2 ? "Add questions applicants must answer" : "Set required skill levels for SFIA matching",
};

export function CreateJobModal({
  onClose,
  onCreate,
}: Readonly<{
  onClose: () => void;
  onCreate: (job: CreateJobPosting) => void;
}>) {
  const wizard = useCreateJobWizard(onCreate);

  return (
    <JobWizardModalShell
      step={wizard.step}
      setStep={wizard.setStep}
      created={Boolean(wizard.createdJob)}
      onClose={onClose}
      labels={stepLabels}
      step1={
        <Step1JobDetails
          form={wizard.form}
          setForm={wizard.setForm}
          departments={wizard.departments}
          saving={wizard.saving}
          onClose={onClose}
          onSubmit={(e) => wizard.handleCreatePosting(e, false)}
          onSaveDraft={() => wizard.handleCreatePosting({ preventDefault: () => {} } as SyntheticEvent<HTMLFormElement>, true)}
        />
      }
      step2={
        <Step2Questions
          questions={wizard.questions}
          setQuestions={wizard.setQuestions}
          savingQuestions={wizard.savingQuestions}
          onSkip={wizard.handleSkipQuestions}
          onNext={wizard.handleSaveQuestions}
        />
      }
      step3={
        <Step3SfiaSkills
          sfiaSearch={wizard.sfiaSearch}
          setSfiaSearch={wizard.setSfiaSearch}
          handleSuggestSfia={wizard.handleSuggestSfia}
          suggestingSfia={wizard.suggestingSfia}
          sfiaLoading={wizard.sfiaLoading}
          sfiaSelected={wizard.sfiaSelected}
          sfiaFiltered={wizard.sfiaFiltered}
          toggleSfiaSkill={wizard.toggleSfiaSkill}
          setSfiaLevel={wizard.setSfiaLevel}
          handleSkipSfia={wizard.handleSkipSfia}
          handleSaveSfia={wizard.handleSaveSfia}
          savingSfia={wizard.savingSfia}
        />
      }
    />
  );
}

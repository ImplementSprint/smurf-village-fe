"use client";

import { JobWizardModalShell } from "../shared/JobWizardModalShell";
import { Step1JobDetails } from "./Step1JobDetails";
import { Step2Questions } from "./Step2Questions";
import { Step3SfiaSkills } from "./Step3SfiaSkills";
import { useEditJobWizard, type EditJobPosting } from "./useEditJobWizard";

const stepLabels = {
  title: (step: 1 | 2 | 3) => (step === 1 ? "Edit Job Posting" : step === 2 ? "Build Application Form" : "Configure SFIA Skills"),
  subtitle: (step: 1 | 2 | 3) =>
    step === 1 ? "Update the details for this position" : step === 2 ? "Add questions applicants must answer" : "Set required skill levels for SFIA matching",
};

export function EditJobModal({
  job,
  onClose,
  onSave,
}: Readonly<{
  job: EditJobPosting;
  onClose: () => void;
  onSave: (updated: EditJobPosting) => void;
}>) {
  const wizard = useEditJobWizard({ job, onSave });

  return (
    <JobWizardModalShell
      step={wizard.step}
      setStep={wizard.setStep}
      created={true}
      onClose={onClose}
      labels={stepLabels}
      step1={
        <Step1JobDetails
          form={wizard.form}
          setForm={wizard.setForm}
          departments={wizard.departments}
          saving={wizard.saving}
          onClose={onClose}
          onSubmit={(e) => wizard.handleSaveDetails(e, false)}
          onSaveClose={() => wizard.handleSaveDetails(undefined, true)}
        />
      }
      step2={
        <Step2Questions
          questions={wizard.questions}
          setQuestions={wizard.setQuestions}
          questionsLoading={wizard.questionsLoading}
          savingQuestions={wizard.savingQuestions}
          onSkip={() => wizard.setStep(3)}
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

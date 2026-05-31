import type { Dispatch, SetStateAction, SyntheticEvent } from "react";
import { JobDetailsForm } from "../shared/JobDetailsForm";
import type { DepartmentOption, JobFormState } from "../shared/jobWizardTypes";

export function Step1JobDetails({
  form,
  setForm,
  departments,
  saving,
  onClose,
  onSubmit,
  onSaveDraft,
}: Readonly<{
  form: JobFormState;
  setForm: Dispatch<SetStateAction<JobFormState>>;
  departments: DepartmentOption[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (e: SyntheticEvent<HTMLFormElement>) => Promise<void>;
  onSaveDraft: () => Promise<void>;
}>) {
  return (
    <JobDetailsForm
      form={form}
      setForm={setForm}
      departments={departments}
      saving={saving}
      onClose={onClose}
      onSubmit={onSubmit}
      onSecondaryActionLabel="Save as Draft"
      onSecondaryAction={onSaveDraft}
      formPrefix="create"
    />
  );
}

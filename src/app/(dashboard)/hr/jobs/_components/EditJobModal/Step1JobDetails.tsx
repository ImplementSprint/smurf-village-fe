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
  onSaveClose,
}: Readonly<{
  form: JobFormState & { status: "open" | "closed" | "draft" };
  setForm: Dispatch<SetStateAction<JobFormState & { status: "open" | "closed" | "draft" }>>;
  departments: DepartmentOption[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (e: SyntheticEvent<HTMLFormElement>) => Promise<void>;
  onSaveClose: () => Promise<void>;
}>) {
  return (
    <JobDetailsForm
      form={form}
      setForm={setForm}
      departments={departments}
      saving={saving}
      onClose={onClose}
      onSubmit={onSubmit}
      onSecondaryActionLabel="Save & Close"
      onSecondaryAction={onSaveClose}
      showStatus
      formPrefix="edit"
    />
  );
}

import type { Dispatch, SetStateAction, SyntheticEvent } from "react";
import { Loader2, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DepartmentOption, JobFormState } from "./jobWizardTypes";

type JobDetailsFormProps<TForm extends JobFormState> = {
  form: TForm & { status?: "open" | "closed" | "draft" };
  setForm: Dispatch<SetStateAction<TForm>>;
  departments: DepartmentOption[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (e: SyntheticEvent<HTMLFormElement>) => Promise<void>;
  onPrimaryActionLabel?: string;
  onSecondaryActionLabel: string;
  onSecondaryAction: () => Promise<void>;
  showStatus?: boolean;
  formPrefix: "create" | "edit";
};

export function JobDetailsForm<TForm extends JobFormState>({
  form,
  setForm,
  departments,
  saving,
  onClose,
  onSubmit,
  onPrimaryActionLabel = "Next",
  onSecondaryActionLabel,
  onSecondaryAction,
  showStatus = false,
  formPrefix,
}: Readonly<JobDetailsFormProps<TForm>>) {
  return (
    <form id={`${formPrefix}-step1-form`} onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor={`${formPrefix}-title`} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Job Title *</label>
        <Input
          id={`${formPrefix}-title`}
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="e.g. Senior Software Engineer"
          required
          className="h-10"
        />
      </div>
      {showStatus && form.status ? (
        <div className="space-y-1.5">
          <label htmlFor={`${formPrefix}-status`} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</label>
          <select
            id={`${formPrefix}-status`}
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "open" | "closed" | "draft" }))}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      ) : null}
      <div className="space-y-1.5">
        <label htmlFor={`${formPrefix}-description`} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description *</label>
        <textarea
          id={`${formPrefix}-description`}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Describe the role, responsibilities, and requirements..."
          required
          rows={4}
          className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`${formPrefix}-department`} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Department</label>
        <select
          id={`${formPrefix}-department`}
          value={form.department_id}
          onChange={(e) => setForm((f) => ({ ...f, department_id: e.target.value }))}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Select department</option>
          {departments.map((d) => (
            <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor={`${formPrefix}-location`} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Location</label>
          <Input id={`${formPrefix}-location`} value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. Manila" className="h-10" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${formPrefix}-employment-type`} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Employment Type</label>
          <select
            id={`${formPrefix}-employment-type`}
            value={form.employment_type}
            onChange={(e) => setForm((f) => ({ ...f, employment_type: e.target.value }))}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Select type</option>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Internship</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor={`${formPrefix}-salary`} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Salary Range</label>
          <Input id={`${formPrefix}-salary`} value={form.salary_range} onChange={(e) => setForm((f) => ({ ...f, salary_range: e.target.value }))} placeholder="e.g. 50k - 80k" className="h-10" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${formPrefix}-closes-at`} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Closes On</label>
          <Input id={`${formPrefix}-closes-at`} type="date" value={form.closes_at} onChange={(e) => setForm((f) => ({ ...f, closes_at: e.target.value }))} className="h-10" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-1.5 border-dashed text-muted-foreground hover:text-foreground"
          disabled={saving || !form.title.trim() || !form.description.trim()}
          onClick={() => void onSecondaryAction()}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : onSecondaryActionLabel}
        </Button>
        <Button type="submit" className="flex-1 gap-1.5" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>{onPrimaryActionLabel}</span><MoveRight className="h-4 w-4" /></>}
        </Button>
      </div>
    </form>
  );
}

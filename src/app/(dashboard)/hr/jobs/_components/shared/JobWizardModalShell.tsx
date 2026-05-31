import { Check, X } from "lucide-react";
import type { ReactNode } from "react";

type Step = 1 | 2 | 3;

type StepLabels = {
  title: (step: Step) => string;
  subtitle: (step: Step) => string;
};

type JobWizardModalShellProps = {
  step: Step;
  setStep: (step: Step) => void;
  created: boolean;
  onClose: () => void;
  labels: StepLabels;
  step1: ReactNode;
  step2: ReactNode;
  step3: ReactNode;
};

export function JobWizardModalShell({
  step,
  setStep,
  created,
  onClose,
  labels,
  step1,
  step2,
  step3,
}: Readonly<JobWizardModalShellProps>) {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-border bg-card shadow-2xl">
        <div className="shrink-0 px-6 pb-4 pt-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold leading-tight text-foreground">{labels.title(step)}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{labels.subtitle(step)}</p>
            </div>
            <button onClick={onClose} className="ml-2 shrink-0 rounded-md p-1.5 transition-colors hover:bg-muted/50">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <div className="flex w-full items-start">
            <button type="button" onClick={() => setStep(1)} className="group flex cursor-pointer flex-col items-center gap-1">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${step === 1 ? "bg-primary text-primary-foreground ring-2 ring-primary/20 ring-offset-1 ring-offset-card" : step > 1 ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
                {step > 1 ? <Check className="h-3.5 w-3.5" /> : "1"}
              </div>
              <span className={`whitespace-nowrap text-[10px] font-medium leading-none ${step === 1 ? "text-primary" : "text-muted-foreground"}`}>Job Details</span>
            </button>
            <div className="mx-2 mt-[13px] flex-1">
              <div className={`h-px w-full transition-colors duration-300 ${step > 1 ? "bg-emerald-400/70" : "bg-border"}`} />
            </div>
            <button type="button" onClick={() => { if (created) setStep(2); }} disabled={!created} className={`group flex flex-col items-center gap-1 ${created ? "cursor-pointer" : "cursor-default"}`}>
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${step === 2 ? "bg-primary text-primary-foreground ring-2 ring-primary/20 ring-offset-1 ring-offset-card" : step > 2 && created ? "bg-emerald-500 text-white" : created ? "bg-muted text-muted-foreground group-hover:bg-muted/70" : "bg-muted/40 text-muted-foreground/40"}`}>
                {step > 2 && created ? <Check className="h-3.5 w-3.5" /> : "2"}
              </div>
              <span className={`whitespace-nowrap text-[10px] font-medium leading-none ${step === 2 ? "text-primary" : created ? "text-muted-foreground" : "text-muted-foreground/40"}`}>App Form</span>
            </button>
            <div className="mx-2 mt-[13px] flex-1">
              <div className={`h-px w-full transition-colors duration-300 ${step > 2 ? "bg-emerald-400/70" : "bg-border"}`} />
            </div>
            <button type="button" onClick={() => { if (created) setStep(3); }} disabled={!created} className={`group flex flex-col items-center gap-1 ${created ? "cursor-pointer" : "cursor-default"}`}>
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${step === 3 ? "bg-primary text-primary-foreground ring-2 ring-primary/20 ring-offset-1 ring-offset-card" : created ? "bg-muted text-muted-foreground group-hover:bg-muted/70" : "bg-muted/40 text-muted-foreground/40"}`}>
                3
              </div>
              <span className={`whitespace-nowrap text-[10px] font-medium leading-none ${step === 3 ? "text-primary" : created ? "text-muted-foreground" : "text-muted-foreground/40"}`}>SFIA Skills</span>
            </button>
          </div>
        </div>
        <div className="border-t border-border" />

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {step === 1 && step1}
          {step === 2 && step2}
          {step === 3 && step3}
        </div>
      </div>
    </div>
  );
}

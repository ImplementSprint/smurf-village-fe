import type { ComputedPayslip, PayslipDetail } from "@/lib/payrollApi";

export const toCurrencyNumber = (value: number | string) =>
  new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));

export function escapePdfText(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
}

export function formatPayslipPeriod(payslip: PayslipDetail | ComputedPayslip) {
  if (payslip.period) {
    const start = new Date(payslip.period.cutoff_start_date).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
    });
    const end = new Date(payslip.period.cutoff_end_date).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${start} - ${end}`;
  }

  return new Date(payslip.created_at).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function maskId(value?: string | null) {
  if (!value) return "Not set";
  const plain = value.replace(/\s+/g, "");
  const tail = plain.slice(-4);
  const hiddenCount = Math.max(0, plain.length - 4);
  return `${"*".repeat(hiddenCount)}${tail}`;
}

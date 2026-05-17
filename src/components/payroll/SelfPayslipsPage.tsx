"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeDollarSign, Download, Eye, FileText, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

import { SecondaryAuthModal } from "@/components/security/SecondaryAuthModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getMyCompensation,
  getMyPayslipsFromCnb,
  type CompensationPackage,
  type PayslipBreakdown,
  type PayslipDetail,
} from "@/lib/payrollApi";
import { getUserInfo } from "@/lib/authStorage";

const toCurrency = (value: number | string) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(Number(value));

const toCurrencyNumber = (value: number | string) =>
  new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));

function escapePdfText(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
}

function maskId(value?: string | null) {
  if (!value) return "Not set";
  const plain = value.replace(/\s+/g, "");
  const tail = plain.slice(-4);
  const hiddenCount = Math.max(0, plain.length - 4);
  return `${"*".repeat(hiddenCount)}${tail}`;
}

function formatPeriod(payslip: PayslipDetail) {
  if (payslip.period) {
    const start = new Date(payslip.period.cutoff_start_date).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
    const end = new Date(payslip.period.cutoff_end_date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
    return `${start} - ${end}`;
  }
  return new Date(payslip.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

type PayslipExportContext = {
  companyName: string;
  employeeName: string;
  employeeEmail: string;
  employeeId: string | null;
  payFrequency: string | null;
};

function downloadPayslipPdf(payslip: PayslipDetail, context: PayslipExportContext) {
  const breakdown = payslip.breakdown as PayslipBreakdown | null;
  const attendance = breakdown?.attendance ?? null;
  const basicPay = breakdown?.basicPay;
  const payableUnits = basicPay?.units ?? attendance?.payableDays ?? null;
  const scheduledUnits = basicPay?.scheduledUnits ?? attendance?.scheduledDays ?? null;
  const unitLabel = basicPay?.unitLabel ?? "day(s)";
  const unitRate = basicPay?.rate ?? null;

  const earningRows = [
    {
      item: "Basic Pay",
      units:
        payableUnits != null
          ? `${payableUnits}${scheduledUnits != null ? ` / ${scheduledUnits} ${unitLabel}` : ` ${unitLabel}`}`
          : "-",
      rate: unitRate != null ? toCurrencyNumber(unitRate) : "-",
      amount: toCurrencyNumber(payslip.basic_pay_earned),
    },
    ...((breakdown?.benefits ?? []).map((benefit) => ({
      item: benefit.name ?? benefit.type ?? "Benefit",
      units: "-",
      rate: "-",
      amount: toCurrencyNumber(benefit.amount),
    }))),
    ...(!breakdown?.benefits?.length && Number(payslip.total_allowances) > 0
      ? [{ item: "Allowances", units: "-", rate: "-", amount: toCurrencyNumber(payslip.total_allowances) }]
      : []),
  ];

  const deductionRows = [
    { item: "Income Tax", amount: toCurrencyNumber(payslip.tax_deduction) },
    ...(breakdown?.sss != null
      ? [
          { item: "SSS", amount: toCurrencyNumber(breakdown.sss) },
          { item: "PhilHealth", amount: toCurrencyNumber(breakdown.philhealth) },
          { item: "Pag-IBIG", amount: toCurrencyNumber(breakdown.pagibig) },
        ]
      : [{ item: "Statutory Deductions", amount: toCurrencyNumber(payslip.statutory_deductions) }]),
  ];

  const payoutDate = payslip.period?.payout_date
    ? new Date(payslip.period.payout_date).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "-";

  const payFrequencyLabel = context.payFrequency
    ? context.payFrequency.replace("-", " ")
    : "-";

  const attendanceNote =
    attendance && (attendance.paidLeaveDays > 0 || attendance.unpaidLeaveDays > 0)
      ? `${attendance.paidLeaveDays > 0 ? `${attendance.paidLeaveDays} paid leave day(s)` : ""}${
          attendance.paidLeaveDays > 0 && attendance.unpaidLeaveDays > 0 ? " | " : ""
        }${attendance.unpaidLeaveDays > 0 ? `${attendance.unpaidLeaveDays} unpaid leave day(s)` : ""}`
      : "";
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  const rightColWidth = 205;
  const leftColWidth = contentWidth - rightColWidth - 18;
  const commands: string[] = [];

  const fillColor = (r: number, g: number, b: number) =>
    commands.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`);
  const strokeColor = (r: number, g: number, b: number) =>
    commands.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG`);
  const lineWidth = (width: number) => commands.push(`${width} w`);
  const drawLine = (x1: number, y1: number, x2: number, y2: number) =>
    commands.push(`${x1} ${y1} m ${x2} ${y2} l S`);
  const drawRect = (x: number, y: number, width: number, height: number, fill = false) =>
    commands.push(`${x} ${y} ${width} ${height} re ${fill ? "B" : "S"}`);
  const drawText = (text: string, x: number, y: number, size = 10) =>
    commands.push(`BT /F1 ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escapePdfText(text)}) Tj ET`);
  const drawRightText = (text: string, rightX: number, y: number, size = 10) => {
    const safe = text ?? "";
    const estimatedWidth = safe.length * size * 0.48;
    drawText(safe, Math.max(margin, rightX - estimatedWidth), y, size);
  };
  const drawPesoMark = (x: number, y: number, size = 10) => {
    drawText("P", x, y, size);
    const left = x + size * 0.14;
    const right = x + size * 0.52;
    const upperY = y + size * 0.48;
    const lowerY = y + size * 0.32;
    drawLine(left, upperY, right, upperY);
    drawLine(left, lowerY, right, lowerY);
  };
  const drawRightPesoAmount = (amount: string, rightX: number, y: number, size = 10) => {
    const safe = amount ?? "";
    const amountWidth = safe.length * size * 0.48;
    const pesoWidth = size * 0.72;
    const gap = 5;
    const amountX = Math.max(margin, rightX - amountWidth);
    const pesoX = amountX - pesoWidth - gap;
    drawPesoMark(pesoX, y, size);
    drawText(safe, amountX, y, size);
  };

  lineWidth(1);
  strokeColor(0.58, 0.66, 0.72);
  fillColor(1, 1, 1);

  drawText("PAYSLIP", margin, 800, 20);
  drawText("Compensation & Benefits", margin, 784, 11);
  drawText(context.companyName || "Your Company", margin, 764, 16);

  let leftInfoY = 740;
  [
    ["Employee", context.employeeName],
    ["Employee ID", context.employeeId || "-"],
    ["Email", context.employeeEmail || "-"],
    ["Payslip ID", payslip.payslip_id],
    ["Status", payslip.status],
  ].forEach(([label, value]) => {
    drawText(`${label}:`, margin, leftInfoY, 10);
    drawText(value, margin + 78, leftInfoY, 10);
    leftInfoY -= 16;
  });

  const rightX = margin + leftColWidth + 18;
  let rightInfoY = 800;
  [
    ["Pay Date", payoutDate],
    ["Pay Period", formatPeriod(payslip)],
    ["Pay Frequency", payFrequencyLabel],
    ["Gross Pay", toCurrencyNumber(payslip.gross_pay)],
    ["Total Deductions", toCurrencyNumber(payslip.total_deductions)],
    ["Net Pay", toCurrencyNumber(payslip.net_pay)],
  ].forEach(([label, value]) => {
    drawText(`${label}:`, rightX, rightInfoY, 10);
    if (label === "Pay Frequency" || label === "Pay Date" || label === "Pay Period") {
      drawRightText(value, pageWidth - margin, rightInfoY, 10);
    } else {
      drawRightPesoAmount(value, pageWidth - margin, rightInfoY, 10);
    }
    rightInfoY -= 16;
  });

  const earningsTop = 635;
  const tableCol1 = margin;
  const tableCol2 = tableCol1 + 240;
  const tableCol3 = tableCol2 + 90;
  const tableCol4 = tableCol3 + 80;
  const tableCol5 = pageWidth - margin;
  const rowHeight = 20;

  fillColor(0.86, 0.92, 0.99);
  drawRect(tableCol1, earningsTop, tableCol5 - tableCol1, rowHeight, true);
  fillColor(0, 0, 0);
  drawText("EARNINGS", tableCol1 + 6, earningsTop + 6, 10);
  drawText("HOURS / UNITS", tableCol2 + 6, earningsTop + 6, 9);
  drawText("RATE", tableCol3 + 6, earningsTop + 6, 9);
  drawText("AMOUNT", tableCol4 + 6, earningsTop + 6, 9);

  [tableCol1, tableCol2, tableCol3, tableCol4, tableCol5].forEach((x) =>
    drawLine(x, earningsTop, x, earningsTop - rowHeight * (earningRows.length + 2)),
  );

  let currentY = earningsTop - rowHeight;
  earningRows.forEach((row) => {
    drawLine(tableCol1, currentY, tableCol5, currentY);
    drawText(row.item, tableCol1 + 6, currentY + 6, 9);
    drawRightText(row.units, tableCol3 - 8, currentY + 6, 9);
    if (row.rate === "-") {
      drawRightText(row.rate, tableCol4 - 8, currentY + 6, 9);
    } else {
      drawRightPesoAmount(row.rate, tableCol4 - 8, currentY + 6, 9);
    }
    drawRightPesoAmount(row.amount, tableCol5 - 8, currentY + 6, 9);
    currentY -= rowHeight;
  });
  drawLine(tableCol1, currentY, tableCol5, currentY);
  drawText("Gross Pay", tableCol1 + 6, currentY + 6, 9);
  drawRightPesoAmount(toCurrencyNumber(payslip.gross_pay), tableCol5 - 8, currentY + 6, 9);
  currentY -= rowHeight;
  drawLine(tableCol1, currentY, tableCol5, currentY);

  const deductionsTop = currentY - 26;
  const deductionCol2 = pageWidth - margin - 120;
  fillColor(0.86, 0.92, 0.99);
  drawRect(tableCol1, deductionsTop, tableCol5 - tableCol1, rowHeight, true);
  fillColor(0, 0, 0);
  drawText("DEDUCTIONS", tableCol1 + 6, deductionsTop + 6, 10);
  drawText("AMOUNT", deductionCol2 + 6, deductionsTop + 6, 9);

  [tableCol1, deductionCol2, tableCol5].forEach((x) =>
    drawLine(x, deductionsTop, x, deductionsTop - rowHeight * (deductionRows.length + 2)),
  );

  currentY = deductionsTop - rowHeight;
  deductionRows.forEach((row) => {
    drawLine(tableCol1, currentY, tableCol5, currentY);
    drawText(row.item, tableCol1 + 6, currentY + 6, 9);
    drawRightPesoAmount(row.amount, tableCol5 - 8, currentY + 6, 9);
    currentY -= rowHeight;
  });
  drawLine(tableCol1, currentY, tableCol5, currentY);
  drawText("Total Deductions", tableCol1 + 6, currentY + 6, 9);
  drawRightPesoAmount(toCurrencyNumber(payslip.total_deductions), tableCol5 - 8, currentY + 6, 9);
  currentY -= rowHeight;
  drawLine(tableCol1, currentY, tableCol5, currentY);

  const summaryTop = currentY - 34;
  const summaryHeight = 74;
  drawRect(tableCol1, summaryTop, tableCol5 - tableCol1, -summaryHeight, false);
  drawLine(tableCol1, summaryTop - 24, tableCol5, summaryTop - 24);
  drawLine(tableCol1, summaryTop - 48, tableCol5, summaryTop - 48);
  drawText("Tax Withheld", tableCol1 + 8, summaryTop - 16, 10);
  drawRightPesoAmount(toCurrencyNumber(payslip.tax_deduction), tableCol5 - 8, summaryTop - 16, 10);
  drawText("Statutory Deductions", tableCol1 + 8, summaryTop - 40, 10);
  drawRightPesoAmount(toCurrencyNumber(payslip.statutory_deductions), tableCol5 - 8, summaryTop - 40, 10);
  fillColor(0.93, 0.99, 0.96);
  drawRect(tableCol1, summaryTop - 48, tableCol5 - tableCol1, -26, true);
  fillColor(0, 0, 0);
  drawText("NET PAY", tableCol1 + 8, summaryTop - 64, 12);
  drawRightPesoAmount(toCurrencyNumber(payslip.net_pay), tableCol5 - 8, summaryTop - 64, 12);

  let footY = summaryTop - 100;
  if (breakdown?.firstPayrollAccumulation && breakdown.coveredPeriodStart && breakdown.coveredPeriodEnd) {
    drawText(
      `First payroll coverage: ${new Date(breakdown.coveredPeriodStart).toLocaleDateString("en-PH")} to ${new Date(breakdown.coveredPeriodEnd).toLocaleDateString("en-PH")}`,
      margin,
      footY,
      9,
    );
    footY -= 14;
  }
  if (attendanceNote) {
    drawText(attendanceNote, margin, footY, 9);
  }
  const stream = commands.join("\\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj`,
    `4 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const offset of offsets) {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `payslip-${formatPeriod(payslip).replace(/\s+/g, "-").toLowerCase()}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function PayslipReceiptView({ payslip }: Readonly<{ payslip: PayslipDetail }>) {
  const breakdown = payslip.breakdown as PayslipBreakdown | null;
  const currentUser = getUserInfo();
  const employeeName =
    [payslip.employee?.first_name, payslip.employee?.last_name]
      .filter((value): value is string => typeof value === "string" && value.length > 0)
      .join(" ") ||
    currentUser?.name ||
    "Employee";
  const exportContext: PayslipExportContext = {
    companyName: payslip.company?.company_name ?? "Company",
    employeeName,
    employeeEmail: payslip.employee?.email ?? currentUser?.email ?? "",
    employeeId: payslip.employee?.employee_id ?? null,
    payFrequency: breakdown?.payFrequency ?? null,
  };


  const handleDownload = () => {
    downloadPayslipPdf(payslip, exportContext);
  };

  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-lg bg-slate-50 border p-3 text-xs text-muted-foreground">
        Pay Period: <span className="font-semibold text-foreground">{formatPeriod(payslip)}</span>
        {payslip.period?.payout_date && (
          <> {" - "}Payout: <span className="font-semibold text-foreground">
            {new Date(payslip.period.payout_date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
          </span></>
        )}
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Earnings</p>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span>Basic Pay</span>
            <span className="font-medium">{toCurrency(payslip.basic_pay_earned)}</span>
          </div>
          {breakdown?.benefits?.map((b, i) => (
            <div key={i} className="flex justify-between text-muted-foreground">
              <span>{b.name ?? b.type ?? "Benefit"}</span>
              <span>{toCurrency(b.amount)}</span>
            </div>
          ))}
          {!breakdown?.benefits?.length && Number(payslip.total_allowances) > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Total Allowances</span>
              <span>{toCurrency(payslip.total_allowances)}</span>
            </div>
          )}
        </div>
        <div className="flex justify-between font-semibold border-t mt-2 pt-2">
          <span>Gross Pay</span>
          <span>{toCurrency(payslip.gross_pay)}</span>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Deductions</p>
        <div className="space-y-1.5">
          <div className="flex justify-between text-muted-foreground">
            <span>Income Tax (Withheld)</span>
            <span>{toCurrency(payslip.tax_deduction)}</span>
          </div>
          {breakdown?.sss != null ? (
            <>
              <div className="flex justify-between text-muted-foreground">
                <span>SSS (Employee Share)</span>
                <span>{toCurrency(breakdown.sss)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>PhilHealth (Employee Share)</span>
                <span>{toCurrency(breakdown.philhealth)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Pag-IBIG</span>
                <span>{toCurrency(breakdown.pagibig)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-muted-foreground">
              <span>Statutory Deductions (SSS / PhilHealth / Pag-IBIG)</span>
              <span>{toCurrency(payslip.statutory_deductions)}</span>
            </div>
          )}
        </div>
        <div className="flex justify-between font-semibold border-t mt-2 pt-2 text-rose-700">
          <span>Total Deductions</span>
          <span>{toCurrency(payslip.total_deductions)}</span>
        </div>
      </div>

      <div className="rounded-lg bg-emerald-50 border-emerald-200 border p-3 flex justify-between items-center">
        <span className="font-bold text-emerald-900">Net Pay</span>
        <span className="font-bold text-emerald-900 text-lg">{toCurrency(payslip.net_pay)}</span>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-3.5 w-3.5" /> Download PDF
        </Button>
      </div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  hint,
}: Readonly<{
  label: string;
  value: string | number;
  hint: string;
}>) {
  return (
    <Card className="border-transparent bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] shadow-[0_18px_40px_rgba(15,23,42,0.07),0_3px_12px_rgba(15,23,42,0.04)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-500">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tracking-tight text-slate-950 [font-variant-numeric:tabular-nums]">
          {value}
        </p>
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      </CardContent>
    </Card>
  );
}

export function SelfPayslipsPage({ personaLabel }: Readonly<{ personaLabel: string }>) {
  const [payslips, setPayslips] = useState<PayslipDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingReceiptId, setPendingReceiptId] = useState<string | null>(null);
  const [receiptPayslip, setReceiptPayslip] = useState<PayslipDetail | null>(null);
  const [activeTab, setActiveTab] = useState("payslips");
  const [packageUnlocked, setPackageUnlocked] = useState(false);
  const [loadingPackage, setLoadingPackage] = useState(false);
  const [myPackage, setMyPackage] = useState<CompensationPackage | null>(null);

  useEffect(() => {
    getMyPayslipsFromCnb()
      .then((data) => setPayslips(data))
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load payslips"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab !== "my-package" || !packageUnlocked || myPackage || loadingPackage) return;
    setLoadingPackage(true);
    getMyCompensation()
      .then((data) => setMyPackage(data))
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load compensation package"))
      .finally(() => setLoadingPackage(false));
  }, [activeTab, packageUnlocked, myPackage, loadingPackage]);

  const totalNetPay = useMemo(
    () => payslips.reduce((sum, payslip) => sum + Number(payslip.net_pay), 0),
    [payslips],
  );

  if (loading) {
    return (
      <div className="min-h-60 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading payslips...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(140deg,#08111f_0%,#0f2850_48%,#123d34_100%)] px-8 py-10 text-white shadow-sm">
        <div className="absolute inset-y-0 right-0 w-72 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_62%)]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">{personaLabel}</p>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Payslips & Compensation</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/78">
              Review released payroll records, then unlock your compensation package only when you need to inspect salary, benefits, or statutory details.
            </p>
          </div>
          <div className="grid w-full max-w-sm grid-cols-2 gap-3 rounded-2xl bg-white/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_14px_30px_rgba(8,17,31,0.18)] backdrop-blur-sm">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">Records</p>
              <p className="mt-2 text-2xl font-bold [font-variant-numeric:tabular-nums]">{payslips.length}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">Net total</p>
              <p className="mt-2 text-lg font-bold [font-variant-numeric:tabular-nums]">{toCurrency(totalNetPay)}</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2 rounded-2xl bg-slate-100/90 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm">
          <TabsTrigger
            value="payslips"
            className="rounded-xl border border-transparent text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-[0_10px_22px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.05)]"
          >
            Payslips
          </TabsTrigger>
          <TabsTrigger
            value="my-package"
            className="rounded-xl border border-transparent text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-[0_10px_22px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.05)]"
          >
            My Package
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payslips" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryStat label="Payslips" value={payslips.length} hint="Released payroll receipts on file." />
            <SummaryStat label="Total net pay" value={toCurrency(totalNetPay)} hint="Combined take-home pay across listed records." />
            <SummaryStat label="Status" value={payslips.length > 0 ? "Ready" : "Empty"} hint={payslips.length > 0 ? "Generated from the payroll engine." : "No payroll records generated yet."} />
          </div>

          <Card className="overflow-hidden border-transparent bg-white shadow-[0_22px_50px_rgba(15,23,42,0.08),0_4px_14px_rgba(15,23,42,0.04)]">
            <CardHeader className="bg-[linear-gradient(180deg,#f8fafc_0%,#f8fafc_62%,rgba(248,250,252,0)_100%)]">
              <CardTitle className="flex items-center gap-2 text-lg font-bold tracking-tight">
                <BadgeDollarSign className="h-4 w-4 text-primary" /> Payslips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-5">
              {payslips.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)]">
                  No payslips yet. Your HR team will generate payslips after running the payroll cutoff.
                </div>
              ) : (
                payslips.map((payslip) => (
                  <div
                    key={payslip.payslip_id}
                    className="rounded-[26px] bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-[0_16px_34px_rgba(15,23,42,0.06),0_3px_10px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(15,23,42,0.08),0_4px_12px_rgba(15,23,42,0.05)] md:p-6"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <p className="text-lg font-semibold tracking-tight text-slate-950">{formatPeriod(payslip)}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Generated: {new Date(payslip.created_at).toLocaleDateString()} · {payslip.status}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 md:justify-end">
                      <Badge variant="outline" className="rounded-full border-transparent bg-emerald-50 px-3.5 py-1.5 text-sm font-semibold text-emerald-900 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.14)]">Net {toCurrency(payslip.net_pay)}</Badge>
                      <Button
                        size="sm"
                        onClick={() => {
                          setPendingReceiptId(payslip.payslip_id);
                          setAuthOpen(true);
                        }}
                        className="h-10 rounded-full px-4 shadow-[0_10px_24px_rgba(37,99,235,0.18)]"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Receipt
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-package" className="space-y-4">
          {!packageUnlocked ? (
            <Card className="overflow-hidden border-transparent bg-white shadow-[0_22px_50px_rgba(15,23,42,0.08),0_4px_14px_rgba(15,23,42,0.04)]">
              <CardHeader className="bg-[linear-gradient(180deg,#f8fafc_0%,#f8fafc_62%,rgba(248,250,252,0)_100%)]">
                <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <Lock className="h-4 w-4" /> My Package
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                <p className="text-sm leading-6 text-slate-500">
                  Verify your identity to view your salary, benefits, and statutory IDs.
                </p>
                <Button onClick={() => setAuthOpen(true)} className="rounded-xl px-4">Unlock My Package</Button>
              </CardContent>
            </Card>
          ) : loadingPackage ? (
            <div className="min-h-40 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading compensation package...</span>
            </div>
          ) : (
            <>
              <Card className="overflow-hidden border-transparent bg-white shadow-[0_22px_50px_rgba(15,23,42,0.08),0_4px_14px_rgba(15,23,42,0.04)]">
                <CardHeader className="bg-[linear-gradient(180deg,#f8fafc_0%,#f8fafc_62%,rgba(248,250,252,0)_100%)]">
                  <CardTitle className="text-base font-bold tracking-tight">Salary</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  {myPackage?.salary ? (
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 shadow-[0_14px_28px_rgba(15,23,42,0.06),0_2px_8px_rgba(15,23,42,0.04)]">
                        <p className="text-xs text-slate-500">Basic Salary</p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">{toCurrency(myPackage.salary.basic_salary)}</p>
                      </div>
                      <div className="rounded-2xl bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 shadow-[0_14px_28px_rgba(15,23,42,0.06),0_2px_8px_rgba(15,23,42,0.04)]">
                        <p className="text-xs text-slate-500">Pay Frequency</p>
                        <p className="mt-2 text-lg font-semibold capitalize text-slate-950">{myPackage.salary.pay_frequency}</p>
                      </div>
                      <div className="rounded-2xl bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 shadow-[0_14px_28px_rgba(15,23,42,0.06),0_2px_8px_rgba(15,23,42,0.04)]">
                        <p className="text-xs text-slate-500">Effective Date</p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">{new Date(myPackage.salary.effective_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Your salary record has not been set up yet. Contact HR.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-transparent bg-white shadow-[0_22px_50px_rgba(15,23,42,0.08),0_4px_14px_rgba(15,23,42,0.04)]">
                <CardHeader className="bg-[linear-gradient(180deg,#f8fafc_0%,#f8fafc_62%,rgba(248,250,252,0)_100%)]">
                  <CardTitle className="text-base font-bold tracking-tight">Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-5">
                  {myPackage?.benefits?.length ? (
                    myPackage.benefits.map((benefit) => (
                      <div key={benefit.mapping_id} className="rounded-2xl bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 flex flex-col gap-1 shadow-[0_14px_28px_rgba(15,23,42,0.06),0_2px_8px_rgba(15,23,42,0.04)] md:flex-row md:items-center md:justify-between">
                        <p className="text-sm font-semibold">{benefit.benefit_name ?? "Unknown Benefit"}</p>
                        <p className="text-sm text-muted-foreground">
                          {benefit.benefit_type ?? "N/A"} · {toCurrency(benefit.amount)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No assigned benefits.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-transparent bg-white shadow-[0_22px_50px_rgba(15,23,42,0.08),0_4px_14px_rgba(15,23,42,0.04)]">
                <CardHeader className="bg-[linear-gradient(180deg,#f8fafc_0%,#f8fafc_62%,rgba(248,250,252,0)_100%)]">
                  <CardTitle className="text-base font-bold tracking-tight">Statutory IDs</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 p-5 md:grid-cols-2">
                  {[
                    { label: "TIN", value: myPackage?.statutory?.tin_number },
                    { label: "SSS", value: myPackage?.statutory?.sss_number },
                    { label: "PhilHealth", value: myPackage?.statutory?.philhealth_number },
                    { label: "Pag-IBIG", value: myPackage?.statutory?.pagibig_number },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-2xl bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 shadow-[0_14px_28px_rgba(15,23,42,0.06),0_2px_8px_rgba(15,23,42,0.04)]">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-semibold">{maskId(value)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      <SecondaryAuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        title="Unlock Payslip"
        description="Enter your account password to view payslip details."
        onVerified={() => {
          if (activeTab === "my-package") {
            setPackageUnlocked(true);
            return;
          }
          if (!pendingReceiptId) return;
          const found = payslips.find((payslip) => payslip.payslip_id === pendingReceiptId) ?? null;
          setReceiptPayslip(found);
          setPendingReceiptId(null);
        }}
      />

      <Dialog open={!!receiptPayslip} onOpenChange={(open) => { if (!open) setReceiptPayslip(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Payslip Receipt
            </DialogTitle>
          </DialogHeader>
          {receiptPayslip && <PayslipReceiptView payslip={receiptPayslip} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

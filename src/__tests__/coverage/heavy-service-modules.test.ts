import * as payrollApi from "../../lib/payrollApi";
import * as offboardingApi from "../../lib/offboardingApi";

const response = (body: unknown, init: { status?: number } = {}) =>
  ({
    ok: (init.status ?? 200) >= 200 && (init.status ?? 200) < 300,
    status: init.status ?? 200,
    json: async () => body,
    text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
  } as Response);

describe("heavy service modules", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue(response({}));
  });

  it("covers payroll service wrappers", async () => {
    await payrollApi.getMyPayslips();
    await payrollApi.getPayrollLedger("2026-01-15");
    await payrollApi.reviewPayslip("p1", { action: "approve" } as never);
    await payrollApi.getAllSalaryBaselines();
    await payrollApi.getSalaryBaseline("u1");
    await payrollApi.setSalaryBaseline({ user_id: "u1" } as never);
    await payrollApi.getBenefitsCatalog();
    await payrollApi.createBenefitCatalogItem({} as never);
    await payrollApi.updateBenefitCatalogItem("b1", {} as never);
    await payrollApi.getEmployeeBenefits("u1");
    await payrollApi.assignEmployeeBenefit({} as never);
    await payrollApi.removeEmployeeBenefit("m1");
    await payrollApi.getStatutoryIds("u1");
    await payrollApi.saveStatutoryIds("u1", {} as never);
    await payrollApi.getTaxBrackets(2026);
    await payrollApi.createTaxBracket({} as never);
    await payrollApi.deleteTaxBracket("t1");
    await payrollApi.getBenefitDefaults();
    await payrollApi.setBenefitDefaults({} as never);
    await payrollApi.getMyCompensation();
    await payrollApi.getMyPayslipsFromCnb();
    await payrollApi.getPayslipDetail("p1");
    await payrollApi.compute13thMonthPay("u1", 2026);
    await payrollApi.computeSalaryAnnualization("u1", 2026);
    await payrollApi.getLeaveRequestsForApproval("pending");
    await payrollApi.reviewLeaveRequestApi("l1", { status: "approved" } as never);
    await payrollApi.reviewLeaveRevocationApi("l1", { status: "approved" } as never);
    await payrollApi.getOvertimeRequestsForApproval("pending");
    await payrollApi.reviewOvertimeRequestApi("o1", { status: "approved" } as never);
    await payrollApi.runPayrollCutoff({} as never);
    await payrollApi.getPayrollPeriods();
    await payrollApi.getPayslipsForPeriod("period-1");
  });

  it("covers offboarding service wrappers", async () => {
    await offboardingApi.getMyOffboardingCase();
    await offboardingApi.submitResignation({} as never);
    await offboardingApi.acknowledgeChecklistItem("c1", "i1");
    await offboardingApi.getManagerCases();
    await offboardingApi.getManagerCaseDetail("case-1");
    await offboardingApi.initiateTermination({} as never);
    await offboardingApi.acknowledgeCase("case-1");
    await offboardingApi.saveKnowledgeTransfer("case-1", { transfer_notes: "notes" } as never);
    await offboardingApi.getHRCases({});
    await offboardingApi.getHRCaseDetail("case-1");
    await offboardingApi.getHRFinalPay("case-1");
    await offboardingApi.initiateHROffboarding({} as never);
    await offboardingApi.reviewCase("case-1", { status: "approved" } as never);
    await offboardingApi.updateHRCaseStatus("case-1", "Completed");
    await offboardingApi.updateChecklistItem("case-1", "item-1", { status: "done" } as never);
    await offboardingApi.revokeSystemAccess("case-1", "sys-1", true);
    await offboardingApi.updateFinalPay("case-1", {} as never);
    await offboardingApi.recomputeFinalPay("case-1");
    await offboardingApi.releaseFinalPay("case-1");
    await offboardingApi.confirmBankTransfer("case-1");
    await offboardingApi.releaseClearance("case-1");
    await offboardingApi.triggerJobPosting("case-1");
    await offboardingApi.resetHRCase("case-1");
    await offboardingApi.fetchCompanyEmployees();
    await offboardingApi.getSystemAdminOffboardingTemplates("Asset");
    await offboardingApi.getSystemAdminSystemAccessOptions();
    await offboardingApi.getHROffboardingTemplates();
    await offboardingApi.createSystemAdminOffboardingTemplate({} as never);
    await offboardingApi.updateSystemAdminOffboardingTemplate("template-1", {} as never);
    await offboardingApi.deleteSystemAdminOffboardingTemplate("template-1");
    await offboardingApi.updateUserAccountStatus("u1", "active");
  });
});

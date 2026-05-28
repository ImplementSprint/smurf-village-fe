import { API_BASE_URL } from "../../lib/api";
import { sum } from "../../lib/sum";
import { getSaToken, setSaToken, clearSaToken, isSaAuthenticated } from "../../lib/superAdminAuth";
import * as adminApi from "../../lib/adminApi";
import * as candidateApi from "../../lib/candidateApi";
import * as changeRequestApi from "../../lib/changeRequestApi";
import * as cnbAdminApi from "../../lib/cnbAdminApi";
import * as hrDirectoryApi from "../../lib/hrDirectoryApi";
import * as notificationsApi from "../../lib/notificationsApi";
import * as superAdminApi from "../../lib/superAdminApi";

const response = (body: unknown, init: { status?: number } = {}) =>
  ({
    ok: (init.status ?? 200) >= 200 && (init.status ?? 200) < 300,
    status: init.status ?? 200,
    json: async () => body,
    text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
  } as Response);

describe("small helpers", () => {
  it("handles super-admin auth tokens and math helpers", () => {
    clearSaToken();
    expect(isSaAuthenticated()).toBe(false);
    setSaToken("token-1");
    expect(getSaToken()).toBe("token-1");
    expect(isSaAuthenticated()).toBe(true);
    expect(superAdminApi.saApi.defaults.baseURL).toBeDefined();
    clearSaToken();
    expect(isSaAuthenticated()).toBe(false);
    expect(sum(2, 3)).toBe(5);
    expect(API_BASE_URL).toContain("/api/");
  });
});

describe("notifications api", () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn().mockResolvedValue(response([]));
  });

  it("gets and marks notifications", async () => {
    localStorage.setItem("access_token", "abc");
    await notificationsApi.getMyNotifications();
    await notificationsApi.markNotificationRead("n1");
    await notificationsApi.markAllNotificationsRead();
  });
});

describe("admin, candidate, change request, directory, and cnb admin apis", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue(response({}));
  });

  it("covers common admin endpoints", async () => {
    await adminApi.getUsers();
    await adminApi.getUserStats();
    await adminApi.createUser({
      first_name: "Ada",
      last_name: "Lovelace",
      username: "ada",
      email: "ada@example.com",
      role: "Admin",
      department: "HR",
      company_id: "c1",
      start_date: "2026-01-01",
      link_expiry_hours: 24,
    });
    await adminApi.setUserStatus("u1", "active");
    await adminApi.updateUser("u1", { first_name: "Grace" });
    await adminApi.resendSignupLink("u1", 24);
    await adminApi.getCompanies();
    await adminApi.getSubscriptions();
    await adminApi.getBillingStats();
    await adminApi.getPlans();
    await adminApi.updateSubscription("s1", { status: "active" } as never);
    await adminApi.getLifecyclePermissions();
    await adminApi.saveLifecyclePermissions([{ module_id: "m1" } as never]);
    await adminApi.getDepartments();
  });

  it("covers candidate and change request flows", async () => {
    await candidateApi.getCandidateJobs();
    await candidateApi.getRankedCandidates("j1", "sfia");
    await candidateApi.saveManualRanking("j1", [{ application_id: "a1", rank: 1 }]);
    await candidateApi.getSurveyScore("a1");
    await candidateApi.updateApplicationStatus("a1", "approved");

    await changeRequestApi.getMyChangeRequests();
    await changeRequestApi.getHRChangeRequests("pending");
    await changeRequestApi.submitChangeRequest({
      field_type: "bank",
      requested_changes: { bank_name: "ACME" },
      reason: "update",
    });
    await changeRequestApi.reviewChangeRequest("cr4", { status: "approved", review_reason: "ok" });
  });

  it("covers cnb admin and hr directory endpoints", async () => {
    await cnbAdminApi.getTenantPayrollConfig();
    await cnbAdminApi.updateTenantPayrollConfig({} as never);
    await cnbAdminApi.getStatutoryDeductionConfig();
    await cnbAdminApi.saveStatutoryDeductionConfig({} as never);
    await cnbAdminApi.getTaxBrackets(2026);
    await cnbAdminApi.createTaxBracket({} as never);
    await cnbAdminApi.deleteTaxBracket("b1");

    await hrDirectoryApi.getDirectorySnapshot();
    await hrDirectoryApi.updateDirectoryUser("u1", { first_name: "Ada" } as never);
  });
});

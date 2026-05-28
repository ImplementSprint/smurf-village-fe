import {
  clearAuthStorage,
  getAccessToken,
  getRememberMe,
  getUserInfo,
  parseJwt,
  saveUserInfo,
  setTokens,
  writeAccessToken,
} from "@/lib/authStorage";
import { API_BASE_URL } from "@/lib/api";
import { LEAVE_CATEGORIES } from "@/lib/leaveCategories";
import { roleToPath, portalToPath, portalLabel } from "@/lib/roleMap";
import {
  getDefaultPathForRole,
  getDefaultPathForRoles,
  isHrPathAllowed,
  isHrPathAllowedForRoles,
  isHrRoleName,
} from "@/lib/hrRoleAccess";
import {
  buildFullRoster,
  computeStats,
  deriveStatus,
  formatDisplayDate,
  formatGpsLocation,
  formatHoursFromDecimal,
  formatHoursFromTimestamps,
  formatTime,
  isToday,
  todayPST,
  toDateString,
} from "@/lib/timekeepingUtils";

describe("authStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearAuthStorage();
  });

  it("stores, retrieves, and clears remembered state", () => {
    setTokens({ access_token: "abc", rememberMe: true });
    expect(getAccessToken()).toBe("abc");
    expect(getRememberMe()).toBe(true);

    saveUserInfo({ name: "Ada", email: "ada@example.com", role: "employee" });
    expect(getUserInfo()).toEqual({ name: "Ada", email: "ada@example.com", role: "employee" });

    clearAuthStorage();
    expect(getAccessToken()).toBeNull();
    expect(getRememberMe()).toBe(false);
    expect(getUserInfo()).toBeNull();
  });

  it("parses JWT payloads and falls back on invalid tokens", () => {
    const payload = { sub: "123", role: "hr" };
    const token = [
      "header",
      btoa(JSON.stringify(payload)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", ""),
      "signature",
    ].join(".");

    expect(parseJwt(token)).toMatchObject(payload);
    expect(parseJwt("invalid")).toBeNull();
  });

  it("writes access tokens without local storage", () => {
    writeAccessToken("mem-only");
    expect(getAccessToken()).toBe("mem-only");
    expect(localStorage.getItem("access_token")).toBeNull();
  });
});

describe("role maps", () => {
  it("maps roles and portals to the expected paths", () => {
    expect(roleToPath("HR Officer")).toBe("/hr");
    expect(roleToPath("Applicant")).toBe("/applicant");
    expect(portalToPath("system-admin")).toBe("/system-admin");
    expect(portalLabel("manager")).toBe("Manager Portal");
  });
});

describe("constants", () => {
  it("exposes the API base url and leave categories", () => {
    expect(API_BASE_URL).toContain("/api/");
    expect(LEAVE_CATEGORIES).toHaveLength(6);
    expect(LEAVE_CATEGORIES[0]).toMatchObject({ value: "Sick Leave", label: "Sick Leave" });
  });
});

describe("HR access helpers", () => {
  it("recognizes HR roles and default landing paths", () => {
    expect(isHrRoleName("HR Recruiter")).toBe(true);
    expect(isHrRoleName("Employee")).toBe(false);
    expect(getDefaultPathForRole("HR Recruiter")).toBe("/hr/jobs");
    expect(getDefaultPathForRoles(["HR Interviewer"])).toBe("/hr/jobs");
    expect(getDefaultPathForRoles(["HR Officer", "HR Interviewer"])).toBe("/hr");
  });

  it("checks whether HR routes are allowed", () => {
    expect(isHrPathAllowed("HR Recruiter", "/hr/jobs")).toBe(true);
    expect(isHrPathAllowed("HR Recruiter", "/hr/payroll")).toBe(false);
    expect(isHrPathAllowedForRoles(["HR Recruiter", "HR Compensation and Benefits Officer"], "/hr/payroll")).toBe(true);
  });
});

describe("timekeeping helpers", () => {
  const users = [
    { user_id: "1", employee_id: "E1", first_name: "Ada", last_name: "Lovelace", account_status: "active" },
    { user_id: "2", employee_id: "E2", first_name: "Grace", last_name: "Hopper", account_status: "inactive" },
  ];
  const punches = [
    { log_id: "p1", employee_id: "E1", log_type: "time-in", timestamp: "2026-01-01T01:00:00Z", latitude: 1, longitude: 1, ip_address: null, is_mock_location: "", log_status: "" },
    { log_id: "p2", employee_id: "E1", log_type: "time-out", timestamp: "2026-01-01T09:30:00Z", latitude: 1, longitude: 1, ip_address: null, is_mock_location: "", log_status: "" },
  ] as Parameters<typeof buildFullRoster>[1];

  it("formats time and date helpers", () => {
    expect(formatTime("2026-01-01T01:30:00Z")).toMatch(/:/);
    expect(formatHoursFromDecimal(7.5)).toBe("7h 30m");
    expect(formatHoursFromTimestamps("2026-01-01T01:00:00Z", "2026-01-01T09:00:00Z")).toBe("8h");
    expect(formatGpsLocation(14.5995, 120.9842, null, "coordinates")).toContain(",");
    expect(todayPST()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(toDateString(new Date("2026-01-01T00:00:00Z"))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(formatDisplayDate(new Date("2026-01-01T00:00:00Z"))).toContain("2026");
    expect(isToday(new Date())).toBe(true);
  });

  it("derives roster and stats", () => {
    expect(deriveStatus(null)).toBe("absent");
    const localeSpy = jest.spyOn(Date.prototype, "toLocaleString");
    localeSpy.mockReturnValueOnce("08");
    expect(deriveStatus("2026-01-01T02:00:00Z")).toBe("present");
    localeSpy.mockReturnValueOnce("09");
    expect(deriveStatus("2026-01-01T10:00:00Z")).toBe("late");
    localeSpy.mockRestore();

    const roster = buildFullRoster(users as never, punches);
    expect(roster).toHaveLength(1);
    expect(roster[0]).toMatchObject({
      employee_id: "E1",
      first_name: "Ada",
      status: "late",
    });

    const stats = computeStats([
      { user_id: "1", employee_id: "E1", first_name: "Ada", last_name: "Lovelace", time_in: "a", time_out: "b", hours_worked: 8, status: "present", gps_verified: true },
      { user_id: "2", employee_id: "E2", first_name: "Grace", last_name: "Hopper", time_in: null, time_out: null, hours_worked: null, status: "absent", gps_verified: false },
    ]);
    expect(stats.present).toBe(1);
    expect(stats.absent).toBe(1);
    expect(stats.attendance_rate).toBe(50);
  });
});

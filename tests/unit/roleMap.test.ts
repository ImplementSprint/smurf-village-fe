import { roleToPath } from "../../src/lib/roleMap";

describe("roleToPath", () => {
  it("maps known roles to dashboard paths", () => {
    expect(roleToPath("System Admin")).toBe("/system-admin");
    expect(roleToPath("Admin")).toBe("/admin");
    expect(roleToPath("HR Officer")).toBe("/hr");
    expect(roleToPath("HR Recruiter")).toBe("/hr");
    expect(roleToPath("HR Interviewer")).toBe("/hr");
    expect(roleToPath("Active Employee")).toBe("/employee");
    expect(roleToPath("Employee")).toBe("/employee");
    expect(roleToPath("Applicant")).toBe("/applicant");
    expect(roleToPath("Manager")).toBe("/manager");
    expect(roleToPath("Group Head")).toBe("/manager");
  });

  it("falls back to login for unknown or missing roles", () => {
    expect(roleToPath("Unknown Role")).toBe("/login");
    expect(roleToPath()).toBe("/login");
  });
});
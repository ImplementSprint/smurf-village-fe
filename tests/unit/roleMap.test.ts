import { roleToPath } from "../../src/lib/roleMap";

describe("roleToPath", () => {
  it("maps system/admin roles", () => {
    expect(roleToPath("System Admin")).toBe("/system-admin");
    expect(roleToPath("Admin")).toBe("/admin");
  });

  it("maps HR roles to hr portal", () => {
    expect(roleToPath("HR Officer")).toBe("/hr");
    expect(roleToPath("HR Recruiter")).toBe("/hr");
    expect(roleToPath("HR Interviewer")).toBe("/hr");
  });

  it("maps employee/applicant/manager roles", () => {
    expect(roleToPath("Active Employee")).toBe("/employee");
    expect(roleToPath("Employee")).toBe("/employee");
    expect(roleToPath("Applicant")).toBe("/applicant");
    expect(roleToPath("Manager")).toBe("/manager");
    expect(roleToPath("Group Head")).toBe("/manager");
  });

  it("falls back to login for unknown roles", () => {
    expect(roleToPath("Something Else")).toBe("/login");
    expect(roleToPath()).toBe("/login");
  });
});

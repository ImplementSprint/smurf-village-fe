import {
  getDefaultPathForRole,
  isHrPathAllowed,
  isHrRoleName,
} from "../../src/lib/hrRoleAccess"

describe("hrRoleAccess", () => {
  describe("isHrRoleName", () => {
    it("returns true for a known HR role", () => {
      expect(isHrRoleName("HR Officer")).toBe(true)
    })

    it("returns false for an unknown role", () => {
      expect(isHrRoleName("Admin")).toBe(false)
    })
  })

  describe("getDefaultPathForRole", () => {
    it("returns /hr/jobs for HR Recruiter", () => {
      expect(getDefaultPathForRole("HR Recruiter")).toBe("/hr/jobs")
    })

    it("returns /hr for generic HR Officer", () => {
      expect(getDefaultPathForRole("HR Officer")).toBe("/hr")
    })

    it("defaults to /hr for unknown roles", () => {
      expect(getDefaultPathForRole("Unknown" as any)).toBe("/hr")
    })
  })

  describe("isHrPathAllowed", () => {
    it("allows a valid HR job path for HR Recruiter", () => {
      expect(isHrPathAllowed("HR Recruiter", "/hr/jobs")).toBe(true)
    })

    it("allows nested routes under allowed HR path", () => {
      expect(isHrPathAllowed("HR Officer", "/hr/candidates/view")).toBe(true)
    })

    it("allows self service payslips path regardless of role", () => {
      expect(isHrPathAllowed("HR Interviewer", "/hr/payslips")).toBe(true)
    })

    it("denies access when role is missing", () => {
      expect(isHrPathAllowed(undefined, "/hr/jobs")).toBe(false)
    })

    it("denies disallowed paths for a valid HR role", () => {
      expect(isHrPathAllowed("HR Interviewer", "/admin/users")).toBe(false)
    })
  })
})

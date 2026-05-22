import { portalLabel, portalToPath, roleToPath } from "../../src/lib/roleMap"

describe("roleMap", () => {
  describe("roleToPath", () => {
    it("returns /system-admin for System Admin", () => {
      expect(roleToPath("System Admin")).toBe("/system-admin")
    })

    it("returns /employee for Employee roles", () => {
      expect(roleToPath("Employee")).toBe("/employee")
    })

    it("defaults to /login for unknown roles", () => {
      expect(roleToPath("Unknown Role")).toBe("/login")
    })
  })

  describe("portalToPath", () => {
    it("maps hr portal to /hr", () => {
      expect(portalToPath("hr")).toBe("/hr")
    })

    it("defaults to /login for unknown portal keys", () => {
      expect(portalToPath("unknown" as any)).toBe("/login")
    })
  })

  describe("portalLabel", () => {
    it("returns a human label for employee portal", () => {
      expect(portalLabel("employee")).toBe("Employee Portal")
    })

    it("defaults to Portal when portal key is missing", () => {
      expect(portalLabel(undefined)).toBe("Portal")
    })
  })
})

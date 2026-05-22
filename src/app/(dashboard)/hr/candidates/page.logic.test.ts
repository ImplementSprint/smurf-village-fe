import { formatJobMeta, getSfiaLevelBgColor, getSfiaLevelColor, getSfiaLevelName, normalizeStatus } from "./page";

describe("CandidateEvaluationPage helpers", () => {
  describe("normalizeStatus", () => {
    it("capitalizes and trims underscores and spaces", () => {
      expect(normalizeStatus("interviewing_in_progress")).toBe("Interviewing In Progress");
      expect(normalizeStatus("  final   interview  ")).toBe("Final Interview");
      expect(normalizeStatus("HIRED")).toBe("Hired");
    });
  });

  describe("getSfiaLevelName", () => {
    it("returns known SFIA level names", () => {
      expect(getSfiaLevelName(1)).toBe("Following");
      expect(getSfiaLevelName(4)).toBe("Enabling");
      expect(getSfiaLevelName(7)).toBe("Strategizing");
    });

    it("returns Unknown for an unsupported level", () => {
      expect(getSfiaLevelName(999)).toBe("Unknown");
      expect(getSfiaLevelName(0)).toBe("Unknown");
    });
  });

  describe("getSfiaLevelColor", () => {
    it("returns beginner and intermediate colors", () => {
      expect(getSfiaLevelColor(1)).toBe("bg-red-400");
      expect(getSfiaLevelColor(2)).toBe("bg-red-400");
      expect(getSfiaLevelColor(3)).toBe("bg-amber-400");
      expect(getSfiaLevelColor(4)).toBe("bg-amber-400");
    });

    it("returns advanced and expert colors", () => {
      expect(getSfiaLevelColor(5)).toBe("bg-green-500");
      expect(getSfiaLevelColor(6)).toBe("bg-green-500");
      expect(getSfiaLevelColor(7)).toBe("bg-emerald-600");
      expect(getSfiaLevelColor(999)).toBe("bg-emerald-600");
    });
  });

  describe("getSfiaLevelBgColor", () => {
    it("returns beginner and intermediate bg colors", () => {
      expect(getSfiaLevelBgColor(1)).toBe("bg-red-50");
      expect(getSfiaLevelBgColor(2)).toBe("bg-red-50");
      expect(getSfiaLevelBgColor(3)).toBe("bg-amber-50");
      expect(getSfiaLevelBgColor(4)).toBe("bg-amber-50");
    });

    it("returns advanced and expert bg colors", () => {
      expect(getSfiaLevelBgColor(5)).toBe("bg-green-50");
      expect(getSfiaLevelBgColor(6)).toBe("bg-green-50");
      expect(getSfiaLevelBgColor(7)).toBe("bg-emerald-50");
      expect(getSfiaLevelBgColor(999)).toBe("bg-emerald-50");
    });
  });

  describe("formatJobMeta", () => {
    it("formats job metadata with location and normalized status", () => {
      expect(
        formatJobMeta({
          job_posting_id: "job-1",
          title: "Senior Engineer",
          department_id: "dept-1",
          status: "open_position",
          location: "Remote",
          closes_at: null,
          total_candidates: 12,
        })
      ).toBe("Remote · Open Position · 12 candidates");
    });

    it("omits the candidate count when total_candidates is undefined", () => {
      expect(
        formatJobMeta({
          job_posting_id: "job-2",
          title: "Product Manager",
          department_id: "dept-2",
          status: "open",
          location: "Manila",
          closes_at: null,
        })
      ).toBe("Manila · Open");
    });

    it("handles missing status gracefully", () => {
      expect(
        formatJobMeta({
          job_posting_id: "job-3",
          title: "UX Designer",
          department_id: "dept-3",
          status: "",
          location: "Onsite",
          closes_at: null,
        })
      ).toBe("Onsite");
    });
  });
});

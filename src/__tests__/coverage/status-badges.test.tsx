import { ApplicationStatusBadge, getApplicationStatusStyle, getNormalizedStatusLabel } from "@/components/candidates/ApplicationStatusBadge";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import { TimekeepingStatusBadge } from "@/components/timekeeping/StatusBadge";
import { StatusBadge as SuperAdminStatusBadge } from "@/components/super-admin/StatusBadge";
import { StatusBadge as OnboardingStatusBadge } from "@/components/onboarding/shared/StatusBadge";

describe("status badges", () => {
  it("normalizes and styles application statuses", () => {
    expect(getNormalizedStatusLabel("final interview")).toBe("Final Interview");
    expect(getApplicationStatusStyle("submitted")).toContain("bg-gray-100");
    expect(ApplicationStatusBadge({ status: "screening" })).toMatchObject({
      type: "span",
      props: expect.objectContaining({ children: "Screening" }),
    });
  });

  it("returns badge elements for the other status badges", () => {
    expect(JobStatusBadge({ status: "open" })).toMatchObject({
      type: "span",
      props: expect.objectContaining({ children: expect.arrayContaining([expect.anything(), "open"]) }),
    });

    expect(TimekeepingStatusBadge({ status: "present" })).toMatchObject({ props: expect.any(Object) });
    expect(SuperAdminStatusBadge({ status: "Active" })).toMatchObject({ props: expect.any(Object) });

    expect(OnboardingStatusBadge({ status: "approved" })).toMatchObject({ props: expect.any(Object) });
  });
});

import { timeAgo } from "../../src/lib/timeAgo";

describe("timeAgo", () => {
  const now = new Date("2026-04-13T12:00:00.000Z").getTime();

  beforeEach(() => {
    jest.spyOn(Date, "now").mockReturnValue(now);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns empty string when timestamp is missing", () => {
    expect(timeAgo(undefined)).toBe("");
    expect(timeAgo(null)).toBe("");
  });

  it("formats same-day and yesterday timestamps", () => {
    expect(timeAgo("2026-04-13T06:00:00.000Z")).toBe("Today");
    expect(timeAgo("2026-04-12T11:59:59.000Z")).toBe("Yesterday");
  });

  it("formats day, week, and month ranges", () => {
    expect(timeAgo("2026-04-10T12:00:00.000Z")).toBe("3d ago");
    expect(timeAgo("2026-04-03T12:00:00.000Z")).toBe("1w ago");
    expect(timeAgo("2026-03-01T12:00:00.000Z")).toBe("1mo ago");
  });
});
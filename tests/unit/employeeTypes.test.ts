import {
  STATUS_STYLES,
  formatDate,
  formatDateTime,
  formatInviteCountdown,
} from "../../src/lib/employeeTypes";

describe("STATUS_STYLES", () => {
  it("contains Active, Inactive, and Pending styles", () => {
    expect(STATUS_STYLES.Active).toContain("green");
    expect(STATUS_STYLES.Inactive).toContain("red");
    expect(STATUS_STYLES.Pending).toContain("amber");
  });
});

describe("formatDate", () => {
  it("returns em dash for null", () => {
    expect(formatDate(null)).toBe("—");
  });

  it("returns Unknown for invalid date", () => {
    expect(formatDate("bad-date")).toBe("Unknown");
  });

  it("returns formatted string for valid date", () => {
    const result = formatDate("2026-04-13T00:00:00.000Z");
    expect(result).not.toBe("—");
    expect(result).not.toBe("Unknown");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("formatDateTime", () => {
  it("returns fallback for null", () => {
    expect(formatDateTime(null)).toBe("Never");
    expect(formatDateTime(null, "No active invite")).toBe("No active invite");
  });

  it("returns Unknown for invalid date", () => {
    expect(formatDateTime("bad-date")).toBe("Unknown");
  });

  it("returns formatted string for valid datetime", () => {
    const result = formatDateTime("2026-04-13T08:30:00.000Z");
    expect(result).not.toBe("Never");
    expect(result).not.toBe("Unknown");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("formatInviteCountdown", () => {
  const now = new Date("2026-04-13T12:00:00.000Z").getTime();

  it("handles null and invalid input", () => {
    expect(formatInviteCountdown(null, now)).toBe("No active invite");
    expect(formatInviteCountdown("bad-date", now)).toBe("Unknown");
  });

  it("returns Expired when in the past", () => {
    const past = new Date("2026-04-12T12:00:00.000Z").toISOString();
    expect(formatInviteCountdown(past, now)).toBe("Expired");
  });

  it("formats day, hour, minute, and seconds branches", () => {
    const days = new Date(now + 2 * 86400 * 1000 + 3600 * 1000).toISOString();
    expect(formatInviteCountdown(days, now)).toMatch(/^\d+d \d+h \d+m$/);

    const hours = new Date(now + 3 * 3600 * 1000 + 15 * 60 * 1000 + 30 * 1000).toISOString();
    expect(formatInviteCountdown(hours, now)).toMatch(/^\d+h \d+m \d+s$/);

    const mins = new Date(now + 25 * 60 * 1000 + 10 * 1000).toISOString();
    expect(formatInviteCountdown(mins, now)).toMatch(/^\d+m \d+s$/);

    const secs = new Date(now + 45 * 1000).toISOString();
    expect(formatInviteCountdown(secs, now)).toMatch(/^\d+s$/);
  });
});

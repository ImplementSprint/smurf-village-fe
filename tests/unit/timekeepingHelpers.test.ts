import {
  parseTs,
  toDateString,
  formatDisplayDate,
  isToday,
  formatTime,
  formatHours,
  computeHoursDecimal,
  isLate,
  buildFullRoster,
  computeStats,
  type UserRow,
  type PunchRow,
  type RosterEntry,
} from "../../src/lib/timekeepingHelpers";

describe("timekeepingHelpers basics", () => {
  it("parseTs adds Z when missing", () => {
    const d = parseTs("2026-04-13T01:00:00");
    expect(Number.isNaN(d.getTime())).toBe(false);
    expect(d.toISOString()).toBe("2026-04-13T01:00:00.000Z");
  });

  it("toDateString and formatDisplayDate return non-empty strings", () => {
    const d = new Date("2026-04-13T00:00:00.000Z");
    expect(toDateString(d)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(formatDisplayDate(d).length).toBeGreaterThan(0);
  });

  it("isToday returns true for current date", () => {
    expect(isToday(new Date())).toBe(true);
  });

  it("formatTime and formatHours handle nulls and valid values", () => {
    expect(formatTime(null)).toBe("—");
    expect(formatHours(null, null)).toBe("—");

    const t = formatTime("2026-04-13T01:00:00.000Z");
    expect(t.length).toBeGreaterThan(0);

    const h = formatHours("2026-04-13T01:00:00.000Z", "2026-04-13T09:00:00.000Z");
    expect(h).toBe("8.00h");
  });

  it("computeHoursDecimal handles branches", () => {
    expect(computeHoursDecimal(null, null)).toBeNull();
    expect(computeHoursDecimal("2026-04-13T01:00:00.000Z", "2026-04-13T05:30:00.000Z")).toBe(4.5);
  });

  it("isLate identifies 9AM+ Manila as late", () => {
    expect(isLate("2026-04-13T00:30:00.000Z")).toBe(false); // 08:30 Manila
    expect(isLate("2026-04-13T01:15:00.000Z")).toBe(true);  // 09:15 Manila
  });
});

describe("buildFullRoster and computeStats", () => {
  const users: UserRow[] = [
    { user_id: "u1", employee_id: "e1", first_name: "Ana", last_name: "Santos" },
    { user_id: "u2", employee_id: "e2", first_name: "Ben", last_name: "Cruz" },
    { user_id: "u3", employee_id: "e3", first_name: "Cia", last_name: "Reyes" },
    { user_id: "u4", employee_id: "e4", first_name: "Dan", last_name: "Lee" },
  ];

  const punches: PunchRow[] = [
    {
      log_id: "1",
      employee_id: "e1",
      log_type: "time-in",
      timestamp: "2026-04-13T00:00:00.000Z", // 08:00 Manila -> present if has timeout
      latitude: 14.6,
      longitude: 121.0,
      ip_address: null,
      is_mock_location: "false",
      log_status: "ok",
    },
    {
      log_id: "2",
      employee_id: "e1",
      log_type: "time-out",
      timestamp: "2026-04-13T09:00:00.000Z",
      latitude: 14.6,
      longitude: 121.0,
      ip_address: null,
      is_mock_location: "false",
      log_status: "ok",
    },
    {
      log_id: "3",
      employee_id: "e2",
      log_type: "time-in",
      timestamp: "2026-04-13T01:30:00.000Z", // 09:30 Manila -> late with timeout
      latitude: 14.6,
      longitude: 121.0,
      ip_address: null,
      is_mock_location: "false",
      log_status: "ok",
    },
    {
      log_id: "4",
      employee_id: "e2",
      log_type: "time-out",
      timestamp: "2026-04-13T10:30:00.000Z",
      latitude: 14.6,
      longitude: 121.0,
      ip_address: null,
      is_mock_location: "false",
      log_status: "ok",
    },
    {
      log_id: "5",
      employee_id: "e3",
      log_type: "time-in",
      timestamp: "2026-04-13T00:15:00.000Z", // clocked-in (no timeout)
      latitude: null,
      longitude: null,
      ip_address: null,
      is_mock_location: "false",
      log_status: "ok",
    },
  ];

  it("builds roster with present, late, clocked-in, and absent statuses", () => {
    const roster = buildFullRoster(users, punches);

    const byId = Object.fromEntries(roster.map((r) => [r.employee_id, r])) as Record<string, RosterEntry>;

    expect(byId.e1.status).toBe("present");
    expect(byId.e2.status).toBe("late");
    expect(byId.e3.status).toBe("clocked-in");
    expect(byId.e4.status).toBe("absent");

    expect(byId.e1.gps_verified).toBe(true);
    expect(byId.e3.gps_verified).toBe(false);
    expect(byId.e1.hours_worked).toBe(9);
    expect(byId.e3.hours_worked).toBeNull();
  });

  it("computes aggregate stats from roster", () => {
    const roster = buildFullRoster(users, punches);
    const stats = computeStats(roster);

    expect(stats.total).toBe(4);
    expect(stats.present).toBe(2); // present + clocked-in
    expect(stats.late).toBe(1);
    expect(stats.absent).toBe(1);
    expect(stats.totalHours).toBe(18);
    expect(stats.avgHours).toBe(9);
    expect(stats.attendance_rate).toBe(50);
  });
});

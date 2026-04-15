import {
  buildFullRoster,
  computeStats,
  deriveStatus,
  formatDisplayDate,
  formatHoursFromDecimal,
  formatHoursFromTimestamps,
  formatTime,
  isToday,
  toDateString,
  todayPST,
  type PunchRow,
  type TimekeepingLog,
  type UserRow,
} from "../../src/lib/timekeepingUtils";

describe("timekeepingUtils", () => {
  it("formats time and date helpers", () => {
    expect(formatTime(null)).toBe("—");
    expect(formatHoursFromDecimal(null)).toBe("—");
    expect(formatHoursFromDecimal(2)).toBe("2h");
    expect(formatHoursFromDecimal(1.5)).toBe("1h 30m");

    const from = "2026-04-15T01:00:00Z";
    const to = "2026-04-15T09:30:00Z";
    expect(formatHoursFromTimestamps(from, to)).toBe("8h 30m");
    expect(formatHoursFromTimestamps(null, to)).toBe("—");

    const now = new Date();
    expect(toDateString(now)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(todayPST()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(formatDisplayDate(now)).toContain(",");
    expect(isToday(now)).toBe(true);
    expect(isToday(new Date("2000-01-01T00:00:00Z"))).toBe(false);
  });

  it("derives attendance status from time-in", () => {
    expect(deriveStatus(null)).toBe("absent");
    // 08:30 Asia/Manila
    expect(deriveStatus("2026-04-15T00:30:00Z")).toBe("present");
    // 09:30 Asia/Manila
    expect(deriveStatus("2026-04-15T01:30:00Z")).toBe("late");
  });

  it("builds full roster including absent users and filters inactive", () => {
    const users: UserRow[] = [
      {
        user_id: "u1",
        employee_id: "E-1",
        first_name: "Jane",
        last_name: "Doe",
        account_status: "Active",
      },
      {
        user_id: "u2",
        employee_id: "E-2",
        first_name: null,
        last_name: null,
        account_status: "Active",
      },
      {
        user_id: "u3",
        employee_id: "E-3",
        first_name: "Skip",
        last_name: "Me",
        account_status: "Inactive",
      },
    ];

    const punches: PunchRow[] = [
      {
        log_id: "p1",
        employee_id: "E-1",
        log_type: "time-in",
        timestamp: "2026-04-15T00:30:00Z",
        latitude: 14.59,
        longitude: 120.98,
        ip_address: null,
        is_mock_location: "false",
        log_status: "ok",
      },
      {
        log_id: "p2",
        employee_id: "E-1",
        log_type: "time-out",
        timestamp: "2026-04-15T09:00:00Z",
        latitude: null,
        longitude: null,
        ip_address: null,
        is_mock_location: "false",
        log_status: "ok",
      },
    ];

    const roster = buildFullRoster(users, punches);
    expect(roster).toHaveLength(2);

    expect(roster[0]).toMatchObject({
      user_id: "u1",
      employee_id: "E-1",
      first_name: "Jane",
      last_name: "Doe",
      status: "present",
      gps_verified: true,
    });
    expect(roster[0].hours_worked).toBeCloseTo(8.5, 5);

    expect(roster[1]).toMatchObject({
      user_id: "u2",
      employee_id: "E-2",
      first_name: "Unknown",
      last_name: "",
      status: "absent",
      gps_verified: false,
      time_in: null,
      time_out: null,
      hours_worked: null,
    });
  });

  it("computes aggregate stats", () => {
    const logs: TimekeepingLog[] = [
      {
        user_id: "u1",
        employee_id: "E-1",
        first_name: "A",
        last_name: "A",
        time_in: "2026-04-15T00:30:00Z",
        time_out: "2026-04-15T09:30:00Z",
        hours_worked: 9,
        status: "present",
        gps_verified: true,
      },
      {
        user_id: "u2",
        employee_id: "E-2",
        first_name: "B",
        last_name: "B",
        time_in: null,
        time_out: null,
        hours_worked: null,
        status: "absent",
        gps_verified: false,
      },
      {
        user_id: "u3",
        employee_id: "E-3",
        first_name: "C",
        last_name: "C",
        time_in: "2026-04-15T01:30:00Z",
        time_out: "2026-04-15T10:30:00Z",
        hours_worked: 9,
        status: "late",
        gps_verified: true,
      },
      {
        user_id: "u4",
        employee_id: "E-4",
        first_name: "D",
        last_name: "D",
        time_in: null,
        time_out: null,
        hours_worked: null,
        status: "on-leave",
        gps_verified: false,
      },
    ];

    const stats = computeStats(logs);
    expect(stats).toEqual({
      total: 4,
      present: 1,
      absent: 1,
      late: 1,
      on_leave: 1,
      attendance_rate: 50,
      avg_hours: 9,
    });
  });
});

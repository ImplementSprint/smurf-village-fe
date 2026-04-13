import {
  buildFullRoster,
  computeStats,
  deriveStatus,
  formatHoursFromDecimal,
  formatHoursFromTimestamps,
  type PunchRow,
  type TimekeepingLog,
  type UserRow,
} from "../../src/lib/timekeepingUtils";

describe("timekeepingUtils", () => {
  it("derives absent, present, and late status from time-in", () => {
    expect(deriveStatus(null)).toBe("absent");
    expect(deriveStatus("2026-01-01T00:30:00Z")).toBe("present");
    expect(deriveStatus("2026-01-01T01:00:00Z")).toBe("late");
  });

  it("formats decimal and timestamp-based hours", () => {
    expect(formatHoursFromDecimal(null)).toBe("—");
    expect(formatHoursFromDecimal(2)).toBe("2h");
    expect(formatHoursFromDecimal(1.5)).toBe("1h 30m");

    expect(formatHoursFromTimestamps(null, "2026-01-01T01:30:00Z")).toBe("—");
    expect(formatHoursFromTimestamps("2026-01-01T00:00:00", "2026-01-01T01:30:00")).toBe("1h 30m");
  });

  it("builds full roster from users and punches", () => {
    const users: UserRow[] = [
      {
        user_id: "u1",
        employee_id: "E001",
        first_name: "Alice",
        last_name: "Reyes",
        account_status: "active",
      },
      {
        user_id: "u2",
        employee_id: "E002",
        first_name: "Bob",
        last_name: null,
        account_status: "active",
      },
      {
        user_id: "u3",
        employee_id: "E003",
        first_name: "Inactive",
        last_name: "User",
        account_status: "inactive",
      },
    ];

    const punches: PunchRow[] = [
      {
        log_id: "p1",
        employee_id: "E001",
        log_type: "time-in",
        timestamp: "2026-01-01T00:30:00Z",
        latitude: 14.59,
        longitude: 120.98,
        ip_address: "127.0.0.1",
        is_mock_location: "false",
        log_status: "ok",
      },
      {
        log_id: "p2",
        employee_id: "E001",
        log_type: "time-out",
        timestamp: "2026-01-01T08:30:00Z",
        latitude: 14.59,
        longitude: 120.98,
        ip_address: "127.0.0.1",
        is_mock_location: "false",
        log_status: "ok",
      },
      {
        log_id: "p3",
        employee_id: "E002",
        log_type: "time-in",
        timestamp: "2026-01-01T01:15:00Z",
        latitude: null,
        longitude: null,
        ip_address: "127.0.0.1",
        is_mock_location: "false",
        log_status: "ok",
      },
    ];

    const roster = buildFullRoster(users, punches);

    expect(roster).toHaveLength(2);

    const first = roster.find((r) => r.employee_id === "E001");
    expect(first).toMatchObject({
      first_name: "Alice",
      last_name: "Reyes",
      status: "present",
      gps_verified: true,
    });
    expect(first?.hours_worked).toBeCloseTo(8, 5);

    const second = roster.find((r) => r.employee_id === "E002");
    expect(second).toMatchObject({
      first_name: "Bob",
      last_name: "",
      status: "late",
      gps_verified: false,
      time_out: null,
      hours_worked: null,
    });
  });

  it("computes aggregate stats from logs", () => {
    const logs: TimekeepingLog[] = [
      {
        user_id: "u1",
        employee_id: "E001",
        first_name: "A",
        last_name: "A",
        time_in: "2026-01-01T00:30:00Z",
        time_out: "2026-01-01T08:30:00Z",
        hours_worked: 8,
        status: "present",
        gps_verified: true,
      },
      {
        user_id: "u2",
        employee_id: "E002",
        first_name: "B",
        last_name: "B",
        time_in: "2026-01-01T01:15:00Z",
        time_out: null,
        hours_worked: null,
        status: "late",
        gps_verified: false,
      },
      {
        user_id: "u3",
        employee_id: "E003",
        first_name: "C",
        last_name: "C",
        time_in: null,
        time_out: null,
        hours_worked: null,
        status: "absent",
        gps_verified: false,
      },
      {
        user_id: "u4",
        employee_id: "E004",
        first_name: "D",
        last_name: "D",
        time_in: null,
        time_out: null,
        hours_worked: 6,
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
      avg_hours: 7,
    });
  });
});
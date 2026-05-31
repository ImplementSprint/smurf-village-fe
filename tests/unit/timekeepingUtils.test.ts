import {
  buildFullRoster,
  computeStats,
  deriveStatus,
  formatDisplayDate,
  formatGpsLocation,
  formatHoursFromDecimal,
  formatHoursFromTimestamps,
  formatTime,
  isToday,
  todayPST,
  toDateString,
} from "../../src/lib/timekeepingUtils";

describe("timekeepingUtils", () => {
  it("formats time and hours values", () => {
    expect(formatTime(null)).toBe("—");
    expect(formatTime("2026-05-31T01:00:00Z")).toMatch(/09:00/);
    expect(formatHoursFromDecimal(null)).toBe("—");
    expect(formatHoursFromDecimal(7)).toBe("7h");
    expect(formatHoursFromDecimal(7.5)).toBe("7h 30m");
    expect(formatHoursFromTimestamps(null, "2026-05-31T08:30:00Z")).toBe("—");
    expect(formatHoursFromTimestamps("2026-05-31T00:00:00Z", "2026-05-31T08:30:00Z")).toBe("8h 30m");
  });

  it("formats gps locations in both display modes", () => {
    expect(formatGpsLocation(null, null, null)).toBe("No GPS");
    expect(formatGpsLocation(14.5995, 120.9842, null)).toBe("GPS Location");
    expect(formatGpsLocation(14.5995, 120.9842, "Makati")).toBe("Makati");
    expect(formatGpsLocation(14.5995, 120.9842, null, "coordinates")).toBe("14.5995, 120.9842");
  });

  it("formats dates and checks the current day", () => {
    const sampleDate = new Date("2026-01-15T00:00:00Z");
    expect(todayPST()).toEqual(expect.any(String));
    expect(toDateString(sampleDate)).toEqual(expect.any(String));
    expect(formatDisplayDate(sampleDate)).toEqual(expect.any(String));
    expect(isToday(new Date())).toBe(true);
    expect(isToday(new Date(Date.now() - 48 * 60 * 60 * 1000))).toBe(false);
  });

  it("derives attendance status and aggregates roster stats", () => {
    expect(deriveStatus(null)).toBe("absent");
    expect(deriveStatus("2026-05-31T00:00:00Z")).toBe("present");
    expect(deriveStatus("2026-05-31T01:00:00Z")).toBe("late");

    const logs = buildFullRoster(
      [
        {
          user_id: "u1",
          employee_id: "emp-1",
          first_name: "Juan",
          last_name: "Dela Cruz",
          account_status: "active",
        },
        {
          user_id: "u2",
          employee_id: "emp-2",
          first_name: "Maria",
          last_name: "Santos",
          account_status: "active",
        },
        {
          user_id: "u3",
          employee_id: "emp-3",
          first_name: "Inactive",
          last_name: "Employee",
          account_status: "inactive",
        },
      ],
      [
        {
          log_id: "p1",
          employee_id: "emp-1",
          log_type: "time-in",
          timestamp: "2026-05-31T00:30:00Z",
          latitude: 14.5,
          longitude: 120.9,
          location_name: null,
          ip_address: null,
          is_mock_location: "false",
          log_status: "approved",
        },
        {
          log_id: "p2",
          employee_id: "emp-1",
          log_type: "time-out",
          timestamp: "2026-05-31T09:30:00Z",
          latitude: null,
          longitude: null,
          location_name: null,
          ip_address: null,
          is_mock_location: "false",
          log_status: "approved",
        },
        {
          log_id: "p3",
          employee_id: "emp-2",
          log_type: "time-in",
          timestamp: "2026-05-31T01:00:00Z",
          latitude: null,
          longitude: null,
          location_name: null,
          ip_address: null,
          is_mock_location: "false",
          log_status: "approved",
        },
      ]
    );

    expect(logs).toHaveLength(2);
    expect(logs[0]).toMatchObject({
      user_id: "u1",
      employee_id: "emp-1",
      first_name: "Juan",
      last_name: "Dela Cruz",
      status: "present",
      gps_verified: true,
    });
    expect(logs[1]).toMatchObject({
      user_id: "u2",
      employee_id: "emp-2",
      status: "late",
      gps_verified: false,
    });

    expect(computeStats([
      { ...logs[0], status: "present", hours_worked: 9 },
      { ...logs[1], status: "late", hours_worked: 8.5 },
    ])).toEqual({
      total: 2,
      present: 1,
      absent: 0,
      late: 1,
      on_leave: 0,
      attendance_rate: 100,
      avg_hours: 8.75,
    });
  });
});

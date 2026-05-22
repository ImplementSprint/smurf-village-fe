import {
  buildFullRoster,
  computeStats,
  deriveStatus,
  formatGpsLocation,
  formatHoursFromDecimal,
  formatHoursFromTimestamps,
  formatTime,
  toDateString,
} from "../../src/lib/timekeepingUtils"
import type { PunchRow, UserRow } from "../../src/lib/timekeepingUtils"

describe("timekeepingUtils", () => {
  describe("formatTime", () => {
    it("formats ISO time in Asia/Manila timezone", () => {
      expect(formatTime("2024-01-01T00:00:00Z")).toContain("08:00")
    })

    it("returns a dash when input is null", () => {
      expect(formatTime(null)).toBe("—")
    })
  })

  describe("formatHoursFromDecimal", () => {
    it("formats hours with minutes", () => {
      expect(formatHoursFromDecimal(1.5)).toBe("1h 30m")
    })

    it("formats whole hours without minutes", () => {
      expect(formatHoursFromDecimal(2)).toBe("2h")
    })

    it("returns dash when null", () => {
      expect(formatHoursFromDecimal(null)).toBe("—")
    })
  })

  describe("formatHoursFromTimestamps", () => {
    it("returns formatted duration for valid timestamps", () => {
      expect(
        formatHoursFromTimestamps("2024-01-01T00:00:00Z", "2024-01-01T02:30:00Z")
      ).toBe("2h 30m")
    })

    it("returns dash when timeOut is missing", () => {
      expect(formatHoursFromTimestamps("2024-01-01T00:00:00Z", null)).toBe("—")
    })
  })

  describe("formatGpsLocation", () => {
    it("returns trimmed location name in place mode", () => {
      expect(formatGpsLocation(14.0, 121.0, "  Manila  ")).toBe("Manila")
    })

    it("returns No GPS when place mode has no location name and missing coordinates", () => {
      expect(formatGpsLocation(null, null, null)).toBe("No GPS")
    })

    it("returns GPS Location when place mode has coordinates and no location name", () => {
      expect(formatGpsLocation(14.0, 121.0, "")).toBe("GPS Location")
    })

    it("returns coordinates when mode is coordinates", () => {
      expect(formatGpsLocation(14.123456, 121.123456, null, "coordinates")).toBe(
        "14.1235, 121.1235"
      )
    })
  })

  describe("deriveStatus", () => {
    it("returns present for a morning timestamp", () => {
      expect(deriveStatus("2024-01-01T00:00:00Z")).toBe("present")
    })

    it("returns late for a timestamp at or after 9 AM PST", () => {
      expect(deriveStatus("2024-01-01T02:00:00Z")).toBe("late")
    })

    it("returns absent when no timeIn provided", () => {
      expect(deriveStatus(null as any)).toBe("absent")
    })
  })

  describe("buildFullRoster and computeStats", () => {
    const users: UserRow[] = [
      {
        user_id: "1",
        employee_id: "e1",
        first_name: "Alice",
        last_name: "Smith",
        account_status: "active",
      },
      {
        user_id: "2",
        employee_id: "e2",
        first_name: null,
        last_name: null,
        account_status: "active",
      },
    ]

    const punches: PunchRow[] = [
      {
        log_id: "p1",
        employee_id: "e1",
        log_type: "time-in",
        timestamp: "2024-01-01T00:00:00Z",
        latitude: 14,
        longitude: 121,
        location_name: "Manila",
        ip_address: null,
        is_mock_location: "false",
        log_status: "ok",
      },
      {
        log_id: "p2",
        employee_id: "e1",
        log_type: "time-out",
        timestamp: "2024-01-01T02:00:00Z",
        latitude: 14,
        longitude: 121,
        location_name: "Manila",
        ip_address: null,
        is_mock_location: "false",
        log_status: "ok",
      },
    ]

    it("builds a full roster with absent and present users", () => {
      const roster = buildFullRoster(users, punches)

      expect(roster).toHaveLength(2)
      expect(roster[0]).toMatchObject({
        employee_id: "e1",
        first_name: "Alice",
        last_name: "Smith",
        status: "present",
        gps_verified: true,
      })
      expect(roster[1]).toMatchObject({
        employee_id: "e2",
        first_name: "Unknown",
        last_name: "",
        status: "absent",
        gps_verified: false,
      })
    })

    it("computes stats for the roster correctly", () => {
      const roster = buildFullRoster(users, punches)
      const stats = computeStats(roster)

      expect(stats).toMatchObject({
        total: 2,
        present: 1,
        absent: 1,
        late: 0,
        on_leave: 0,
        attendance_rate: 50,
      })
      expect(stats.avg_hours).toBeGreaterThan(0)
    })
  })

  describe("toDateString", () => {
    it("formats a Date object to en-CA format in Manila timezone", () => {
      const value = toDateString(new Date("2024-01-01T12:00:00Z"))
      expect(value).toBe("2024-01-01")
    })
  })
})

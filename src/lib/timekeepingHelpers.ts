// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRow = {
  user_id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
};

export type PunchRow = {
  log_id: string;
  employee_id: string;
  log_type: "time-in" | "time-out";
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
  ip_address: string | null;
  is_mock_location: string;
  log_status: string;
};

export type RosterEntry = {
  employee_id: string;
  first_name: string;
  last_name: string;
  time_in: string | null;
  time_out: string | null;
  hours_worked: number | null;
  status: "present" | "late" | "clocked-in" | "absent";
  gps_verified: boolean;
};

export type TimekeepingStats = {
  total: number;
  present: number;
  late: number;
  absent: number;
  totalHours: number;
  avgHours: number;
  attendance_rate: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Supabase returns `timestamp without time zone` without Z — force UTC parsing
export function parseTs(ts: string): Date {
  return new Date(ts.includes("Z") || ts.includes("+") ? ts : ts + "Z");
}

export function toDateString(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
}

export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short", month: "long", day: "numeric", year: "numeric",
    timeZone: "Asia/Manila",
  });
}

export function isToday(date: Date): boolean {
  return toDateString(date) === toDateString(new Date());
}

export function formatTime(timestamp: string | null): string {
  if (!timestamp) return "—";
  return parseTs(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
    timeZone: "Asia/Manila",
  });
}

export function formatHours(timeIn: string | null, timeOut: string | null): string {
  if (!timeIn || !timeOut) return "—";
  const diff = (parseTs(timeOut).getTime() - parseTs(timeIn).getTime()) / 3600000;
  return `${diff.toFixed(2)}h`;
}

export function computeHoursDecimal(timeIn: string | null, timeOut: string | null): number | null {
  if (!timeIn || !timeOut) return null;
  return (parseTs(timeOut).getTime() - parseTs(timeIn).getTime()) / 3600000;
}

export function isLate(timeIn: string): boolean {
  const hourPST = Number.parseInt(
    parseTs(timeIn).toLocaleString("en-US", {
      hour: "numeric", hour12: false, timeZone: "Asia/Manila",
    }), 10
  );
  return hourPST >= 9;
}

export function buildFullRoster(users: UserRow[], punches: PunchRow[]): RosterEntry[] {
  const punchMap: Record<string, { clockIn: PunchRow | null; clockOut: PunchRow | null }> = {};

  for (const punch of punches) {
    if (!punchMap[punch.employee_id]) {
      punchMap[punch.employee_id] = { clockIn: null, clockOut: null };
    }
    if (punch.log_type === "time-in" && !punchMap[punch.employee_id].clockIn) {
      punchMap[punch.employee_id].clockIn = punch;
    }
    if (punch.log_type === "time-out") {
      punchMap[punch.employee_id].clockOut = punch;
    }
  }

  return users.map(user => {
    const entry    = punchMap[user.employee_id];
    const clockIn  = entry?.clockIn  ?? null;
    const clockOut = entry?.clockOut ?? null;

    const time_in  = clockIn?.timestamp  ?? null;
    const time_out = clockOut?.timestamp ?? null;
    const gps_verified = !!(clockIn?.latitude && clockIn?.longitude);

    let status: RosterEntry["status"] = "absent";
    if (time_in && time_out) {
      status = isLate(time_in) ? "late" : "present";
    } else if (time_in && !time_out) {
      status = "clocked-in";
    }

    return {
      employee_id: user.employee_id,
      first_name: user.first_name,
      last_name: user.last_name,
      time_in,
      time_out,
      hours_worked: computeHoursDecimal(time_in, time_out),
      status,
      gps_verified,
    };
  });
}

export function computeStats(roster: RosterEntry[]): TimekeepingStats {
  const total   = roster.length;
  const present = roster.filter(r => r.status === "present" || r.status === "clocked-in").length;
  const late    = roster.filter(r => r.status === "late").length;
  const absent  = roster.filter(r => r.status === "absent").length;
  const totalHours = roster.reduce((sum, r) => sum + (r.hours_worked ?? 0), 0);
  const avgHours   = present > 0 ? totalHours / present : 0;
  const attendance_rate = total > 0 ? Math.round((present / total) * 100) : 0;
  return { total, present, late, absent, totalHours, avgHours, attendance_rate };
}

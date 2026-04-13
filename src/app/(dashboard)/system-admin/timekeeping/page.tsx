"use client";

import { Users, TrendingUp, Timer, BarChart2 } from "lucide-react";
import TimekeepingDashboard, { StatCard, type TimekeepingStats } from "@/components/timekeeping/TimekeepingDashboard";

export default function SystemAdminTimekeepingPage() {
  return (
    <TimekeepingDashboard
      title="Timekeeping Management"
      subtitle="Platform-wide attendance and compliance tracking"
      searchPlaceholder="Search by name or ID..."
      renderStatCards={(stats: TimekeepingStats) => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users}      label="Total Employees"   value={String(stats.total)}                sub="tracked"                             colorClass="bg-primary/10 text-primary" />
          <StatCard icon={TrendingUp} label="Attendance Rate"   value={`${stats.attendance_rate}%`}        sub={`${stats.present} present`}          colorClass="bg-green-50 text-green-600" />
          <StatCard icon={BarChart2}  label="Total Hours"       value={`${stats.totalHours.toFixed(1)}h`}  sub={`${stats.avgHours.toFixed(1)}h avg`} colorClass="bg-blue-50 text-blue-600" />
          <StatCard icon={Timer}      label="Compliance Issues" value={String(stats.late + stats.absent)}  sub="late + absent"                       colorClass="bg-red-50 text-red-600" />
        </div>
      )}
    />
  );
}

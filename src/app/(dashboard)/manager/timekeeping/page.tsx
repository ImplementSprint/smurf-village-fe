"use client";

import { Users, CheckCircle2, Timer, Clock } from "lucide-react";
import TimekeepingDashboard, { StatCard, type TimekeepingStats } from "@/components/timekeeping/TimekeepingDashboard";

export default function ManagerTimekeepingPage() {
  return (
    <TimekeepingDashboard
      title="Team Timekeeping"
      subtitle="Monitor your team's daily attendance and compliance"
      searchPlaceholder="Search employees..."
      renderStatCards={(stats: TimekeepingStats) => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users}        label="Total Team"    value={String(stats.total)}             sub="employees"                              colorClass="bg-primary/10 text-primary" />
          <StatCard icon={CheckCircle2} label="Present Today" value={String(stats.present)}           sub={`${stats.attendance_rate}% attendance`} colorClass="bg-green-50 text-green-600" />
          <StatCard icon={Timer}        label="Late Arrivals" value={String(stats.late)}              sub="needs follow-up"                        colorClass="bg-amber-50 text-amber-600" />
          <StatCard icon={Clock}        label="Avg Hours"     value={`${stats.avgHours.toFixed(1)}h`} sub="per employee"                           colorClass="bg-blue-50 text-blue-600" />
        </div>
      )}
    />
  );
}

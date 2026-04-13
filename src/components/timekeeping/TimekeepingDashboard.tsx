"use client";

import type React from "react";
import { useState, useMemo, useEffect } from "react";
import {
  Clock, Search, ChevronLeft, ChevronRight,
  MapPin, MapPinOff,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authFetch } from "@/lib/authApi";
import { API_BASE_URL } from "@/lib/api";
import {
  type UserRow, type PunchRow, type RosterEntry, type TimekeepingStats,
  toDateString, formatDisplayDate, isToday, formatTime, formatHours,
  buildFullRoster, computeStats,
} from "@/lib/timekeepingHelpers";
export type { TimekeepingStats } from "@/lib/timekeepingHelpers";

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<RosterEntry["status"], { label: string; className: string }> = {
  "present":    { label: "Present",    className: "bg-green-100 text-green-700 border border-green-200" },
  "late":       { label: "Late",       className: "bg-amber-100 text-amber-700 border border-amber-200" },
  "clocked-in": { label: "Clocked In", className: "bg-blue-100 text-blue-700 border border-blue-200" },
  "absent":     { label: "Absent",     className: "bg-red-100 text-red-700 border border-red-200" },
};

function StatusBadge({ status }: { readonly status: RosterEntry["status"] }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

export function StatCard({
  icon: Icon, label, value, sub, colorClass,
}: {
  readonly icon: React.ElementType;
  readonly label: string;
  readonly value: string;
  readonly sub: string;
  readonly colorClass: string;
}) {
  return (
    <Card className="p-5 border-border">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </Card>
  );
}

// ─── Filter options ───────────────────────────────────────────────────────────

type StatusFilter = RosterEntry["status"] | "all";

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all",        label: "All" },
  { value: "present",    label: "Present" },
  { value: "absent",     label: "Absent" },
  { value: "late",       label: "Late" },
  { value: "clocked-in", label: "Clocked In" },
];

const ITEMS_PER_PAGE = 8;

// ─── Dashboard ────────────────────────────────────────────────────────────────

interface TimekeepingDashboardProps {
  title: string;
  subtitle: string;
  renderStatCards: (stats: TimekeepingStats) => React.ReactNode;
  searchPlaceholder?: string;
}

export default function TimekeepingDashboard({
  title,
  subtitle,
  renderStatCards,
  searchPlaceholder = "Search employees...",
}: TimekeepingDashboardProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [roster, setRoster]             = useState<RosterEntry[]>([]);
  const [loading, setLoading]           = useState(true);
  const [fetchError, setFetchError]     = useState(false);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage]                 = useState(1);

  useEffect(() => {
    setLoading(true);
    setFetchError(false);
    setPage(1);

    const dateStr = toDateString(selectedDate);

    Promise.all([
      authFetch(`${API_BASE_URL}/timekeeping/employees`)
        .then(r => { if (!r.ok) { throw new Error("Failed to fetch employees"); } return r.json() as Promise<UserRow[]>; }),
      authFetch(`${API_BASE_URL}/timekeeping/timesheets?from=${dateStr}&to=${dateStr}`)
        .then(r => { if (!r.ok) { throw new Error("Failed to fetch timesheets"); } return r.json() as Promise<PunchRow[]>; }),
    ])
      .then(([users, punches]) => setRoster(buildFullRoster(users, punches)))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  const stats    = useMemo(() => computeStats(roster), [roster]);
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return roster.filter(r => {
      const name = `${r.first_name} ${r.last_name}`.toLowerCase();
      const matchSearch = name.includes(q) || r.employee_id.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [roster, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged      = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  function goToPrev()  { setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; }); }
  function goToNext()  { setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; }); }
  function goToToday() { setSelectedDate(new Date()); }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Header + Date Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={goToPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={isToday(selectedDate) ? "default" : "outline"}
            className="h-9 px-4 text-sm font-semibold"
            onClick={goToToday}
          >
            {isToday(selectedDate) ? "Today" : "Go to Today"}
          </Button>
          <div className="h-9 px-4 flex items-center border border-border rounded-md text-sm font-medium bg-background min-w-40 justify-center">
            {formatDisplayDate(selectedDate)}
          </div>
          <Button
            variant="outline" size="icon" className="h-9 w-9"
            onClick={goToNext} disabled={isToday(selectedDate)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      {renderStatCards(stats)}

      {/* Table */}
      <Card className="border-border overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-6 bg-muted/20 border-b border-border">
          <div className="flex gap-1.5 flex-wrap">
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => { setStatusFilter(opt.value); setPage(1); }}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-colors ${
                  statusFilter === opt.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 h-9 w-52 bg-background"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-bold text-muted-foreground bg-muted/30 border-b border-border uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Time In</th>
                <th className="px-6 py-4">Time Out</th>
                <th className="px-6 py-4">Hours</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">GPS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-muted-foreground text-sm">Loading timekeeping data...</td></tr>
              ) : fetchError ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-destructive text-sm">Failed to load data. Please refresh or contact support.</td></tr>
              ) : paged.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-muted-foreground text-sm">
                  {search || statusFilter !== "all" ? "No records match your search." : "No entries found for this date."}
                </td></tr>
              ) : paged.map(log => (
                <tr key={log.employee_id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xs border border-primary/5 shrink-0">
                        {log.first_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{`${log.first_name} ${log.last_name}`.trim()}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{log.employee_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium">{formatTime(log.time_in)}</td>
                  <td className="px-6 py-4 text-xs font-medium">{formatTime(log.time_out)}</td>
                  <td className="px-6 py-4 text-xs font-medium">{formatHours(log.time_in, log.time_out)}</td>
                  <td className="px-6 py-4"><StatusBadge status={log.status} /></td>
                  <td className="px-6 py-4">
                    {log.status === "absent" ? (
                      <span className="text-muted-foreground text-xs">—</span>
                    ) : log.gps_verified ? (
                      <div className="flex items-center gap-1.5 text-green-600">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPinOff className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">No GPS</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-muted/10 border-t border-border flex items-center justify-between">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {filtered.length > 0
              ? `Showing ${(page - 1) * ITEMS_PER_PAGE + 1}–${Math.min(page * ITEMS_PER_PAGE, filtered.length)} of ${filtered.length}`
              : "No results"}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1"
              onClick={() => setPage(p => p - 1)} disabled={page === 1 || totalPages === 0}>
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1"
              onClick={() => setPage(p => p + 1)} disabled={page === totalPages || totalPages === 0}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

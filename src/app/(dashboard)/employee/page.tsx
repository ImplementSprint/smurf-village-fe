"use client";
import { useEffect, useState } from "react";
import { getUserInfo, type StoredUser } from "@/lib/authStorage";
import { useWelcomeToast } from "@/lib/useWelcomeToast";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User, Briefcase, CheckCircle2, Upload,
  FileText, Shield, Clock, ChevronRight
} from "lucide-react";

export default function EmployeeDashboardPage() {
  const [session, setSession] = useState<StoredUser | null>(null);

  useEffect(() => {
    setSession(getUserInfo());
  }, []);

  useWelcomeToast(session?.name || "Employee", "Staff Portal");

  // TODO: replace with GET /employees/:id — needs start_date, onboarding completion %
  const checklist = [
    { title: "Upload Identification Documents", status: "Pending", icon: Upload,   locked: false },
    { title: "Review Employee Handbook",        status: "Pending", icon: FileText,  locked: false },
    { title: "Complete Tax Forms",              status: "Pending", icon: FileText,  locked: false },
    { title: "Set Up Direct Deposit",           status: "Pending", icon: Briefcase, locked: false },
    { title: "IT Security Training",            status: "Locked",  icon: Shield,    locked: true  },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">

      <section className="relative overflow-hidden rounded-[26px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#172554_52%,#134e4a_100%)] px-6 py-7 text-white shadow-sm md:px-7 md:py-8">
        <div className="absolute inset-y-0 right-0 w-72 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.20),transparent_60%)]" />
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">Employee Portal</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">Welcome, {session?.name || "Employee"}!</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/75">
            Here&apos;s a quick overview of your profile and onboarding progress. Complete your checklist to get started.
          </p>
        </div>
      </section>

      <div className="grid md:grid-cols-[1fr_1.5fr] gap-6 items-start">

        <Card className="border-border shadow-sm rounded-xl bg-card">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <User className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-bold">Profile Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <ProfileField label="FULL NAME"    value={session?.name || "—"} />
            <ProfileField label="ROLE"         value={session?.role === "employee" ? "Internal Staff" : session?.role || "—"} />
            {/* TODO: replace "—" with start_date from GET /employees/:id */}
            <ProfileField label="MEMBER SINCE" value="—" />
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm rounded-xl bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 text-green-600 rounded-lg">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg font-bold">Onboarding Progress</CardTitle>
              </div>
              {/* TODO: replace with real completion % from GET /employees/:id */}
              <span className="font-bold text-primary text-sm bg-primary/5 px-3 py-1 rounded-full">0% Complete</span>
            </div>
            <Progress value={0} className="mt-6 h-2" />
          </CardHeader>
          <CardContent className="mt-4 space-y-3">
            {checklist.map((item, idx) => (
              <ChecklistItem key={idx} item={item} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl border border-border bg-muted/30 group hover:bg-muted/50 transition-colors">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <p className="font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ChecklistItem({ item }: any) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
      item.locked
        ? "bg-muted/20 border-border opacity-50 grayscale"
        : "bg-card border-border hover:border-primary/50 hover:shadow-md cursor-pointer group"
    }`}>
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg ${item.locked ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
          <item.icon className="h-4 w-4" />
        </div>
        <div>
          <span className={`font-semibold block ${item.locked ? "text-muted-foreground" : "text-foreground"}`}>
            {item.title}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase font-medium">Requirement</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${
          item.locked ? "text-muted-foreground bg-muted" : "text-amber-600 bg-amber-50 border border-amber-100"
        }`}>
          {!item.locked && <Clock className="h-3 w-3" />}
          {item.status}
        </div>
        {!item.locked && <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />}
      </div>
    </div>
  );
}

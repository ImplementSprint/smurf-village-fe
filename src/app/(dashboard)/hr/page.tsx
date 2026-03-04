"use client";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, FileText, UserPlus, MoreHorizontal, Filter, 
  Download, CheckCircle2, X, Search, ChevronLeft, ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HRDashboardPage() {
  const [isToastVisible, setIsToastVisible] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const pipelineData = [
    { initials: "S", name: "Sarah Connor", email: "sarah.c@company.com", role: "Product Designer", dept: "Design", status: "In Progress", progress: 45 },
    { initials: "M", name: "Michael Chen", email: "m.chen@company.com", role: "Software Engineer", dept: "Engineering", status: "Reviewing", progress: 80 },
    { initials: "J", name: "Jessica Day", email: "j.day@company.com", role: "Marketing Specialist", dept: "Marketing", status: "Pending", progress: 10 },
    { initials: "D", name: "David Miller", email: "d.miller@company.com", role: "Sales Associate", dept: "Sales", status: "Completed", progress: 100 },
    { initials: "E", name: "Emily Wilson", email: "e.wilson@company.com", role: "HR Coordinator", dept: "Human Resources", status: "In Progress", progress: 30 },
    { initials: "A", name: "Alex Thompson", email: "a.thompson@company.com", role: "DevOps Engineer", dept: "Engineering", status: "Reviewing", progress: 70 },
  ];

  const filteredData = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return pipelineData.filter(emp => 
      emp.name.toLowerCase().includes(lowerSearch) || 
      emp.role.toLowerCase().includes(lowerSearch) || 
      emp.dept.toLowerCase().includes(lowerSearch)
    );
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentTableData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
  

      {/* Brand-Aligned Toast - Moved to Top Right below Topbar */}
      {isToastVisible && (
        <div className="fixed top-20 right-8 flex items-center gap-3 bg-card border border-border px-4 py-3 rounded-xl shadow-2xl z-50 animate-in slide-in-from-top-5">
          <div className="bg-green-500/10 p-1.5 rounded-full">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold">Authenticated</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-tight">HR Administrator Access</span>
          </div>
          <button onClick={() => setIsToastVisible(false)} className="ml-4 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard icon={Users} label="Total Headcount" value="1,248" sub="Active Employees" trend="+12%" />
        <MetricCard icon={FileText} label="Pending Verifications" value="15" sub="Action Required" trend="Critical" isAlert />
        <MetricCard icon={UserPlus} label="New Hires" value="28" sub="Onboarding" trend="+5" />
      </div>

      {/* Pipeline Table */}
      <Card className="border-border overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 bg-muted/20">
          <div>
            <CardTitle className="text-lg font-bold">Onboarding Pipeline</CardTitle>
            <p className="text-xs text-muted-foreground">Monitor candidate progress and document status</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search candidates..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-9 w-64 h-9 bg-background" 
              />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9"><Filter className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="h-9 w-9"><Download className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-bold text-muted-foreground bg-muted/30 border-y border-border uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Role & Dept</th>
                <th className="px-6 py-4">Status & Progress</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {currentTableData.map((row, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="h-9 w-9 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xs border border-primary/5">
                      {row.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{row.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-medium">{row.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-foreground font-medium">{row.role}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">{row.dept}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 w-32">
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-bold uppercase tracking-tight ${row.progress === 100 ? 'text-green-600' : 'text-primary'}`}>
                          {row.status}
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">{row.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-700 ${row.progress === 100 ? 'bg-green-500' : 'bg-primary'}`} 
                          style={{ width: `${row.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Standardized Pagination */}
        <div className="p-4 bg-muted/10 border-t border-border flex items-center justify-between">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="h-8 gap-1">
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="h-8 gap-1">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub, trend, isAlert }: any) {
  return (
    <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-lg ${isAlert ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
            <Icon className="h-5 w-5" />
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${isAlert ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground uppercase"}`}>
            {trend}
          </span>
        </div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
        <h2 className="text-2xl font-bold tracking-tight">{value}</h2>
        <p className="text-xs text-muted-foreground font-medium">{sub}</p>
      </CardContent>
    </Card>
  );
}
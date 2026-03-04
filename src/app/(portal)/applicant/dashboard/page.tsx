"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Check, 
  Briefcase, 
  MapPin, 
  Clock, 
  Search, 
  ChevronRight, 
  Building2 
} from "lucide-react";

export default function ApplicantDashboardPage() {
  const jobRoles = [
    { title: "Product Manager", dept: "Product", location: "San Francisco, CA", time: "2 days ago", type: "Full-time" },
    { title: "UX/UI Designer", dept: "Design", location: "Remote", time: "5 hours ago", type: "Contract" },
    { title: "DevOps Engineer", dept: "Engineering", location: "New York, NY", time: "1 week ago", type: "Full-time" },
    { title: "Data Scientist", dept: "Data", location: "Boston, MA", time: "3 days ago", type: "Full-time" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      
      {/* Application Status Tracker - Updated to match HR Card Format */}
      <Card className="border-border shadow-sm overflow-hidden bg-card">
        <CardHeader className="bg-muted/20 border-b border-border pb-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Current Application</p>
              <CardTitle className="text-xl font-bold tracking-tight">Status: In Review</CardTitle>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> Senior Software Engineer at Tech Corp
              </p>
            </div>
            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-tight rounded-full border border-primary/20">
              Active Phase
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-10">
          {/* Visual Step Tracker - Using System Primary */}
          <div className="relative flex items-center justify-between w-full max-w-4xl mx-auto">
            {/* Background Lines */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full z-0"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[66%] h-1 bg-primary rounded-full z-0 transition-all duration-1000"></div>

            {/* Steps - Formatted for Professional Hierarchy */}
            <StepItem icon={<Check className="h-4 w-4" />} label="Applied" active completed />
            <StepItem icon={<Check className="h-4 w-4" />} label="Screening" active completed />
            <StepItem icon={<span className="text-xs">3</span>} label="Interview" active current />
            <StepItem icon={<span className="text-xs">4</span>} label="Offer" />
          </div>
        </CardContent>
      </Card>

      {/* Available Job Roles */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Available Positions</h2>
            <p className="text-xs text-muted-foreground mt-1">Discover roles that match your expertise and preferences</p>
          </div>
          <div className="relative w-full md:w-72">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input 
                type="text" 
                placeholder="Search jobs..." 
                className="pl-9 h-10 bg-card border-border focus-visible:ring-primary/20" 
             />
          </div>
        </div>

        <div className="grid gap-3">
          {jobRoles.map((job, i) => (
            <Card key={i} className="border-border shadow-sm hover:border-primary/40 transition-all group cursor-pointer bg-card">
              <CardContent className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full">
                  <div className="h-12 w-12 rounded-xl border border-border bg-muted/30 flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors">
                    <Briefcase className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground text-lg leading-none mb-2 group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground font-semibold uppercase tracking-tight">
                      <span className="flex items-center gap-1.5"><Building2 className="h-3 w-3"/> {job.dept}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3"/> {job.location}</span>
                      <span className="flex items-center gap-1.5"><Clock className="h-3 w-3"/> {job.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  <span className="text-[10px] font-bold text-muted-foreground border border-border px-3 py-1.5 rounded-lg uppercase tracking-widest bg-muted/20">
                    {job.type}
                  </span>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-6 group-hover:translate-x-1 transition-transform">
                    Apply Now <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center pt-2">
           <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 text-sm uppercase tracking-widest">
             View all 24 open positions
           </Button>
        </div>
      </div>
    </div>
  );
}

// Sub-component for Step Items to keep code clean
function StepItem({ icon, label, active, completed, current }: any) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-3 bg-card px-3">
      <div className={`
        h-10 w-10 rounded-full flex items-center justify-center border-4 border-card shadow-md transition-all duration-500
        ${completed ? 'bg-primary text-primary-foreground' : ''}
        ${current ? 'bg-card border-primary text-primary ring-4 ring-primary/10' : ''}
        ${!active ? 'bg-muted text-muted-foreground border-muted' : ''}
      `}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-primary' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  );
}
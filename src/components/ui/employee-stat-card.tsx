"use client";

import { Card, CardContent } from "@/components/ui/card";

export function EmployeeStatCard({
  label, value, sub, color,
}: {
  readonly label: string;
  readonly value: number;
  readonly sub: string;
  readonly color: string;
}) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  );
}

"use client";

import { STATUS_STYLES } from "@/lib/employeeTypes";

export function EmployeeStatusBadge({ status }: { readonly status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${style}`}>
      {status}
    </span>
  );
}

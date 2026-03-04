"use client";

import { useState, useLayoutEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getRefreshToken, getUserInfo } from "@/lib/authStorage";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

type UserRole = "hr" | "manager" | "employee" | "applicant" | "admin" | "system-admin";

export default function SharedDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useLayoutEffect(() => {
    const token = getRefreshToken();
    const userInfo = getUserInfo();

    if (!token || !userInfo) {
      router.replace("/login");
      return;
    }

    const userRole = userInfo.role as UserRole;

    // Strict Persona Guard: prevents a Manager from viewing /hr pages, etc.
    const isAccessingWrongDashboard =
      (pathname.startsWith("/hr") && userRole !== "hr") ||
      (pathname.startsWith("/manager") && userRole !== "manager") ||
      (pathname.startsWith("/employee") && userRole !== "employee") ||
      (pathname.startsWith("/applicant") && userRole !== "applicant") ||
      (pathname.startsWith("/admin") && !pathname.startsWith("/system-admin") && userRole !== "admin") ||
      (pathname.startsWith("/system-admin") && userRole !== "system-admin");

    if (isAccessingWrongDashboard) {
      router.replace(`/${userRole}`);
      return;
    }

    setRole(userRole);
    setIsAuthorized(true);
  }, [pathname, router]);

  if (!isAuthorized || !role) {
    return null;
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
      <Sidebar persona={role} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar persona={role} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

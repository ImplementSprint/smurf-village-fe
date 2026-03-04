"use client";

import { useEffect, useState } from "react";
import { parseJwt, getAccessToken } from "@/lib/authStorage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Settings, LayoutDashboard } from "lucide-react";

export default function AdminDashboardPage() {
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    const decoded = parseJwt(token);
    const first = decoded?.first_name || "";
    const last = decoded?.last_name || "";
    const full = (first + " " + last).trim();
    setAdminName(full || decoded?.username || decoded?.email || "Admin");
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative bg-[#7c3aed] overflow-hidden rounded-xl p-8 text-white shadow-sm h-48 flex flex-col justify-center">
        <div className="absolute top-0 right-10 w-48 h-48 bg-white/10 rounded-full -translate-y-1/4 translate-x-1/4"></div>
        <div className="absolute bottom-0 right-32 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-bold mb-3">Welcome, {adminName}!</h1>
          <p className="text-white/80 text-sm leading-relaxed">
            You are logged in as an Administrator. Manage users and platform settings from here.
          </p>
        </div>
      </div>

      {/* Placeholder Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-gray-100 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold text-gray-900">Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Admin overview coming soon.</p>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Users className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold text-gray-900">Users</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">User management coming soon.</p>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Settings className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold text-gray-900">Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Settings coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

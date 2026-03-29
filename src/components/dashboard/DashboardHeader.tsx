"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Building2 } from "lucide-react";
import NotificationBell from "@/components/dashboard/NotificationBell";

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  SUPER_ADMIN: { label: "Super Admin", className: "bg-red-100 text-red-700 border-red-200" },
  ADMIN:       { label: "Admin",       className: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  MANAGER:     { label: "Manager",     className: "bg-blue-100 text-blue-700 border-blue-200" },
  EMPLOYEE:    { label: "Employee",    className: "bg-gray-100 text-gray-600 border-gray-200" },
};

export default function DashboardHeader() {
  const auth = useAuth();
  const { role } = useRole();

  useEffect(() => {
    if (!auth?.isHydrated) return;
    if (!auth.token) return;
    auth.refreshProfile().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.isHydrated, auth?.token]);

  const companyName = auth?.company?.name ?? "Company";
  const userEmail = auth?.currentUser?.email ?? "";
  const userName = auth?.currentUser?.name ?? userEmail;
  const roleBadge = ROLE_BADGE[role] ?? ROLE_BADGE.EMPLOYEE;

  return (
    <div className="sticky top-0 z-10 -mx-6 mb-6 border-b bg-white/80 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex items-center justify-between gap-4">
        {/* Left — company + user info */}
        <div className="min-w-0 flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100">
            <Building2 className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 truncate">
                {companyName}
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 font-medium hidden sm:flex ${roleBadge.className}`}
              >
                {roleBadge.label}
              </Badge>
            </div>
            <p className="text-xs text-gray-400 truncate">
              {userName !== userEmail ? `${userName} · ${userEmail}` : userEmail}
            </p>
          </div>
        </div>

        {/* Right — notifications + logout */}
        <div className="flex items-center gap-2">
          <NotificationBell />

          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-gray-600 hover:text-red-600 hover:border-red-200 transition-colors"
            onClick={() => auth?.logout()}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

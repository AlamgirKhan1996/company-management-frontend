"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Building2 } from "lucide-react";

export default function DashboardHeader() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth?.isHydrated) return;
    if (!auth.token) return;
    auth.refreshProfile().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.isHydrated, auth?.token]);

  const companyName = auth?.company?.name ?? "Company";
  const userEmail = auth?.currentUser?.email ?? "";

  return (
    <div className="sticky top-0 z-10 -mx-6 mb-6 border-b bg-white/80 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Building2 className="h-4 w-4" />
            <span className="truncate">{companyName}</span>
          </div>
          <div className="truncate text-lg font-semibold text-gray-900">
            {userEmail ? `Welcome, ${userEmail}` : "Welcome"}
          </div>
        </div>

        <Button
          variant="outline"
          className="gap-2"
          onClick={() => auth?.logout()}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}


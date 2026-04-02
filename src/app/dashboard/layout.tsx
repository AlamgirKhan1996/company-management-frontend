"use client";

// ─── src/app/dashboard/layout.tsx ─────────────────────────────────────────────

import Protected from "@/components/protected";
import Sidebar from "@/components/sidebar/sidebar";
import { ReactNode } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
// import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { useAuth } from "@/context/AuthContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import OnboardingChecklist from "@/components/onboarding/OnboardingChecklist";
import WelcomeModal from "@/components/onboarding/WelcomeModal";

function DashboardInner({ children }: { children: ReactNode }) {
  // useSessionTimeout();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar — handles its own mobile/desktop visibility */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col">
        <DashboardHeader />

        {/* Page content — padded, mobile-safe */}
        <div className="flex-1 p-4 md:p-6 pt-16 md:pt-4 max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Onboarding */}
      <WelcomeModal />
      <OnboardingChecklist />
    </div>
  );
}

function OnboardingWrapper({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const companyId = auth?.companyId ?? null;

  return (
    <OnboardingProvider companyId={companyId}>
      <DashboardInner>{children}</DashboardInner>
    </OnboardingProvider>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Protected>
      <OnboardingWrapper>{children}</OnboardingWrapper>
    </Protected>
  );
}

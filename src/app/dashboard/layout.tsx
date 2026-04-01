"use client";

import Protected from "@/components/protected";
import Sidebar from "@/components/sidebar/sidebar";
import { ReactNode } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { useAuth } from "@/context/AuthContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import OnboardingChecklist from "@/components/onboarding/OnboardingChecklist";
import WelcomeModal from "@/components/onboarding/WelcomeModal";

// ─── Inner layout — has access to all hooks ───────────────────────────────────
function DashboardInner({ children }: { children: ReactNode }) {
  useSessionTimeout(); // Auto logout after 30 min inactivity

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-50 min-h-screen p-6">
        <DashboardHeader />
        {children}
      </main>

      {/* Onboarding — always rendered, self-manages visibility */}
      <WelcomeModal />
      <OnboardingChecklist />
    </div>
  );
}

// ─── Onboarding wrapper — needs companyId from auth ──────────────────────────
function OnboardingWrapper({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const companyId = auth?.companyId ?? null;

  return (
    <OnboardingProvider companyId={companyId}>
      <DashboardInner>{children}</DashboardInner>
    </OnboardingProvider>
  );
}

// ─── Root layout export ───────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Protected>
      <OnboardingWrapper>{children}</OnboardingWrapper>
    </Protected>
  );
}

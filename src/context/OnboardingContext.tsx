"use client";

import {
  createContext, useContext, useState,
  useEffect, useCallback, ReactNode,
} from "react";
import api from "@/lib/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  href: string;
  completed: boolean;
  points: number;
};

type OnboardingState = {
  steps: OnboardingStep[];
  completed: boolean;
  dismissed: boolean;
  totalPoints: number;
  earnedPoints: number;
  percentComplete: number;
};

type OnboardingContextValue = OnboardingState & {
  completeStep: (id: string) => void;
  dismiss: () => void;
  refresh: () => Promise<void>;
  isNewUser: boolean;
};

// ─── Steps definition ─────────────────────────────────────────────────────────

const STEPS: Omit<OnboardingStep, "completed">[] = [
  {
    id: "department",
    title: "Create your first department",
    description: "Organize your company by creating departments like HR, Engineering, or Sales.",
    href: "/dashboard/departments",
    points: 20,
  },
  {
    id: "employee",
    title: "Add your first employee",
    description: "Add a team member to your company and assign them to a department.",
    href: "/dashboard/employees",
    points: 20,
  },
  {
    id: "project",
    title: "Create your first project",
    description: "Start tracking work by creating a project and linking it to a department.",
    href: "/dashboard/projects",
    points: 20,
  },
  {
    id: "task",
    title: "Assign your first task",
    description: "Create a task inside a project and assign it to an employee.",
    href: "/dashboard/tasks",
    points: 20,
  },
  {
    id: "ai_employee",
    title: "Try an AI employee",
    description: "Install an AI agent from the marketplace and assign it a real task.",
    href: "/dashboard/marketplace",
    points: 20,
  },
];

// ─── Context ──────────────────────────────────────────────────────────────────

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

const LS_KEY = "cms_onboarding_v1";

function loadFromStorage(companyId: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(`${LS_KEY}_${companyId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToStorage(companyId: string, completed: Record<string, boolean>) {
  try {
    localStorage.setItem(`${LS_KEY}_${companyId}`, JSON.stringify(completed));
  } catch {}
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function OnboardingProvider({
  children,
  companyId,
}: {
  children: ReactNode;
  companyId: string | null;
}) {
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [dismissed, setDismissed] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [checked, setChecked] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (!companyId) return;
    const stored = loadFromStorage(companyId);
    setCompletedMap(stored);

    // Check if dismissed
    const dismissKey = `${LS_KEY}_dismissed_${companyId}`;
    setDismissed(localStorage.getItem(dismissKey) === "true");

    // Auto-detect if new user by checking if company data exists
    checkIfNewUser();
    setChecked(true);
  }, [companyId]);

  // Check real data to auto-complete steps
  const refresh = useCallback(async () => {
    if (!companyId) return;
    try {
      const [deptRes, empRes, projRes, taskRes, aiRes] = await Promise.allSettled([
        api.get("/api/departments"),
        api.get("/api/employees"),
        api.get("/api/projects"),
        api.get("/api/tasks"),
        api.get("/api/ai-employees"),
      ]);

      const newMap: Record<string, boolean> = { ...completedMap };

      if (deptRes.status === "fulfilled") {
        const d = deptRes.value.data;
        const arr = Array.isArray(d) ? d : d?.departments ?? [];
        if (arr.length > 0) newMap["department"] = true;
      }
      if (empRes.status === "fulfilled") {
        const d = empRes.value.data;
        const arr = Array.isArray(d) ? d : [];
        if (arr.length > 0) newMap["employee"] = true;
      }
      if (projRes.status === "fulfilled") {
        const d = projRes.value.data;
        const arr = Array.isArray(d) ? d : [];
        if (arr.length > 0) newMap["project"] = true;
      }
      if (taskRes.status === "fulfilled") {
        const d = taskRes.value.data;
        const arr = Array.isArray(d) ? d : [];
        if (arr.length > 0) newMap["task"] = true;
      }
      if (aiRes.status === "fulfilled") {
        const d = aiRes.value.data;
        const arr = Array.isArray(d) ? d : [];
        // AI employee step done if they have one AND it has tasks
        if (arr.some((a: { _count?: { tasks: number } }) => (a._count?.tasks ?? 0) > 0)) {
          newMap["ai_employee"] = true;
        }
      }

      setCompletedMap(newMap);
      if (companyId) saveToStorage(companyId, newMap);
    } catch {
      // Silently fail — onboarding should never break the app
    }
  }, [companyId, completedMap]);

  async function checkIfNewUser() {
    try {
      const res = await api.get("/api/departments");
      const arr = Array.isArray(res.data) ? res.data : res.data?.departments ?? [];
      // If no departments, this is a new user
      setIsNewUser(arr.length === 0);
    } catch {
      setIsNewUser(false);
    }
  }

  // Refresh on mount to sync with real data
  useEffect(() => {
    if (companyId && checked) {
      refresh();
    }
  }, [companyId, checked]);

  const completeStep = useCallback((id: string) => {
    setCompletedMap((prev) => {
      const next = { ...prev, [id]: true };
      if (companyId) saveToStorage(companyId, next);
      return next;
    });
  }, [companyId]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    if (companyId) {
      localStorage.setItem(`${LS_KEY}_dismissed_${companyId}`, "true");
    }
  }, [companyId]);

  // Build state
  const steps: OnboardingStep[] = STEPS.map((s) => ({
    ...s,
    completed: completedMap[s.id] ?? false,
  }));

  const earnedPoints = steps.filter((s) => s.completed).reduce((sum, s) => sum + s.points, 0);
  const totalPoints = STEPS.reduce((sum, s) => sum + s.points, 0);
  const percentComplete = Math.round((earnedPoints / totalPoints) * 100);
  const allCompleted = steps.every((s) => s.completed);

  const value: OnboardingContextValue = {
    steps,
    completed: allCompleted,
    dismissed,
    totalPoints,
    earnedPoints,
    percentComplete,
    completeStep,
    dismiss,
    refresh,
    isNewUser,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingContext);
}

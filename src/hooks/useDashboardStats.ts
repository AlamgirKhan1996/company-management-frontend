"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api-client";
import { toast } from "sonner";

type DashboardStats = {
  departments: number;
  employees: number;
  projects: number;
  tasks: number;
};

export function useDashboardStats() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        const [deptRes, empRes, projRes, taskRes] = await Promise.all([
          api.get("/api/departments"),
          api.get("/api/employees"),
          api.get("/api/projects"),
          api.get("/api/tasks"),
        ]);

        if (!isMounted) return;

        setData({
          departments: deptRes.data.length ?? 0,
          employees: empRes.data.length ?? 0,
          projects: projRes.data.length ?? 0,
          tasks: taskRes.data.length ?? 0,
        });
      } catch (err: unknown) {
  console.error(err);

  const errorMessage =
    err && typeof err === "object" && "response" in err
      ? (err as { response?: { data?: { error: string } } }).response?.data?.error ?? "Failed to load dashboard stats"
      : "Failed to load dashboard stats";

  setError(errorMessage);
  toast.error(errorMessage);
} finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
}

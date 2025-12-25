"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type DashboardStats = {
  departments: number;
  employees: number;
  projects: number;
  tasks: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        // Call your backend APIs in parallel
        const [deptRes, empRes, projRes, taskRes] = await Promise.all([
          api.get("/api/departments"),
          api.get("/api/employees"),
          api.get("/api/projects"),
          api.get("/api/tasks"),
        ]);

        setStats({
          departments: deptRes.data.length || 0,
          employees: empRes.data.length || 0,
          projects: projRes.data.length || 0,
          tasks: taskRes.data.length || 0,
        });
      } catch (err: unknown) {
        console.error(err);
        setError("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const chartData =
    stats
      ? [
          { name: "Departments", value: stats.departments },
          { name: "Employees", value: stats.employees },
          { name: "Projects", value: stats.projects },
          { name: "Tasks", value: stats.tasks },
        ]
      : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Overview of your company management system.
        </p>
      </div>

      {loading && (
        <p className="text-sm text-gray-500">Loading stats...</p>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Top metric cards */}
      {stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Departments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.departments}</p>
                <p className="text-xs text-gray-500 mt-1">Total departments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Employees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.employees}</p>
                <p className="text-xs text-gray-500 mt-1">Active employees</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.projects}</p>
                <p className="text-xs text-gray-500 mt-1">Ongoing projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.tasks}</p>
                <p className="text-xs text-gray-500 mt-1">Total tasks</p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Overview chart
              </CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

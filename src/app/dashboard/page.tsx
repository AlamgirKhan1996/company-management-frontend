"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api-client";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Building2, Users, FolderKanban, CheckCircle2,
  Bot, AlertTriangle, Zap, TrendingUp, Clock,
  Activity, RefreshCw, ArrowUpRight, Flame,
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
type TaskStats = {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
  highPriority: number;
  aiExecuted: number;
  completionRate: number;
};

type TrendDay = {
  label: string;
  created: number;
  completed: number;
};

type RecentProject = {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  _count: { tasks: number };
};

type RecentEmployee = {
  id: string;
  name: string;
  role: string;
  department?: { name: string };
};

type DashboardStats = {
  departments: number;
  employees: number;
  projects: number;
  aiEmployees: number;
  aiTasksExecuted: number;
  tasks: TaskStats;
  taskTrend: TrendDay[];
  recentProjects: RecentProject[];
  recentEmployees: RecentEmployee[];
  generatedAt: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const PROJECT_STATUS_COLOR: Record<string, string> = {
  PLANNED: "bg-gray-100 text-gray-600 border-gray-200",
  IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  ON_HOLD: "bg-red-100 text-red-700 border-red-200",
};

const PIE_COLORS = ["#6366f1", "#3b82f6", "#22c55e"];

// ─── Subcomponents ───────────────────────────────────────────────────────────
function StatCard({
  label, value, icon: Icon, color, bg, href, suffix,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  bg: string;
  href?: string;
  suffix?: string;
}) {
  const inner = (
    <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {value}{suffix && <span className="text-lg text-gray-400 ml-1">{suffix}</span>}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${bg}`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
        </div>
        {href && (
          <div className="flex items-center gap-1 mt-3 text-xs text-gray-400 group-hover:text-indigo-600 transition-colors">
            <span>View all</span>
            <ArrowUpRight className="h-3 w-3" />
          </div>
        )}
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function PulseBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div
        className={`h-2 rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const res = await api.get("/api/dashboard/stats");
      setStats(res.data);
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ─── Loading skeleton ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-64 rounded-xl lg:col-span-2" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const { tasks, taskTrend, recentProjects, recentEmployees } = stats;

  // Pie chart data
  const pieData = [
    { name: "Todo", value: tasks.todo },
    { name: "In Progress", value: tasks.inProgress },
    { name: "Done", value: tasks.done },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Your company at a glance ·{" "}
            <span className="text-gray-400">
              Updated {new Date(stats.generatedAt).toLocaleTimeString()}
            </span>
          </p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 border rounded-lg px-3 py-2 hover:border-indigo-200 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* ── Top stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Departments"
          value={stats.departments}
          icon={Building2}
          color="text-purple-600"
          bg="bg-purple-50"
          href="/dashboard/departments"
        />
        <StatCard
          label="Employees"
          value={stats.employees}
          icon={Users}
          color="text-blue-600"
          bg="bg-blue-50"
          href="/dashboard/employees"
        />
        <StatCard
          label="Projects"
          value={stats.projects}
          icon={FolderKanban}
          color="text-orange-600"
          bg="bg-orange-50"
          href="/dashboard/projects"
        />
        <StatCard
          label="AI Employees"
          value={stats.aiEmployees}
          icon={Bot}
          color="text-violet-600"
          bg="bg-violet-50"
          href="/dashboard/ai-employees"
        />
      </div>

      {/* ── Task stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Tasks"
          value={tasks.total}
          icon={Activity}
          color="text-indigo-600"
          bg="bg-indigo-50"
          href="/dashboard/tasks"
        />
        <StatCard
          label="Completion Rate"
          value={tasks.completionRate}
          suffix="%"
          icon={TrendingUp}
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatCard
          label="Overdue Tasks"
          value={tasks.overdue}
          icon={AlertTriangle}
          color="text-red-600"
          bg="bg-red-50"
          href="/dashboard/tasks"
        />
        <StatCard
          label="AI Tasks Executed"
          value={stats.aiTasksExecuted}
          icon={Zap}
          color="text-amber-600"
          bg="bg-amber-50"
          href="/dashboard/ai-employees"
        />
      </div>

      {/* ── Task breakdown + trend charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart — 7 day trend */}
        <Card className="lg:col-span-2 border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-500" />
              Task Activity — Last 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskTrend} barSize={10} barGap={4}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  width={24}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px", border: "1px solid #e5e7eb",
                    fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                  cursor={{ fill: "#f3f4f6" }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="created" name="Created" fill="#818cf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie chart — task status split */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Task Status Split
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            {tasks.total === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No tasks yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={52}
                    outerRadius={76}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px", border: "1px solid #e5e7eb",
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11 }}
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Task health panel ── */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Task Health Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Completed", value: tasks.done, total: tasks.total, color: "bg-green-400" },
              { label: "In Progress", value: tasks.inProgress, total: tasks.total, color: "bg-blue-400" },
              { label: "Todo", value: tasks.todo, total: tasks.total, color: "bg-gray-300" },
              { label: "Overdue", value: tasks.overdue, total: tasks.total, color: "bg-red-400" },
              { label: "High Priority", value: tasks.highPriority, total: tasks.total, color: "bg-orange-400" },
              { label: "AI Executed", value: tasks.aiExecuted, total: tasks.total, color: "bg-violet-400" },
            ].map(({ label, value, total, color }) => (
              <div key={label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">{label}</span>
                  <span className="font-bold text-gray-900">
                    {value}
                    <span className="text-gray-400 font-normal text-xs ml-1">/ {total}</span>
                  </span>
                </div>
                <PulseBar value={value} max={total} color={color} />
                <p className="text-[11px] text-gray-400">
                  {total > 0 ? Math.round((value / total) * 100) : 0}% of all tasks
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Recent activity row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent projects */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-orange-500" />
              Recent Projects
            </CardTitle>
            <Link
              href="/dashboard/projects"
              className="text-xs text-indigo-500 hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentProjects.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No projects yet</p>
            ) : (
              recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                      <FolderKanban className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-800 truncate">{project.name}</p>
                      <p className="text-[11px] text-gray-400">
                        {project._count.tasks} tasks ·{" "}
                        {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] flex-shrink-0 ml-2 ${PROJECT_STATUS_COLOR[project.status] || "bg-gray-100 text-gray-500"}`}
                  >
                    {project.status.replace("_", " ")}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent employees */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Recent Employees
            </CardTitle>
            <Link
              href="/dashboard/employees"
              className="text-xs text-indigo-500 hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentEmployees.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No employees yet</p>
            ) : (
              recentEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-800 truncate">{emp.name}</p>
                      <p className="text-[11px] text-gray-400">
                        {emp.role}
                        {emp.department?.name && ` · ${emp.department.name}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 flex-shrink-0 ml-2">
                    <span className="text-[11px] text-gray-400">
                   {emp.role}{emp.department?.name && ` · ${emp.department.name}`}
                   </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

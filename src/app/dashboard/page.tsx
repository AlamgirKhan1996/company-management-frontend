"use client";

// ─── src/app/dashboard/page.tsx ───────────────────────────────────────────────
// Dashboard with proper error handling, loading states, retry logic

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import {
  ErrorBoundary, PageError, InlineError, NetworkError,
} from "@/components/errors/ErrorBoundary";
import { getErrorMessage } from "@/hooks/useApiError";

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskStats = {
  total: number; completed: number; inProgress: number;
  todo: number; overdue: number; highPriority: number;
  aiExecuted: number; completionRate: number;
};

type TrendDay = { label: string; created: number; completed: number };

type RecentProject = {
  id: string; name: string; status: string;
  createdAt: string; _count: { tasks: number };
};

type RecentEmployee = {
  id: string; name: string; role: string;
  department?: { name: string };
};

type DashboardStats = {
  departments: number; employees: number;
  projects: number; aiEmployees: number; aiTasksExecuted: number;
  tasks: TaskStats; taskTrend: TrendDay[];
  recentProjects: RecentProject[]; recentEmployees: RecentEmployee[];
  generatedAt: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const PROJECT_STATUS_COLOR: Record<string, string> = {
  PLANNED:     "bg-gray-100 text-gray-600 border-gray-200",
  IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
  COMPLETED:   "bg-green-100 text-green-700 border-green-200",
  ON_HOLD:     "bg-red-100 text-red-700 border-red-200",
};

const PIE_COLORS = ["#6366f1", "#3b82f6", "#22c55e"];

// ─── Subcomponents ───────────────────────────────────────────────────────────

function StatCard({
  label, value, icon: Icon, color, bg, href, suffix,
}: {
  label: string; value: number | string;
  icon: React.ElementType; color: string; bg: string;
  href?: string; suffix?: string;
}) {
  const inner = (
    <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group border">
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide truncate">{label}</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
              {value}
              {suffix && <span className="text-base md:text-lg text-gray-400 ml-1">{suffix}</span>}
            </p>
          </div>
          <div className={`p-2.5 md:p-3 rounded-xl ${bg} flex-shrink-0 ml-2`}>
            <Icon className={`h-4 w-4 md:h-5 md:w-5 ${color}`} />
          </div>
        </div>
        {href && (
          <div className="flex items-center gap-1 mt-2 md:mt-3 text-xs text-gray-400 group-hover:text-indigo-600 transition-colors">
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

function DashboardSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-24 md:h-28 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-56 rounded-xl lg:col-span-2" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false);

  const fetchStats = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError(null);
      setIsNetworkError(false);

      const res = await api.get("/api/dashboard/stats");
      setStats(res.data);
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to load dashboard");
      setError(msg);

      // Detect network vs server error
      if (
        err && typeof err === "object" && "message" in err &&
        (err as Error).message === "Network Error"
      ) {
        setIsNetworkError(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) return <DashboardSkeleton />;

  if (isNetworkError) return <NetworkError onRetry={() => fetchStats()} />;

  if (error || !stats) {
    return (
      <PageError
        title="Dashboard unavailable"
        message={error || "Could not load dashboard data."}
        onRetry={() => fetchStats()}
      />
    );
  }

  const { tasks, taskTrend, recentProjects, recentEmployees } = stats;

  const pieData = [
    { name: "Todo", value: tasks.todo },
    { name: "In Progress", value: tasks.inProgress },
    { name: "Done", value: tasks.done },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            Updated {new Date(stats.generatedAt).toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 border rounded-lg px-3 py-2 hover:border-indigo-200 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Top stat cards — 2 col on mobile, 4 col on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Departments"  value={stats.departments}  icon={Building2}    color="text-purple-600" bg="bg-purple-50"  href="/dashboard/departments" />
        <StatCard label="Employees"    value={stats.employees}    icon={Users}        color="text-blue-600"   bg="bg-blue-50"    href="/dashboard/employees"   />
        <StatCard label="Projects"     value={stats.projects}     icon={FolderKanban} color="text-orange-600" bg="bg-orange-50"  href="/dashboard/projects"    />
        <StatCard label="AI Employees" value={stats.aiEmployees}  icon={Bot}          color="text-violet-600" bg="bg-violet-50"  href="/dashboard/ai-employees"/>
      </div>

      {/* Task stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Total Tasks"      value={tasks.total}            icon={Activity}      color="text-indigo-600" bg="bg-indigo-50" href="/dashboard/tasks" />
        <StatCard label="Completion Rate"  value={tasks.completionRate}   icon={TrendingUp}    color="text-green-600"  bg="bg-green-50"  suffix="%" />
        <StatCard label="Overdue"          value={tasks.overdue}          icon={AlertTriangle} color="text-red-600"    bg="bg-red-50"    href="/dashboard/tasks" />
        <StatCard label="AI Tasks Done"    value={stats.aiTasksExecuted}  icon={Zap}           color="text-amber-600"  bg="bg-amber-50"  href="/dashboard/ai-employees" />
      </div>

      {/* Charts — wrap in ErrorBoundary since Recharts can crash */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ErrorBoundary
          fallback={
            <InlineError
              message="Chart failed to render"
              onRetry={() => fetchStats(true)}
            />
          }
        >
          <Card className="lg:col-span-2 border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-500" />
                Task Activity — Last 7 Days
              </CardTitle>
            </CardHeader>
            <CardContent className="h-48 md:h-56">
              {taskTrend.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  No data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskTrend} barSize={8}>
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={20} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: 11 }} cursor={{ fill: "#f3f4f6" }} />
                    <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} iconType="circle" iconSize={7} />
                    <Bar dataKey="created"   name="Created"   fill="#818cf8" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="completed" name="Completed" fill="#34d399" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </ErrorBoundary>

        <ErrorBoundary
          fallback={<InlineError message="Chart failed to render" />}
        >
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Task Status
              </CardTitle>
            </CardHeader>
            <CardContent className="h-48 md:h-56">
              {tasks.total === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  No tasks yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="45%" innerRadius={44} outerRadius={68} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" iconSize={7} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </ErrorBoundary>
      </div>

      {/* Task health */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Task Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {[
              { label: "Completed",    value: tasks.done,         total: tasks.total, color: "bg-green-400"  },
              { label: "In Progress",  value: tasks.inProgress,   total: tasks.total, color: "bg-blue-400"   },
              { label: "Todo",         value: tasks.todo,         total: tasks.total, color: "bg-gray-300"   },
              { label: "Overdue",      value: tasks.overdue,      total: tasks.total, color: "bg-red-400"    },
              { label: "High Priority",value: tasks.highPriority, total: tasks.total, color: "bg-orange-400" },
              { label: "AI Executed",  value: tasks.aiExecuted,   total: tasks.total, color: "bg-violet-400" },
            ].map(({ label, value, total, color }) => (
              <div key={label} className="space-y-2">
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-gray-600 font-medium truncate">{label}</span>
                  <span className="font-bold text-gray-900 ml-1">{value}</span>
                </div>
                <PulseBar value={value} max={total} color={color} />
                <p className="text-[10px] text-gray-400">
                  {total > 0 ? Math.round((value / total) * 100) : 0}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent projects */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-orange-500" />
              Recent Projects
            </CardTitle>
            <Link href="/dashboard/projects" className="text-xs text-indigo-500 hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-0 p-0">
            {recentProjects.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6 px-4">No projects yet</p>
            ) : (
              recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between px-4 py-3 border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                      <FolderKanban className="h-3.5 w-3.5 text-orange-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-800 truncate">{project.name}</p>
                      <p className="text-[10px] text-gray-400">{project._count.tasks} tasks</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] flex-shrink-0 ml-2 ${PROJECT_STATUS_COLOR[project.status] || "bg-gray-100 text-gray-500"}`}>
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
            <Link href="/dashboard/employees" className="text-xs text-indigo-500 hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-0 p-0">
            {recentEmployees.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6 px-4">No employees yet</p>
            ) : (
              recentEmployees.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between px-4 py-3 border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-800 truncate">{emp.name}</p>
                      <p className="text-[10px] text-gray-400">
                        {emp.role}{emp.department?.name ? ` · ${emp.department.name}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 flex-shrink-0 ml-2">
                    <Clock className="h-3 w-3" />
                    <span className="hidden sm:inline">New</span>
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

// ─── Page export — wrapped in ErrorBoundary ───────────────────────────────────

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api-client";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid,
} from "recharts";
import {
  TrendingUp, AlertTriangle, CheckCircle2, Activity,
  Download, RefreshCw, Building2, Target, Calendar,
  Gauge, ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportOverview = {
  productivityScore: number;
  taskSummary: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    overdue: number;
    completionRate: number;
    overdueRate: number;
  };
  projectHealth: {
    onTrack: number;
    atRisk: number;
    overdue: number;
    total: number;
  };
  generatedAt: string;
};

type TrendPoint = {
  label: string;
  created: number;
  completed: number;
};

type DepartmentStat = {
  id: string;
  name: string;
  employeeCount: number;
  taskStats: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    completionRate: number;
  };
  productivityScore: number;
};

type ProjectHealthItem = {
  id: string;
  name: string;
  health: "ON_TRACK" | "AT_RISK" | "OVERDUE";
  completionPercent: number;
  taskCount: number;
  dueDate?: string;
};

type Department = { id: string; name: string };
type Project = { id: string; name: string };
type User = { id: string; name: string; email: string };

// ─── Constants ────────────────────────────────────────────────────────────────

const DATE_PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "Last 6 months", days: 180 },
];

const HEALTH_COLORS: Record<string, string> = {
  ON_TRACK: "#22c55e",
  AT_RISK: "#f59e0b",
  OVERDUE: "#ef4444",
};

const HEALTH_BADGE: Record<string, string> = {
  ON_TRACK: "bg-green-100 text-green-700 border-green-200",
  AT_RISK: "bg-amber-100 text-amber-700 border-amber-200",
  OVERDUE: "bg-red-100 text-red-700 border-red-200",
};

function getDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── Score badge helpers ──────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 70) return { ring: "stroke-green-500", text: "text-green-600", bg: "bg-green-50" };
  if (score >= 40) return { ring: "stroke-amber-500", text: "text-amber-600", bg: "bg-amber-50" };
  return { ring: "stroke-red-500", text: "text-red-600", bg: "bg-red-50" };
}

function scoreTrend(score: number) {
  if (score >= 70) return { icon: ArrowUpRight, label: "Healthy", color: "text-green-500" };
  if (score >= 40) return { icon: Minus, label: "At Risk", color: "text-amber-500" };
  return { icon: ArrowDownRight, label: "Critical", color: "text-red-500" };
}

// ─── Productivity Gauge ───────────────────────────────────────────────────────

function ProductivityGauge({ score }: { score: number }) {
  const { ring, text } = scoreColor(score);
  const { icon: TrendIcon, label, color } = scoreTrend(score);
  const circumference = 2 * Math.PI * 40;
  const dash = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-2">
      <svg width={100} height={100} viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={40} fill="none" stroke="#e5e7eb" strokeWidth={10} />
        <circle
          cx={50} cy={50} r={40}
          fill="none"
          className={ring}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
        <text x={50} y={53} textAnchor="middle" className="text-base font-bold" fill="currentColor">
          <tspan className={text} style={{ fontSize: 18, fontWeight: 700, fill: "inherit" }}>
            {score}
          </tspan>
        </text>
      </svg>
      <div className={`flex items-center gap-1 text-xs font-semibold ${color}`}>
        <TrendIcon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="text-[11px] text-gray-400 text-center">Productivity Score</p>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="flex gap-3 flex-wrap">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-9 w-36" />)}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-64 lg:col-span-2 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  // Filter state
  const [preset, setPreset] = useState(1); // index into DATE_PRESETS — default 30 days
  const [departmentId, setDepartmentId] = useState("all");
  const [projectId, setProjectId] = useState("all");
  const [userId, setUserId] = useState("all");

  // Filter options
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Report data
  const [overview, setOverview] = useState<ReportOverview | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [deptStats, setDeptStats] = useState<DepartmentStat[]>([]);
  const [projectHealth, setProjectHealth] = useState<ProjectHealthItem[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  // ─── Build query params ─────────────────────────────────────────────────
  const buildParams = useCallback(() => {
    const params: Record<string, string> = {
      startDate: getDaysAgo(DATE_PRESETS[preset].days),
      endDate: today(),
    };
    if (departmentId !== "all") params.departmentId = departmentId;
    if (projectId !== "all") params.projectId = projectId;
    if (userId !== "all") params.userId = userId;
    return params;
  }, [preset, departmentId, projectId, userId]);

  // ─── Load filter options once ───────────────────────────────────────────
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [deptRes, projRes, userRes] = await Promise.all([
          api.get("/api/departments"),
          api.get("/api/projects"),
          api.get("/api/users"),
        ]);
        setDepartments(deptRes.data?.departments ?? deptRes.data ?? []);
        setProjects(projRes.data?.projects ?? projRes.data ?? []);
        setUsers(userRes.data?.users ?? userRes.data ?? []);
      } catch {
        // Filters are best-effort; silently ignore
      }
    };
    loadFilters();
  }, []);

  // ─── Fetch report data ──────────────────────────────────────────────────
  const fetchReports = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const params = buildParams();

      const [overviewRes, trendsRes, deptRes, healthRes] = await Promise.all([
        api.get("/api/reports/overview", { params }),
        api.get("/api/reports/tasks/trends", { params }),
        api.get("/api/reports/departments", { params }),
        api.get("/api/reports/projects/health", { params }),
      ]);

      setOverview(overviewRes.data);
      setTrends(trendsRes.data?.trends ?? trendsRes.data ?? []);
      setDeptStats(deptRes.data?.departments ?? deptRes.data ?? []);
      setProjectHealth(healthRes.data?.projects ?? healthRes.data ?? []);
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Failed to load reports");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [buildParams]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // ─── CSV Export ─────────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      setExporting(true);
      const params = buildParams();
      const res = await api.get("/api/reports/export", {
        params,
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      const start = params.startDate;
      const end = params.endDate;
      link.setAttribute("download", `report-${start}-to-${end}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Report exported successfully");
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  // ─── Loading ─────────────────────────────────────────────────────────────
  if (loading) return <ReportsSkeleton />;
  if (!overview) return null;

  const { taskSummary, projectHealth: ph } = overview;

  // Pie data for project health
  const healthPieData = [
    { name: "On Track", value: ph.onTrack, color: HEALTH_COLORS.ON_TRACK },
    { name: "At Risk", value: ph.atRisk, color: HEALTH_COLORS.AT_RISK },
    { name: "Overdue", value: ph.overdue, color: HEALTH_COLORS.OVERDUE },
  ].filter((d) => d.value > 0);

  const selectedPresetLabel = DATE_PRESETS[preset].label;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {selectedPresetLabel} ·{" "}
            <span className="text-gray-400">
              Generated {overview.generatedAt
                ? new Date(overview.generatedAt).toLocaleTimeString()
                : "just now"}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchReports(true)}
            disabled={refreshing}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 border rounded-lg px-3 py-2 hover:border-indigo-200 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Button
            onClick={handleExport}
            disabled={exporting}
            size="sm"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <Download className="h-3.5 w-3.5" />
            {exporting ? "Exporting…" : "Export CSV"}
          </Button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-xl border">
        {/* Date preset */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <Select
            value={String(preset)}
            onValueChange={(v) => setPreset(Number(v))}
          >
            <SelectTrigger className="h-8 text-xs w-36 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_PRESETS.map((p, i) => (
                <SelectItem key={i} value={String(i)} className="text-xs">
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Department filter */}
        {departments.length > 0 && (
          <Select value={departmentId} onValueChange={setDepartmentId}>
            <SelectTrigger className="h-8 text-xs w-40 bg-white">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id} className="text-xs">{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Project filter */}
        {projects.length > 0 && (
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger className="h-8 text-xs w-40 bg-white">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* User filter */}
        {users.length > 0 && (
          <Select value={userId} onValueChange={setUserId}>
            <SelectTrigger className="h-8 text-xs w-40 bg-white">
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Users</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id} className="text-xs">{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* ── Overview metric cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Productivity Score */}
        <Card className="border shadow-sm col-span-2 md:col-span-1">
          <CardContent className="p-4 flex flex-col items-center">
            <ProductivityGauge score={Math.round(overview.productivityScore)} />
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="border shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Completion Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {taskSummary.completionRate}
                  <span className="text-lg text-gray-400 ml-1">%</span>
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  {taskSummary.completed} / {taskSummary.total} tasks
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-50">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overdue Rate */}
        <Card className="border shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Overdue Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {taskSummary.overdueRate}
                  <span className="text-lg text-gray-400 ml-1">%</span>
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  {taskSummary.overdue} overdue tasks
                </p>
              </div>
              <div className="p-3 rounded-xl bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Tasks */}
        <Card className="border shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{taskSummary.total}</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  {taskSummary.inProgress} in progress
                </p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50">
                <Activity className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Task Trend + Project Health ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Task Trend — area chart */}
        <Card className="lg:col-span-2 border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              Task Completion Trend
              <span className="ml-auto text-[10px] font-normal text-gray-400">
                {DATE_PRESETS[preset].days > 90 ? "Weekly granularity" : "Daily granularity"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-60">
            {trends.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No trend data for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                  <defs>
                    <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    width={22}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px", border: "1px solid #e5e7eb",
                      fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                    cursor={{ stroke: "#e5e7eb" }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Area
                    type="monotone"
                    dataKey="created"
                    name="Created"
                    stroke="#818cf8"
                    strokeWidth={2}
                    fill="url(#gradCreated)"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    name="Completed"
                    stroke="#34d399"
                    strokeWidth={2}
                    fill="url(#gradCompleted)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Project Health — donut */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-500" />
              Project Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ph.total === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                No projects found
              </div>
            ) : (
              <>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={healthPieData}
                        cx="50%"
                        cy="45%"
                        innerRadius={44}
                        outerRadius={64}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {healthPieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: 12,
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: 10 }}
                        iconType="circle"
                        iconSize={7}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[
                    { label: "On Track", value: ph.onTrack, color: "text-green-600 bg-green-50" },
                    { label: "At Risk", value: ph.atRisk, color: "text-amber-600 bg-amber-50" },
                    { label: "Overdue", value: ph.overdue, color: "text-red-600 bg-red-50" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className={`rounded-lg p-2 text-center ${color}`}>
                      <p className="text-lg font-bold leading-none">{value}</p>
                      <p className="text-[10px] mt-1 font-medium">{label}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Department Analytics ── */}
      {deptStats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Horizontal bar chart */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-500" />
                Department Completion Rates
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={deptStats.slice(0, 8)}
                  margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
                  barSize={12}
                >
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip
                    formatter={(v: number) => [`${v}%`, "Completion"]}
                    contentStyle={{
                      borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="taskStats.completionRate"
                    name="Completion Rate"
                    fill="#818cf8"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Department table */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Gauge className="h-4 w-4 text-indigo-500" />
                Department Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50/60">
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-2.5">Department</th>
                      <th className="text-right text-xs font-medium text-gray-500 px-3 py-2.5">Tasks</th>
                      <th className="text-right text-xs font-medium text-gray-500 px-3 py-2.5">Done</th>
                      <th className="text-right text-xs font-medium text-gray-500 px-3 py-2.5">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deptStats.map((dept) => {
                      const { text } = scoreColor(Math.round(dept.productivityScore));
                      return (
                        <tr key={dept.id} className="border-b last:border-0 hover:bg-gray-50/40 transition-colors">
                          <td className="px-4 py-2.5">
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{dept.name}</p>
                              <p className="text-[10px] text-gray-400">{dept.employeeCount} employees</p>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-right text-gray-600 font-medium">
                            {dept.taskStats.total}
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <span className="text-green-600 font-semibold">{dept.taskStats.completed}</span>
                            <span className="text-gray-400 text-[10px] ml-0.5">
                              /{dept.taskStats.total}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <span className={`font-bold ${text}`}>
                              {Math.round(dept.productivityScore)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Project Health Table ── */}
      {projectHealth.length > 0 && (
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-500" />
              Project Health Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/60">
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-2.5">Project</th>
                    <th className="text-center text-xs font-medium text-gray-500 px-3 py-2.5">Health</th>
                    <th className="text-right text-xs font-medium text-gray-500 px-3 py-2.5">Tasks</th>
                    <th className="text-right text-xs font-medium text-gray-500 px-3 py-2.5">Progress</th>
                    <th className="text-right text-xs font-medium text-gray-500 px-4 py-2.5">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {projectHealth.map((p) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50/40 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{p.name}</p>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${HEALTH_BADGE[p.health] ?? "bg-gray-100 text-gray-500"}`}
                        >
                          {p.health.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-right text-gray-600">{p.taskCount}</td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 bg-gray-100 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full"
                              style={{
                                width: `${p.completionPercent}%`,
                                backgroundColor: HEALTH_COLORS[p.health],
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8 text-right">
                            {p.completionPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-gray-400">
                        {p.dueDate
                          ? new Date(p.dueDate).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

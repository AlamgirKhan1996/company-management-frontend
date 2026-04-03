"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/hooks/useRole";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2, Clock, Zap, AlertTriangle, Search,
  Bot, User, Building2, Layers, BarChart3, Filter,
} from "lucide-react";
import { ErrorBoundary, PageError, EmptyState } from "@/components/errors/ErrorBoundary";
import RunWithAIDialog from "@/components/tasks/RunWithAIDialog";
import RoleGuard from "@/components/auth/RoleGuard";
import { useCompleteStep } from "@/hooks/useCompleteStep";

// ─── Types ────────────────────────────────────────────────────────────────────
type Department = { id: string; name: string };
type Project    = { id: string; name: string; departments: Department[] };
type Employee   = { id: string; name: string; email: string; role: string };
type AIEmployee = { id: string; name: string; role: string };

type Task = {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string;
  createdAt: string;
  project?: Project;
  employee?: Employee;
  aiEmployee?: AIEmployee;
  aiResult?: Record<string, unknown>;
  aiExecutedAt?: string;
};

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  TODO:        { label: "To Do",       color: "bg-gray-100 text-gray-700 border-gray-200",  icon: Clock        },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-700 border-blue-200",  icon: Zap          },
  DONE:        { label: "Done",        color: "bg-green-100 text-green-700 border-green-200",icon: CheckCircle2 },
};

const PRIORITY_CONFIG = {
  HIGH:   { color: "bg-red-100 text-red-700 border-red-200",         dot: "bg-red-500"    },
  MEDIUM: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
  LOW:    { color: "bg-gray-100 text-gray-500 border-gray-200",       dot: "bg-gray-400"   },
};

function getDueStatus(dueDate?: string, status?: string) {
  if (!dueDate || status === "DONE") return null;
  const diff = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  return null;
}

// ─── Task Row ─────────────────────────────────────────────────────────────────
function TaskRow({
  task,
  canEdit,
  onStatusChange,
  onAIExecuted,
}: {
  task: Task;
  canEdit: boolean;
  onStatusChange: (id: string, status: string) => void;
  onAIExecuted: () => void;
}) {
  const statusCfg   = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
  const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
  const StatusIcon  = statusCfg.icon;
  const dueStatus   = getDueStatus(task.dueDate, task.status);

  return (
    <div className="bg-white border rounded-xl p-4 space-y-3 hover:shadow-sm transition-shadow">
      {/* Title + priority */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 leading-tight">{task.title}</p>
          {task.description && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>
          )}
        </div>
        <Badge variant="outline" className={`text-[10px] flex-shrink-0 flex items-center gap-1 ${priorityCfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${priorityCfg.dot}`} />
          {task.priority}
        </Badge>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {/* Project */}
        {task.project && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Layers className="h-3 w-3 text-indigo-400" />
            <span className="truncate max-w-[100px]">{task.project.name}</span>
          </div>
        )}

        {/* Department */}
        {task.project?.departments?.[0] && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Building2 className="h-3 w-3 text-purple-400" />
            <span>{task.project.departments[0].name}</span>
          </div>
        )}

        {/* Human assignee */}
        {task.employee && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <User className="h-3 w-3 text-blue-400" />
            <span>{task.employee.name}</span>
          </div>
        )}

        {/* Due date */}
        {task.dueDate && (
          <div className={`flex items-center gap-1 text-xs ${
            dueStatus === "overdue" ? "text-red-600 font-medium" :
            dueStatus === "today"   ? "text-orange-600 font-medium" :
            "text-gray-400"
          }`}>
            <Clock className="h-3 w-3" />
            {dueStatus === "overdue" ? "Overdue" :
             dueStatus === "today"   ? "Due today" :
             new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* AI badge */}
      {task.aiEmployee && (
        <div className="flex items-center gap-1.5 text-xs text-violet-600 bg-violet-50 rounded-lg px-2.5 py-1.5 border border-violet-100">
          <Bot className="h-3 w-3" />
          <span>Handled by <strong>{task.aiEmployee.name}</strong> ({task.aiEmployee.role})</span>
          {task.aiExecutedAt && (
            <span className="text-violet-400 ml-auto">
              {new Date(task.aiExecutedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      {/* Footer — status + actions */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-50">
        {/* Status selector — employees can update own tasks */}
        {canEdit ? (
          <Select
            value={task.status}
            onValueChange={(val) => onStatusChange(task.id, val)}
          >
            <SelectTrigger className={`h-7 text-xs w-36 border ${statusCfg.color}`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODO">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="DONE">Mark Done ✓</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge variant="outline" className={`text-xs ${statusCfg.color}`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusCfg.label}
          </Badge>
        )}

        {/* Run with AI — managers and above only */}
        <RoleGuard minRole="MANAGER">
          <RunWithAIDialog
            taskId={task.id}
            taskTitle={task.title}
            onExecuted={onAIExecuted}
          />
        </RoleGuard>
      </div>
    </div>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────
function TasksContent() {
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get("projectId");
  const auth = useAuth();
  const { isAdmin, isManager, role } = useRole();
  const completeStep = useCompleteStep();

  const currentUserId = auth?.currentUser?.id;
  const isEmployee = role === "EMPLOYEE";

  const [tasks, setTasks]           = useState<Task[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filters
  const [search,           setSearch]           = useState("");
  const [filterStatus,     setFilterStatus]     = useState("ALL");
  const [filterPriority,   setFilterPriority]   = useState("ALL");
  const [filterProject,    setFilterProject]    = useState(projectIdParam || "ALL");
  const [filterDepartment, setFilterDepartment] = useState("ALL");
  const [filterAssignee,   setFilterAssignee]   = useState("ALL");

  // Derived filter options
  const [projects,    setProjects]    = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const url = projectIdParam
        ? `/api/tasks?projectId=${projectIdParam}`
        : "/api/tasks";
      const res = await api.get(url);
      let data: Task[] = Array.isArray(res.data) ? res.data : [];

      // ✅ EMPLOYEES only see their own tasks
      if (isEmployee && currentUserId) {
        data = data.filter((t) => t.employee?.id === currentUserId);
      }

      setTasks(data);

      // Build filter options from data
      const projMap = new Map<string, { id: string; name: string }>();
      const deptMap = new Map<string, { id: string; name: string }>();
      data.forEach((t) => {
        if (t.project) {
          projMap.set(t.project.id, { id: t.project.id, name: t.project.name });
          t.project.departments?.forEach((d) =>
            deptMap.set(d.id, { id: d.id, name: d.name })
          );
        }
      });
      setProjects(Array.from(projMap.values()));
      setDepartments(Array.from(deptMap.values()));
    } catch {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [projectIdParam, isEmployee, currentUserId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks, refreshKey]);

  // Status update
  async function handleStatusChange(taskId: string, newStatus: string) {
    try {
      await api.put(`/api/tasks/${taskId}`, { status: newStatus });
      if (newStatus === "DONE") completeStep("task");
      setRefreshKey((k) => k + 1);
      toast.success("Task updated");
    } catch {
      toast.error("Failed to update task");
    }
  }

  // Filter tasks
  const filtered = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
        !(t.project?.name.toLowerCase().includes(search.toLowerCase()))) return false;
    if (filterStatus !== "ALL" && t.status !== filterStatus) return false;
    if (filterPriority !== "ALL" && t.priority !== filterPriority) return false;
    if (filterProject !== "ALL" && t.project?.id !== filterProject) return false;
    if (filterDepartment !== "ALL") {
      const has = t.project?.departments?.some((d) => d.id === filterDepartment);
      if (!has) return false;
    }
    if (filterAssignee === "AI" && !t.aiEmployee) return false;
    if (filterAssignee === "HUMAN" && t.aiEmployee) return false;
    return true;
  });

  // Stats
  const total      = filtered.length;
  const done       = filtered.filter((t) => t.status === "DONE").length;
  const inProgress = filtered.filter((t) => t.status === "IN_PROGRESS").length;
  const overdue    = filtered.filter((t) => getDueStatus(t.dueDate, t.status) === "overdue").length;
  const aiTasks    = filtered.filter((t) => !!t.aiEmployee).length;

  const hasFilter = search || filterStatus !== "ALL" || filterPriority !== "ALL" ||
    filterProject !== "ALL" || filterDepartment !== "ALL" || filterAssignee !== "ALL";

  if (error) {
    return <PageError title="Failed to load tasks" message={error} onRetry={() => setRefreshKey((k) => k + 1)} />;
  }

  const pageTitle = isEmployee ? "My Tasks" : "All Tasks";
  const pageSubtitle = isEmployee
    ? "Tasks assigned to you"
    : projectIdParam
    ? "Tasks for this project"
    : "All tasks across your company";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-indigo-100">
              <Layers className="h-5 w-5 text-indigo-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">{pageTitle}</h1>
          </div>
          <p className="text-gray-500 text-sm ml-12">{pageSubtitle}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total",       value: total,      icon: BarChart3,    color: "text-indigo-600", bg: "bg-indigo-50"  },
          { label: "Done",        value: done,       icon: CheckCircle2, color: "text-green-600",  bg: "bg-green-50"   },
          { label: "In Progress", value: inProgress, icon: Zap,          color: "text-blue-600",   bg: "bg-blue-50"    },
          { label: "Overdue",     value: overdue,    icon: AlertTriangle,color: "text-red-600",    bg: "bg-red-50"     },
          { label: "AI Tasks",    value: aiTasks,    icon: Bot,          color: "text-violet-600", bg: "bg-violet-50"  },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border p-3 flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${bg} flex-shrink-0`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tasks or projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-8 text-xs w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="TODO">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="h-8 text-xs w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priority</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* ✅ Show assignee filter only to managers+ */}
          {(isAdmin || isManager) && (
            <Select value={filterAssignee} onValueChange={setFilterAssignee}>
              <SelectTrigger className="h-8 text-xs w-36">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Assignees</SelectItem>
                <SelectItem value="HUMAN">Human Only</SelectItem>
                <SelectItem value="AI">AI Only</SelectItem>
              </SelectContent>
            </Select>
          )}

          {projects.length > 0 && (
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="h-8 text-xs w-36">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Projects</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {departments.length > 0 && (
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="h-8 text-xs w-36">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {hasFilter && (
            <button
              onClick={() => {
                setSearch(""); setFilterStatus("ALL"); setFilterPriority("ALL");
                setFilterProject("ALL"); setFilterDepartment("ALL"); setFilterAssignee("ALL");
              }}
              className="h-8 text-xs text-gray-400 hover:text-red-500 px-3 rounded-lg border hover:border-red-200 transition-colors flex items-center gap-1"
            >
              <Filter className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={hasFilter ? "No tasks match your filters" : isEmployee ? "No tasks assigned to you yet" : "No tasks yet"}
          description={hasFilter ? "Try adjusting your filters" : "Tasks will appear here once created"}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              canEdit={
                isAdmin || isManager ||
                // Employees can update their own task status
                task.employee?.id === currentUserId
              }
              onStatusChange={handleStatusChange}
              onAIExecuted={() => setRefreshKey((k) => k + 1)}
            />
          ))}
        </div>
      )}

      {/* Result count */}
      {!loading && tasks.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          Showing {filtered.length} of {tasks.length} tasks
          {hasFilter && " (filtered)"}
        </p>
      )}
    </div>
  );
}

export default function TasksPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="space-y-4"><Skeleton className="h-20" /><Skeleton className="h-64" /></div>}>
        <TasksContent />
      </Suspense>
    </ErrorBoundary>
  );
}

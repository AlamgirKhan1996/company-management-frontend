"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/hooks/useRole";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2, Clock, Zap, AlertTriangle,
  Layers, Calendar, FolderKanban, Bot,
  TrendingUp, Target,
} from "lucide-react";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";

type Task = {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string;
  project?: { id: string; name: string };
  employee?: { id: string; name: string };
  aiEmployee?: { name: string; role: string };
};

const STATUS_CONFIG = {
  TODO:        { label: "To Do",       color: "bg-gray-100 text-gray-700 border-gray-200",  icon: Clock,        ring: "border-l-gray-300"   },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-700 border-blue-200",  icon: Zap,          ring: "border-l-blue-400"   },
  DONE:        { label: "Done",        color: "bg-green-100 text-green-700 border-green-200",icon: CheckCircle2, ring: "border-l-green-400"  },
};

const PRIORITY_CONFIG = {
  HIGH:   { color: "bg-red-100 text-red-700 border-red-200",     dot: "bg-red-500"    },
  MEDIUM: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
  LOW:    { color: "bg-gray-100 text-gray-500 border-gray-200",  dot: "bg-gray-400"   },
};

function getDaysUntilDue(dueDate?: string, status?: string) {
  if (!dueDate || status === "DONE") return null;
  const diff = Math.ceil(
    (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  return diff;
}

function MyTasksContent() {
  const auth = useAuth();
  const { role, isAdmin, isManager } = useRole();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [refreshKey, setRefreshKey] = useState(0);

  const currentUserId = auth?.currentUser?.id;
  const currentUserName = auth?.currentUser?.name || auth?.currentUser?.email || "You";

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/tasks");
      const all: Task[] = Array.isArray(res.data) ? res.data : [];

      // Employees only see their own tasks
      // Managers/Admins see all but this page focuses on personal view
      const mine = (isAdmin || isManager)
        ? all
        : all.filter((t) => t.employee?.id === currentUserId);

      setTasks(mine);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [currentUserId, isAdmin, isManager]);

  useEffect(() => { fetchTasks(); }, [fetchTasks, refreshKey]);

  async function updateStatus(taskId: string, newStatus: string) {
    try {
      await api.put(`/api/tasks/${taskId}`, { status: newStatus });
      setRefreshKey((k) => k + 1);
      toast.success("Task status updated");
    } catch {
      toast.error("Failed to update task");
    }
  }

  const filtered = tasks.filter((t) => {
    if (filterStatus !== "ALL" && t.status !== filterStatus) return false;
    if (filterPriority !== "ALL" && t.priority !== filterPriority) return false;
    return true;
  });

  // Stats
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "DONE").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const overdue = tasks.filter((t) => {
    const days = getDaysUntilDue(t.dueDate, t.status);
    return days !== null && days < 0;
  }).length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  const pageTitle = isAdmin || isManager ? "All Tasks" : "My Tasks";
  const pageSubtitle = isAdmin || isManager
    ? "All tasks across your company"
    : `Tasks assigned to ${currentUserName}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
            <Target className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
        </div>
        <p className="text-gray-500 ml-12">{pageSubtitle}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total",       value: total,          icon: Layers,       color: "text-indigo-600", bg: "bg-indigo-50"  },
          { label: "In Progress", value: inProgress,     icon: Zap,          color: "text-blue-600",   bg: "bg-blue-50"    },
          { label: "Completed",   value: done,           icon: CheckCircle2, color: "text-green-600",  bg: "bg-green-50"   },
          { label: "Overdue",     value: overdue,        icon: AlertTriangle,color: "text-red-600",    bg: "bg-red-50"     },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Completion progress */}
      {total > 0 && (
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-gray-700">
                  Overall Progress
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {completionRate}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-green-500 transition-all duration-700"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              {done} of {total} tasks completed
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
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
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Priority</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>

        {(filterStatus !== "ALL" || filterPriority !== "ALL") && (
          <button
            onClick={() => { setFilterStatus("ALL"); setFilterPriority("ALL"); }}
            className="text-xs text-gray-400 hover:text-red-500 px-3 py-1.5 rounded-lg border hover:border-red-200 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Task columns — Kanban style */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-gray-50">
          <CheckCircle2 className="h-8 w-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">
            {tasks.length === 0 ? "No tasks assigned yet" : "No tasks match your filters"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(["TODO", "IN_PROGRESS", "DONE"] as const).map((status) => {
            const cfg = STATUS_CONFIG[status];
            const StatusIcon = cfg.icon;
            const columnTasks = filtered.filter((t) => t.status === status);

            return (
              <div key={status}>
                {/* Column header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`h-4 w-4 ${cfg.color.split(" ")[1]}`} />
                    <h3 className="font-semibold text-sm text-gray-700">{cfg.label}</h3>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Task cards */}
                <div className="space-y-3">
                  {columnTasks.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-xl text-gray-300 text-sm">
                      No tasks
                    </div>
                  ) : (
                    columnTasks.map((task) => {
                      const priCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
                      const daysLeft = getDaysUntilDue(task.dueDate, task.status);
                      const isOverdue = daysLeft !== null && daysLeft < 0;
                      const isDueToday = daysLeft === 0;

                      return (
                        <div
                          key={task.id}
                          className={`
                            bg-white rounded-xl border-l-4 border border-gray-100 p-4 space-y-3
                            shadow-sm hover:shadow-md transition-shadow
                            ${cfg.ring}
                            ${isOverdue ? "border-l-red-500" : ""}
                          `}
                        >
                          {/* Title + priority */}
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm text-gray-900 leading-tight">
                              {task.title}
                            </h4>
                            <Badge
                              variant="outline"
                              className={`text-[10px] flex-shrink-0 flex items-center gap-1 ${priCfg.color}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${priCfg.dot}`} />
                              {task.priority}
                            </Badge>
                          </div>

                          {/* Description */}
                          {task.description && (
                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {/* Project */}
                          {task.project && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <FolderKanban className="h-3 w-3 text-orange-400" />
                              <span>{task.project.name}</span>
                            </div>
                          )}

                          {/* Due date */}
                          {task.dueDate && (
                            <div className={`flex items-center gap-1.5 text-xs ${
                              isOverdue ? "text-red-600" :
                              isDueToday ? "text-orange-600" :
                              "text-gray-400"
                            }`}>
                              <Calendar className="h-3 w-3" />
                              <span>
                                {isOverdue
                                  ? `${Math.abs(daysLeft!)} days overdue`
                                  : isDueToday
                                  ? "Due today!"
                                  : `Due ${new Date(task.dueDate).toLocaleDateString()}`
                                }
                              </span>
                              {isOverdue && <AlertTriangle className="h-3 w-3" />}
                            </div>
                          )}

                          {/* AI agent badge */}
                          {task.aiEmployee && (
                            <div className="flex items-center gap-1.5 text-xs text-violet-600 bg-violet-50 rounded-lg px-2 py-1">
                              <Bot className="h-3 w-3" />
                              <span>{task.aiEmployee.name} handled this</span>
                            </div>
                          )}

                          {/* Status update — only show if not DONE, or if DONE allow reopen */}
                          <div className="pt-1 border-t border-gray-50">
                            <Select
                              value={task.status}
                              onValueChange={(val) => updateStatus(task.id, val)}
                            >
                              <SelectTrigger className={`h-7 text-xs border ${cfg.color}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="TODO">To Do</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="DONE">Mark Done ✓</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TasksPage() {
  return (
    <ErrorBoundary>
      <MyTasksContent />
    </ErrorBoundary>
  );
}

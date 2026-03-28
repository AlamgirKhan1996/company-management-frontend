"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api-client";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2, Clock, Zap, XCircle, HelpCircle,
  Search, Bot, User, Building2, Layers, Filter,
  AlertTriangle, BarChart3,
} from "lucide-react";
import RunWithAIDialog from "@/components/tasks/RunWithAIDialog";

type Department = { id: string; name: string };
type Project = {
  id: string; name: string;
  departments: Department[];
};
type Employee = { id: string; name: string; email: string; role: string };
type AIEmployee = { id: string; name: string; role: string; department: string };

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

const STATUS_CONFIG = {
  TODO: { label: "Todo", color: "bg-gray-100 text-gray-600 border-gray-200", icon: Clock },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Zap },
  DONE: { label: "Done", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
};

const PRIORITY_CONFIG = {
  HIGH: { color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
  MEDIUM: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
  LOW: { color: "bg-gray-100 text-gray-500 border-gray-200", dot: "bg-gray-400" },
};

function getDueStatus(dueDate?: string, status?: string) {
  if (!dueDate || status === "DONE") return null;
  const due = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "today";
  return null;
}

function TasksContent() {
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get("projectId");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filter state
  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState(projectIdParam || "ALL");
  const [filterDepartment, setFilterDepartment] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");

  // Derived filter options
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const url = projectIdParam
        ? `/api/tasks?projectId=${projectIdParam}`
        : "/api/tasks";
      const res = await api.get(url);
      const data: Task[] = Array.isArray(res.data) ? res.data : [];
      setTasks(data);

      // Build unique project + department lists from task data
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
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [projectIdParam, refreshKey]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Apply all filters
  const filtered = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
        !(t.project?.name.toLowerCase().includes(search.toLowerCase()))) return false;
    if (filterProject !== "ALL" && t.project?.id !== filterProject) return false;
    if (filterStatus !== "ALL" && t.status !== filterStatus) return false;
    if (filterPriority !== "ALL" && t.priority !== filterPriority) return false;
    if (filterDepartment !== "ALL") {
      const hasDept = t.project?.departments?.some((d) => d.id === filterDepartment);
      if (!hasDept) return false;
    }
    return true;
  });

  // Stats
  const total = filtered.length;
  const done = filtered.filter((t) => t.status === "DONE").length;
  const inProgress = filtered.filter((t) => t.status === "IN_PROGRESS").length;
  const overdue = filtered.filter((t) => getDueStatus(t.dueDate, t.status) === "overdue").length;
  const aiExecuted = filtered.filter((t) => t.aiEmployee).length;

  const hasActiveFilter =
    search || filterProject !== "ALL" || filterDepartment !== "ALL" ||
    filterStatus !== "ALL" || filterPriority !== "ALL";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {projectIdParam ? "Project Tasks" : "All Tasks"}
            </h1>
          </div>
          <p className="text-gray-500 ml-12">
            {projectIdParam
              ? "Viewing tasks for this project"
              : "Global task view across all projects and departments"}
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total", value: total, icon: BarChart3, color: "bg-indigo-50 text-indigo-600" },
          { label: "Done", value: done, icon: CheckCircle2, color: "bg-green-50 text-green-600" },
          { label: "In Progress", value: inProgress, icon: Zap, color: "bg-blue-50 text-blue-600" },
          { label: "Overdue", value: overdue, icon: AlertTriangle, color: "bg-red-50 text-red-600" },
          { label: "AI Executed", value: aiExecuted, icon: Bot, color: "bg-violet-50 text-violet-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border p-3 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks or projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="TODO">Todo</SelectItem>
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

            {projects.length > 0 && (
              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger className="w-40">
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
                <SelectTrigger className="w-40">
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

            {hasActiveFilter && (
              <button
                onClick={() => {
                  setSearch(""); setFilterProject("ALL");
                  setFilterDepartment("ALL"); setFilterStatus("ALL");
                  setFilterPriority("ALL");
                }}
                className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 px-2 py-1 rounded border hover:border-red-200 transition-colors"
              >
                <XCircle className="h-3 w-3" /> Clear filters
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tasks table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-gray-50">
          <Layers className="h-8 w-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No tasks found</p>
          <p className="text-gray-400 text-sm mt-1">
            {hasActiveFilter ? "Try adjusting your filters" : "No tasks exist yet"}
          </p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Task</TableHead>
                <TableHead className="font-semibold text-gray-700">
                  <div className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> Project</div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  <div className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> Departments</div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700">Priority</TableHead>
                <TableHead className="font-semibold text-gray-700">Due Date</TableHead>
                <TableHead className="font-semibold text-gray-700">
                  <div className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Assigned To</div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  <div className="flex items-center gap-1"><Bot className="h-3.5 w-3.5" /> AI Agent</div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((task) => {
                const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
                const StatusIcon = statusCfg.icon;
                const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
                const dueStatus = getDueStatus(task.dueDate, task.status);

                return (
                  <TableRow key={task.id} className="hover:bg-gray-50 transition-colors group">
                    {/* Task title */}
                    <TableCell className="max-w-[200px]">
                      <div>
                        <p className="font-medium text-gray-900 truncate">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">{task.description}</p>
                        )}
                      </div>
                    </TableCell>

                    {/* Project */}
                    <TableCell>
                      {task.project ? (
                        <span className="text-sm font-medium text-indigo-600 hover:underline cursor-pointer">
                          {task.project.name}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </TableCell>

                    {/* Departments */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {task.project?.departments?.length ? (
                          task.project.departments.map((d) => (
                            <Badge
                              key={d.id}
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 bg-purple-50 text-purple-700 border-purple-200"
                            >
                              {d.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-300 text-sm">—</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge variant="outline" className={`text-xs flex items-center gap-1 w-fit ${statusCfg.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusCfg.label}
                      </Badge>
                    </TableCell>

                    {/* Priority */}
                    <TableCell>
                      <Badge variant="outline" className={`text-xs flex items-center gap-1.5 w-fit ${priorityCfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${priorityCfg.dot}`} />
                        {task.priority}
                      </Badge>
                    </TableCell>

                    {/* Due date */}
                    <TableCell>
                      {task.dueDate ? (
                        <div className="flex items-center gap-1">
                          <span className={`text-xs font-medium ${
                            dueStatus === "overdue" ? "text-red-600" :
                            dueStatus === "today" ? "text-orange-600" :
                            "text-gray-600"
                          }`}>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          {dueStatus === "overdue" && (
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </TableCell>

                    {/* Human assignee */}
                    <TableCell>
                      {task.employee ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                            {task.employee.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs text-gray-700">{task.employee.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </TableCell>

                    {/* AI Employee */}
                    <TableCell>
                      {task.aiEmployee ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center">
                            <Bot className="h-3 w-3 text-violet-700" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-violet-700">{task.aiEmployee.name}</p>
                            <p className="text-[10px] text-gray-400">{task.aiEmployee.role}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Not assigned</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <RunWithAIDialog
                        taskId={task.id}
                        taskTitle={task.title}
                        onExecuted={() => setRefreshKey((k) => k + 1)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="px-4 py-3 border-t bg-gray-50 text-xs text-gray-400">
            Showing {filtered.length} of {tasks.length} tasks
            {hasActiveFilter && " (filtered)"}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GlobalTasksPage() {
  return (
    <Suspense fallback={<div className="space-y-4"><Skeleton className="h-20" /><Skeleton className="h-64" /></div>}>
      <TasksContent />
    </Suspense>
  );
}

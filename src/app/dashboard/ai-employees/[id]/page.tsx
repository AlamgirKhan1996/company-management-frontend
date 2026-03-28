"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api-client";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bot, ArrowLeft, CheckCircle2, Clock, AlertCircle,
  XCircle, HelpCircle, Zap, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AssignTaskDialog from "@/components/ai-employees/AssignTaskDialog";

type AIEmployee = {
  id: string;
  name: string;
  role: string;
  department: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
};

type AITaskResult = {
  taskSummary?: string;
  plan?: string[];
  execution?: string;
  status?: string;
  impact?: string;
  suggestions?: string[];
};

type AITask = {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "NEEDS_CLARIFICATION" | "FAILED";
  priority: string;
  result: AITaskResult | null;
  executedAt: string | null;
  createdAt: string;
};

const STATUS_CONFIG = {
  COMPLETED: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", border: "border-green-200", label: "Completed" },
  PENDING: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", label: "Pending" },
  IN_PROGRESS: { icon: Zap, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", label: "In Progress" },
  NEEDS_CLARIFICATION: { icon: HelpCircle, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", label: "Needs Clarification" },
  FAILED: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "Failed" },
};

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700 border-red-200",
  MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
  LOW: "bg-gray-100 text-gray-600 border-gray-200",
};

const AVATAR_COLORS = [
  "bg-purple-500", "bg-blue-500", "bg-pink-500",
  "bg-green-600", "bg-orange-500", "bg-teal-500",
  "bg-red-500", "bg-indigo-500",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function TaskResultCard({ result }: { result: AITaskResult }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="mt-3 rounded-xl border bg-gray-950 text-gray-100 overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          </div>
          <span className="text-xs text-gray-400 font-mono ml-2">AI Response</span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {expanded && (
        <div className="p-4 space-y-4 font-mono text-sm">
          {/* Summary */}
          {result.taskSummary && (
            <div>
              <span className="text-indigo-400 text-xs uppercase tracking-widest">Task Summary</span>
              <p className="text-gray-200 mt-1 font-sans text-sm">{result.taskSummary}</p>
            </div>
          )}

          {/* Plan */}
          {result.plan && result.plan.length > 0 && (
            <div>
              <span className="text-indigo-400 text-xs uppercase tracking-widest">Execution Plan</span>
              <ol className="mt-2 space-y-1">
                {result.plan.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300 text-xs font-sans">
                    <span className="text-indigo-400 font-mono mt-0.5">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Execution */}
          {result.execution && (
            <div>
              <span className="text-indigo-400 text-xs uppercase tracking-widest">Execution Output</span>
              <p className="text-gray-200 mt-1 font-sans text-sm leading-relaxed whitespace-pre-wrap">
                {result.execution}
              </p>
            </div>
          )}

          {/* Impact */}
          {result.impact && (
            <div className="border-t border-gray-800 pt-3">
              <span className="text-green-400 text-xs uppercase tracking-widest">Business Impact</span>
              <p className="text-gray-200 mt-1 font-sans text-sm">{result.impact}</p>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions && result.suggestions.length > 0 && (
            <div>
              <span className="text-yellow-400 text-xs uppercase tracking-widest">Suggestions</span>
              <ul className="mt-2 space-y-1">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300 text-xs font-sans">
                    <span className="text-yellow-400">›</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AIEmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<AIEmployee | null>(null);
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchAgent = useCallback(async () => {
    try {
      const res = await api.get(`/api/ai-employees`);
      const all = Array.isArray(res.data) ? res.data : [];
      const found = all.find((a: AIEmployee) => a.id === agentId);
      setAgent(found || null);
    } catch {
      toast.error("Failed to load agent");
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  const fetchTasks = useCallback(async () => {
    try {
      setTasksLoading(true);
      const res = await api.get(`/api/ai-employees/${agentId}/tasks`);
      const data = Array.isArray(res.data) ? res.data : [];
      setTasks(data);
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Failed to load tasks");
    } finally {
      setTasksLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchAgent();
    fetchTasks();
  }, [fetchAgent, fetchTasks, refreshKey]);

  const handleTaskCreated = () => setRefreshKey((k) => k + 1);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
        <p className="text-gray-600">Agent not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard/ai-employees")}>
          Go back
        </Button>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
  const failedCount = tasks.filter((t) => t.status === "FAILED").length;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push("/dashboard/ai-employees")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to AI Employees
      </button>

      {/* Agent profile card */}
      <Card className="border-0 shadow-md bg-linear-to-br from-indigo-600 to-violet-700 text-white overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg bg-white/20 backdrop-blur`}>
                {getInitials(agent.name)}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{agent.name}</h1>
                <p className="text-indigo-200 text-sm">{agent.role}</p>
                <p className="text-indigo-300 text-xs mt-0.5">{agent.department}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <Badge className={`${agent.isActive ? "bg-green-400/20 text-green-200 border-green-400/40" : "bg-white/10 text-white/60"} border`}>
                {agent.isActive ? "● Active" : "○ Inactive"}
              </Badge>
              <AssignTaskDialog agentId={agent.id} agentName={agent.name} onTaskAssigned={handleTaskCreated} />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{tasks.length}</p>
              <p className="text-indigo-200 text-xs mt-0.5">Total Tasks</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-300">{completedCount}</p>
              <p className="text-indigo-200 text-xs mt-0.5">Completed</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-red-300">{failedCount}</p>
              <p className="text-indigo-200 text-xs mt-0.5">Failed</p>
            </div>
          </div>

          {/* Permissions */}
          {agent.permissions.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {agent.permissions.map((p) => (
                <span key={p} className="text-xs bg-white/10 text-indigo-100 px-2.5 py-1 rounded-full border border-white/20">
                  {p.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task history */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Task History</h2>

        {tasksLoading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-gray-50">
            <Bot className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No tasks assigned yet</p>
            <p className="text-gray-400 text-xs mt-1">Assign a task to see the AI response here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.PENDING;
              const StatusIcon = cfg.icon;

              return (
                <Card key={task.id} className={`border ${cfg.border} overflow-hidden`}>
                  <CardHeader className={`pb-3 ${cfg.bg}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 flex-1">
                        <StatusIcon className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.color}`} />
                        <div>
                          <CardTitle className="text-sm font-semibold">{task.title}</CardTitle>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{task.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={`text-xs ${PRIORITY_COLORS[task.priority] || ""}`}>
                          {task.priority}
                        </Badge>
                        <Badge variant="outline" className={`text-xs border ${cfg.border} ${cfg.color} ${cfg.bg}`}>
                          {cfg.label}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400 ml-6">
                      {task.executedAt
                        ? `Executed ${new Date(task.executedAt).toLocaleString()}`
                        : `Created ${new Date(task.createdAt).toLocaleString()}`}
                    </p>
                  </CardHeader>

                  {task.result && (
                    <CardContent className="pt-0 pb-4 px-4">
                      <TaskResultCard result={task.result} />
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

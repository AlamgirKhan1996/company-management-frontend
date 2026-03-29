"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api-client";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import RoleGuard from "@/components/auth/RoleGuard";
import { Button } from "@/components/ui/button";
import {
  Activity, Search, ChevronLeft, ChevronRight,
  User, Layers, Building2, FolderKanban, Bot,
  Trash2, PenLine, Plus, Eye, Zap, Shield,
} from "lucide-react";

type ActivityLog = {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  createdAt: string;
  user?: { id: string; name?: string; email: string };
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

// Map action → icon + color
const ACTION_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  CREATE_DEPARTMENT:    { icon: Plus,     color: "text-green-700",  bg: "bg-green-100"  },
  UPDATE_DEPARTMENT:    { icon: PenLine,  color: "text-blue-700",   bg: "bg-blue-100"   },
  DELETE_DEPARTMENT:    { icon: Trash2,   color: "text-red-700",    bg: "bg-red-100"    },
  GET_ALL_DEPARTMENTS:  { icon: Eye,      color: "text-gray-600",   bg: "bg-gray-100"   },
  TASK_CREATED:         { icon: Plus,     color: "text-green-700",  bg: "bg-green-100"  },
  TASK_UPDATED:         { icon: PenLine,  color: "text-blue-700",   bg: "bg-blue-100"   },
  TASK_AI_EXECUTED:     { icon: Zap,      color: "text-violet-700", bg: "bg-violet-100" },
  CREATE_PROJECT:       { icon: Plus,     color: "text-green-700",  bg: "bg-green-100"  },
  UPDATE_PROJECT:       { icon: PenLine,  color: "text-blue-700",   bg: "bg-blue-100"   },
  DELETE_PROJECT:       { icon: Trash2,   color: "text-red-700",    bg: "bg-red-100"    },
  GET_ALL_TASKS:        { icon: Eye,      color: "text-gray-600",   bg: "bg-gray-100"   },
  AI_EXECUTE_TASK:      { icon: Bot,      color: "text-violet-700", bg: "bg-violet-100" },
};

const ENTITY_ICON: Record<string, React.ElementType> = {
  Department: Building2,
  Employee: User,
  Project: FolderKanban,
  Task: Layers,
  AIEmployee: Bot,
  System: Shield,
};

const ENTITY_OPTIONS = ["Department", "Employee", "Project", "Task", "AIEmployee"];
const ACTION_OPTIONS = [
  "TASK_CREATED", "TASK_UPDATED", "TASK_AI_EXECUTED",
  "CREATE_DEPARTMENT", "UPDATE_DEPARTMENT", "DELETE_DEPARTMENT",
  "CREATE_PROJECT", "UPDATE_PROJECT", "DELETE_PROJECT",
  "AI_EXECUTE_TASK",
];

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function getInitials(name?: string, email?: string) {
  if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  if (email) return email[0].toUpperCase();
  return "?";
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterEntity, setFilterEntity] = useState("ALL");
  const [filterAction, setFilterAction] = useState("ALL");

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });
      if (filterEntity !== "ALL") params.set("entity", filterEntity);
      if (filterAction !== "ALL") params.set("action", filterAction);

      const res = await api.get(`/api/activity?${params.toString()}`);
      setLogs(res.data.logs ?? []);
      setPagination(res.data.pagination ?? null);
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  }, [page, filterEntity, filterAction]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Client-side search filter
  const filtered = search
    ? logs.filter(
        (l) =>
          l.action.toLowerCase().includes(search.toLowerCase()) ||
          l.entity.toLowerCase().includes(search.toLowerCase()) ||
          l.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
          l.user?.email?.toLowerCase().includes(search.toLowerCase())
      )
    : logs;

  return (
    <RoleGuard minRole="USER">
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-gradient-to-br from-slate-600 to-gray-800 shadow-md">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
          </div>
          <p className="text-gray-500 ml-12">
            Full audit trail of all actions across your company
          </p>
        </div>
        {pagination && (
          <div className="text-sm text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border">
            {pagination.total.toLocaleString()} total events
          </div>
        )}
      </div>

      {/* Filters */}
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by action, entity, or user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterEntity} onValueChange={(v) => { setFilterEntity(v); setPage(1); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Entities</SelectItem>
                {ENTITY_OPTIONS.map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterAction} onValueChange={(v) => { setFilterAction(v); setPage(1); }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Actions</SelectItem>
                {ACTION_OPTIONS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(filterEntity !== "ALL" || filterAction !== "ALL" || search) && (
              <button
                onClick={() => { setFilterEntity("ALL"); setFilterAction("ALL"); setSearch(""); setPage(1); }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded border hover:border-red-200"
              >
                Clear
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-gray-50">
          <Activity className="h-8 w-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No activity found</p>
        </div>
      ) : (
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="py-3 px-5 border-b bg-gray-50">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {filtered.length} events
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {filtered.map((log) => {
                const cfg = ACTION_CONFIG[log.action] || {
                  icon: Activity,
                  color: "text-gray-600",
                  bg: "bg-gray-100",
                };
                const ActionIcon = cfg.icon;
                const EntityIcon = ENTITY_ICON[log.entity] || Activity;

                let parsedDetails: Record<string, unknown> | null = null;
                try {
                  if (log.details) parsedDetails = JSON.parse(log.details);
                } catch { /* ignore */ }

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    {/* Action icon */}
                    <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${cfg.bg}`}>
                      <ActionIcon className={`h-4 w-4 ${cfg.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-gray-900">
                            {log.action.replace(/_/g, " ")}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 flex items-center gap-1"
                          >
                            <EntityIcon className="h-2.5 w-2.5" />
                            {log.entity}
                          </Badge>
                        </div>
                        <span className="text-[11px] text-gray-400 flex-shrink-0">
                          {timeAgo(log.createdAt)}
                        </span>
                      </div>

                      {/* Details */}
                      {parsedDetails && (
                        <div className="mt-1 text-xs text-gray-500 flex flex-wrap gap-x-3">
                          {Object.entries(parsedDetails)
                            .filter(([, v]) => v !== null && v !== undefined && v !== "")
                            .slice(0, 4)
                            .map(([k, v]) => (
                              <span key={k}>
                                <span className="text-gray-400">{k}:</span>{" "}
                                <span className="text-gray-600">{String(v)}</span>
                              </span>
                            ))}
                        </div>
                      )}

                      {/* User */}
                      {log.user && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-700">
                            {getInitials(log.user.name, log.user.email)}
                          </div>
                          <span className="text-[11px] text-gray-400">
                            {log.user.name || log.user.email}
                          </span>
                          <span className="text-[11px] text-gray-300">·</span>
                          <span className="text-[11px] text-gray-400">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Page {pagination.page} of {pagination.pages} ·{" "}
            {pagination.total} total events
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
    </RoleGuard>
  );
}

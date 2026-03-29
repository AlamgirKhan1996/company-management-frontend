"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api-client";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Briefcase, CheckCircle2, Clock, } from "lucide-react";
import RoleGuard from "@/components/auth/RoleGuard";
import Link from "next/link";
import CreateAIEmployeeDialog from "@/components/ai-employees/CreateAIEmployeeDialog";

type AIEmployee = {
  id: string;
  name: string;
  role: string;
  department: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  _count: { tasks: number };
};

const DEPT_COLORS: Record<string, string> = {
  "Human Resources": "bg-purple-100 text-purple-700 border-purple-200",
  "Sales": "bg-blue-100 text-blue-700 border-blue-200",
  "Marketing": "bg-pink-100 text-pink-700 border-pink-200",
  "Finance": "bg-green-100 text-green-700 border-green-200",
  "Engineering": "bg-orange-100 text-orange-700 border-orange-200",
  "Support": "bg-teal-100 text-teal-700 border-teal-200",
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

export default function AIEmployeesPage() {
  const [agents, setAgents] = useState<AIEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/ai-employees");
      const data = Array.isArray(res.data) ? res.data : [];
      setAgents(data);
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Failed to load AI employees");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents, refreshKey]);

  const activeCount = agents.filter((a) => a.isActive).length;
  const totalTasks = agents.reduce((sum, a) => sum + a._count.tasks, 0);

  return (
    <RoleGuard minRole="ADMIN">
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-linear-to-br from-violet-500 to-indigo-600 shadow-md">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">AI Employees</h1>
          </div>
          <p className="text-gray-500 ml-12">
            Your autonomous digital workforce — assign tasks, get structured results
          </p>
        </div>
        <CreateAIEmployeeDialog onCreated={() => setRefreshKey((k) => k + 1)} />
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50">
            <Bot className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Agents</p>
            <p className="text-2xl font-bold">{agents.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Active</p>
            <p className="text-2xl font-bold">{activeCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50">
            <Briefcase className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Tasks Executed</p>
            <p className="text-2xl font-bold">{totalTasks}</p>
          </div>
        </div>
      </div>

      {/* Agent grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-2xl bg-gray-50">
          <div className="p-4 rounded-full bg-indigo-100 mb-4">
            <Bot className="h-8 w-8 text-indigo-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">No AI employees yet</h3>
          <p className="text-gray-400 text-sm mt-1 mb-4">
            Create your first AI agent to start delegating tasks
          </p>
          <CreateAIEmployeeDialog onCreated={() => setRefreshKey((k) => k + 1)} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <Link key={agent.id} href={`/dashboard/ai-employees/${agent.id}`}>
              <Card className="group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border hover:border-indigo-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm ${getAvatarColor(agent.name)}`}>
                        {getInitials(agent.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                          {agent.name}
                        </p>
                        <p className="text-xs text-gray-500">{agent.role}</p>
                      </div>
                    </div>
                    <Badge
                      className={`text-xs ${agent.isActive
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}
                      variant="outline"
                    >
                      {agent.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Department */}
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium ${DEPT_COLORS[agent.department] || "bg-gray-100 text-gray-600"}`}
                  >
                    {agent.department}
                  </Badge>

                  {/* Permissions */}
                  <div className="flex flex-wrap gap-1">
                    {agent.permissions.slice(0, 3).map((p) => (
                      <span
                        key={p}
                        className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
                      >
                        {p.replace(/_/g, " ")}
                      </span>
                    ))}
                    {agent.permissions.length > 3 && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        +{agent.permissions.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1 border-t">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>{agent._count.tasks} tasks run</span>
                    </div>
                    <span className="text-xs text-indigo-500 font-medium group-hover:underline">
                      Assign task →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
    </RoleGuard>
  );
}

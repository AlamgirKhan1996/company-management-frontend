"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AxiosError } from "axios";
import CreateProjectDialog from "@/components/Projects/CreateProjectDialog";
import RoleGuard from "@/components/auth/RoleGuard";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCompleteStep } from "@/hooks/useCompleteStep";
import { FolderKanban, ExternalLink } from "lucide-react";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";

type ProjectStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "TODO" | "DONE";

type Project = {
  id: string;
  name: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string | null;
  departments: { id: string; name: string }[];
  createdBy?: { name?: string; email: string };
};

const STATUS_COLOR: Record<string, string> = {
  IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
  COMPLETED:   "bg-green-100 text-green-700 border-green-200",
  DONE:        "bg-green-100 text-green-700 border-green-200",
  ON_HOLD:     "bg-red-100 text-red-700 border-red-200",
  PLANNED:     "bg-gray-100 text-gray-600 border-gray-200",
  TODO:        "bg-gray-100 text-gray-600 border-gray-200",
};

function ProjectsContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const completeStep = useCompleteStep();

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/projects");
      setProjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects, refreshKey]);

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-orange-100">
              <FolderKanban className="h-5 w-5 text-orange-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Projects</h1>
          </div>
          <p className="text-gray-500 text-sm ml-12">
            Manage all company projects
          </p>
        </div>

        <RoleGuard minRole="MANAGER">
          <CreateProjectDialog
            onCreated={() => {
              completeStep("project");
              handleRefresh();
            }}
          />
        </RoleGuard>
      </div>

      {/* Responsive table */}
      <ResponsiveTable
        title="Projects List"
        loading={loading}
        empty="No projects yet. Create your first project above."
        columns={["Project", "Status", "Departments", "Start Date", "Tasks"]}
        rows={projects.map((project) => ({
          key: project.id,
          badge: (
            <Badge
              variant="outline"
              className={`text-[10px] ${STATUS_COLOR[project.status] ?? "bg-gray-100 text-gray-500"}`}
            >
              {project.status.replace("_", " ")}
            </Badge>
          ),
          cells: [
            <div>
              <p className="font-semibold text-gray-900">{project.name}</p>
              {project.createdBy && (
                <p className="text-xs text-gray-400 mt-0.5">
                  By {project.createdBy.name || project.createdBy.email}
                </p>
              )}
            </div>,
            <Badge
              variant="outline"
              className={`text-[10px] ${STATUS_COLOR[project.status] ?? ""}`}
            >
              {project.status.replace("_", " ")}
            </Badge>,
            <div className="flex flex-wrap gap-1">
              {project.departments.length > 0
                ? project.departments.map((d) => (
                    <Badge key={d.id} variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200">
                      {d.name}
                    </Badge>
                  ))
                : <span className="text-gray-300 text-sm">—</span>
              }
            </div>,
            <span className="text-gray-500 text-sm">
              {project.startDate
                ? new Date(project.startDate).toLocaleDateString()
                : "—"}
            </span>,
            <Link href={`/dashboard/tasks?projectId=${project.id}`}>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <ExternalLink className="h-3 w-3" />
                Tasks
              </Button>
            </Link>,
          ],
        }))}
      />
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <ErrorBoundary>
      <ProjectsContent />
    </ErrorBoundary>
   );
}

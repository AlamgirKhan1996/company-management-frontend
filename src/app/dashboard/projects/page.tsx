"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AxiosError } from "axios";
import CreateProjectDialog from "@/components/Projects/CreateProjectDialog";
import { USE_MOCK_API } from "@/lib/CreateProjectDialog";
import { getMockProjects } from "@/mocks/projects";
import Link from "next/link";
import { Button } from "@/components/ui/button";


type Project = {
  id: string;
  name: string;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "PLANNED" | "COMPLETED" | "ON_HOLD";
  startDate: string;
  endDate: string | null;
  departments: { id: string; name: string }[];
  createdBy?: { id: string; name?: string; email: string };
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // async function fetchProjects() {
  //   try {
  //     const res = await api.get("/api/projects");
  //     setProjects(res.data);
  //   } catch (error) {
  //       const err = error as AxiosError<{ error: string }>;
  //       toast.error(err.response?.data?.error || "Failed to load projects");
  //   } finally {
  //     setLoading(false);
  //   }
  // }
  async function fetchProjects() {
    try {
      if (USE_MOCK_API) {
        const mockProjects = getMockProjects().map((p) => ({
          ...p,
          endDate: p.endDate ?? null,
          createdBy: p.createdBy ? { id: "", ...p.createdBy } : undefined,
        }));
        setProjects(mockProjects);
        return;
      }

      // const res = await api.get("/api/projects");
      // setProjects(res.data);
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      toast.error(err.response?.data?.error || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    fetchProjects();
  }, []);

  

  const statusColor = (status: Project["status"]) => {
    switch (status) {
      case "TODO":
        return "secondary";
      case "IN_PROGRESS":
        return "default";
      case "DONE":
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-gray-500 mt-1">
          Manage all company projects
        </p>
      </div>

      <CreateProjectDialog onCreated={fetchProjects} />

      <Card>
        <CardHeader>
          <CardTitle>Projects List</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Loading projects...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Departments</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Tasks</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {projects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">
                      No projects found
                    </TableCell>
                  </TableRow>
                )}

                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      {project.name}
                    </TableCell>

                    <TableCell>
                      <Badge variant={statusColor(project.status)}>
                        {project.status.replace("_", " ")}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {project.departments.map((d) => (
                          <Badge key={d.id} variant="outline">
                            {d.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell>
                      {project.startDate
                        ? new Date(project.startDate).toLocaleDateString()
                        : "-"}
                    </TableCell>

                    <TableCell>
                      {project.endDate
                        ? new Date(project.endDate).toLocaleDateString()
                        : "-"}
                    </TableCell>

                    <TableCell>
                      {project.createdBy?.email || "-"}
                    </TableCell>

                    <TableCell>
  <Link href={`/dashboard/projects/${project.id}/tasks`}>
    <Button size="sm" variant="outline">
      View Tasks
    </Button>
  </Link>
</TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

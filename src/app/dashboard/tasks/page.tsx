"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import api from "@/lib/api-client";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getDueStatus } from "@/lib/dateUtils";
import type { TaskStatus } from "@/types/task";

type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  projectId: string;
  assignedToId?: string;
  priority?: string;
};

type Employee = {
  id: string;
  name: string;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchByUserId, setSearchByUserId] = useState("");
  const [searchByName, setSearchByName] = useState("");

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const [tasksRes, employeesRes] = await Promise.all([
        api.get<Task[]>("/api/tasks"),
        api.get<Employee[]>("/api/employees"),
      ]);
      setTasks(tasksRes.data);
      setEmployees(employeesRes.data);
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>;
      toast.error(error.response?.data?.error || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const getAssigneeName = (assignedToId?: string) => {
    if (!assignedToId) return "—";
    const emp = employees.find((e) => e.id === assignedToId);
    return emp ? emp.name : assignedToId;
  };

  const filteredTasks = useMemo(() => {
    const idQ = searchByUserId.trim().toLowerCase();
    const nameQ = searchByName.trim().toLowerCase();
    return tasks.filter((task) => {
      const byId =
        !idQ ||
        (task.assignedToId &&
          task.assignedToId.toLowerCase().includes(idQ));
      const assigneeName = task.assignedToId
        ? (employees.find((e) => e.id === task.assignedToId)?.name ?? task.assignedToId).toLowerCase()
        : "";
      const byName = !nameQ || assigneeName.includes(nameQ);
      return byId && byName;
    });
  }, [tasks, employees, searchByUserId, searchByName]);

  const statusVariant = (status: TaskStatus) => {
    switch (status) {
      case "TODO":
        return "secondary";
      case "IN_PROGRESS":
        return "default";
      case "DONE":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tasks</h1>
        <p className="text-gray-500 mt-1">
          All tasks across projects. Search by assignee ID or name.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>All Tasks</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder="Search by user ID..."
              value={searchByUserId}
              onChange={(e) => setSearchByUserId(e.target.value)}
              className="w-full sm:w-48"
            />
            <Input
              placeholder="Search by user name..."
              value={searchByName}
              onChange={(e) => setSearchByName(e.target.value)}
              className="w-full sm:w-48"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due date</TableHead>
                  <TableHead>Assignee (ID)</TableHead>
                  <TableHead>Assignee (name)</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-gray-500 py-8"
                    >
                      {tasks.length === 0
                        ? "No tasks found"
                        : "No tasks match the current search"}
                    </TableCell>
                  </TableRow>
                )}
                {filteredTasks.map((task) => {
                  const dueStatus = getDueStatus(task.dueDate, task.status);
                  return (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(task.status)}>
                          {task.status.replace("_", " ")}
                        </Badge>
                        {dueStatus === "OVERDUE" && (
                          <Badge variant="destructive" className="ml-1">
                            Overdue
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {task.assignedToId ?? "—"}
                      </TableCell>
                      <TableCell>
                        {getAssigneeName(task.assignedToId)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {task.projectId}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/dashboard/projects/${task.projectId}/tasks`}
                        >
                          <Button size="sm" variant="outline">
                            View in project
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

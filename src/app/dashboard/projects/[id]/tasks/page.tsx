"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task, TaskStatus, getTasksByProject, updateMockTaskStatus } from "@/mocks/tasks";
import CreateTaskDialog from "@/components/tasks/CreateTaskDialog";
import { Badge } from "@/components/ui/badge";
import { getEmployees } from "@/mocks/employees";
import { assignMockTask } from "@/mocks/tasks";
import { getDueStatus } from "@/lib/dateUtils";
import TaskComments from "@/components/tasks/taskComments";

const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export default function ProjectTasksPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [tasks, setTasks] = useState<Task[]>([]);
  const employees = getEmployees();
  useEffect(() => {
    setTasks(getTasksByProject(projectId));
  }, [projectId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Project Tasks</h1>
        <p className="text-gray-500 mt-1">
          Tasks for project ID: {projectId}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATUSES.map((status) => (
          <Card key={status}>
            <CardHeader>
              <CardTitle>{status.replace("_", " ")}</CardTitle>
            
              <CreateTaskDialog projectId={projectId} onCreated={() => {
  setTasks(getTasksByProject(projectId));
}} />

            </CardHeader>

            <CardContent className="space-y-3">
              {tasks
                .filter((t) => t.status === status)
                .map((task) => {
                  const assignedEmployee = employees.find(
                    (e) => e.id === task.assignedToId
                  );

                  const dueStatus = getDueStatus(task.dueDate, task.status);

                  return (
                    <div
                      key={task.id}
                      className={`border rounded-md p-3 bg-white space-y-3
                      ${dueStatus === "OVERDUE" ? "border-red-500" : ""}
                      ${dueStatus === "DUE_TODAY" ? "border-yellow-500" : ""}
                      ${dueStatus === "UPCOMING" ? "border-green-500" : ""}
                      `}>
                      <p className="font-medium">{task.title}</p>
                      {/* Due Date */}

                      {/* Assign employee */}
                      <Select
                        value={task.assignedToId || ""}
                        onValueChange={(value) => {
                          assignMockTask(projectId, task.id, value);
                          setTasks(getTasksByProject(projectId));
                        }}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue
                            placeholder={
                              assignedEmployee
                                ? assignedEmployee.name
                                : "Unassigned"
                            }
                          />
                        </SelectTrigger>

                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Status Dropdown */}
  <Select
    value={task.status}
    onValueChange={(value) => {
      updateMockTaskStatus(projectId, task.id, value as TaskStatus);
      setTasks(getTasksByProject(projectId));
    }}
  >
    <SelectTrigger className="w-40">
      <SelectValue />
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="TODO">Todo</SelectItem>
      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
      <SelectItem value="DONE">Done</SelectItem>
    </SelectContent>
  </Select>

                      {/* Status */}
                      <Badge
                        variant={
                          task.status === "DONE"
                            ? "default"
                            : task.status === "IN_PROGRESS"
                            ? "secondary"
                            : "outline"
                        }
                      >
                       {dueStatus === "OVERDUE"
                          ? "Overdue"
                          : dueStatus === "DUE_TODAY"
                          ? "Due Today"
                          : dueStatus === "UPCOMING"
                          ? "Upcoming"
                          : task.status}
                           </Badge>
                           <Badge
                        variant={
                          task.priority === "HIGH"
                            ? "destructive"
                            : task.priority === "MEDIUM"
                            ? "secondary"
                            : "outline"
                        }
                      >
                       {task.priority}
                           </Badge>
                      <TaskComments taskId={task.id} author="Admin" />
                    </div>
                  );
                })}
                

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

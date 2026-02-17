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
import { addTaskActivity } from "@/mocks/taskActivity";
import TaskTimeline from "@/components/tasks/TaskTimeline";
import { calculateTaskMetrics } from "@/lib/taskMetrics";
import MetricCard from "@/components/ui/MetricCard";


const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];




export default function ProjectTasksPage() {

  const [searchQuery, setSearchQuery] = useState("");
  const [assignedFilter, setAssignedFilter] = useState<string | "ALL">("ALL");
  const [activeFilter, setActiveFilter] = useState<TaskStatus | "ALL" | "OVERDUE">("ALL");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const params = useParams();
  const projectId = params.id as string;

  const [tasks, setTasks] = useState<Task[]>([]);
  const employees = getEmployees();

  useEffect(() => {
    setTasks(getTasksByProject(projectId));
  }, [projectId]);

  const metrics = calculateTaskMetrics(tasks);
  const filteredTasks = tasks.filter((t) => {
    if (activeFilter !== "ALL") {
      if (activeFilter === "OVERDUE") {
        if (getDueStatus(t.dueDate, t.status) !== "OVERDUE") return false;
      } else if (t.status !== activeFilter) {
        return false;
      }
    }
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (assignedFilter !== "ALL" && t.assignedToId !== assignedFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Project Tasks</h1>
        <p className="text-gray-500 mt-1">
          Tasks for project ID: {projectId}
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div onClick={() => setActiveFilter("ALL")}>
      <MetricCard label="Total Tasks" value={metrics.total} />
      </div>
      <div onClick={() => setActiveFilter("TODO")}>
      <MetricCard label="To Do" value={metrics.todo} />
      </div>
      <div onClick={() => setActiveFilter("IN_PROGRESS")}>
      <MetricCard label="In Progress" value={metrics.inProgress} />
      </div>
      <div onClick={() => setActiveFilter("DONE")}>
      <MetricCard label="Done" value={metrics.done} />
      </div>
      <div onClick={() => setActiveFilter("OVERDUE")}>
      <MetricCard label="Overdue" value={metrics.overdue} />
      </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/3 border rounded-md px-3 py-2 text-sm"
        />
        <Select
          value={assignedFilter}
          onValueChange={(value) => setAssignedFilter(value)}
        >
            <SelectTrigger className="w-full md:w-1/4">
              <SelectValue placeholder="Filter by employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Employees</SelectItem>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              {filteredTasks
                .filter((t) => t.status === status)
                .map((task) => {
                  const assignedEmployee = employees.find(
                    (e) => e.id === task.assignedToId
                  );

                  const dueStatus = getDueStatus(task.dueDate, task.status);

                  return (
                    
                    <div
  key={task.id}
  className={`rounded-lg border bg-white p-4 space-y-3 shadow-sm
    ${dueStatus === "OVERDUE" ? "border-red-500" : ""}
    ${dueStatus === "DUE_TODAY" ? "border-yellow-500" : ""}
    ${dueStatus === "UPCOMING" ? "border-green-500" : ""}
  `}
>
  {/* Title */}
  <h3 className="font-semibold text-base">{task.title}</h3>
 

  {/* Due date */}
  <p className="text-sm text-gray-500">
    Due:{" "}
    {task.dueDate
      ? new Date(task.dueDate).toLocaleDateString()
      : "No due date"}
  </p>

  {/* Assignment */}
  <div>
    <label className="text-xs text-gray-400 block mb-1">
      Assigned Employee
    </label>
    <Select
      value={task.assignedToId || ""}
      onValueChange={(value) => {
        assignMockTask(projectId, task.id, value);

        const emp = employees.find((e) => e.id === value);

  addTaskActivity(
    task.id,
    "ASSIGNMENT",
    emp
      ? `Assigned to ${emp.name}`
      : "Unassigned task"
  );
        setTasks(getTasksByProject(projectId));
      }}
    >
      
      <SelectTrigger className="w-full">
        <SelectValue
          placeholder={
            assignedEmployee ? assignedEmployee.name : "Unassigned"
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
  </div>

  {/* Status */}
  <div>
    <label className="text-xs text-gray-400 block mb-1">Status</label>
    <Select
      value={task.status}
      onValueChange={(value) => {
        updateMockTaskStatus(projectId, task.id, value as TaskStatus);
        addTaskActivity(
    task.id,
    "STATUS",
    `Status changed to ${value}`
  );
        setTasks(getTasksByProject(projectId));
      }}
    >

      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="TODO">Todo</SelectItem>
        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
        <SelectItem value="DONE">Done</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* Badges */}
  <div className="flex gap-2 pt-2">
    <Badge
      variant={
        dueStatus === "OVERDUE"
          ? "destructive"
          : dueStatus === "DUE_TODAY"
          ? "secondary"
          : "outline"
      }
    >
      {dueStatus.replace("_", " ")}
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
  </div>
  <div className="flex justify-between items-center pt-2">
    <button
    onClick={() =>
      setExpandedTask(expandedTask === task.id? null : task.id)
    }
    className="text-sm text-blue-600 hover:underline"
    >{expandedTask === task.id ? "Hide Details" : "View Details"}</button>
  </div>
  {expandedTask === task.id && (
    <div className="space-y-4 pt-3 border-t">
    <TaskComments taskId={task.id} author="Admin" role={"ADMIN"} />
    <TaskTimeline taskId={task.id} />
    </div>
  )}
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

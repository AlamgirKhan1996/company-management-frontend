export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedToId?: string;
  createdAt: string;
  dueDate?: string;
};
export function createMockTask(projectId: string, task:string,dueDate?:string,priority:TaskPriority="MEDIUM") {
  tasks.push({
    id: crypto.randomUUID(),
    title: task,
    status: "TODO",
    projectId,
    dueDate,
    createdAt: "",
    priority,
  });
}


export function getTasksByProject(projectId: string) {
  return tasks.filter((t) => t.projectId === projectId);
}

export function updateMockTaskStatus(
  projectId: string,
  taskId: string,
  status: TaskStatus
) {
  tasks = tasks.map((t) =>
    t.projectId === projectId && t.id === taskId
      ? { ...t, status }
      : t
  );
}

export function assignMockTask(
  projectId: string,
  taskId: string,
  employeeId: string
) {
  tasks = tasks.map((task) =>
    task.projectId === projectId && task.id === taskId
      ? { ...task, assignedToId: employeeId }
      : task
  );
}

let tasks: Task[] = [
  {
    id: "task-1",
    projectId: "project-1",
    title: "Design UI",
    description: "Create wireframes and mockups",
    status: "TODO",
    createdAt: "2023-05-15T10:00:00Z",
    priority: "HIGH"
  },
  {
    id: "task-2",
    projectId: "project-1",
    title: "Setup API",
    description: "Configure backend endpoints",
    status: "IN_PROGRESS",
    createdAt: "2023-05-16T14:30:00Z",
    priority: "MEDIUM"
  },
  {
    id: "task-3",
    projectId: "project-1",
    title: "Testing",
    description: "Run unit tests and integration tests",
    status: "DONE",
    createdAt: "2023-05-17T16:45:00Z",
    priority: "LOW"
  }
];
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  projectId: string;
  employee?: {
    id: string;
    name: string;
  };
};


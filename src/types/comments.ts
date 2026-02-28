import { ReactNode } from "react";

export interface TaskComment {
  message: ReactNode;
  id: string;
  content: string;
  taskId: string;
  author: string;
  createdAt: string;
    role: string;
}
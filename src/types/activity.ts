export interface TaskActivity {
  id: string;
  taskId: string;
  type: string;
  message: string;
  timestamp: string;
  description?: string;
  createdAt: string;
}
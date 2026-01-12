export type Comment = {
  id: string;
  taskId: string;
  message: string;
  role: "ADMIN" | "EMPLOYEE";
  author: string;
  createdAt: string;
};
const comments: Comment[] = [];

export function getCommentsByTask(taskId: string) {
  return comments.filter((c) => c.taskId === taskId);
}

export function addMockComment(taskId: string, data: Omit<Comment, "id" | "taskId" | "createdAt">) {
  comments.push({
    id: crypto.randomUUID(),
    taskId,
    message: data.message,
    role: data.role,
    author: data.author,
    createdAt: new Date().toISOString(),
  });
}
export type Comment = {
  id: string;
  taskId: string;
  message: string;
  author: string;
  createdAt: string;
};
const comments: Comment[] = [];

export function getCommentsByTask(taskId: string) {
  return comments.filter((c) => c.taskId === taskId);
}

export function addMockComment(taskId: string, message: string, author: string) {
  comments.push({
    id: crypto.randomUUID(),
    taskId,
    message,
    author,
    createdAt: new Date().toISOString(),
  });
}
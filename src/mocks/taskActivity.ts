export type TaskActivity = {
  id: string;
  taskId: string;
  type: "STATUS" | "ASSIGNMENT" | "PRIORITY";
  message: string;
  createdAt: string;
};

const activities: TaskActivity[] = [];

export function getTaskActivities(taskId: string) {
  return activities.filter((a) => a.taskId === taskId);
}

export function addTaskActivity(
  taskId: string,
  type: TaskActivity["type"],
  message: string
) {
  activities.push({
    id: crypto.randomUUID(),
    taskId,
    type,
    message,
    createdAt: new Date().toISOString(),
  });
}

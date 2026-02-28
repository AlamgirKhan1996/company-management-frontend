import { Task } from "@/types/task";
import { getDueStatus } from "@/lib/dateUtils";

export function calculateTaskMetrics(tasks: Task[]) {
  const total = tasks.length;

  const todo = tasks.filter((t) => t.status === "TODO").length;
  const inProgress = tasks.filter(
    (t) => t.status === "IN_PROGRESS"
  ).length;
  const done = tasks.filter((t) => t.status === "DONE").length;

  const overdue = tasks.filter(
    (t) => getDueStatus(t.dueDate, t.status) === "OVERDUE"
  ).length;

  const completionRate =
    total === 0 ? 0 : Math.round((done / total) * 100);

  return {
    total,
    todo,
    inProgress,
    done,
    overdue,
    completionRate,
  };
}

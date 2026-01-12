"use client";

import { getTaskActivities } from "@/mocks/taskActivity";

export default function TaskTimeline({ taskId }: { taskId: string }) {
  const activities = getTaskActivities(taskId);

  if (!activities.length) return null;

  return (
    <div className="border-t pt-3 space-y-2">
      <p className="text-xs font-semibold text-gray-500">
        Activity
      </p>

      {activities.map((a) => (
        <div
          key={a.id}
          className="text-xs text-gray-600 flex justify-between"
        >
          <span>{a.message}</span>
          <span className="text-gray-400">
            {new Date(a.createdAt).toLocaleTimeString()}
          </span>
        </div>
      ))}
    </div>
  );
}

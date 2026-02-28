"use client";
import { TaskActivity } from "@/types/activity";
import { useEffect, useState } from "react";
import api from "@/lib/api-client";

interface Props {
  taskId: string;
}

export default function TaskTimeline({ taskId }: Props) {
  const [activities, setActivities] = useState<TaskActivity[]>([]);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const res = await api.get(`/api/tasks/${taskId}/activities`);
        setActivities(res.data);
      } catch (error) {
        console.error("Failed to fetch task activities:", error);
      }
    }
    fetchActivities();
  }, [taskId]);

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

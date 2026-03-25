"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TaskComment } from "@/types/comments";
import api from "@/lib/api-client";

interface Props {
  taskId: string;
  author: string;
  role: string;
}

export default function TaskComments({ taskId, author, role }: Props) {
  const [message, setMessage] = useState("");
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // BUG FIXED: original used raw fetch("/api/comments?taskId=...") which:
  // 1) Has no Authorization header → 401 on every request
  // 2) Hits Next.js /api route (doesn't exist) instead of the backend
  // Fixed to use the api client which attaches Bearer token automatically.
  const fetchComments = async () => {
    try {
      const res = await api.get(`/api/comments?taskId=${taskId}`);
      // Backend may return { comments: [] } or just []
      const data = res.data;
      setComments(Array.isArray(data) ? data : data?.comments ?? []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  useEffect(() => {
    if (open) fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, taskId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  async function submitComment() {
    if (!message.trim()) return;
    try {
      setLoading(true);
      await api.post("/api/comments", {
        content: message,
        taskId,
        author,
        role,
        message,
      });
      await fetchComments();
      setMessage("");
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-3 border-t">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-gray-500 hover:text-gray-700"
      >
        {open ? "Hide comments" : `View comments (${comments.length})`}
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
            {comments.map((c) => (
              <div
                key={c.id}
                className={`rounded-md p-2 text-sm border ${
                  c.role === "ADMIN" ? "bg-blue-50 border-blue-200" : "bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold">{c.author}</span>
                  <Badge variant="outline">{c.role}</Badge>
                </div>
                <p>{c.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {new Date(c.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Write a comment..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
            />
            <Button size="sm" onClick={submitComment} disabled={loading}>
              {loading ? "..." : "Send"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

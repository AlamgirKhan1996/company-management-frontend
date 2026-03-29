"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import api from "@/lib/api-client";
import {
  Bell, AlertTriangle, Bot, Activity,
  Zap, X, CheckCheck,
} from "lucide-react";

type Notification = {
  id: string;
  type: "OVERDUE" | "AI_COMPLETED" | "ACTIVITY";
  severity: "critical" | "warning" | "info" | "default";
  title: string;
  message: string;
  meta?: Record<string, string | undefined>;
  createdAt: string;
};

const TYPE_CONFIG = {
  OVERDUE: {
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-100",
    dot: "bg-red-500",
  },
  AI_COMPLETED: {
    icon: Bot,
    color: "text-violet-600",
    bg: "bg-violet-100",
    dot: "bg-violet-500",
  },
  ACTIVITY: {
    icon: Activity,
    color: "text-gray-500",
    bg: "bg-gray-100",
    dot: "bg-gray-400",
  },
};

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/notifications");
      setNotifications(res.data.notifications ?? []);
      setUnreadCount(res.data.unreadCount ?? 0);
    } catch {
      // Fail silently — bell should never break the header
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll every 60 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const visible = notifications.filter((n) => !dismissed.has(n.id));
  const visibleUnread = visible.filter(
    (n) => n.type === "OVERDUE" || n.type === "AI_COMPLETED"
  ).length;

  function dismiss(id: string) {
    setDismissed((prev) => new Set([...prev, id]));
  }

  function dismissAll() {
    setDismissed(new Set(notifications.map((n) => n.id)));
    setUnreadCount(0);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open) fetchNotifications();
        }}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {visibleUnread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {visibleUnread > 9 ? "9+" : visibleUnread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-gray-600" />
              <span className="font-semibold text-sm text-gray-800">Notifications</span>
              {visibleUnread > 0 && (
                <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {visibleUnread} new
                </span>
              )}
            </div>
            {visible.length > 0 && (
              <button
                onClick={dismissAll}
                className="text-[11px] text-gray-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="h-3 w-3" />
                Clear all
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-96 overflow-y-auto">
            {loading && visible.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <span className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
              </div>
            ) : visible.length === 0 ? (
              <div className="text-center py-10">
                <Zap className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">All caught up!</p>
                <p className="text-xs text-gray-300 mt-0.5">No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {visible.map((n) => {
                  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.ACTIVITY;
                  const Icon = cfg.icon;

                  return (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors relative group ${
                        n.type !== "ACTIVITY" ? "bg-blue-50/30" : ""
                      }`}
                    >
                      {/* Icon */}
                      <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${cfg.bg}`}>
                        <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-5">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                          <p className="text-xs font-semibold text-gray-800 truncate">
                            {n.title}
                          </p>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
                          {n.message}
                        </p>
                        {n.meta?.project && (
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Project: {n.meta.project}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>

                      {/* Dismiss */}
                      <button
                        onClick={() => dismiss(n.id)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {visible.length > 0 && (
            <div className="border-t px-4 py-2.5 bg-gray-50">
              <a
                href="/dashboard/activity"
                className="text-xs text-indigo-600 hover:underline font-medium"
              >
                View full activity log →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

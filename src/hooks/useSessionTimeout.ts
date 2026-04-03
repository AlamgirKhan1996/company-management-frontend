"use client";

// ─── src/hooks/useSessionTimeout.ts ──────────────────────────────────────────
// Auto-logout after 30 minutes of inactivity
// Shows warning at 28 minutes
// Resets timer on ANY user interaction

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const TIMEOUT    = 30 * 60 * 1000; // 30 minutes
const WARN_BEFORE = 2 * 60 * 1000; // Warn 2 min before

const ACTIVITY_EVENTS = [
  "mousedown", "mousemove", "keydown",
  "scroll", "touchstart", "click",
] as const;

export function useSessionTimeout() {
  const auth = useAuth();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnedRef  = useRef(false);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    warnedRef.current = false;
  }, []);

  const resetTimer = useCallback(() => {
    if (!auth?.token) return;
    clearTimers();

    // Warning at 28 min
    warningRef.current = setTimeout(() => {
      if (warnedRef.current) return;
      warnedRef.current = true;
      toast.warning("⚠️ Your session expires in 2 minutes due to inactivity.", {
        id: "session-warning",
        duration: 10_000,
      });
    }, TIMEOUT - WARN_BEFORE);

    // Logout at 30 min
    timeoutRef.current = setTimeout(() => {
      toast.dismiss("session-warning");
      toast.error("Session expired. Please log in again.", {
        id: "session-expired",
        duration: 4_000,
      });
      setTimeout(() => {
        auth?.logout();
      }, 1_500);
    }, TIMEOUT);
  }, [auth, clearTimers]);

  useEffect(() => {
    if (!auth?.token) return;

    const handleActivity = () => resetTimer();

    resetTimer();
    ACTIVITY_EVENTS.forEach((e) =>
      window.addEventListener(e, handleActivity, { passive: true })
    );

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((e) =>
        window.removeEventListener(e, handleActivity)
      );
    };
  }, [auth?.token, resetTimer, clearTimers]);
}

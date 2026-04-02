"use client";

// ─── src/hooks/useApiError.ts ─────────────────────────────────────────────────
//
// Standardized error handling for all API calls.
// Extracts meaningful messages from Axios errors.

import { useCallback } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";

type ApiErrorResponse = {
  error?: string;
  message?: string;
  errors?: string[];
};

// ─── Extract clean message from any error ────────────────────────────────────

export function getErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (!err) return fallback;

  // Axios error
  if (err && typeof err === "object" && "response" in err) {
    const axiosErr = err as AxiosError<ApiErrorResponse>;
    const status = axiosErr.response?.status;
    const data = axiosErr.response?.data;

    // Handle specific status codes
    if (status === 401) return "Your session has expired. Please log in again.";
    if (status === 403) return "You don't have permission to do this.";
    if (status === 404) return "The requested resource was not found.";
    if (status === 429) return "Too many requests. Please slow down.";
    if (status === 503) return "The server is temporarily unavailable. Please try again.";
    if (status && status >= 500) return "A server error occurred. Our team has been notified.";

    // Extract error message from response
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    if (data?.errors?.length) return data.errors[0];
  }

  // Network error
  if (err && typeof err === "object" && "message" in err) {
    const e = err as Error;
    if (e.message === "Network Error") return "Connection failed. Check your internet.";
    if (e.message?.includes("timeout")) return "Request timed out. Please try again.";
    if (e.message) return e.message;
  }

  return fallback;
}

// ─── Hook for pages that fetch data ──────────────────────────────────────────

export function useApiError() {
  const handleError = useCallback((err: unknown, fallback?: string) => {
    const message = getErrorMessage(err, fallback);
    toast.error(message);
    return message;
  }, []);

  return { handleError, getErrorMessage };
}

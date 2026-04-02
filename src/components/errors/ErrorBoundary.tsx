"use client";

// ─── src/components/errors/ErrorBoundary.tsx ──────────────────────────────────
// React class-based error boundary — catches render crashes
// Wrap any page or section that might crash

import { Component, ReactNode, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  // Optional: custom fallback UI
  fallback?: ReactNode;
  // Optional: reset key — change it to reset the boundary
  resetKey?: string | number;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production, send to your error tracking service
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  componentDidUpdate(prevProps: Props) {
    // Reset boundary when resetKey changes
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <PageError
          title="Something went wrong"
          message="An unexpected error occurred. Our team has been notified."
          error={this.state.error?.message}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    return this.props.children;
  }
}

// ─── PageError — friendly full-page error state ───────────────────────────────

interface PageErrorProps {
  title?: string;
  message?: string;
  error?: string;
  onRetry?: () => void;
  showHome?: boolean;
}

export function PageError({
  title = "Something went wrong",
  message = "We couldn't load this page. Please try again.",
  error,
  onRetry,
  showHome = true,
}: PageErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6 py-12">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-5">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>

      {/* Message */}
      <p className="text-gray-500 text-sm max-w-md leading-relaxed mb-2">{message}</p>

      {/* Technical error — only in dev */}
      {error && process.env.NODE_ENV === "development" && (
        <div className="mb-5 max-w-sm w-full">
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-left">
            <p className="text-[10px] font-mono text-red-600 break-all leading-relaxed">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 mt-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        )}
        {showHome && (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium transition-colors"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── InlineError — small error for inside cards ───────────────────────────────

export function InlineError({
  message = "Failed to load data",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
        <p className="text-sm text-red-700">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1 flex-shrink-0"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </button>
      )}
    </div>
  );
}

// ─── EmptyState — when data exists but list is empty ─────────────────────────

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="h-7 w-7 text-gray-400" />
      </div>
      <h3 className="font-semibold text-gray-700 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-4">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// ─── NetworkError — when backend is completely unreachable ────────────────────

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <PageError
      title="Connection problem"
      message="We can't reach the server right now. Check your internet connection and try again."
      onRetry={onRetry}
    />
  );
}

// ─── NotFound — 404 style ─────────────────────────────────────────────────────

export function NotFound({ message = "This page doesn't exist." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
      <p className="text-7xl font-black text-gray-100 mb-4">404</p>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Page not found</h2>
      <p className="text-gray-500 text-sm mb-6">{message}</p>
      <Link
        href="/dashboard"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
      >
        <Home className="h-4 w-4" />
        Back to Dashboard
      </Link>
    </div>
  );
}

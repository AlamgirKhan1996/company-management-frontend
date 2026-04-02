"use client";
import { useEffect } from "react";
import { PageError } from "@/components/errors/ErrorBoundary";

export default function DashboardError({ error, reset }: {
  error: Error; reset: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);
  return <PageError title="Dashboard error" message="Something went wrong." onRetry={reset} />;
}
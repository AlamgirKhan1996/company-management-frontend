"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface ProtectedProps {
  children: ReactNode;
}

export default function Protected({ children }: ProtectedProps) {
  const router = useRouter();
  const auth = useAuth();

  // BUG FIXED: original deps array was [router] — auth was missing so the
  // effect never re-ran after hydration finished, meaning the redirect to
  // /login never happened when there was no token.
  useEffect(() => {
    if (!auth?.isHydrated) return;
    if (!auth.token) {
      router.replace("/login");
    }
  }, [auth?.isHydrated, auth?.token, router]);

  // Show nothing while hydrating to avoid flash
  if (!auth?.isHydrated) return null;
  if (!auth?.token) return null;

  return <>{children}</>;
}

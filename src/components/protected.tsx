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

  useEffect(() => {
    if (!auth?.isHydrated) return;
    if (!auth.token) router.replace("/login");
  }, [router]);

  if (!auth?.isHydrated) return null;
  if (!auth.token) return null;
  return <>{children}</>;
}

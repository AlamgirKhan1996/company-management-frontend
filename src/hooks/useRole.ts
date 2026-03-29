"use client";

import { useAuth } from "@/context/AuthContext";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE" | string;

// Role hierarchy — higher index = more permissions
const ROLE_HIERARCHY: UserRole[] = ["EMPLOYEE", "MANAGER", "ADMIN", "SUPER_ADMIN"];

export function useRole() {
  const auth = useAuth();
  const role = (auth?.currentUser?.role ?? "EMPLOYEE") as UserRole;

  // Check exact role
  const is = (r: UserRole) => role === r;

  // Check if user has AT LEAST this role level
  const atLeast = (minRole: UserRole) => {
    const userIdx = ROLE_HIERARCHY.indexOf(role);
    const minIdx = ROLE_HIERARCHY.indexOf(minRole);
    // If role not in hierarchy, treat as lowest
    if (userIdx === -1) return false;
    return userIdx >= minIdx;
  };

  // Convenience flags
  const isAdmin = atLeast("ADMIN");
  const isSuperAdmin = is("SUPER_ADMIN");
  const isManager = atLeast("MANAGER");
  const isEmployee = is("EMPLOYEE");

  return {
    role,
    is,
    atLeast,
    isAdmin,
    isSuperAdmin,
    isManager,
    isEmployee,
  };
}

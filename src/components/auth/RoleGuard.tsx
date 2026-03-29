"use client";

import { useRole, UserRole } from "@/hooks/useRole";

interface RoleGuardProps {
  // Show content only if user has at least this role
  minRole?: UserRole;
  // Show content only for exact roles
  roles?: UserRole[];
  // What to show if access denied (default: nothing)
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * RoleGuard — conditionally renders children based on user role.
 *
 * Usage examples:
 *
 * // Only ADMIN and above
 * <RoleGuard minRole="ADMIN">
 *   <DeleteButton />
 * </RoleGuard>
 *
 * // Only SUPER_ADMIN
 * <RoleGuard roles={["SUPER_ADMIN"]}>
 *   <DangerZone />
 * </RoleGuard>
 *
 * // With fallback
 * <RoleGuard minRole="MANAGER" fallback={<p>No access</p>}>
 *   <ManagerPanel />
 * </RoleGuard>
 */
export default function RoleGuard({
  minRole,
  roles,
  fallback = null,
  children,
}: RoleGuardProps) {
  const { atLeast, is } = useRole();

  let hasAccess = false;

  if (minRole) {
    hasAccess = atLeast(minRole);
  } else if (roles && roles.length > 0) {
    hasAccess = roles.some((r) => is(r));
  } else {
    // No restriction specified — show to everyone
    hasAccess = true;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

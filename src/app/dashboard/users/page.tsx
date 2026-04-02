"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api-client";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  UserCog, UserPlus, Shield, Trash2,
  Crown, ChevronDown, Search,
} from "lucide-react";
import { ErrorBoundary, PageError, EmptyState } from "@/components/errors/ErrorBoundary";
import RoleGuard from "@/components/auth/RoleGuard";
import InviteMemberDialog from "@/components/users/InviteMemberDialog";
import { useAuth } from "@/context/AuthContext";

type User = {
  id: string;
  name?: string;
  email: string;
  role: string;
  createdAt?: string;
};

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  SUPER_ADMIN: { label: "Super Admin", color: "text-red-700",    bg: "bg-red-100 border-red-200"      },
  ADMIN:       { label: "Admin",       color: "text-indigo-700", bg: "bg-indigo-100 border-indigo-200" },
  MANAGER:     { label: "Manager",     color: "text-blue-700",   bg: "bg-blue-100 border-blue-200"     },
  EMPLOYEE:    { label: "Employee",    color: "text-gray-700",   bg: "bg-gray-100 border-gray-200"     },
};

function getInitials(name?: string, email?: string) {
  if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  return email?.[0]?.toUpperCase() ?? "?";
}

const AVATAR_COLORS = [
  "bg-indigo-500", "bg-blue-500", "bg-emerald-500",
  "bg-violet-500", "bg-orange-500", "bg-pink-500",
];

function getAvatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function UsersContent() {
  const auth = useAuth();
  const currentUserId = auth?.currentUser?.id;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/users");
      const data = Array.isArray(res.data) ? res.data : [];
      setUsers(data);
    } catch (err) {
      const e = err as AxiosError<{ error: string }>;
      setError(e.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers, refreshKey]);

  async function handleRoleChange(userId: string, newRole: string) {
    try {
      setUpdatingRole(userId);
      await api.patch(`/api/users/${userId}/role`, { role: newRole });
      toast.success("Role updated successfully");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      const e = err as AxiosError<{ error: string }>;
      toast.error(e.response?.data?.error || "Failed to update role");
    } finally {
      setUpdatingRole(null);
    }
  }

  async function handleDelete(userId: string, email: string) {
    if (!confirm(`Remove ${email} from your company?`)) return;
    try {
      setDeletingId(userId);
      await api.delete(`/api/users/${userId}`);
      toast.success("User removed");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      const e = err as AxiosError<{ error: string }>;
      toast.error(e.response?.data?.error || "Failed to remove user");
    } finally {
      setDeletingId(null);
    }
  }

  if (error) {
    return <PageError title="Failed to load users" message={error} onRetry={fetchUsers} />;
  }

  const filtered = users.filter((u) => {
    if (!search) return true;
    return (
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
    );
  });

  const adminCount = users.filter((u) => ["ADMIN", "SUPER_ADMIN"].includes(u.role)).length;
  const managerCount = users.filter((u) => u.role === "MANAGER").length;
  const employeeCount = users.filter((u) => u.role === "EMPLOYEE").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-indigo-100">
              <UserCog className="h-5 w-5 text-indigo-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Team Members</h1>
          </div>
          <p className="text-gray-500 text-sm ml-12">
            Manage who has access to your company workspace
          </p>
        </div>
        <RoleGuard minRole="ADMIN">
          <InviteMemberDialog onInvited={() => setRefreshKey((k) => k + 1)} />
        </RoleGuard>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Members", value: users.length,    color: "bg-indigo-50 text-indigo-600" },
          { label: "Admins",        value: adminCount,      color: "bg-red-50 text-red-600"       },
          { label: "Managers",      value: managerCount,    color: "bg-blue-50 text-blue-600"     },
          { label: "Employees",     value: employeeCount,   color: "bg-gray-50 text-gray-600"     },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border p-3 md:p-4">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color.split(" ")[1]}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
        />
      </div>

      {/* Users list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No team members found"
          description={search ? "No members match your search" : "Invite your first team member to get started"}
          action={
            !search ? (
              <RoleGuard minRole="ADMIN">
                <InviteMemberDialog onInvited={() => setRefreshKey((k) => k + 1)} />
              </RoleGuard>
            ) : undefined
          }
        />
      ) : (
        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-50">
            {filtered.map((user) => {
              const roleCfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.EMPLOYEE;
              const isCurrentUser = user.id === currentUserId;
              const isSuperAdmin = user.role === "SUPER_ADMIN";
              const avatarColor = getAvatarColor(user.id);

              return (
                <div
                  key={user.id}
                  className="flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3 md:py-4 hover:bg-gray-50/60 transition-colors"
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {getInitials(user.name, user.email)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {user.name || user.email}
                      </p>
                      {isCurrentUser && (
                        <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-medium">
                          You
                        </span>
                      )}
                      {isSuperAdmin && (
                        <Crown className="h-3.5 w-3.5 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>

                  {/* Role badge / selector */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <RoleGuard
                      minRole="ADMIN"
                      fallback={
                        <Badge variant="outline" className={`text-xs ${roleCfg.bg} ${roleCfg.color}`}>
                          {roleCfg.label}
                        </Badge>
                      }
                    >
                      {isSuperAdmin || isCurrentUser ? (
                        <Badge variant="outline" className={`text-xs ${roleCfg.bg} ${roleCfg.color}`}>
                          <Shield className="h-3 w-3 mr-1" />
                          {roleCfg.label}
                        </Badge>
                      ) : (
                        <Select
                          value={user.role}
                          onValueChange={(val) => handleRoleChange(user.id, val)}
                          disabled={updatingRole === user.id}
                        >
                          <SelectTrigger className={`h-7 text-xs w-32 border ${roleCfg.bg} ${roleCfg.color} font-medium`}>
                            <SelectValue />
                            <ChevronDown className="h-3 w-3 ml-1" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EMPLOYEE" className="text-xs">Employee</SelectItem>
                            <SelectItem value="MANAGER" className="text-xs">Manager</SelectItem>
                            <SelectItem value="ADMIN" className="text-xs">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </RoleGuard>

                    {/* Delete */}
                    <RoleGuard minRole="ADMIN">
                      {!isSuperAdmin && !isCurrentUser && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          onClick={() => handleDelete(user.id, user.email)}
                          disabled={deletingId === user.id}
                        >
                          {deletingId === user.id
                            ? <span className="animate-spin h-3.5 w-3.5 border border-red-500 border-t-transparent rounded-full" />
                            : <Trash2 className="h-3.5 w-3.5" />
                          }
                        </Button>
                      )}
                    </RoleGuard>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function UsersPage() {
  return (
    <ErrorBoundary>
      <UsersContent />
    </ErrorBoundary>
  );
}

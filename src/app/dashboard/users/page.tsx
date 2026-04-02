"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api-client";
import { AxiosError } from "axios";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import RoleGuard from "@/components/auth/RoleGuard";
import { Badge } from "@/components/ui/badge";
import InviteMemberDialog from "@/components/users/InviteMemberDialog";
import ResponsiveTable from "@/components/ui/ResponsiveTable";

type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
  status?: "ACTIVE" | "INACTIVE" | "PENDING" | string;
  createdAt?: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get<User[]>("/api/users");
      setUsers(res.data);
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>;
      toast.error(error.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const statusVariant = (status?: User["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "default" as const;
      case "INACTIVE":
        return "outline" as const;
      case "PENDING":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <RoleGuard minRole="ADMIN">
            <InviteMemberDialog onInvited={fetchUsers} />
          </RoleGuard>
        </div>
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-gray-500 mt-1">
            View and manage all application users
          </p>
        </div>
      </div>

      <ResponsiveTable
  title="Users List"
  loading={loading}
  empty="No users found"
  columns={["Name", "Email", "Role", "Status"]}
  rows={users.map(u => ({
    key: u.id,
    cells: [u.name, u.email, u.role, u.status]
  }))}
/>
    </div>
  );
}


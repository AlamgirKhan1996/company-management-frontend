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
    <RoleGuard minRole="ADMIN">
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

      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-gray-500"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                )}

                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name || "-"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role || "-"}</TableCell>
                    <TableCell>
                      {user.status ? (
                        <Badge variant={statusVariant(user.status)}>
                          {String(user.status).toUpperCase()}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
      </RoleGuard>
  );
}


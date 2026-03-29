"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api-client";
import CreateDepartmentDialog from "../../../components/departments/CreateDepartmentDialog";
import EditDepartmentDialog from "@/components/departments/edit-department-dialog";
import DeleteDepartmentDialog from "@/components/departments/delete-department-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import RoleGuard from "@/components/auth/RoleGuard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AxiosError } from "axios";

type Department = { id: string; name: string; createdAt: string };

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/departments", {
        // ✅ THE CORE FIX — force bypass any browser/proxy cache
        headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" },
        params: { _t: Date.now() }, // cache-buster query param
      });

      const data: Department[] = Array.isArray(res.data)
        ? res.data
        : res.data?.departments ?? res.data?.data ?? [];

      setDepartments(data);
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Failed to load departments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Departments</h1>
          <p className="text-gray-500 mt-1">Manage all company departments</p>
        </div>
        {/* ✅ Pass fetchDepartments directly — no refreshKey middleman needed */}
        <RoleGuard minRole="ADMIN">
          <CreateDepartmentDialog onCreated={fetchDepartments} />
        </RoleGuard>
      </div>

      <Card>
        <CardHeader><CardTitle>Departments List</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500">
                      No departments found
                    </TableCell>
                  </TableRow>
                ) : (
                  departments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell>{dept.name}</TableCell>
                      <TableCell>
                        {new Date(dept.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <RoleGuard minRole="ADMIN">
                            <EditDepartmentDialog
                              id={dept.id}
                              name={dept.name}
                              onUpdated={fetchDepartments}
                            />
                          </RoleGuard>
                          <RoleGuard minRole="ADMIN">
                            <DeleteDepartmentDialog
                              id={dept.id}
                              name={dept.name}
                              onDeleted={fetchDepartments}
                            />
                          </RoleGuard>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AxiosError } from "axios";

type Department = {
  id: string;
  name: string;
  createdAt: string;
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  // ✅ KEY FIX: trigger state — incrementing this reliably fires useEffect
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/departments");

      // ✅ Guard all possible response shapes from the backend
      const data: Department[] = Array.isArray(res.data)
        ? res.data
        : res.data?.departments ?? res.data?.data ?? [];

      setDepartments(data);
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      console.error("[DepartmentsPage] fetch error:", err);
      toast.error(error.response?.data?.error || "Failed to load departments");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Re-runs whenever refreshKey changes (on mount AND after any mutation)
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments, refreshKey]);

  // ✅ Simple, synchronous callback — no async prop contracts needed
  const handleRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Departments</h1>
          <p className="text-gray-500 mt-1">Manage all company departments</p>
        </div>
        <CreateDepartmentDialog onCreated={handleRefresh} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Departments List</CardTitle>
        </CardHeader>
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
                          <EditDepartmentDialog
                            id={dept.id}
                            name={dept.name}
                            onUpdated={handleRefresh}
                          />
                          <DeleteDepartmentDialog
                            id={dept.id}
                            name={dept.name}
                            onDeleted={handleRefresh}
                          />
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
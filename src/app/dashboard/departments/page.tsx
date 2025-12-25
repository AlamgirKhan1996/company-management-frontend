"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api-client";
import CreateDepartmentDialog from "../../../components/departments/CreateDepartmentDialog";
import EditDepartmentDialog from "@/components/departments/edit-department-dialog";
import DeleteDepartmentDialog from "@/components/departments/delete-department-dialog"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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

  // ✅ MOVE HERE
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/departments");
      setDepartments(res.data);
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Departments</h1>
          <p className="text-gray-500 mt-1">
            Manage all company departments
          </p>
        </div>

        {/* ✅ No reload needed anymore */}
        <CreateDepartmentDialog onCreated={fetchDepartments} />
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
                {departments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500">
                      No departments found
                    </TableCell>
                  </TableRow>
                )}

                {departments.map((dept) => (
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
                        onUpdated={fetchDepartments}
                        />
                 <DeleteDepartmentDialog
                 id={dept.id}
                 name={dept.name}
                 onDeleted={fetchDepartments}
                 />
                 </div>
</TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

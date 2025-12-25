"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api-client";
import CreateEmployeeDialog from "@/components/employee/create-employee-dialog";
import EditEmployeeDialog from "@/components/employee/edit-employee-dialog";
import DeleteEmployeeDialog from "@/components/employee/delete-employee-dialog";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AxiosError } from "axios";

type Employee = {
  id: string;
  name: string;
  createdAt: string;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ MOVE HERE
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/employees");
      setEmployees(res.data);
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-gray-500 mt-1">
            Manage all company employees
          </p>
        </div>

        {/* ✅ No reload needed anymore */}
        <CreateEmployeeDialog onCreated={fetchEmployees} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employees List</CardTitle>
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
                {employees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500">
                      No employees found
                    </TableCell>
                  </TableRow>
                )}

                {employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>
                      {new Date(emp.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">

                      <EditEmployeeDialog
                        id={emp.id}
                        name={emp.name}
                        onUpdated={fetchEmployees}
                        />
                 <DeleteEmployeeDialog
                 id={emp.id}
                 name={emp.name}
                 onDeleted={fetchEmployees}
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

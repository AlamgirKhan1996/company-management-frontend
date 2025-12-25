"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CreateEmployeeDialog from "@/components/employee/create-employee-dialog";
import EditEmployeeDialog from "@/components/employee/edit-employee-dialog";
import DeleteEmployeeDialog from "@/components/employee/delete-employee-dialog";

type Employee = {
  id: string;
  name: string;
  createdAt: string;
};

export default function EmployeeTable() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchEmployees() {
    try {
      setLoading(true);
      const res = await api.get("/api/employees");
      setEmployees(res.data || []);
    } catch {
      console.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">All Employees</h2>
        <CreateEmployeeDialog onCreated={fetchEmployees} />
      </div>

      <div className="border rounded-lg bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>

<TableBody>
  {loading ? (
    <TableRow>
      <TableCell colSpan={2}>Loading...</TableCell>
    </TableRow>
  ) : employees.length === 0 ? (
    <TableRow>
      <TableCell colSpan={2}>No employees found</TableCell>
    </TableRow>
  ) : (
    employees.map((emp) => (
      <TableRow key={emp.id}>
        <TableCell>{emp.name}</TableCell>
        <TableCell>{new Date(emp.createdAt).toLocaleDateString()}</TableCell>
        <TableCell className="flex gap-2">
          <EditEmployeeDialog
            id={emp.id}
            name={emp.name}
            onUpdated={fetchEmployees}
          />
        </TableCell>
        <TableCell className="flex gap-2">
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
</TableCell>

      </TableRow>
    ))
  )}
</TableBody>
        </Table>
      </div>
    </div>
  );
}

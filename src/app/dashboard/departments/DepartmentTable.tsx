"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CreateDepartmentDialog from "../../../components/departments/CreateDepartmentDialog";
import EditDepartmentDialog from "@/components/departments/edit-department-dialog";
import DeleteDepartmentDialog from "@/components/departments/delete-department-dialog";

type Department = {
  id: string;
  name: string;
  createdAt: string;
};

export default function DepartmentTable() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchDepartments() {
    try {
      setLoading(true);
      const res = await api.get("/api/departments");
      setDepartments(res.data || []);
    } catch {
      console.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">All Departments</h2>
        <CreateDepartmentDialog onCreated={fetchDepartments} />
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
  ) : departments.length === 0 ? (
    <TableRow>
      <TableCell colSpan={2}>No departments found</TableCell>
    </TableRow>
  ) : (
    departments.map((dept) => (
      <TableRow key={dept.id}>
        <TableCell>{dept.name}</TableCell>
        <TableCell>{new Date(dept.createdAt).toLocaleDateString()}</TableCell>
        <TableCell className="flex gap-2">
          <EditDepartmentDialog
            id={dept.id}
            name={dept.name}
            onUpdated={fetchDepartments}
          />
        </TableCell>
        <TableCell className="flex gap-2">
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

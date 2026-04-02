"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api-client";
import { toast } from "sonner";
import { AxiosError } from "axios";
import CreateDepartmentDialog from "../../../components/departments/CreateDepartmentDialog";
import EditDepartmentDialog from "@/components/departments/edit-department-dialog";
import DeleteDepartmentDialog from "@/components/departments/delete-department-dialog";
import RoleGuard from "@/components/auth/RoleGuard";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import { useCompleteStep } from "@/hooks/useCompleteStep";
import { Building2 } from "lucide-react";

type Department = { id: string; name: string; createdAt: string };

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const completeStep = useCompleteStep();

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/departments");
      const data = Array.isArray(res.data)
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
  }, [fetchDepartments, refreshKey]);

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-purple-100">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Departments</h1>
          </div>
          <p className="text-gray-500 text-sm ml-12">
            Manage all company departments
          </p>
        </div>

        <RoleGuard minRole="ADMIN">
          <CreateDepartmentDialog
            onCreated={() => {
              completeStep("department");
              handleRefresh();
            }}
          />
        </RoleGuard>
      </div>

      {/* Responsive table */}
      <ResponsiveTable
        title="Departments List"
        loading={loading}
        empty="No departments found. Create your first department above."
        columns={["Name", "Created At", "Actions"]}
        rows={departments.map((dept) => ({
          key: dept.id,
          cells: [
            <span className="font-medium text-gray-900">{dept.name}</span>,
            <span className="text-gray-500">
              {new Date(dept.createdAt).toLocaleDateString()}
            </span>,
            <RoleGuard minRole="ADMIN">
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
            </RoleGuard>,
          ],
        }))}
      />
    </div>
  );
}

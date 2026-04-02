"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api-client";
import CreateEmployeeDialog from "@/components/employee/create-employee-dialog";
import EditEmployeeDialog from "@/components/employee/edit-employee-dialog";
import DeleteEmployeeDialog from "@/components/employee/delete-employee-dialog";
import RoleGuard from "@/components/auth/RoleGuard";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useCompleteStep } from "@/hooks/useCompleteStep";
import { Users } from "lucide-react";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";

type Employee = {
  id: string;
  name: string;
  email?: string;
  role?: string;
  createdAt: string;
  department?: { name: string };
};

function EmployeesContent() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const completeStep = useCompleteStep();

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/employees");
      const data = Array.isArray(res.data) ? res.data : [];
      setEmployees(data);
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees, refreshKey]);

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Employees</h1>
          </div>
          <p className="text-gray-500 text-sm ml-12">
            Manage all company employees
          </p>
        </div>

        <RoleGuard minRole="ADMIN">
          <CreateEmployeeDialog
            onCreated={() => {
              completeStep("employee");
              handleRefresh();
            }}
          />
        </RoleGuard>
      </div>

      {/* Responsive table */}
      <ResponsiveTable
        title="Employees List"
        loading={loading}
        empty="No employees found. Add your first employee above."
        columns={["Name", "Department", "Role", "Actions"]}
        rows={employees.map((emp) => ({
          key: emp.id,
          badge: emp.role ? (
            <Badge variant="outline" className="text-[10px] capitalize">
              {emp.role}
            </Badge>
          ) : undefined,
          cells: [
            <div>
              <p className="font-medium text-gray-900">{emp.name}</p>
              {emp.email && (
                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[160px]">
                  {emp.email}
                </p>
              )}
            </div>,
            <span className="text-gray-600 text-sm">
              {emp.department?.name ?? "—"}
            </span>,
            <Badge variant="outline" className="capitalize text-xs">
              {emp.role ?? "—"}
            </Badge>,
            <RoleGuard minRole="ADMIN">
              <div className="flex items-center gap-2">
                <EditEmployeeDialog
                  id={emp.id}
                  name={emp.name}
                  onUpdated={handleRefresh}
                />
                <DeleteEmployeeDialog
                  id={emp.id}
                  name={emp.name}
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

export default function EmployeesPage() {
  return (
    <ErrorBoundary>
      <EmployeesContent />
    </ErrorBoundary>
  );
}

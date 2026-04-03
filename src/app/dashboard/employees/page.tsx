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
import { ErrorBoundary, PageError } from "@/components/errors/ErrorBoundary";
import { Users, Info } from "lucide-react";

type Employee = {
  id: string;
  name: string;
  email?: string;
  role?: string;
  departmentId?: string;
  createdAt: string;
  department?: { id: string; name: string };
};

const ROLE_COLORS: Record<string, string> = {
  admin:    "bg-indigo-100 text-indigo-700 border-indigo-200",
  manager:  "bg-blue-100 text-blue-700 border-blue-200",
  employee: "bg-gray-100 text-gray-600 border-gray-200",
};

function EmployeesContent() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const completeStep = useCompleteStep();

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/employees");
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const e = err as AxiosError<{ error: string }>;
      setError(e.response?.data?.error || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees, refreshKey]);

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  if (error) {
    return <PageError title="Failed to load employees" message={error} onRetry={fetchEmployees} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Employees</h1>
          </div>
          <p className="text-gray-500 text-sm ml-12">
            Staff records for task assignment and tracking
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

      {/* ✅ Clear info box explaining Employees vs Users */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-semibold text-blue-800 mb-0.5">
            Employees vs Team Members
          </p>
          <p className="text-blue-700 text-xs leading-relaxed">
            <strong>Employees</strong> are staff records used for task assignment, department tracking,
            and reporting — they don&apos;t need dashboard access.{" "}
            <strong>Team Members</strong> (in the Users page) are people who can login to the dashboard.
            A person can be both, or just one.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total</p>
        </div>
        <div className="bg-white rounded-xl border p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {employees.filter((e) => e.role === "manager").length}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Managers</p>
        </div>
        <div className="bg-white rounded-xl border p-3 text-center">
          <p className="text-2xl font-bold text-gray-600">
            {employees.filter((e) => e.department).length}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">In Departments</p>
        </div>
      </div>

      {/* Table */}
      <ResponsiveTable
        title="Employee Records"
        loading={loading}
        empty="No employees yet. Add your first employee record above."
        columns={["Employee", "Department", "Role", "Actions"]}
        rows={employees.map((emp) => ({
          key: emp.id,
          badge: emp.role ? (
            <Badge variant="outline" className={`text-[10px] capitalize ${ROLE_COLORS[emp.role] || ""}`}>
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
              {emp.department?.name ?? (
                <span className="text-gray-300">No department</span>
              )}
            </span>,
            emp.role ? (
              <Badge variant="outline" className={`text-xs capitalize ${ROLE_COLORS[emp.role] || ""}`}>
                {emp.role}
              </Badge>
            ) : (
              <span className="text-gray-300 text-xs">Not set</span>
            ),
            <RoleGuard minRole="ADMIN">
              <div className="flex items-center gap-2">
                <EditEmployeeDialog
                  id={emp.id}
                  name={emp.name}
                  email={emp.email}
                  role={emp.role}
                  departmentId={emp.department?.id}
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

// ═══════════════════════════════════════════════════════════════════
// FILE 1: src/components/employee/edit-employee-dialog.tsx
// FIXED: Was only editing name. Now edits name + role + department
// ═══════════════════════════════════════════════════════════════════
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api-client";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";

type Props = {
  id: string;
  name: string;
  email?: string;
  role?: string;
  departmentId?: string;
  onUpdated: () => void;
};

type Department = { id: string; name: string };

const ROLES = [
  { label: "Employee", value: "employee" },
  { label: "Manager",  value: "manager"  },
  { label: "Admin",    value: "admin"    },
];

export default function EditEmployeeDialog({
  id, name, email = "", role = "", departmentId = "", onUpdated,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [empName, setEmpName]         = useState(name);
  const [empEmail, setEmpEmail]       = useState(email);
  const [empRole, setEmpRole]         = useState(role);
  const [empDeptId, setEmpDeptId]     = useState(departmentId);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Reset form when props change
  useEffect(() => {
    setEmpName(name);
    setEmpEmail(email);
    setEmpRole(role);
    setEmpDeptId(departmentId);
  }, [name, email, role, departmentId]);

  async function loadDepartments() {
    try {
      const res = await api.get("/api/departments");
      const data = Array.isArray(res.data) ? res.data : res.data?.departments ?? [];
      setDepartments(data);
    } catch {
      toast.error("Failed to load departments");
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!empName.trim()) { toast.error("Name is required"); return; }

    try {
      setLoading(true);
      await api.put(`/api/employees/${id}`, {
        name: empName.trim(),
        email: empEmail.trim() || undefined,
        role: empRole || undefined,
        departmentId: empDeptId || undefined,
      });
      toast.success("Employee updated successfully");
      setOpen(false);
      onUpdated();
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) loadDepartments();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleUpdate} className="space-y-4 mt-1">
          <div className="space-y-1.5">
            <Label htmlFor="emp-name">Full Name</Label>
            <Input
              id="emp-name"
              value={empName}
              onChange={(e) => setEmpName(e.target.value)}
              placeholder="Employee name"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="emp-email">Email</Label>
            <Input
              id="emp-email"
              type="email"
              value={empEmail}
              onChange={(e) => setEmpEmail(e.target.value)}
              placeholder="employee@company.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={empRole} onValueChange={setEmpRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="z-[1000]">
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Department</Label>
            <Select value={empDeptId} onValueChange={setEmpDeptId}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent className="z-[1000]">
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

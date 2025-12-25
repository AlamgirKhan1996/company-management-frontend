"use client";

import { useState } from "react";
import api from "@/lib/api-client";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AxiosError } from "axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface Props {
  onCreated: () => void;
}


export default function CreateEmployeeDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  type Department = { id: string; name: string };

const [departments, setDepartments] = useState<Department[]>([]);
const [departmentId, setDepartmentId] = useState("");

const roles = [
  {label: 'Admin', value: 'admin'},
  {label: 'Manager', value: 'manager'},
  {label: 'Employee', value: 'employee'},
]


  async function loadDepartments() {
    try {
      const res = await api.get("/api/departments");
      setDepartments(res.data);
    } catch {
      toast.error("Failed to load departments");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Employee name is required");
      return;
    }

    try {
      setLoading(true);
      if (!departmentId) {
  toast.error("Department is required");
  return;
}
if (!role) {
  toast.error("Role is required");
  return;
}

      await api.post("/api/employees", { name, email, departmentId, role });

      toast.success("Employee created successfully");
      onCreated();
      setOpen(false);
      setName("");
      setDepartmentId("");
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      console.log("EMPLOYEE CREATE ERROR:", error.response?.data);
      toast.error(error.response?.data?.error || "Failed to create employee");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => {setOpen(v); if (v) loadDepartments();}}>
    
      <DialogTrigger asChild>
        <Button>Add Employee</Button>
      </DialogTrigger>

      <DialogContent className="overflow-visible">
        <DialogHeader>
          <DialogTitle>Create Employee</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Employee Name</Label>
            
            <Input
              id="name"
              placeholder="e.g. Human Resources"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="email">Employee Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="employee@example.com"
            />
          </div>

          <div>
  <Label>Role</Label>
  <Select
    value={role}
    onValueChange={(value) => {
      setRole(value);
      console.log("Selected role:", value);
    }}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select role" />
    </SelectTrigger>

    <SelectContent 
  position="popper"
  sideOffset={4}
  className="max-h-60 overflow-y-auto z-[1000]"
>
      {roles.map((r) => (
        <SelectItem key={r.value} value={r.value}>
          {r.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

          <div>
            
            <Label>Department</Label>
            <Select
              value={departmentId}
              onValueChange={(value) => {
                setDepartmentId(value);
                console.log("Selected department:", value); // 👈 debug
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>

              <SelectContent 
  position="popper"
  sideOffset={4}
  className="max-h-60 overflow-y-auto z-[1000]" >

                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          



          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Employee"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

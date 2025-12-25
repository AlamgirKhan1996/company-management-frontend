"use client";

import {  useState } from "react";
import api from "@/lib/api-client";
import { toast } from "sonner";
import { getUserFromToken } from "@/lib/auth";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {AxiosError } from "axios";


interface Props {
  onCreated: () => void;
}

type Department = {
  id: string;
  name: string;
};



const STATUSES = [
  { label: "Planned", value: "PLANNED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
  { label: "On Hold", value: "ON_HOLD" },
];


export default function CreateProjectDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("PLANNED");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);

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

  if (!name.trim()) return toast.error("Project name is required");
  if (!startDate) return toast.error("Start date is required");

  const user = getUserFromToken();
  if (!user) return toast.error("User not authenticated");

  try {
    setLoading(true);

   const payload = {
  name,
  description,
  startDate,
  endDate: endDate || undefined,
  status,
  departmentIds,     // ✅ correct key
  userId: user.id,
};

console.log("PROJECT PAYLOAD", payload);


    await api.post("/api/projects", payload);

    toast.success("Project created successfully");
    onCreated();
    setOpen(false);

    // reset
    setName("");
    setDescription("");
    setStatus("TODO");
    setStartDate("");
    setEndDate("");
    setDepartmentIds([]);
  } catch (err) {
    const error = err as AxiosError<{ error: string; message: string }>;
    console.error("PROJECT CREATE ERROR:", error.response?.data || error);
    toast.error(
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Failed to create project"
    );
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
        <Button>Add Project</Button>
      </DialogTrigger>

      <DialogContent aria-describedby="create-project-desc">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Project Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent position="popper"
  sideOffset={4}
  className="max-h-60 overflow-y-auto z-[1000]">
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Departments</Label>
            <div className="flex flex-wrap gap-2">
              {departments.map((dept) => (
                <Button
                  key={dept.id}
                  type="button"
                  variant={
                    departmentIds.includes(dept.id)
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setDepartmentIds((prev) =>
                      prev.includes(dept.id)
                        ? prev.filter((id) => id !== dept.id)
                        : [...prev, dept.id]
                    )
                  }
                >
                  {dept.name}
                </Button>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Project"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

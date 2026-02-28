"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import api from "@/lib/api-client";
import { TaskPriority } from "@/types/task";

interface Props {
  projectId: string;
  onCreated: () => void;
}

interface Employee {
  id: string;
  name: string;
}

export default function CreateTaskDialog({ projectId, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [assignedToId, setAssignedToId] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get("/api/employees");
        setEmployees(response.data);
      } catch {
        toast.error("Failed to load employees");
      }
    };
    fetchEmployees();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) { toast.error("Task title required"); return; }

    try {
      setLoading(true);
      await api.post("/api/tasks", {
        title,
        projectId,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        priority,
        assignedToId,
        status: "TODO",
      });

    toast.success("Task created");
    setTitle("");
    setOpen(false);
    setPriority("MEDIUM");
    setLoading(false);
    setDueDate("");
    setTitle("");

    onCreated();
  } catch {
    toast.error("Failed to create task");
  } finally {
    setLoading(false);
  }
}
return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Task</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-2">Task Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mb-2" />
            <Label className="mb-2">Due Date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mb-2" />
            <Label className="mb-2">Priority</Label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>

            <select
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              className="ml-4"
            >
              <option value="">Unassigned</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <Button disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Task"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

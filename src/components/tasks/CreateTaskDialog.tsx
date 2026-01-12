"use client";

import { useState } from "react";
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
import { createMockTask, TaskPriority } from "@/mocks/tasks";

interface Props {
  projectId: string;
  onCreated: () => void;
}

export default function CreateTaskDialog({ projectId, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) return toast.error("Task title required");

    setLoading(true);

    createMockTask(projectId, title, dueDate || undefined, priority);

    toast.success("Task created");
    setTitle("");
    setOpen(false);
    setLoading(false);
    onCreated();
    setDueDate("");
    setTitle("");
    
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
          </div>

          <Button disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Task"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

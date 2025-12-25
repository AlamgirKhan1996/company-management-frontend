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
import { AxiosError } from "axios";

type Props = {
  id: string;
  name: string;
  onUpdated: () => void;
};

export default function EditEmployeeDialog({ id, name, onUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [employeeName, setEmployeeName] = useState(name);
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    if (!employeeName.trim()) {
      toast.error("Employee name is required");
      return;
    }

    try {
      setLoading(true);
      await api.put(`/api/employees/${id}`, {
        name: employeeName,
      });

      toast.success("Employee updated successfully");
      setOpen(false);
      onUpdated(); // refresh table
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            placeholder="Employee name"
          />

          <Button onClick={handleUpdate} disabled={loading} className="w-full">
            {loading ? "Updating..." : "Update"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

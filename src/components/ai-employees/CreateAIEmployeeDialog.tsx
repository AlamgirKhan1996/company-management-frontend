"use client";

import { useState } from "react";
import api from "@/lib/api-client";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bot, Plus, X } from "lucide-react";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Props {
  onCreated: () => void;
}

const DEPARTMENTS = [
  "Human Resources", "Sales", "Marketing", "Finance",
  "Engineering", "Support", "Operations", "Legal",
];

const ROLES = [
  "HR Manager", "Sales Executive", "Marketing Specialist",
  "Financial Analyst", "Senior Developer", "Support Agent",
  "Operations Manager", "Legal Advisor", "Data Analyst",
  "Project Manager", "CEO Agent", "Custom...",
];

const PERMISSIONS_OPTIONS = [
  "READ_EMPLOYEES", "WRITE_REPORTS", "MANAGE_LEAVES",
  "VIEW_FINANCIALS", "MANAGE_PROJECTS", "SEND_EMAILS",
  "READ_ANALYTICS", "MANAGE_TASKS", "VIEW_CLIENTS",
  "WRITE_POLICIES", "MANAGE_HIRING", "VIEW_SALARIES",
];

export default function CreateAIEmployeeDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [department, setDepartment] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);

  function togglePermission(p: string) {
    setPermissions((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  function handleClose() {
    setOpen(false);
    setName("");
    setRole("");
    setCustomRole("");
    setDepartment("");
    setPermissions([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const finalRole = role === "Custom..." ? customRole : role;

    if (!name.trim()) { toast.error("Name is required"); return; }
    if (!finalRole.trim()) { toast.error("Role is required"); return; }
    if (!department) { toast.error("Department is required"); return; }

    try {
      setLoading(true);
      await api.post("/api/ai-employees", {
        name: name.trim(),
        role: finalRole.trim(),
        department,
        permissions,
      });

      toast.success(`${name} is ready to work!`);
      onCreated();
      handleClose();
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Failed to create AI employee");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md">
          <Bot className="h-4 w-4" />
          New AI Employee
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100">
              <Bot className="h-4 w-4 text-indigo-600" />
            </div>
            Create AI Employee
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="ai-name">Agent Name</Label>
            <Input
              id="ai-name"
              placeholder="e.g. Sara, Alex, Jordan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="z-1000">
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {role === "Custom..." && (
              <Input
                placeholder="Enter custom role..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent className="z-1000">
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Permissions */}
          <div className="space-y-2">
            <Label>
              Permissions
              <span className="text-gray-400 font-normal ml-1 text-xs">
                ({permissions.length} selected)
              </span>
            </Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50 min-h-20">
              {PERMISSIONS_OPTIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePermission(p)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    permissions.includes(p)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  {p.replace(/_/g, " ")}
                </button>
              ))}
            </div>
            {permissions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {permissions.map((p) => (
                  <Badge key={p} variant="secondary" className="text-xs gap-1 pr-1">
                    {p.replace(/_/g, " ")}
                    <button
                      type="button"
                      onClick={() => togglePermission(p)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Creating agent...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create AI Employee
              </span>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

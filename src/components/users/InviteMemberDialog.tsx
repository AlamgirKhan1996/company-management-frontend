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
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { UserPlus, Mail, Shield, CheckCircle2 } from "lucide-react";

interface Props {
  onInvited?: () => void;
}

const ROLES = [
  {
    value: "EMPLOYEE",
    label: "Employee",
    description: "Can view and update their own tasks",
    color: "text-gray-600",
    bg: "bg-gray-50 border-gray-200",
  },
  {
    value: "MANAGER",
    label: "Manager",
    description: "Can manage projects, tasks, and run AI agents",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
  },
  {
    value: "ADMIN",
    label: "Admin",
    description: "Full access — can invite members and manage everything",
    color: "text-indigo-600",
    bg: "bg-indigo-50 border-indigo-200",
  },
];

export default function InviteMemberDialog({ onInvited }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function handleClose() {
    if (loading) return;
    setOpen(false);
    setTimeout(() => {
      setEmail("");
      setRole("EMPLOYEE");
      setSent(false);
    }, 300);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) { toast.error("Email is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      await api.post("/api/invite", { email: email.trim(), role });
      setSent(true);
      onInvited?.();
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Failed to send invite");
    } finally {
      setLoading(false);
    }
  }

  const selectedRole = ROLES.find((r) => r.value === role);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100">
              <UserPlus className="h-4 w-4 text-indigo-600" />
            </div>
            Invite Team Member
          </DialogTitle>
        </DialogHeader>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-5 mt-1">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>

            {/* Role selector — visual cards */}
            <div className="space-y-2">
              <Label>Assign Role</Label>
              <div className="space-y-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                      role === r.value
                        ? `${r.bg} border-current ${r.color}`
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Shield className={`h-3.5 w-3.5 ${role === r.value ? r.color : "text-gray-400"}`} />
                          <span className={`font-semibold text-sm ${role === r.value ? r.color : "text-gray-700"}`}>
                            {r.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 ml-5">
                          {r.description}
                        </p>
                      </div>
                      {role === r.value && (
                        <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${r.color}`} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Info box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-700">
                An email will be sent to <strong>{email || "the recipient"}</strong> with
                a secure invite link that expires in 48 hours.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Sending invite...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Send Invite Email
                </span>
              )}
            </Button>
          </form>
        ) : (
          /* Success state */
          <div className="text-center py-6 space-y-4">
            <div className="relative mx-auto w-16 h-16">
              <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
              <div className="relative w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Invite sent!</h3>
              <p className="text-sm text-gray-500 mt-1">
                We&apos;ve sent an invite to <strong>{email}</strong> as{" "}
                <span className={selectedRole?.color}>{selectedRole?.label}</span>.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Link expires in 48 hours.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setSent(false); setEmail(""); }}
              >
                Invite Another
              </Button>
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleClose}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

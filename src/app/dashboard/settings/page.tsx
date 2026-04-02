"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/hooks/useRole";
import api from "@/lib/api-client";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User, Building2, LogOut, Lock,
  Shield, Save, Eye, EyeOff, Info,
} from "lucide-react";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";

const ROLE_CONFIG: Record<string, { label: string; color: string; desc: string }> = {
  SUPER_ADMIN: { label: "Super Admin", color: "bg-red-100 text-red-700 border-red-200",       desc: "Full system access including company settings" },
  ADMIN:       { label: "Admin",       color: "bg-indigo-100 text-indigo-700 border-indigo-200", desc: "Full access to all features and team management" },
  MANAGER:     { label: "Manager",     color: "bg-blue-100 text-blue-700 border-blue-200",     desc: "Manage projects, tasks, and AI agents" },
  EMPLOYEE:    { label: "Employee",    color: "bg-gray-100 text-gray-600 border-gray-200",     desc: "View and update assigned tasks" },
};

function SettingsContent() {
  const auth = useAuth();
  const { role } = useRole();

  const user = auth?.currentUser;
  const company = auth?.company;
  const roleCfg = ROLE_CONFIG[role] || ROLE_CONFIG.EMPLOYEE;

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Password strength
  const strength = (() => {
    let s = 0;
    if (newPassword.length >= 8) s++;
    if (/[A-Z]/.test(newPassword)) s++;
    if (/[0-9]/.test(newPassword)) s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"][strength];

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword) { toast.error("Enter your current password"); return; }
    if (newPassword.length < 8) { toast.error("New password must be at least 8 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords don't match"); return; }

    try {
      setSavingPassword(true);
      await api.patch("/api/auth/change-password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  }

  const handleLogout = () => {
    auth?.logout();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile card */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50">
              <User className="h-4 w-4 text-indigo-600" />
            </div>
            <CardTitle className="text-base">Your Profile</CardTitle>
          </div>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.name || "—"}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <Badge variant="outline" className={`text-xs mt-1 ${roleCfg.color}`}>
                <Shield className="h-3 w-3 mr-1" />
                {roleCfg.label}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Read-only fields */}
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label className="text-xs text-gray-500">Email Address</Label>
              <Input
                value={user?.email ?? ""}
                readOnly
                className="bg-gray-50 text-gray-700 cursor-not-allowed"
              />
              <p className="text-[11px] text-gray-400 flex items-center gap-1">
                <Info className="h-3 w-3" />
                Email cannot be changed
              </p>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs text-gray-500">Display Name</Label>
              <Input
                value={user?.name ?? ""}
                readOnly
                placeholder="Not set"
                className="bg-gray-50 text-gray-700 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Role description */}
          <div className="bg-indigo-50 rounded-xl p-3 flex items-start gap-2.5 border border-indigo-100">
            <Shield className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-indigo-700">{roleCfg.label}</p>
              <p className="text-xs text-indigo-600 mt-0.5">{roleCfg.desc}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company card */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-50">
              <Building2 className="h-4 w-4 text-orange-600" />
            </div>
            <CardTitle className="text-base">Company</CardTitle>
          </div>
          <CardDescription>Your company workspace details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-1.5">
            <Label className="text-xs text-gray-500">Company Name</Label>
            <Input
              value={company?.name ?? ""}
              readOnly
              className="bg-gray-50 text-gray-700 cursor-not-allowed font-medium"
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs text-gray-500">API Endpoint</Label>
            <Input
              value={process.env.NEXT_PUBLIC_API_URL || "Not configured"}
              readOnly
              className="bg-gray-50 text-gray-400 cursor-not-allowed font-mono text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-green-50">
              <Lock className="h-4 w-4 text-green-600" />
            </div>
            <CardTitle className="text-base">Change Password</CardTitle>
          </div>
          <CardDescription>Update your login password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Current password */}
            <div className="grid gap-1.5">
              <Label className="text-xs text-gray-500">Current Password</Label>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Your current password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="grid gap-1.5">
              <Label className="text-xs text-gray-500">New Password</Label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength bar */}
              {newPassword.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i <= strength ? strengthColor : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-[11px] ${
                    strength <= 1 ? "text-red-500" :
                    strength === 2 ? "text-yellow-600" :
                    strength === 3 ? "text-blue-600" : "text-green-600"
                  }`}>
                    {strengthLabel} password
                  </p>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div className="grid gap-1.5">
              <Label className="text-xs text-gray-500">Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className={confirmPassword && confirmPassword !== newPassword ? "border-red-300" : ""}
              />
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-[11px] text-red-500">Passwords don't match</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={savingPassword}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              {savingPassword ? (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {savingPassword ? "Saving..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-200 bg-red-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-red-700">Sign Out</CardTitle>
          <CardDescription>
            You'll need to sign in again to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4 bg-red-100" />
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ErrorBoundary>
      <SettingsContent />
    </ErrorBoundary>
  );
}

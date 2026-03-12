"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Building2, LogOut } from "lucide-react";

type UserShape = { email?: string; name?: string; id?: string } | null;

export default function SettingsPage() {
  const auth = useAuth();
  const user = auth?.user as UserShape;
  const email = user?.email ?? "";
  const name = user?.name ?? "";

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      document.cookie = "token=; path=/; max-age=0;";
    }
    auth?.logout();
    window.location.href = "/login";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your account and application preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            <CardTitle>Profile</CardTitle>
          </div>
          <CardDescription>
            Your account information (read-only)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="settings-email">Email</Label>
            <Input
              id="settings-email"
              type="email"
              value={email}
              readOnly
              className="bg-gray-50"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="settings-name">Name</Label>
            <Input
              id="settings-name"
              type="text"
              value={name}
              readOnly
              placeholder="Not set"
              className="bg-gray-50"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-gray-500" />
            <CardTitle>Application</CardTitle>
          </div>
          <CardDescription>
            Company Management System (CMS)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="settings-api">API base URL</Label>
            <Input
              id="settings-api"
              type="text"
              value={process.env.NEXT_PUBLIC_API_URL || "Not configured"}
              readOnly
              className="bg-gray-50 font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20">
        <CardHeader>
          <CardTitle className="text-red-700 dark:text-red-400">
            Account
          </CardTitle>
          <CardDescription>
            Sign out from this device. You will need to sign in again to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4 bg-red-200 dark:bg-red-900/50" />
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

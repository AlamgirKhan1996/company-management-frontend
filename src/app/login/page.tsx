"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AxiosError } from "axios";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";

function LoginContent() {
  const router = useRouter();
  const auth = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

    try {
      setLoading(true);
      if (!auth) throw new Error("Auth not initialized");
      await auth.login(email, password);
      toast.success("Logged in successfully");
      setTimeout(() => {
        router.push("/dashboard");
      }, 300);
    } catch (err: unknown) {
      console.error(err);
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Failed to login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 px-4">
      <Card className="w-full max-w-md p-4 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center">
            Company Management System
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Don&apos;t have a company yet?{" "}
              <Link
                href="/register-company"
                className="font-medium text-gray-900 underline underline-offset-4"
              >
                Register your company
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <ErrorBoundary>
      <LoginContent />
    </ErrorBoundary>
  );
}


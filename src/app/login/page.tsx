"use client";

import { useState } from "react";
import api from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AxiosError } from "axios";

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

    try {
      const res = await api.post("/api/auth/login", { email, password });

      const token = res.data.token;
      localStorage.setItem("token", token);

      toast.success("Logged in successfully");
      router.replace("/dashboard");
    } catch (err: unknown) {
      console.error(err);
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || "Failed to login");
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

            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

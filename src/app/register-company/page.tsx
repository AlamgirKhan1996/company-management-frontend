"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api-client";
import { AxiosError } from "axios";
import { toast } from "sonner";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";

type FormState = {
  companyName: string;
  companyEmail: string;
  adminName: string;
  adminEmail: string;
  password: string;
};

function RegisterCompanyContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    companyName: "",
    companyEmail: "",
    adminName: "",
    adminEmail: "",
    password: "",
  });

const BLOCKED = ["example.com","test.com","fake.com","mailinator.com","yopmail.com"];

function isFakeEmail(email: string) {
  const domain = email.split("@")[1]?.toLowerCase();
  return BLOCKED.includes(domain);
}

const errors = useMemo(() => {
  const e: Partial<Record<keyof FormState, string>> = {};
  if (!form.companyName.trim()) e.companyName = "Company name is required";
  if (!form.companyEmail.trim()) e.companyEmail = "Company email is required";
  if (!form.adminName.trim()) e.adminName = "Admin name is required";
  if (!form.adminEmail.trim()) e.adminEmail = "Admin email is required";
  if (form.password.length < 8) e.password = "Password must be at least 8 characters";
  if (isFakeEmail(form.adminEmail)) {
    e.adminEmail = "Please use a real email address";
  }
  if (isFakeEmail(form.companyEmail)) {
    e.companyEmail = "Please use a real business email";
  }
  return e;
}, [form]);

const isValid = Object.keys(errors).length === 0;

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  if (!isValid) {
    toast.error("Please fix the form errors");
    return;
  }

  try {
    setLoading(true);
    await api.post("/api/auth/register-company", {
      companyName: form.companyName.trim(),
      companyEmail: form.companyEmail.trim(),
      adminName: form.adminName.trim(),
      adminEmail: form.adminEmail.trim(),
      password: form.password,
    });

    toast.success("Company registered successfully. Please log in.");
    router.replace("/login");
  } catch (err) {
    const error = err as AxiosError<{ error?: string; message?: string }>;
    toast.error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Registration failed"
    );
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="text-2xl font-bold tracking-tight text-gray-900">
            Create your company workspace
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Register your company and the first admin account.
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Company registration</CardTitle>
            <CardDescription>
              This creates a new company tenant and an admin user.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company name</Label>
                <Input
                  id="companyName"
                  value={form.companyName}
                  onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
                  placeholder="Acme Inc."
                  aria-invalid={!!errors.companyName}
                />
                {errors.companyName && (
                  <p className="text-xs text-red-600">{errors.companyName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyEmail">Company email</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={form.companyEmail}
                  onChange={(e) => setForm((p) => ({ ...p, companyEmail: e.target.value }))}
                  placeholder="billing@acme.com"
                  aria-invalid={!!errors.companyEmail}
                />
                {errors.companyEmail && (
                  <p className="text-xs text-red-600">{errors.companyEmail}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="adminName">Admin name</Label>
                  <Input
                    id="adminName"
                    value={form.adminName}
                    onChange={(e) => setForm((p) => ({ ...p, adminName: e.target.value }))}
                    placeholder="John Doe"
                    aria-invalid={!!errors.adminName}
                  />
                  {errors.adminName && (
                    <p className="text-xs text-red-600">{errors.adminName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={form.adminEmail}
                    onChange={(e) => setForm((p) => ({ ...p, adminEmail: e.target.value }))}
                    placeholder="admin@acme.com"
                    aria-invalid={!!errors.adminEmail}
                  />
                  {errors.adminEmail && (
                    <p className="text-xs text-red-600">{errors.adminEmail}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="At least 8 characters"
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <p className="text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              <Button className="w-full" type="submit" disabled={loading || !isValid}>
                {loading ? "Creating workspace..." : "Create company"}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-gray-900 underline underline-offset-4"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterCompanyPage() {
  return (
    <ErrorBoundary>
      <RegisterCompanyContent />
    </ErrorBoundary>
  );
}


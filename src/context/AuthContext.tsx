"use client";

import { createContext, useContext,  useState, ReactNode } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

const AuthContext = createContext<{
  user: unknown;
  login: (email: unknown, password: unknown) => Promise<void>;
  logout: () => void;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<unknown | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  }
  );
  async function login(email: unknown, password: unknown) {
    const res = await api.post("/auth/login", { email, password });

    localStorage.setItem("accessToken", res.data.accessToken);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    setUser(res.data.user);

    router.push("/dashboard");
  }

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

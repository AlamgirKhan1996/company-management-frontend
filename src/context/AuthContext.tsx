"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import api from "@/lib/api-client";
import { useRouter } from "next/navigation";

export type AuthUser = {
  id: string;
  name?: string | null;
  email: string;
  companyId?: string | null;
  role?: string | null;
};

type CompanyInfo = {
  id: string;
  name: string;
  email?: string | null;
};

type AuthState = {
  token: string | null;
  currentUser: AuthUser | null;
  companyId: string | null;
  company: CompanyInfo | null;
  isHydrated: boolean;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const LS_KEYS = {
  token: "token",
  user: "user",
  companyId: "companyId",
  company: "company",
} as const;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedToken = localStorage.getItem(LS_KEYS.token);
    const storedUser = localStorage.getItem(LS_KEYS.user);
    const storedCompanyId = localStorage.getItem(LS_KEYS.companyId);
    const storedCompany = localStorage.getItem(LS_KEYS.company);

    setToken(storedToken);
    setCompanyId(storedCompanyId);

    try {
      setCurrentUser(storedUser ? (JSON.parse(storedUser) as AuthUser) : null);
    } catch {
      setCurrentUser(null);
    }

    try {
      setCompany(storedCompany ? (JSON.parse(storedCompany) as CompanyInfo) : null);
    } catch {
      setCompany(null);
    }

    setIsHydrated(true);
  }, []);

  const refreshProfile = async () => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem(LS_KEYS.token);
    if (!t) return;

    // Backend contract can vary; support a few shapes without breaking.
    // Expected (ideal): { user, company } or { user } with user.companyId.
    const res = await api.get("/api/auth/me");
    const nextUser: AuthUser | null = res.data?.user ?? res.data?.currentUser ?? res.data ?? null;
    const nextCompany: CompanyInfo | null = res.data?.company ?? null;

    if (nextUser && typeof nextUser === "object" && nextUser.email) {
      setCurrentUser(nextUser);
      localStorage.setItem(LS_KEYS.user, JSON.stringify(nextUser));

      const cid =
        res.data?.companyId ??
        nextUser.companyId ??
        nextCompany?.id ??
        localStorage.getItem(LS_KEYS.companyId);
      if (cid) {
        setCompanyId(cid);
        localStorage.setItem(LS_KEYS.companyId, cid);
      }
    }

    if (nextCompany && nextCompany.id && nextCompany.name) {
      setCompany(nextCompany);
      localStorage.setItem(LS_KEYS.company, JSON.stringify(nextCompany));
    } else if (!company && nextUser?.companyId) {
      // Optional: try to resolve company info if backend supports it.
      try {
        const cRes = await api.get("/api/companies/me");
        const c: CompanyInfo | null = cRes.data?.company ?? cRes.data ?? null;
        if (c?.id && c?.name) {
          setCompany(c);
          localStorage.setItem(LS_KEYS.company, JSON.stringify(c));
        }
      } catch {
        // ignore — endpoint might not exist
      }
    }
  };

  useEffect(() => {
    if (!isHydrated) return;
    if (!token) return;
    if (currentUser) return;
    refreshProfile().catch(() => {
      // If token is invalid/expired, keep pages protected via Protected component.
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, token]);

  async function login(email: string, password: string) {
    const res = await api.post("/api/auth/login", { email, password });

    const nextToken: string | undefined =
      res.data?.token ?? res.data?.accessToken ?? res.data?.jwt ?? undefined;
    if (!nextToken) throw new Error("No token returned from server");

    const nextUser: AuthUser | null = res.data?.user ?? res.data?.currentUser ?? null;
    const nextCompany: CompanyInfo | null = res.data?.company ?? null;
    const nextCompanyId: string | null =
      res.data?.companyId ??
      nextUser?.companyId ??
      nextCompany?.id ??
      null;

    localStorage.setItem(LS_KEYS.token, nextToken);
    setToken(nextToken);

    if (nextUser) {
      localStorage.setItem(LS_KEYS.user, JSON.stringify(nextUser));
      setCurrentUser(nextUser);
    } else {
      localStorage.removeItem(LS_KEYS.user);
      setCurrentUser(null);
    }

    if (nextCompanyId) {
      localStorage.setItem(LS_KEYS.companyId, nextCompanyId);
      setCompanyId(nextCompanyId);
    } else {
      localStorage.removeItem(LS_KEYS.companyId);
      setCompanyId(null);
    }

    if (nextCompany) {
      localStorage.setItem(LS_KEYS.company, JSON.stringify(nextCompany));
      setCompany(nextCompany);
    }

    router.replace("/dashboard");
  }

  function logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(LS_KEYS.token);
      localStorage.removeItem(LS_KEYS.user);
      localStorage.removeItem(LS_KEYS.companyId);
      localStorage.removeItem(LS_KEYS.company);
      document.cookie = "token=; path=/; max-age=0;";
    }
    setToken(null);
    setCurrentUser(null);
    setCompanyId(null);
    setCompany(null);
    router.replace("/login");
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      currentUser,
      companyId,
      company,
      isHydrated,
      login,
      logout,
      refreshProfile,
    }),
    [token, currentUser, companyId, company, isHydrated]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

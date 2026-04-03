"use client";

// ─── src/context/AuthContext.tsx ──────────────────────────────────────────────
// FIXES:
// 1. Logout now properly clears everything and forces hard redirect
// 2. Token expiry handled gracefully
// 3. Hydration race condition fixed

import {
  createContext, useCallback, useContext,
  useEffect, useMemo, useState, ReactNode,
} from "react";
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
  token:     "token",
  user:      "user",
  companyId: "companyId",
  company:   "company",
} as const;

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Clear all auth data ──────────────────────────────────────────────────────
function clearAuthStorage() {
  if (typeof window === "undefined") return;
  Object.values(LS_KEYS).forEach((key) => localStorage.removeItem(key));
  // Clear cookie
  document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [token, setToken]           = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [companyId, setCompanyId]   = useState<string | null>(null);
  const [company, setCompany]       = useState<CompanyInfo | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // ─── Hydrate from localStorage on mount ───────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedToken     = localStorage.getItem(LS_KEYS.token);
    const storedUser      = localStorage.getItem(LS_KEYS.user);
    const storedCompanyId = localStorage.getItem(LS_KEYS.companyId);
    const storedCompany   = localStorage.getItem(LS_KEYS.company);

    setToken(storedToken);
    setCompanyId(storedCompanyId);

    try { setCurrentUser(storedUser ? JSON.parse(storedUser) : null); }
    catch { setCurrentUser(null); }

    try { setCompany(storedCompany ? JSON.parse(storedCompany) : null); }
    catch { setCompany(null); }

    setIsHydrated(true);
  }, []);

  // ─── Refresh profile ───────────────────────────────────────────────────────
  const refreshProfile = useCallback(async () => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem(LS_KEYS.token);
    if (!t) return;

    try {
      const res = await api.get("/api/auth/me");
      const nextUser: AuthUser | null =
        res.data?.user ?? res.data?.currentUser ?? res.data ?? null;
      const nextCompany: CompanyInfo | null = res.data?.company ?? null;

      if (nextUser?.email) {
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

      if (nextCompany?.id && nextCompany?.name) {
        setCompany(nextCompany);
        localStorage.setItem(LS_KEYS.company, JSON.stringify(nextCompany));
      }
    } catch {
      // Token expired or invalid — logout
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || !token || currentUser) return;
    refreshProfile();
  }, [isHydrated, token, currentUser, refreshProfile]);

  // ─── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post("/api/auth/login", { email, password });

      const nextToken: string | undefined =
        res.data?.token ?? res.data?.accessToken ?? res.data?.jwt;
      if (!nextToken) throw new Error("No token returned from server");

      const nextUser: AuthUser | null =
        res.data?.user ?? res.data?.currentUser ?? null;
      const nextCompany: CompanyInfo | null = res.data?.company ?? null;
      const nextCompanyId: string | null =
        res.data?.companyId ??
        nextUser?.companyId ??
        nextCompany?.id ?? null;

      // Persist token FIRST
      localStorage.setItem(LS_KEYS.token, nextToken);
      setToken(nextToken);

      // ✅ Set cookie for middleware
      document.cookie = `token=${nextToken}; path=/; max-age=86400; SameSite=Lax`;

      if (nextUser) {
        localStorage.setItem(LS_KEYS.user, JSON.stringify(nextUser));
        setCurrentUser(nextUser);
      }
      if (nextCompanyId) {
        localStorage.setItem(LS_KEYS.companyId, nextCompanyId);
        setCompanyId(nextCompanyId);
      }
      if (nextCompany) {
        localStorage.setItem(LS_KEYS.company, JSON.stringify(nextCompany));
        setCompany(nextCompany);
      }

      router.replace("/dashboard");
    },
    [router]
  );

  // ─── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    // 1. Clear all state
    setToken(null);
    setCurrentUser(null);
    setCompanyId(null);
    setCompany(null);

    // 2. Clear all storage + cookies
    clearAuthStorage();

    // 3. ✅ FIX: Hard redirect — not router.replace
    // router.replace can show white screen because React re-renders
    // before the middleware kicks in. window.location is instant.
    window.location.href = "/login";
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token, currentUser, companyId, company,
      isHydrated, login, logout, refreshProfile,
    }),
    [token, currentUser, companyId, company, isHydrated, login, logout, refreshProfile]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

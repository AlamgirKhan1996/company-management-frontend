import { jwtDecode } from "jwt-decode";

type TokenPayload = {
  id: string;
  email: string;
  role: string;
};

export function getUserFromToken(): TokenPayload | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    return jwtDecode<TokenPayload>(token);
  } catch {
    return null;
  }
}

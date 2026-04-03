// ─── src/middleware.ts ────────────────────────────────────────────────────────
// Handles auth routing for all pages

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes — no auth needed
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register-company",
  "/accept-invite",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value ?? null;

  // ✅ Always allow public paths
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "?")
  );
  if (isPublic) return NextResponse.next();

  // ✅ Allow static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isDashboard = pathname.startsWith("/dashboard");
  const isLoginPage = pathname === "/login";

  // Logged in → trying to reach login → send to dashboard
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ✅ FIX: Not logged in → trying to reach dashboard → send to login
  // This is what was causing the white screen after logout
  if (!token && isDashboard) {
    const loginUrl = new URL("/login", req.url);
    // Don't add redirect param for dashboard root — cleaner UX
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

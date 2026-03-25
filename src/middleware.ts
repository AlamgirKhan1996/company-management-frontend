import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// BUG FIXED: original typed req as a plain object literal which is wrong.
// Next.js middleware always receives a NextRequest instance.
export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value ?? null;

  const isAuthPage = req.nextUrl.pathname.startsWith("/login");
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  // Logged in + trying to reach login → send to dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Not logged in + trying to reach dashboard → send to login
  if (!token && isDashboard) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard/:path*"],
};

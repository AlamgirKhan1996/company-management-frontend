import { NextResponse } from "next/server";

export function middleware(req: { cookies: { get: (arg0: string) => { (): unknown; new(): unknown; value: null; }; }; nextUrl: { pathname: string; }; url: string | URL | undefined; }) {
  const token = req.cookies.get("token")?.value || null;

  const isAuthPage = req.nextUrl.pathname.startsWith("/login");
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  // If logged in and trying to access login → redirect to dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // If NOT logged in and trying to access dashboard → redirect to login
  if (!token && isDashboard) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard/:path*"],
};

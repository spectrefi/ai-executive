import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const secret = process.env.ADMIN_SECRET;
    if (!secret) return NextResponse.redirect(new URL("/", req.url));

    const provided =
      req.nextUrl.searchParams.get("secret") ??
      req.headers.get("x-admin-secret") ??
      "";

    if (provided !== secret) return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};

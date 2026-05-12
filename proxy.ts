import { NextRequest, NextResponse } from "next/server";

// Constant-time string comparison — prevents timing-based secret enumeration
function safeCompare(a: string, b: string): boolean {
  const ab = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const secret = process.env.ADMIN_SECRET;
    if (!secret) return NextResponse.redirect(new URL("/", req.url));

    const provided = req.headers.get("x-admin-secret") ?? "";
    if (!safeCompare(provided, secret)) {
      console.warn(`[security] Admin auth failure from ${req.headers.get("x-forwarded-for") ?? "unknown"} — ${req.nextUrl.pathname}`);
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};

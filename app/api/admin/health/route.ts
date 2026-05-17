import { NextRequest, NextResponse } from "next/server";
import { runAllChecks } from "@/lib/health-checks";

export const dynamic = "force-dynamic";

function auth(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const provided = req.headers.get("x-admin-secret") ?? "";
  if (provided.length !== secret.length) return false;
  // Constant-time comparison
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const report = await runAllChecks();
  return NextResponse.json(report);
}

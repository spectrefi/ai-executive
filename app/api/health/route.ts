import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(
    { status: "ok", ts: new Date().toISOString() },
    { status: 200 }
  );
}

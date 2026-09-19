import { NextResponse } from "next/server";

export async function POST() {
  // Phase 4 counts intentional install clicks (never page-views).
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { submissionSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = submissionSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "INVALID", message: "Invalid submission." } }, { status: 400 });
    }
    // Phase 4 persists as PENDING_REVIEW. Stub acknowledges validation.
    return NextResponse.json({ ok: true, status: "PENDING_REVIEW" }, { status: 202 });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL", message: "Something went wrong." } }, { status: 500 });
  }
}

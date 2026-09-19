import { NextResponse } from "next/server";
import { searchParamsSchema } from "@/lib/validation";
import { searchSkills } from "@/lib/search";
import { toErrorResponse, AppError } from "@/lib/errors";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = searchParamsSchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) throw new AppError("INVALID", "Invalid params.", 400);
    return NextResponse.json(await searchSkills(parsed.data));
  } catch (err) {
    const body = toErrorResponse(err);
    return NextResponse.json(body, { status: err instanceof AppError ? err.status : 500 });
  }
}

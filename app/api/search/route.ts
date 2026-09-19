import { NextResponse } from "next/server";
import { searchParamsSchema } from "@/lib/validation";
import { searchSkills } from "@/lib/search";
import { toErrorResponse, AppError } from "@/lib/errors";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = searchParamsSchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) {
      throw new AppError("INVALID", "Invalid search params.", 400);
    }
    const result = await searchSkills(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    const body = toErrorResponse(err);
    const status = err instanceof AppError ? err.status : 500;
    return NextResponse.json(body, { status });
  }
}

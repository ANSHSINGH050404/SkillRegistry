import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const header = req.headers.get("x-admin-secret");
  if (header === secret) return true;
  const bearer = req.headers.get("authorization");
  if (bearer === `Bearer ${secret}`) return true;
  const url = new URL(req.url);
  // Allow ?admin=SECRET for browser navigation convenience in V1 (server-gated, never logged).
  if (url.searchParams.get("admin") === secret) return true;
  const cookie = req.cookies.get("admin_secret")?.value;
  if (cookie === secret) return true;
  return false;
}

export default function proxy(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin") || req.nextUrl.pathname.startsWith("/api/admin")) {
    if (!isAuthorized(req)) {
      if (req.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized." } }, { status: 401 });
      }
      return new NextResponse("Unauthorized. Provide ?admin=SECRET, x-admin-secret header, or admin_secret cookie.", { status: 401 });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

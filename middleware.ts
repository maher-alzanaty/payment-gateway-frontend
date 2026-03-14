import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // ✅ debug with headers
  const res = NextResponse.next();
  res.headers.set("x-debug-token", token || "no-token");
  return res;

  // Or just do redirect as you already have
  // if (!token && request.nextUrl.pathname.startsWith("/admin-page")) {
  //   return NextResponse.redirect(new URL("/", request.url));
  // }
}

export const config = {
  matcher: ["/admin-page/:path*"],
};
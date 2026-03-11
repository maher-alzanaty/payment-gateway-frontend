import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {

const token = request.cookies.get("token");

if (!token && request.nextUrl.pathname.startsWith("/admin-page")) {
  return NextResponse.redirect(new URL("/", request.url));
}

return NextResponse.next();

}

export const config = {
matcher: ["/admin-page/:path*"],
};
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const openPaths = ["/login", "/accept-invite"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) return NextResponse.next();
  if (openPaths.some((path) => pathname.startsWith(path))) return NextResponse.next();

  const token = req.cookies.get("yi_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api).*)"],
};

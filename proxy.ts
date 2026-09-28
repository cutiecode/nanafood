import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "admin_auth";

function isAuthenticated(req: NextRequest) {
  return req.cookies.get(ADMIN_COOKIE)?.value === "true";
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method.toUpperCase();

  // Never gate the login page itself — doing so would create a redirect loop.
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Bare "/admin" is not a real page anymore — send it straight to the
  // dashboard (if already authenticated) or the login page.
  if (pathname === "/admin") {
    const target = isAuthenticated(req) ? "/admin/dashboard" : "/admin/login";
    return NextResponse.redirect(new URL(target, req.url));
  }

  const isAdminPage = pathname.startsWith("/admin/");

  const isProtectedApi =
    (pathname === "/api/menu" || pathname.startsWith("/api/menu/")) && method !== "GET" ||
    (pathname === "/api/categories" || pathname.startsWith("/api/categories/")) && method !== "GET" ||
    (pathname === "/api/drinks" || pathname.startsWith("/api/drinks/")) && method !== "GET" ||
    (pathname === "/api/desserts" || pathname.startsWith("/api/desserts/")) && method !== "GET" ||
    pathname === "/api/upload" ||
    (pathname === "/api/settings" && method !== "GET") ||
    pathname === "/api/orders";

  // Anything matched by config.matcher below that isn't an admin page and
  // isn't a protected API call (e.g. a public GET) passes through untouched.
  if (!isAdminPage && !isProtectedApi) {
    return NextResponse.next();
  }

  if (isAuthenticated(req)) {
    return NextResponse.next();
  }

  if (isAdminPage) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/menu/:path*",
    "/api/categories/:path*",
    "/api/drinks/:path*",
    "/api/desserts/:path*",
    "/api/upload",
    "/api/settings",
    "/api/orders",
  ],
};

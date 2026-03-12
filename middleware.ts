import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/config";
import {
  hasAnyPlatformEntitlement,
  hasFullPortalEntitlement,
} from "@/lib/access/entitlements";
import { verifySessionToken } from "@/lib/auth/session";

const AUTH_ROUTE = "/login";
const PRICING_ROUTE = "/pricing";
const PROTECTED_PREFIXES = ["/dashboard", "/module", "/resources"];

const matchesPrefix = (pathname: string, prefixes: string[]) =>
  prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedContent = matchesPrefix(pathname, PROTECTED_PREFIXES);
  const isAuthRoute = pathname === AUTH_ROUTE;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  const isAuthenticated = Boolean(session);
  const hasFullAccess = hasFullPortalEntitlement(session?.entitlements ?? []);
  const hasPlatformAccess = hasAnyPlatformEntitlement(session?.entitlements ?? []);
  const isCoreSetupModule =
    pathname === "/module/core-setup-guides" || pathname.startsWith("/module/core-setup-guides/");

  let routeDecision = "allow";

  if (isAuthRoute && isAuthenticated) {
    const destination =
      session?.accessLevel === "portal"
        ? "/dashboard"
        : session?.hasAccess
          ? "/module/core-setup-guides"
          : PRICING_ROUTE;
    routeDecision = `redirect:${destination}`;
    if (process.env.NODE_ENV === "development") {
      console.log("[route-guard]", {
        pathname,
        isAuthenticated,
        hasAccess: session?.hasAccess ?? false,
        accessLevel: session?.accessLevel ?? "none",
        routeDecision,
      });
    }
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (isProtectedContent && !isAuthenticated) {
    routeDecision = "redirect:/login";
    if (process.env.NODE_ENV === "development") {
      console.log("[route-guard]", {
        pathname,
        isAuthenticated,
        hasAccess: false,
        accessLevel: "none",
        routeDecision,
      });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isProtectedContent && isAuthenticated) {
    const allowCoreSetup = isCoreSetupModule && hasPlatformAccess;
    const allowFull = hasFullAccess;
    if (allowCoreSetup || allowFull) {
      return NextResponse.next();
    }

    routeDecision = "redirect:/pricing";
    if (process.env.NODE_ENV === "development") {
      console.log("[route-guard]", {
        pathname,
        isAuthenticated,
        hasAccess: session?.hasAccess ?? false,
        accessLevel: session?.accessLevel ?? "none",
        routeDecision,
      });
    }
    return NextResponse.redirect(new URL(PRICING_ROUTE, request.url));
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[route-guard]", {
      pathname,
      isAuthenticated,
      hasAccess: session?.hasAccess ?? false,
      accessLevel: session?.accessLevel ?? "none",
      routeDecision,
    });
  }

  // NOTE: Add role/subscription tier checks here later.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/module/:path*",
    "/resources/:path*",
    "/pricing",
    "/checkout/:path*",
    "/login",
  ],
};

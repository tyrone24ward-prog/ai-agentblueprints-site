import { NextResponse } from "next/server";

import { setSessionCookie } from "@/lib/auth/cookies";
import { verifyDemoCredentials } from "@/lib/auth/credentials";
import { createSessionToken } from "@/lib/auth/session";
import { getAccessStateForEmail } from "@/lib/access/store";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;

  const email = body?.email ?? "";
  const password = body?.password ?? "";
  const user = await verifyDemoCredentials(email, password);

  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  const accessState = await getAccessStateForEmail(user.email);
  const redirectTo =
    accessState.accessLevel === "portal"
      ? "/dashboard"
      : accessState.hasAccess
        ? "/module/core-setup-guides"
        : "/pricing";

  if (process.env.NODE_ENV === "development") {
    console.log("[auth-login] auth state", {
      email: user.email,
      isAuthenticated: true,
    });
    console.log("[auth-login] access state", {
      email: user.email,
      hasAccess: accessState.hasAccess,
      accessLevel: accessState.accessLevel,
      entitlements: accessState.entitlements,
    });
    console.log("[auth-login] redirect destination", { redirectTo });
  }

  const token = await createSessionToken({
    ...user,
    hasAccess: accessState.hasAccess,
    accessLevel: accessState.accessLevel,
    entitlements: accessState.entitlements,
  });
  const response = NextResponse.json({ success: true, redirectTo });
  setSessionCookie(response, token);

  return response;
}

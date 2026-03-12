import { NextResponse } from "next/server";

import { getAccessStateForEmail } from "@/lib/access/store";
import { setSessionCookie } from "@/lib/auth/cookies";
import { createSessionToken } from "@/lib/auth/session";
import { consumeSetPasswordToken } from "@/lib/auth/user-store";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { token?: string; password?: string }
    | null;

  const token = body?.token?.trim() ?? "";
  const password = body?.password ?? "";

  if (!token) {
    return NextResponse.json({ error: "Missing setup token." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const user = await consumeSetPasswordToken(token, password);
  if (!user) {
    return NextResponse.json({ error: "Token is invalid or expired." }, { status: 400 });
  }

  const accessState = await getAccessStateForEmail(user.email);
  const redirectTo =
    accessState.accessLevel === "portal"
      ? "/dashboard"
      : accessState.hasAccess
        ? "/module/core-setup-guides"
        : "/pricing";

  const sessionToken = await createSessionToken({
    email: user.email,
    role: user.role,
    hasAccess: accessState.hasAccess,
    accessLevel: accessState.accessLevel,
    entitlements: accessState.entitlements,
  });

  const response = NextResponse.json({ success: true, redirectTo });
  setSessionCookie(response, sessionToken);
  return response;
}

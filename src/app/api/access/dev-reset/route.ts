import { NextResponse } from "next/server";

import { resetPortalAccess } from "@/lib/access/store";
import { setSessionCookie } from "@/lib/auth/cookies";
import { createSessionToken } from "@/lib/auth/session";
import { getCurrentSessionUser } from "@/lib/auth/session-server";

export const runtime = "nodejs";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production." }, { status: 403 });
  }

  const sessionUser = await getCurrentSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessState = await resetPortalAccess(sessionUser.email);
  const token = await createSessionToken({
    ...sessionUser,
    hasAccess: accessState.hasAccess,
    accessLevel: accessState.accessLevel,
    entitlements: accessState.entitlements,
  });

  const response = NextResponse.json({ success: true });
  setSessionCookie(response, token);
  return response;
}

import { SignJWT, jwtVerify } from "jose";

import {
  AUTH_SECRET,
  AUTH_SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/config";
import { deriveAccessLevel, normalizeEntitlements } from "@/lib/access/entitlements";
import type { SessionUser } from "@/lib/auth/types";

const secretKey = new TextEncoder().encode(AUTH_SECRET);

export const createSessionToken = async (user: SessionUser) => {
  return new SignJWT({
    email: user.email,
    role: user.role,
    hasAccess: user.hasAccess,
    accessLevel: user.accessLevel,
    entitlements: user.entitlements,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.email)
    .setIssuedAt()
    .setExpirationTime(`${AUTH_SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey);
};

export const verifySessionToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    const rawEntitlements = Array.isArray(payload.entitlements)
      ? payload.entitlements
      : [];
    const entitlements = normalizeEntitlements(
      rawEntitlements.filter((entry): entry is SessionUser["entitlements"][number] =>
        typeof entry === "string",
      ),
    );
    const accessLevel = deriveAccessLevel(entitlements);

    return {
      email: String(payload.email ?? ""),
      role: "admin",
      hasAccess: accessLevel !== "none",
      accessLevel,
      entitlements,
    } satisfies SessionUser;
  } catch {
    return null;
  }
};

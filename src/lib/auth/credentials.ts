import { DEMO_AUTH_EMAIL, DEMO_AUTH_PASSWORD } from "@/lib/auth/config";
import type { SessionUser } from "@/lib/auth/types";
import { verifyStoredUserCredentials } from "@/lib/auth/user-store";

export type AuthenticatedUser = Pick<SessionUser, "email" | "role">;

export const verifyDemoCredentials = async (email: string, password: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const isValid =
    normalizedEmail === DEMO_AUTH_EMAIL.toLowerCase() && password === DEMO_AUTH_PASSWORD;

  if (isValid) {
    // NOTE: Later, replace this return shape with your provider's user object.
    // This is also the place to pull paid status/subscription tier.
    return {
      email: normalizedEmail,
      role: "admin",
    } satisfies AuthenticatedUser;
  }

  const storedUser = await verifyStoredUserCredentials(normalizedEmail, password);
  if (!storedUser) {
    return null;
  }

  return storedUser satisfies AuthenticatedUser;
};

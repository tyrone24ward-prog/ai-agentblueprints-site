export const AUTH_COOKIE_NAME = "abp_portal_session";
export const AUTH_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

// NOTE: Replace these demo values with your real auth provider/user store later.
export const DEMO_AUTH_EMAIL =
  process.env.DEMO_AUTH_EMAIL ?? "admin@agentblueprints.com";
export const DEMO_AUTH_PASSWORD =
  process.env.DEMO_AUTH_PASSWORD ?? "AgentBlueprints123!";

// NOTE: In production, set AUTH_SECRET in environment variables.
// This fallback is only for local/dev convenience.
export const AUTH_SECRET =
  process.env.AUTH_SECRET ?? "replace-this-dev-secret-with-auth-secret";

export const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

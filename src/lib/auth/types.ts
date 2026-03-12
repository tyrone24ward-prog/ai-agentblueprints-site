export type AccessLevel = "none" | "platform" | "portal";

export type Entitlement =
  | "portal.full"
  | "platform.bland"
  | "platform.retell"
  | "platform.vapi";

export type SessionUser = {
  email: string;
  role: "admin";
  hasAccess: boolean;
  accessLevel: AccessLevel;
  entitlements: Entitlement[];
};

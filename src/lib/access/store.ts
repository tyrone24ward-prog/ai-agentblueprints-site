import {
  FULL_PORTAL_ENTITLEMENT,
  PLATFORM_ENTITLEMENTS,
  deriveAccessLevel,
  isEntitlement,
  normalizeEntitlements,
} from "@/lib/access/entitlements";
import type { AccessLevel, Entitlement } from "@/lib/auth/types";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type AccessRecord = {
  hasAccess: boolean;
  accessLevel: AccessLevel;
  entitlements: Entitlement[];
  updatedAt: string;
};

const defaultAccessRecord = (): AccessRecord => ({
  hasAccess: false,
  accessLevel: "none",
  entitlements: [],
  updatedAt: new Date().toISOString(),
});

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const ensureUserIdForEmail = async (email: string) => {
  const supabase = getSupabaseAdminClient();
  const normalizedEmail = normalizeEmail(email);
  const { data, error } = await supabase
    .from("ab_users")
    .upsert(
      {
        email: normalizedEmail,
        role: "admin",
      },
      { onConflict: "email" },
    )
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(`Unable to upsert user for access state: ${error?.message ?? "Unknown error"}`);
  }

  return data.id as string;
};

const getEntitlementsForUserId = async (userId: string) => {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("ab_user_entitlements")
    .select("entitlement")
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Unable to read user entitlements: ${error.message}`);
  }

  return normalizeEntitlements(
    (data ?? [])
      .map((entry) => entry.entitlement)
      .filter((entry): entry is Entitlement => typeof entry === "string" && isEntitlement(entry)),
  );
};

export const getAccessStateForEmail = async (email: string) => {
  const normalizedEmail = normalizeEmail(email);
  const supabase = getSupabaseAdminClient();
  const { data: user, error } = await supabase
    .from("ab_users")
    .select("id, updated_at")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load access state: ${error.message}`);
  }

  if (!user?.id) {
    return defaultAccessRecord();
  }

  const entitlements = await getEntitlementsForUserId(user.id as string);
  const accessLevel = deriveAccessLevel(entitlements);
  return {
    hasAccess: accessLevel !== "none",
    accessLevel,
    entitlements,
    updatedAt: String(user.updated_at ?? new Date().toISOString()),
  } satisfies AccessRecord;
};

export const grantPortalAccess = async (email: string) => {
  const userId = await ensureUserIdForEmail(email);
  const supabase = getSupabaseAdminClient();
  const entitlements = normalizeEntitlements([
    FULL_PORTAL_ENTITLEMENT,
    ...PLATFORM_ENTITLEMENTS,
  ]);

  const { error } = await supabase.from("ab_user_entitlements").upsert(
    entitlements.map((entitlement) => ({
      user_id: userId,
      entitlement,
    })),
    { onConflict: "user_id,entitlement", ignoreDuplicates: true },
  );

  if (error) {
    throw new Error(`Unable to grant portal access: ${error.message}`);
  }

  return getAccessStateForEmail(email);
};

export const grantEntitlement = async (email: string, entitlement: Entitlement) => {
  const userId = await ensureUserIdForEmail(email);
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("ab_user_entitlements").upsert(
    {
      user_id: userId,
      entitlement,
    },
    { onConflict: "user_id,entitlement", ignoreDuplicates: true },
  );

  if (error) {
    throw new Error(`Unable to grant entitlement: ${error.message}`);
  }

  return getAccessStateForEmail(email);
};

export const resetPortalAccess = async (email: string) => {
  const userId = await ensureUserIdForEmail(email);
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("ab_user_entitlements").delete().eq("user_id", userId);

  if (error) {
    throw new Error(`Unable to reset entitlements: ${error.message}`);
  }

  return getAccessStateForEmail(email);
};

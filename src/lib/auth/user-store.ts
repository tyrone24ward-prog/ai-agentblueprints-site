import { createHash, randomBytes } from "node:crypto";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type StoredUser = {
  email: string;
  role: "admin";
  passwordHash: string | null;
  setPasswordTokenHash: string | null;
  setPasswordTokenExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const SET_PASSWORD_TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

const nowIso = () => new Date().toISOString();

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

const upsertUser = async (email: string): Promise<StoredUser> => {
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
    .select("email, role, password_hash, created_at, updated_at")
    .single();

  if (error || !data) {
    throw new Error(`Unable to upsert user: ${error?.message ?? "Unknown error"}`);
  }

  return {
    email: String(data.email),
    role: "admin",
    passwordHash: data.password_hash ? String(data.password_hash) : null,
    setPasswordTokenHash: null,
    setPasswordTokenExpiresAt: null,
    createdAt: String(data.created_at ?? nowIso()),
    updatedAt: String(data.updated_at ?? nowIso()),
  };
};

export const ensureUserForEmail = async (email: string) => {
  return upsertUser(email);
};

export const verifyStoredUserCredentials = async (email: string, password: string) => {
  const normalizedEmail = normalizeEmail(email);
  const supabase = getSupabaseAdminClient();
  const { data: user, error } = await supabase
    .from("ab_users")
    .select("email, role, password_hash")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to verify user credentials: ${error.message}`);
  }

  if (!user?.password_hash) {
    return null;
  }

  const isValid = await verifyPassword(password, String(user.password_hash));
  if (!isValid) {
    return null;
  }

  return {
    email: String(user.email),
    role: "admin",
  } as const;
};

export const issueSetPasswordToken = async (email: string) => {
  const supabase = getSupabaseAdminClient();
  const user = await upsertUser(email);
  const { data: persistedUser, error: userLookupError } = await supabase
    .from("ab_users")
    .select("id, email")
    .eq("email", user.email)
    .single();

  if (userLookupError || !persistedUser?.id) {
    throw new Error(
      `Unable to issue password token because user lookup failed: ${
        userLookupError?.message ?? "Unknown error"
      }`,
    );
  }

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(Date.now() + SET_PASSWORD_TOKEN_TTL_MS).toISOString();

  const { error: insertError } = await supabase.from("ab_password_setup_tokens").insert({
    user_id: persistedUser.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  if (insertError) {
    throw new Error(`Unable to create password setup token: ${insertError.message}`);
  }

  return {
    token: rawToken,
    expiresAt,
    email: String(persistedUser.email),
  };
};

export const consumeSetPasswordToken = async (token: string, password: string) => {
  const supabase = getSupabaseAdminClient();
  const tokenHash = sha256(token);
  const nowIsoTime = new Date().toISOString();
  const { data: tokenRow, error: tokenLookupError } = await supabase
    .from("ab_password_setup_tokens")
    .select("id, user_id, expires_at, used_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (tokenLookupError) {
    throw new Error(`Unable to validate password setup token: ${tokenLookupError.message}`);
  }

  if (!tokenRow || tokenRow.used_at || new Date(String(tokenRow.expires_at)).getTime() <= Date.now()) {
    return null;
  }

  const newPasswordHash = await hashPassword(password);

  const { error: userUpdateError } = await supabase
    .from("ab_users")
    .update({ password_hash: newPasswordHash, updated_at: nowIso() })
    .eq("id", tokenRow.user_id);

  if (userUpdateError) {
    throw new Error(`Unable to set new password: ${userUpdateError.message}`);
  }

  const { error: tokenConsumeError } = await supabase
    .from("ab_password_setup_tokens")
    .update({ used_at: nowIsoTime })
    .eq("id", tokenRow.id);

  if (tokenConsumeError) {
    throw new Error(`Unable to consume password token: ${tokenConsumeError.message}`);
  }

  const { data: user, error: userLookupError } = await supabase
    .from("ab_users")
    .select("email, role")
    .eq("id", tokenRow.user_id)
    .single();

  if (userLookupError || !user?.email) {
    throw new Error(
      `Unable to load user after password set: ${userLookupError?.message ?? "Unknown error"}`,
    );
  }

  return {
    email: String(user.email),
    role: "admin",
  } as const;
};

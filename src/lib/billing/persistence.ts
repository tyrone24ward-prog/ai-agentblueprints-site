import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type RecordPurchaseArgs = {
  email: string;
  provider: "stripe" | "lemonsqueezy";
  providerCheckoutId: string;
  providerOrderId?: string | null;
  productKey?: string | null;
  status: "paid" | "pending" | "failed";
  amountCents?: number | null;
  currency?: string | null;
  metadata?: Record<string, unknown>;
};

export const ensureUserIdForEmail = async (email: string) => {
  const supabase = getSupabaseAdminClient();
  const normalizedEmail = email.trim().toLowerCase();
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
    throw new Error(`Unable to upsert user for purchase record: ${error?.message ?? "Unknown error"}`);
  }

  return String(data.id);
};

export const recordPurchase = async ({
  email,
  provider,
  providerCheckoutId,
  providerOrderId = null,
  productKey = null,
  status,
  amountCents = null,
  currency = null,
  metadata = {},
}: RecordPurchaseArgs) => {
  const supabase = getSupabaseAdminClient();
  const userId = await ensureUserIdForEmail(email);

  const { data: existing, error: existingError } = await supabase
    .from("ab_purchases")
    .select("id")
    .eq("provider", provider)
    .eq("provider_checkout_id", providerCheckoutId)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Unable to check existing purchase: ${existingError.message}`);
  }

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from("ab_purchases")
      .update({
        status,
        metadata,
        provider_order_id: providerOrderId,
        product_key: productKey,
        amount_cents: amountCents,
        currency,
      })
      .eq("id", existing.id);

    if (updateError) {
      throw new Error(`Unable to update purchase record: ${updateError.message}`);
    }

    return;
  }

  const { error: insertError } = await supabase.from("ab_purchases").insert({
    user_id: userId,
    provider,
    provider_order_id: providerOrderId,
    provider_checkout_id: providerCheckoutId,
    product_key: productKey,
    status,
    amount_cents: amountCents,
    currency,
    metadata,
  });

  if (insertError) {
    throw new Error(`Unable to insert purchase record: ${insertError.message}`);
  }
};

export const claimWebhookEvent = async ({
  provider,
  eventId,
  eventType,
  payload,
}: {
  provider: "stripe" | "lemonsqueezy";
  eventId: string;
  eventType: string;
  payload: Record<string, unknown>;
}) => {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("ab_webhook_events").insert({
    provider,
    event_id: eventId,
    event_type: eventType,
    status: "processing",
    payload,
  });

  if (!error) {
    return { claimed: true as const };
  }

  if (error.code === "23505") {
    return { claimed: false as const };
  }

  throw new Error(`Unable to claim webhook event: ${error.message}`);
};

export const finalizeWebhookEvent = async ({
  provider,
  eventId,
  status,
}: {
  provider: "stripe" | "lemonsqueezy";
  eventId: string;
  status: "processed" | "failed";
}) => {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("ab_webhook_events")
    .update({ status, processed_at: new Date().toISOString() })
    .eq("provider", provider)
    .eq("event_id", eventId);

  if (error) {
    throw new Error(`Unable to finalize webhook event: ${error.message}`);
  }
};

export const hasPaidPurchaseForEmail = async ({
  email,
  provider,
  productKey,
}: {
  email: string;
  provider?: "stripe" | "lemonsqueezy";
  productKey?: string | null;
}) => {
  const supabase = getSupabaseAdminClient();
  const normalizedEmail = email.trim().toLowerCase();

  const { data: user, error: userError } = await supabase
    .from("ab_users")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (userError) {
    throw new Error(`Unable to look up user for purchase check: ${userError.message}`);
  }

  if (!user?.id) {
    return false;
  }

  let query = supabase
    .from("ab_purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "paid")
    .limit(1);

  if (provider) {
    query = query.eq("provider", provider);
  }

  if (productKey) {
    query = query.eq("product_key", productKey);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    throw new Error(`Unable to check paid purchase: ${error.message}`);
  }

  return Boolean(data?.id);
};

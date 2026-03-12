-- Adds uniqueness protection for purchase checkout identifiers.
create unique index if not exists ab_purchases_provider_checkout_id_unique
  on public.ab_purchases(provider, provider_checkout_id)
  where provider_checkout_id is not null;

-- AgentBlueprints Portal - Core application schema
-- Run this in Supabase SQL Editor for the selected project.

create extension if not exists pgcrypto;

create table if not exists public.ab_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null default 'admin',
  password_hash text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ab_user_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.ab_users(id) on delete cascade,
  entitlement text not null,
  created_at timestamptz not null default now(),
  unique(user_id, entitlement)
);

create index if not exists ab_user_entitlements_user_id_idx
  on public.ab_user_entitlements(user_id);

create table if not exists public.ab_password_setup_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.ab_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists ab_password_setup_tokens_user_id_idx
  on public.ab_password_setup_tokens(user_id);

create index if not exists ab_password_setup_tokens_expires_at_idx
  on public.ab_password_setup_tokens(expires_at);

create table if not exists public.ab_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.ab_users(id) on delete cascade,
  provider text not null,
  provider_order_id text null,
  provider_checkout_id text null,
  product_key text null,
  status text not null default 'paid',
  amount_cents integer null,
  currency text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ab_purchases_user_id_idx
  on public.ab_purchases(user_id);

create index if not exists ab_purchases_provider_order_id_idx
  on public.ab_purchases(provider, provider_order_id);

create unique index if not exists ab_purchases_provider_checkout_id_unique
  on public.ab_purchases(provider, provider_checkout_id)
  where provider_checkout_id is not null;

create table if not exists public.ab_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  event_type text not null,
  status text not null default 'received',
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz null,
  created_at timestamptz not null default now(),
  unique(provider, event_id)
);

create or replace function public.ab_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ab_users_set_updated_at on public.ab_users;
create trigger ab_users_set_updated_at
before update on public.ab_users
for each row
execute function public.ab_set_updated_at();

drop trigger if exists ab_purchases_set_updated_at on public.ab_purchases;
create trigger ab_purchases_set_updated_at
before update on public.ab_purchases
for each row
execute function public.ab_set_updated_at();

-- ==============================================================================
-- LocalLoop · Supabase PostgreSQL Database Schema
-- Execute this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business TEXT NOT NULL,
  business_wallet TEXT,
  category TEXT NOT NULL DEFAULT 'entretenimiento',
  description TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget NUMERIC(12, 2) NOT NULL CHECK (budget > 0),
  reward NUMERIC(12, 2) NOT NULL CHECK (reward > 0),
  used_budget NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  conversions INTEGER NOT NULL DEFAULT 0,
  max_conversions INTEGER NOT NULL DEFAULT 100,
  days_left INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closing', 'completed')),
  conversion_action TEXT NOT NULL,
  validation_method TEXT NOT NULL DEFAULT 'code+voucher',
  conditions TEXT,
  stellar_funding_tx TEXT,
  stellar_settlement_tx TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Promoter participations table
CREATE TABLE IF NOT EXISTS public.participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  promoter_name TEXT NOT NULL,
  promoter_wallet TEXT NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  conversions_count INTEGER NOT NULL DEFAULT 0,
  earned_usdc NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused'))
);

-- 3. Conversions table (attributed sales)
CREATE TABLE IF NOT EXISTS public.conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  promoter_id UUID REFERENCES public.participations(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  operation_id TEXT NOT NULL,
  reward_amount NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'paid')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  rejection_reason TEXT,
  stellar_tx_hash TEXT
);

-- 4. Stellar on-chain settlements table
CREATE TABLE IF NOT EXISTS public.stellar_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  tx_hash TEXT NOT NULL UNIQUE,
  ledger INTEGER,
  amount_usdc NUMERIC(12, 2) NOT NULL,
  promoters_paid_count INTEGER NOT NULL DEFAULT 0,
  explorer_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_participations_campaign ON public.participations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_participations_code ON public.participations(referral_code);
CREATE INDEX IF NOT EXISTS idx_conversions_campaign ON public.conversions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_conversions_code ON public.conversions(referral_code);
CREATE INDEX IF NOT EXISTS idx_conversions_status ON public.conversions(status);

-- Enable Supabase Realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.participations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversions;

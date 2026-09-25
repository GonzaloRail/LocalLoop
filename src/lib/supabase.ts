import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ────────────────────────────────────────────────────────────────
// Tipos que reflejan exactamente el schema de Supabase
// (snake_case como viene de la BD)
// ────────────────────────────────────────────────────────────────
export interface DBCampaign {
  id: string
  name: string
  business: string
  business_wallet: string | null
  category: string
  description: string
  start_date: string
  end_date: string
  budget: number
  reward: number
  used_budget: number
  conversions: number
  max_conversions: number
  days_left: number
  status: 'active' | 'closing' | 'completed' | 'liquidated'
  conversion_action: string
  validation_method: string
  conditions: string | null
  stellar_funding_tx: string | null
  stellar_settlement_tx: string | null
  created_at: string
}

export interface DBParticipation {
  id: string
  campaign_id: string
  promoter_name: string
  promoter_wallet: string
  referral_code: string
  joined_at: string
  conversions_count: number
  earned_usdc: number
  status: 'active' | 'paused'
}

export interface DBConversion {
  id: string
  campaign_id: string
  promoter_id: string | null
  referral_code: string
  operation_id: string
  reward_amount: number
  status: 'pending' | 'confirmed' | 'rejected' | 'paid'
  timestamp: string
  rejection_reason: string | null
  stellar_tx_hash: string | null
}

export interface DBStellarSettlement {
  id: string
  campaign_id: string
  tx_hash: string
  ledger: number | null
  amount_usdc: number
  promoters_paid_count: number
  explorer_url: string
  created_at: string
}

export type Page =
  | 'landing'
  | 'select-type'
  | 'register-business'
  | 'register-promoter'
  | 'account-created'
  | 'login'
  | 'business-dashboard'
  | 'business-profile'
  | 'create-campaign'
  | 'my-campaigns'
  | 'campaign-detail'
  | 'campaign-conversions'
  | 'fund-campaign'
  | 'close-campaign'
  | 'liquidation-summary'
  | 'liquidation-complete'
  | 'business-history'
  | 'promoter-dashboard'
  | 'explore-campaigns'
  | 'campaign-detail-promoter'
  | 'join-confirmation'
  | 'my-code'
  | 'promoter-campaigns'
  | 'promoter-campaign-detail'
  | 'promoter-earnings'
  | 'account-statement'
  | 'transaction-history'
  | 'promoter-profile'

export type UserType = 'business' | 'promoter' | null

export interface NavProps {
  navigate: (page: Page, params?: Record<string, unknown>) => void
  params: Record<string, unknown>
  userType: UserType
  setUserType: (t: UserType) => void
}

export type CampaignStatus = 'active' | 'closing' | 'liquidated'

export interface Campaign {
  id: string
  name: string
  business: string
  businessWallet?: string
  category: string
  description: string
  startDate: string
  endDate: string
  budget: number
  reward: number
  maxConversions: number
  conversions: number
  usedBudget: number
  daysLeft: number
  status: CampaignStatus
  conversionAction: string
  validationMethod: string
  conditions: string
  fundingTxHash?: string
  liquidationTxHash?: string
}

export type ConversionStatus = 'pending' | 'confirmed' | 'rejected' | 'paid'

export interface Conversion {
  id: string
  campaignId: string
  code: string
  promoter: string
  promoterWallet?: string
  operation: string
  date: string
  reward: number
  status: ConversionStatus
}

export interface PromoterParticipation {
  id: string
  campaignId: string
  promoterName: string
  promoterWallet: string
  code: string
  joinedDate: string
}

export interface StellarTransactionRecord {
  id: string
  campaign: string
  campaignId?: string
  code?: string
  amount: number
  date: string
  txId: string | null
  status: 'paid' | 'pending' | 'failed'
  type: 'funding' | 'liquidation'
  explorerUrl?: string
}

export interface CurrentUser {
  type: UserType
  name: string
  email: string
  wallet: string | null
  phone?: string
  category?: string
  description?: string
  businessName?: string
  promoterName?: string
  businessWallet?: string | null
  promoterWallet?: string | null
}

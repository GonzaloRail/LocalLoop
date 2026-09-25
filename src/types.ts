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

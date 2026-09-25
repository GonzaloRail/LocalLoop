import React, { useState } from 'react'
import { Page, UserType } from './types'
import { AppProvider } from './context/AppContext'
import {
  LandingPage,
  SelectTypePage,
  RegisterBusinessPage,
  RegisterPromoterPage,
  AccountCreatedPage,
  LoginPage,
} from './pages/AuthPages'
import {
  BusinessDashboard,
  BusinessProfile,
  CreateCampaign,
  MyCampaigns,
  CampaignDetail,
  CampaignConversions,
  CloseCampaign,
  LiquidationSummary,
  LiquidationComplete,
  BusinessHistory,
} from './pages/BusinessPages'
import {
  PromoterDashboard,
  ExploreCampaigns,
  CampaignDetailPromoter,
  JoinConfirmation,
  MyCode,
  PromoterCampaigns,
  PromoterCampaignDetail,
  PromoterEarnings,
  AccountStatement,
  TransactionHistory,
  PromoterProfile,
} from './pages/PromoterPages'

function AppContent() {
  const [page, setPage] = useState<Page>('landing')
  const [params, setParams] = useState<Record<string, unknown>>({})
  const [userType, setUserType] = useState<UserType>(null)

  function navigate(p: Page, newParams?: Record<string, unknown>) {
    setPage(p)
    setParams(newParams ?? {})
    window.scrollTo(0, 0)
  }

  const navProps = { navigate, params, userType, setUserType }

  const pages: Record<string, React.ReactElement> = {
    landing: <LandingPage {...navProps} />,
    'select-type': <SelectTypePage {...navProps} />,
    'register-business': <RegisterBusinessPage {...navProps} />,
    'register-promoter': <RegisterPromoterPage {...navProps} />,
    'account-created': <AccountCreatedPage {...navProps} />,
    login: <LoginPage {...navProps} />,
    'business-dashboard': <BusinessDashboard {...navProps} />,
    'business-profile': <BusinessProfile {...navProps} />,
    'create-campaign': <CreateCampaign {...navProps} />,
    'my-campaigns': <MyCampaigns {...navProps} />,
    'campaign-detail': <CampaignDetail {...navProps} />,
    'campaign-conversions': <CampaignConversions {...navProps} />,
    'fund-campaign': <CreateCampaign {...navProps} />,
    'close-campaign': <CloseCampaign {...navProps} />,
    'liquidation-summary': <LiquidationSummary {...navProps} />,
    'liquidation-complete': <LiquidationComplete {...navProps} />,
    'business-history': <BusinessHistory {...navProps} />,
    'promoter-dashboard': <PromoterDashboard {...navProps} />,
    'explore-campaigns': <ExploreCampaigns {...navProps} />,
    'campaign-detail-promoter': <CampaignDetailPromoter {...navProps} />,
    'join-confirmation': <JoinConfirmation {...navProps} />,
    'my-code': <MyCode {...navProps} />,
    'promoter-campaigns': <PromoterCampaigns {...navProps} />,
    'promoter-campaign-detail': <PromoterCampaignDetail {...navProps} />,
    'promoter-earnings': <PromoterEarnings {...navProps} />,
    'account-statement': <AccountStatement {...navProps} />,
    'transaction-history': <TransactionHistory {...navProps} />,
    'promoter-profile': <PromoterProfile {...navProps} />,
  }

  return pages[page] ?? pages.landing
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

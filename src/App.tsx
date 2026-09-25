import React, { useState, useEffect } from 'react'
import { Page, UserType } from './types'
import { AppProvider, useApp } from './context/AppContext'
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

const VALID_PAGES = new Set<string>([
  'landing',
  'select-type',
  'register-business',
  'register-promoter',
  'account-created',
  'login',
  'business-dashboard',
  'business-profile',
  'create-campaign',
  'my-campaigns',
  'campaign-detail',
  'campaign-conversions',
  'fund-campaign',
  'close-campaign',
  'liquidation-summary',
  'liquidation-complete',
  'business-history',
  'promoter-dashboard',
  'explore-campaigns',
  'campaign-detail-promoter',
  'join-confirmation',
  'my-code',
  'promoter-campaigns',
  'promoter-campaign-detail',
  'promoter-earnings',
  'account-statement',
  'transaction-history',
  'promoter-profile',
])

const ROUTE_STORAGE_KEY = 'localloop_current_page'

function getInitialPage(): Page {
  if (typeof window !== 'undefined') {
    if (window.location.hash) {
      const hashPage = window.location.hash.replace(/^#\/?/, '').split('?')[0] as Page
      if (VALID_PAGES.has(hashPage)) {
        return hashPage
      }
    }
    const saved = localStorage.getItem(ROUTE_STORAGE_KEY) as Page
    if (saved && VALID_PAGES.has(saved)) {
      return saved
    }
  }
  return 'landing'
}

function AppContent() {
  const { currentUser, userType, setUserType } = useApp()
  const [page, setPage] = useState<Page>(getInitialPage)
  const [params, setParams] = useState<Record<string, unknown>>({})

  // Sincronizar userType con currentUser guardado en AppContext
  useEffect(() => {
    if (currentUser?.type && currentUser.type !== userType) {
      setUserType(currentUser.type)
    }
  }, [currentUser?.type, userType, setUserType])

  function navigate(p: Page, newParams?: Record<string, unknown>) {
    setPage(p)
    setParams(newParams ?? {})
    if (typeof window !== 'undefined') {
      window.location.hash = `#/${p}`
      localStorage.setItem(ROUTE_STORAGE_KEY, p)
      window.scrollTo(0, 0)
    }
  }

  // Soporte para botones Atrás/Adelante del navegador (hashchange)
  useEffect(() => {
    function handleHashChange() {
      const hashPage = window.location.hash.replace(/^#\/?/, '').split('?')[0] as Page
      if (VALID_PAGES.has(hashPage)) {
        setPage(hashPage)
        localStorage.setItem(ROUTE_STORAGE_KEY, hashPage)
      }
    }

    if (window.location.hash && page !== 'landing') {
      const currentHash = window.location.hash.replace(/^#\/?/, '').split('?')[0]
      if (currentHash !== page) {
        window.location.hash = `#/${page}`
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [page])

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


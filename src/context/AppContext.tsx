import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  Campaign,
  Conversion,
  PromoterParticipation,
  StellarTransactionRecord,
  CurrentUser,
  UserType,
} from '../types'
import {
  MOCK_CAMPAIGNS,
  MOCK_CONVERSIONS,
  MOCK_PROMOTER_CAMPAIGNS,
  MOCK_TRANSACTIONS,
} from '../data'
import { getStellarExpertTxUrl } from '../lib/stellar'

interface AppContextValue {
  currentUser: CurrentUser
  setCurrentUser: (u: Partial<CurrentUser>) => void
  userType: UserType
  setUserType: (t: UserType) => void

  campaigns: Campaign[]
  conversions: Conversion[]
  participations: PromoterParticipation[]
  transactions: StellarTransactionRecord[]

  createCampaign: (data: Omit<Campaign, 'id' | 'conversions' | 'usedBudget' | 'status'>) => Campaign
  fundCampaign: (campaignId: string, txHash: string) => void
  joinCampaign: (campaignId: string, promoterName?: string, promoterWallet?: string) => PromoterParticipation
  getParticipation: (campaignId: string, codeOrWallet?: string) => PromoterParticipation | undefined
  recordConversion: (
    campaignId: string,
    code: string,
    operation: string
  ) => { success: boolean; message: string; conversion?: Conversion }
  confirmConversion: (conversionId: string) => void
  rejectConversion: (conversionId: string) => void
  closeCampaign: (campaignId: string) => void
  liquidateCampaign: (
    campaignId: string,
    txHash: string
  ) => { totalPaid: number; promoterCount: number; txHash: string }
  resetToMockData: () => void

  // Métricas calculadas dinámicamente
  businessStats: {
    activeCampaigns: number
    closingCampaigns: number
    completedCampaigns: number
    totalConversions: number
    pendingRewards: number
    usedBudget: number
  }
  promoterStats: {
    totalEarnings: number
    pending: number
    paid: number
    totalConversions: number
    activeCampaigns: number
  }
}

const AppContext = createContext<AppContextValue | null>(null)

const STORAGE_KEYS = {
  USER: 'localloop_user',
  CAMPAIGNS: 'localloop_campaigns',
  CONVERSIONS: 'localloop_conversions',
  PARTICIPATIONS: 'localloop_participations',
  TRANSACTIONS: 'localloop_transactions',
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  // 1. Usuario actual
  const [currentUser, setCurrentUserState] = useState<CurrentUser>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // ignore
      }
    }
    return {
      type: null,
      name: '',
      email: '',
      wallet: null,
    }
  })

  // 2. Campañas
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // ignore
      }
    }
    return MOCK_CAMPAIGNS as Campaign[]
  })

  // 3. Conversiones
  const [conversions, setConversions] = useState<Conversion[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONVERSIONS)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // ignore
      }
    }
    return MOCK_CONVERSIONS.map((c) => ({
      ...c,
      status: c.status as 'pending' | 'confirmed' | 'rejected' | 'paid',
    }))
  })

  // 4. Participaciones de promotores
  const [participations, setParticipations] = useState<PromoterParticipation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PARTICIPATIONS)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // ignore
      }
    }
    return MOCK_PROMOTER_CAMPAIGNS.map((p) => ({
      id: p.id,
      campaignId: p.campaignId,
      promoterName: 'Diego Huamani',
      promoterWallet: 'GA7HPIC5QEG7GD42Q4XNXJ72FDPYKFRMMXY4IBWA3R5ZNTD5QKKSUSPX',
      code: p.code,
      joinedDate: '01/10/2026',
    }))
  })

  // 5. Historial de transacciones Stellar
  const [transactions, setTransactions] = useState<StellarTransactionRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // ignore
      }
    }
    return MOCK_TRANSACTIONS.map((t) => ({
      id: t.id,
      campaign: t.campaign,
      amount: t.amount,
      date: t.date,
      txId: t.txId,
      status: t.status as 'paid' | 'pending',
      type: 'liquidation',
      explorerUrl: t.txId ? getStellarExpertTxUrl(t.txId) : undefined,
    }))
  })

  // Persistir en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser))
  }, [currentUser])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns))
  }, [campaigns])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONVERSIONS, JSON.stringify(conversions))
  }, [conversions])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PARTICIPATIONS, JSON.stringify(participations))
  }, [participations])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions))
  }, [transactions])

  function setCurrentUser(u: Partial<CurrentUser>) {
    setCurrentUserState((prev) => ({ ...prev, ...u }))
  }

  function setUserType(t: UserType) {
    setCurrentUserState((prev) => ({ ...prev, type: t }))
  }

  // Crear campaña
  function createCampaign(data: Omit<Campaign, 'id' | 'conversions' | 'usedBudget' | 'status'>): Campaign {
    const newCamp: Campaign = {
      ...data,
      id: String(Date.now()),
      conversions: 0,
      usedBudget: 0,
      status: 'active',
      businessWallet: currentUser.wallet || undefined,
    }
    setCampaigns((prev) => [newCamp, ...prev])
    return newCamp
  }

  // Financiar campaña en Stellar
  function fundCampaign(campaignId: string, txHash: string) {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, fundingTxHash: txHash } : c))
    )

    const targetCamp = campaigns.find((c) => c.id === campaignId)
    if (targetCamp) {
      const txRecord: StellarTransactionRecord = {
        id: `tx-fund-${Date.now()}`,
        campaign: targetCamp.name,
        campaignId,
        amount: targetCamp.budget,
        date: new Date().toLocaleDateString('es-PE'),
        txId: txHash,
        status: 'paid',
        type: 'funding',
        explorerUrl: getStellarExpertTxUrl(txHash),
      }
      setTransactions((prev) => [txRecord, ...prev])
    }
  }

  // Unirse a una campaña como promotor
  function joinCampaign(
    campaignId: string,
    promoterName?: string,
    promoterWallet?: string
  ): PromoterParticipation {
    const name = promoterName || currentUser.name || 'Promotor'
    const wallet = promoterWallet || currentUser.wallet || 'G...WALLET'

    // Si ya existe participación, devolverla
    const existing = participations.find(
      (p) => p.campaignId === campaignId && (p.promoterWallet === wallet || p.promoterName === name)
    )
    if (existing) return existing

    // Generar código único (ej: DIEGO82)
    const prefix = name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5) || 'REF'
    const randomSuffix = Math.floor(10 + Math.random() * 90)
    const code = `${prefix}${randomSuffix}`

    const newPart: PromoterParticipation = {
      id: `part-${Date.now()}`,
      campaignId,
      promoterName: name,
      promoterWallet: wallet,
      code,
      joinedDate: new Date().toLocaleDateString('es-PE'),
    }

    setParticipations((prev) => [...prev, newPart])
    return newPart
  }

  function getParticipation(campaignId: string, codeOrWallet?: string): PromoterParticipation | undefined {
    return participations.find(
      (p) =>
        p.campaignId === campaignId &&
        (!codeOrWallet || p.code === codeOrWallet || p.promoterWallet === codeOrWallet || p.promoterName === codeOrWallet)
    )
  }

  // Registrar conversión atribuida a un código
  function recordConversion(
    campaignId: string,
    code: string,
    operation: string
  ): { success: boolean; message: string; conversion?: Conversion } {
    const campaign = campaigns.find((c) => c.id === campaignId)
    if (!campaign) {
      return { success: false, message: 'Campaña no encontrada' }
    }

    if (campaign.status === 'liquidated') {
      return { success: false, message: 'La campaña ya está liquidada y cerrada' }
    }

    if (campaign.conversions >= campaign.maxConversions) {
      return { success: false, message: 'La campaña alcanzó el límite máximo de conversiones' }
    }

    // Verificar si la operación ya fue registrada previamente para evitar doble gasto / duplicados
    const duplicate = conversions.find(
      (c) => c.campaignId === campaignId && c.operation.toLowerCase() === operation.toLowerCase()
    )
    if (duplicate) {
      return {
        success: false,
        message: `La operación "${operation}" ya fue registrada previamente para esta campaña.`,
      }
    }

    // Buscar promotor dueño del código
    const part = participations.find((p) => p.code.toUpperCase() === code.toUpperCase() && p.campaignId === campaignId)
    const promoterName = part ? part.promoterName : 'Promotor'
    const promoterWallet = part ? part.promoterWallet : undefined

    const newConv: Conversion = {
      id: `conv-${Date.now()}`,
      campaignId,
      code: code.toUpperCase(),
      promoter: promoterName,
      promoterWallet,
      operation,
      date: new Date().toLocaleDateString('es-PE'),
      reward: campaign.reward,
      status: 'pending',
    }

    setConversions((prev) => [newConv, ...prev])

    // Actualizar contadores de la campaña
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === campaignId) {
          const nextConvCount = c.conversions + 1
          const nextUsedBudget = nextConvCount * c.reward
          return {
            ...c,
            conversions: nextConvCount,
            usedBudget: nextUsedBudget,
          }
        }
        return c
      })
    )

    return {
      success: true,
      message: `Conversión registrada exitosamente para el código ${code}.`,
      conversion: newConv,
    }
  }

  // Confirmar conversión (revisión del negocio)
  function confirmConversion(conversionId: string) {
    setConversions((prev) =>
      prev.map((c) => (c.id === conversionId ? { ...c, status: 'confirmed' } : c))
    )
  }

  // Rechazar conversión
  function rejectConversion(conversionId: string) {
    setConversions((prev) =>
      prev.map((c) => (c.id === conversionId ? { ...c, status: 'rejected' } : c))
    )
  }

  // Poner campaña en cierre
  function closeCampaign(campaignId: string) {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, status: 'closing', daysLeft: 0 } : c))
    )
  }

  // Ejecutar liquidación mediante Stellar
  function liquidateCampaign(
    campaignId: string,
    txHash: string
  ): { totalPaid: number; promoterCount: number; txHash: string } {
    const campaign = campaigns.find((c) => c.id === campaignId)
    if (!campaign) return { totalPaid: 0, promoterCount: 0, txHash }

    // Conversiones confirmadas para esta campaña
    const validConversions = conversions.filter(
      (c) => c.campaignId === campaignId && (c.status === 'confirmed' || c.status === 'pending')
    )

    const totalPaid = validConversions.reduce((sum, c) => sum + c.reward, 0)
    const uniquePromoters = new Set(validConversions.map((c) => c.code)).size

    // Actualizar conversiones a estado "paid"
    setConversions((prev) =>
      prev.map((c) => {
        if (c.campaignId === campaignId && (c.status === 'confirmed' || c.status === 'pending')) {
          return { ...c, status: 'paid' }
        }
        return c
      })
    )

    // Actualizar estado de la campaña a "liquidated"
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, status: 'liquidated', liquidationTxHash: txHash } : c))
    )

    // Registrar en el historial de transacciones de Stellar
    const txRecord: StellarTransactionRecord = {
      id: `tx-liq-${Date.now()}`,
      campaign: campaign.name,
      campaignId,
      amount: totalPaid,
      date: new Date().toLocaleDateString('es-PE'),
      txId: txHash,
      status: 'paid',
      type: 'liquidation',
      explorerUrl: getStellarExpertTxUrl(txHash),
    }

    setTransactions((prev) => [txRecord, ...prev])

    return { totalPaid, promoterCount: uniquePromoters, txHash }
  }

  function resetToMockData() {
    localStorage.removeItem(STORAGE_KEYS.CAMPAIGNS)
    localStorage.removeItem(STORAGE_KEYS.CONVERSIONS)
    localStorage.removeItem(STORAGE_KEYS.PARTICIPATIONS)
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS)
    setCampaigns(MOCK_CAMPAIGNS as Campaign[])
    setConversions(
      MOCK_CONVERSIONS.map((c) => ({
        ...c,
        status: c.status as 'pending' | 'confirmed' | 'rejected' | 'paid',
      }))
    )
    setParticipations(
      MOCK_PROMOTER_CAMPAIGNS.map((p) => ({
        id: p.id,
        campaignId: p.campaignId,
        promoterName: 'Diego Huamani',
        promoterWallet: 'GA7HPIC5QEG7GD42Q4XNXJ72FDPYKFRMMXY4IBWA3R5ZNTD5QKKSUSPX',
        code: p.code,
        joinedDate: '01/10/2026',
      }))
    )
    setTransactions(
      MOCK_TRANSACTIONS.map((t) => ({
        id: t.id,
        campaign: t.campaign,
        amount: t.amount,
        date: t.date,
        txId: t.txId,
        status: t.status as 'paid' | 'pending',
        type: 'liquidation',
        explorerUrl: t.txId ? getStellarExpertTxUrl(t.txId) : undefined,
      }))
    )
  }

  // Métricas calculadas para Negocio
  const activeCampaigns = campaigns.filter((c) => c.status === 'active').length
  const closingCampaigns = campaigns.filter((c) => c.status === 'closing').length
  const completedCampaigns = campaigns.filter((c) => c.status === 'liquidated').length
  const totalConversions = conversions.length
  const pendingRewards = conversions
    .filter((c) => c.status === 'pending' || c.status === 'confirmed')
    .reduce((sum, c) => sum + c.reward, 0)
  const usedBudget = campaigns.reduce((sum, c) => sum + c.usedBudget, 0)

  const businessStats = {
    activeCampaigns,
    closingCampaigns,
    completedCampaigns,
    totalConversions,
    pendingRewards,
    usedBudget,
  }

  // Métricas calculadas para Promotor
  const totalEarnings = conversions.reduce((sum, c) => sum + c.reward, 0)
  const promoterPending = conversions
    .filter((c) => c.status === 'pending' || c.status === 'confirmed')
    .reduce((sum, c) => sum + c.reward, 0)
  const promoterPaid = conversions
    .filter((c) => c.status === 'paid')
    .reduce((sum, c) => sum + c.reward, 0)
  const promoterConversions = conversions.length
  const promoterActiveCampaigns = new Set(participations.map((p) => p.campaignId)).size

  const promoterStats = {
    totalEarnings,
    pending: promoterPending,
    paid: promoterPaid,
    totalConversions: promoterConversions,
    activeCampaigns: promoterActiveCampaigns,
  }

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        userType: currentUser.type,
        setUserType,
        campaigns,
        conversions,
        participations,
        transactions,
        createCampaign,
        fundCampaign,
        joinCampaign,
        getParticipation,
        recordConversion,
        confirmConversion,
        rejectConversion,
        closeCampaign,
        liquidateCampaign,
        resetToMockData,
        businessStats,
        promoterStats,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider')
  }
  return context
}

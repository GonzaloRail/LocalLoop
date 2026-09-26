import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  Campaign,
  Conversion,
  PromoterParticipation,
  StellarTransactionRecord,
  CurrentUser,
  UserType,
} from '../types'
import { supabase, DBCampaign, DBParticipation, DBConversion } from '../lib/supabase'
import { getStellarExpertTxUrl } from '../lib/stellar'
import { MOCK_CAMPAIGNS } from '../data'

// ─────────────────────────────────────────────────────────────────────────────
// Mappers: BD (snake_case) → App (camelCase)
// ─────────────────────────────────────────────────────────────────────────────

function mapCampaign(r: DBCampaign): Campaign {
  return {
    id: r.id,
    name: r.name,
    business: r.business,
    businessWallet: r.business_wallet ?? undefined,
    category: r.category,
    description: r.description,
    startDate: r.start_date,
    endDate: r.end_date,
    budget: Number(r.budget),
    reward: Number(r.reward),
    usedBudget: Number(r.used_budget),
    conversions: r.conversions,
    maxConversions: r.max_conversions,
    daysLeft: r.days_left,
    status: r.status as Campaign['status'],
    conversionAction: r.conversion_action,
    validationMethod: r.validation_method,
    conditions: r.conditions ?? '',
    fundingTxHash: r.stellar_funding_tx ?? undefined,
    liquidationTxHash: r.stellar_settlement_tx ?? undefined,
  }
}

function mapParticipation(r: DBParticipation): PromoterParticipation {
  return {
    id: r.id,
    campaignId: r.campaign_id,
    promoterName: r.promoter_name,
    promoterWallet: r.promoter_wallet,
    code: r.referral_code,
    joinedDate: new Date(r.joined_at).toLocaleDateString('es-PE'),
  }
}

function mapConversion(r: DBConversion): Conversion {
  return {
    id: r.id,
    campaignId: r.campaign_id,
    code: r.referral_code,
    promoter: '',
    promoterWallet: undefined,
    operation: r.operation_id,
    date: new Date(r.timestamp).toLocaleDateString('es-PE'),
    reward: Number(r.reward_amount),
    status: r.status,
  }
}

interface AppContextValue {
  currentUser: CurrentUser
  setCurrentUser: (u: Partial<CurrentUser>) => void
  userType: UserType
  setUserType: (t: UserType) => void

  campaigns: Campaign[]
  conversions: Conversion[]
  participations: PromoterParticipation[]
  transactions: StellarTransactionRecord[]

  loading: boolean

  createCampaign: (data: Omit<Campaign, 'id' | 'conversions' | 'usedBudget' | 'status'>) => Promise<Campaign>
  fundCampaign: (campaignId: string, txHash: string) => Promise<void>
  joinCampaign: (campaignId: string, promoterName?: string, promoterWallet?: string) => Promise<PromoterParticipation>
  getParticipation: (campaignId: string, codeOrWallet?: string) => PromoterParticipation | undefined
  recordConversion: (
    campaignId: string,
    code: string,
    operation: string
  ) => Promise<{ success: boolean; message: string; conversion?: Conversion }>
  confirmConversion: (conversionId: string) => Promise<void>
  rejectConversion: (conversionId: string) => Promise<void>
  closeCampaign: (campaignId: string) => Promise<void>
  liquidateCampaign: (
    campaignId: string,
    txHash: string
  ) => Promise<{ totalPaid: number; promoterCount: number; txHash: string }>
  refreshData: () => Promise<void>

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

const USER_KEY = 'localloop_user'

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<CurrentUser>(() => {
    const saved = localStorage.getItem(USER_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Sanitizar si el nombre cruzó de rol por herencia de sesiones anteriores
        if (parsed.type === 'business') {
          if (!parsed.businessName || parsed.name === 'Diego Huamani') {
            parsed.businessName = parsed.name === 'Diego Huamani' ? 'Eventos XYZ' : (parsed.name || 'Eventos XYZ')
            parsed.name = parsed.businessName
          }
          if (!parsed.promoterName) parsed.promoterName = 'Diego Huamani'
        } else if (parsed.type === 'promoter') {
          if (!parsed.promoterName || parsed.name === 'Eventos XYZ' || parsed.name?.toLowerCase().includes('eventos')) {
            parsed.promoterName = 'Diego Huamani'
            parsed.name = parsed.promoterName
          }
          if (!parsed.businessName) parsed.businessName = 'Eventos XYZ'
        }
        return parsed
      } catch { /* ignore */ }
    }
    return {
      type: null,
      name: '',
      email: '',
      wallet: null,
      businessName: 'Eventos XYZ',
      promoterName: 'Diego Huamani',
      businessWallet: 'GC6AXP53B236R7X6NDJ3K6X5Y34S2HXYGZNDW7X6BCKB3Y',
      promoterWallet: 'GB7B236R7X6NDJ3K6X5Y34S2HXYGZNDW7X6BCKB3YGA7HPIC',
    }
  })

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [conversions, setConversions] = useState<Conversion[]>([])
  const [participations, setParticipations] = useState<PromoterParticipation[]>([])
  const [transactions, setTransactions] = useState<StellarTransactionRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Persiste sesión del usuario en localStorage
  useEffect(() => {
    localStorage.setItem(USER_KEY, JSON.stringify(currentUser))
  }, [currentUser])

  // ── Carga inicial desde Supabase ──────────────────────────────────────────
  const refreshData = useCallback(async () => {
    setLoading(true)
    try {
      const [campRes, partRes, convRes, settlRes] = await Promise.all([
        supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
        supabase.from('participations').select('*').order('joined_at', { ascending: false }),
        supabase.from('conversions').select('*').order('timestamp', { ascending: false }),
        supabase.from('stellar_settlements').select('*').order('created_at', { ascending: false }),
      ])

      if (campRes.data && campRes.data.length > 0) {
        setCampaigns((campRes.data as DBCampaign[]).map(mapCampaign))
      } else {
        setCampaigns(MOCK_CAMPAIGNS)
      }

      const partMap = new Map<string, DBParticipation>()
      if (partRes.data) {
        ;(partRes.data as DBParticipation[]).forEach((p) => partMap.set(p.referral_code, p))
        setParticipations((partRes.data as DBParticipation[]).map(mapParticipation))
      }

      if (convRes.data) {
        const mappedConv: Conversion[] = (convRes.data as DBConversion[]).map((r) => {
          const part = partMap.get(r.referral_code)
          return {
            ...mapConversion(r),
            promoter: part?.promoter_name ?? 'Promotor',
            promoterWallet: part?.promoter_wallet,
          }
        })
        setConversions(mappedConv)
      }

      if (settlRes.data) {
        const txs: StellarTransactionRecord[] = (settlRes.data as any[]).map((s) => ({
          id: s.id,
          campaign: '',
          campaignId: s.campaign_id,
          amount: Number(s.amount_usdc),
          date: new Date(s.created_at).toLocaleDateString('es-PE'),
          txId: s.tx_hash,
          status: 'paid' as const,
          type: 'liquidation' as const,
          explorerUrl: s.explorer_url,
        }))
        setTransactions(txs)
      }
    } catch (err) {
      console.error('Error cargando datos desde Supabase:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  function setCurrentUser(u: Partial<CurrentUser>) {
    setCurrentUserState((prev) => {
      const next = { ...prev, ...u }
      const effectiveType = u.type ?? prev.type
      if (effectiveType === 'business') {
        if (u.name) next.businessName = u.name
        if (u.wallet) next.businessWallet = u.wallet
      } else if (effectiveType === 'promoter') {
        if (u.name) next.promoterName = u.name
        if (u.wallet) next.promoterWallet = u.wallet
      }
      return next
    })
  }

  function setUserType(t: UserType) {
    setCurrentUserState((prev) => {
      if (!t) return { ...prev, type: null }
      const newName = t === 'business'
        ? (prev.businessName || 'Eventos XYZ')
        : (prev.promoterName || 'Diego Huamani')

      const newWallet = t === 'business'
        ? (prev.businessWallet || 'GC6AXP53B236R7X6NDJ3K6X5Y34S2HXYGZNDW7X6BCKB3Y')
        : (prev.promoterWallet || 'GB7B236R7X6NDJ3K6X5Y34S2HXYGZNDW7X6BCKB3YGA7HPIC')

      return {
        ...prev,
        type: t,
        name: newName,
        wallet: newWallet,
      }
    })
  }

  // ── Crear campaña ──────────────────────────────────────────────────────────
  async function createCampaign(
    data: Omit<Campaign, 'id' | 'conversions' | 'usedBudget' | 'status'>
  ): Promise<Campaign> {
    const insert = {
      name: data.name,
      business: data.business,
      business_wallet: data.businessWallet ?? currentUser.wallet ?? null,
      category: data.category,
      description: data.description,
      start_date: data.startDate,
      end_date: data.endDate,
      budget: data.budget,
      reward: data.reward,
      max_conversions: data.maxConversions,
      days_left: data.daysLeft,
      conversion_action: data.conversionAction,
      validation_method: data.validationMethod,
      conditions: data.conditions ?? null,
      status: 'active',
    }
    const { data: row, error } = await supabase.from('campaigns').insert(insert).select().single()
    let newCamp: Campaign
    if (error) {
      console.warn('Supabase campaign insert warning (RLS activo en DB):', error.message)
      newCamp = {
        id: `camp-${Date.now()}`,
        name: data.name,
        business: data.business,
        businessWallet: data.businessWallet ?? currentUser.wallet ?? undefined,
        category: data.category,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        budget: data.budget,
        reward: data.reward,
        usedBudget: 0,
        conversions: 0,
        maxConversions: data.maxConversions,
        daysLeft: data.daysLeft,
        status: 'active',
        conversionAction: data.conversionAction,
        validationMethod: data.validationMethod,
        conditions: data.conditions ?? '',
      }
    } else {
      newCamp = mapCampaign(row as DBCampaign)
    }
    setCampaigns((prev) => [newCamp, ...prev])
    return newCamp
  }

  // ── Financiar campaña ──────────────────────────────────────────────────────
  async function fundCampaign(campaignId: string, txHash: string): Promise<void> {
    try {
      await supabase
        .from('campaigns')
        .update({ stellar_funding_tx: txHash })
        .eq('id', campaignId)
    } catch (e) {
      console.warn('Supabase fundCampaign update skipped/failed:', e)
    }

    const campaign = campaigns.find((c) => c.id === campaignId)
    if (campaign) {
      const txRecord: StellarTransactionRecord = {
        id: `tx-fund-${Date.now()}`,
        campaign: campaign.name,
        campaignId,
        amount: campaign.budget,
        date: new Date().toLocaleDateString('es-PE'),
        txId: txHash,
        status: 'paid',
        type: 'funding',
        explorerUrl: getStellarExpertTxUrl(txHash),
      }
      setTransactions((prev) => [txRecord, ...prev])
    }
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, fundingTxHash: txHash } : c))
    )
  }

  // ── Unirse a una campaña ──────────────────────────────────────────────────
  async function joinCampaign(
    campaignId: string,
    promoterName?: string,
    promoterWallet?: string
  ): Promise<PromoterParticipation> {
    const name = promoterName || currentUser.name || 'Promotor'
    const wallet = promoterWallet || currentUser.wallet || 'G...WALLET'

    const existing = participations.find(
      (p) => p.campaignId === campaignId && (p.promoterWallet === wallet || p.promoterName === name)
    )
    if (existing) return existing

    const prefix = name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5) || 'REF'
    const randomSuffix = Math.floor(10 + Math.random() * 90)
    const code = `${prefix}${randomSuffix}`

    const { data: row, error } = await supabase
      .from('participations')
      .insert({ campaign_id: campaignId, promoter_name: name, promoter_wallet: wallet, referral_code: code })
      .select()
      .single()

    let newPart: PromoterParticipation
    if (error) {
      console.warn('Supabase joinCampaign insert warning (RLS):', error.message)
      newPart = {
        id: `part-${Date.now()}`,
        campaignId,
        promoterName: name,
        promoterWallet: wallet,
        code,
        joinedDate: new Date().toLocaleDateString('es-PE'),
      }
    } else {
      newPart = mapParticipation(row as DBParticipation)
    }
    setParticipations((prev) => [...prev, newPart])
    return newPart
  }

  function getParticipation(campaignId: string, codeOrWallet?: string): PromoterParticipation | undefined {
    return participations.find(
      (p) =>
        p.campaignId === campaignId &&
        (!codeOrWallet ||
          p.code === codeOrWallet ||
          p.promoterWallet === codeOrWallet ||
          p.promoterName === codeOrWallet)
    )
  }

  // ── Registrar conversión ──────────────────────────────────────────────────
  async function recordConversion(
    campaignId: string,
    code: string,
    operation: string
  ): Promise<{ success: boolean; message: string; conversion?: Conversion }> {
    const campaign = campaigns.find((c) => c.id === campaignId)
    if (!campaign) return { success: false, message: 'Campaña no encontrada' }
    if (campaign.status === 'liquidated')
      return { success: false, message: 'La campaña ya está liquidada y cerrada' }
    if (campaign.conversions >= campaign.maxConversions)
      return { success: false, message: 'La campaña alcanzó el límite máximo de conversiones' }

    // 1. Antifraude: Verificar duplicado en memoria local
    const localDup = conversions.find(
      (c) => c.campaignId === campaignId && c.operation.trim().toLowerCase() === operation.trim().toLowerCase()
    )
    if (localDup) {
      return {
        success: false,
        message: `La operación "${operation}" ya fue registrada previamente (prevención de doble gasto).`,
      }
    }

    // 2. Antifraude: Verificar duplicado en Supabase
    try {
      const { data: dupCheck } = await supabase
        .from('conversions')
        .select('id')
        .eq('campaign_id', campaignId)
        .ilike('operation_id', operation)
        .limit(1)
      if (dupCheck && dupCheck.length > 0) {
        return {
          success: false,
          message: `La operación "${operation}" ya fue registrada previamente en la base de datos.`,
        }
      }
    } catch {
      // ignore
    }

    // 3. Validar que el código pertenezca a un promotor registrado en la campaña
    const part = participations.find(
      (p) => p.code.toUpperCase() === code.toUpperCase() && p.campaignId === campaignId
    )
    const isDemoCampaign1Code = campaignId === '1' && ['DIEGO82', 'ANA99', 'CARLOS21', 'ANA45', 'JUAN73'].includes(code.toUpperCase())

    if (!part && !isDemoCampaign1Code) {
      return {
        success: false,
        message: `El código "${code}" no está inscrito como promotor en esta campaña. Únete como promotor primero para obtener un código válido.`,
      }
    }

    const { data: row, error } = await supabase
      .from('conversions')
      .insert({
        campaign_id: campaignId,
        promoter_id: part?.id ?? null,
        referral_code: code.toUpperCase(),
        operation_id: operation,
        reward_amount: campaign.reward,
        status: 'pending',
      })
      .select()
      .single()

    let newConv: Conversion
    if (error) {
      console.warn('Supabase recordConversion insert warning (RLS):', error.message)
      newConv = {
        id: `conv-${Date.now()}`,
        campaignId,
        code: code.toUpperCase(),
        promoter: part?.promoterName ?? 'Promotor',
        promoterWallet: part?.promoterWallet,
        operation,
        date: new Date().toLocaleDateString('es-PE'),
        reward: campaign.reward,
        status: 'pending',
      }
    } else {
      newConv = {
        ...mapConversion(row as DBConversion),
        promoter: part?.promoterName ?? 'Promotor',
        promoterWallet: part?.promoterWallet,
      }
    }

    setConversions((prev) => [newConv, ...prev])
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === campaignId) {
          const nextCount = c.conversions + 1
          return { ...c, conversions: nextCount, usedBudget: nextCount * c.reward }
        }
        return c
      })
    )
    // Actualizar contadores en BD (best-effort)
    supabase
      .from('campaigns')
      .update({ conversions: campaign.conversions + 1, used_budget: (campaign.conversions + 1) * campaign.reward })
      .eq('id', campaignId)

    return {
      success: true,
      message: `Conversión registrada exitosamente para el código ${code}.`,
      conversion: newConv,
    }
  }

  // ── Confirmar conversión ──────────────────────────────────────────────────
  async function confirmConversion(conversionId: string): Promise<void> {
    const { error } = await supabase.from('conversions').update({ status: 'confirmed' }).eq('id', conversionId)
    if (error) throw new Error(error.message)
    setConversions((prev) =>
      prev.map((c) => (c.id === conversionId ? { ...c, status: 'confirmed' } : c))
    )
  }

  // ── Rechazar conversión ───────────────────────────────────────────────────
  async function rejectConversion(conversionId: string): Promise<void> {
    const { error } = await supabase.from('conversions').update({ status: 'rejected' }).eq('id', conversionId)
    if (error) throw new Error(error.message)
    setConversions((prev) =>
      prev.map((c) => (c.id === conversionId ? { ...c, status: 'rejected' } : c))
    )
  }

  // ── Cerrar campaña ────────────────────────────────────────────────────────
  async function closeCampaign(campaignId: string): Promise<void> {
    const { error } = await supabase
      .from('campaigns')
      .update({ status: 'closing', days_left: 0 })
      .eq('id', campaignId)
    if (error) throw new Error(error.message)
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, status: 'closing', daysLeft: 0 } : c))
    )
  }

  // ── Liquidar campaña ──────────────────────────────────────────────────────
  async function liquidateCampaign(
    campaignId: string,
    txHash: string
  ): Promise<{ totalPaid: number; promoterCount: number; txHash: string }> {
    const campaign = campaigns.find((c) => c.id === campaignId)
    if (!campaign) return { totalPaid: 0, promoterCount: 0, txHash }

    const validConversions = conversions.filter(
      (c) => c.campaignId === campaignId && (c.status === 'confirmed' || c.status === 'pending')
    )
    const totalPaid = validConversions.reduce((sum, c) => sum + c.reward, 0)
    const uniquePromoters = new Set(validConversions.map((c) => c.code)).size

    if (validConversions.length > 0) {
      await supabase
        .from('conversions')
        .update({ status: 'paid', stellar_tx_hash: txHash })
        .eq('campaign_id', campaignId)
        .in('status', ['confirmed', 'pending'])
    }
    await supabase
      .from('campaigns')
      .update({ status: 'liquidated', stellar_settlement_tx: txHash })
      .eq('id', campaignId)

    const explorerUrl = getStellarExpertTxUrl(txHash)
    await supabase.from('stellar_settlements').insert({
      campaign_id: campaignId,
      tx_hash: txHash,
      amount_usdc: totalPaid,
      promoters_paid_count: uniquePromoters,
      explorer_url: explorerUrl,
    })

    setConversions((prev) =>
      prev.map((c) => {
        if (c.campaignId === campaignId && (c.status === 'confirmed' || c.status === 'pending')) {
          return { ...c, status: 'paid' }
        }
        return c
      })
    )
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId ? { ...c, status: 'liquidated', liquidationTxHash: txHash } : c
      )
    )
    setTransactions((prev) => [
      {
        id: `tx-liq-${Date.now()}`,
        campaign: campaign.name,
        campaignId,
        amount: totalPaid,
        date: new Date().toLocaleDateString('es-PE'),
        txId: txHash,
        status: 'paid',
        type: 'liquidation',
        explorerUrl,
      },
      ...prev,
    ])

    return { totalPaid, promoterCount: uniquePromoters, txHash }
  }

  // ── Métricas ──────────────────────────────────────────────────────────────
  const activeCampaigns = campaigns.filter((c) => c.status === 'active').length
  const closingCampaigns = campaigns.filter((c) => c.status === 'closing').length
  const completedCampaigns = campaigns.filter((c) => c.status === 'liquidated').length
  const totalConversions = conversions.length
  const pendingRewards = conversions
    .filter((c) => c.status === 'pending' || c.status === 'confirmed')
    .reduce((sum, c) => sum + c.reward, 0)
  const usedBudget = campaigns.reduce((sum, c) => sum + c.usedBudget, 0)

  const businessStats = { activeCampaigns, closingCampaigns, completedCampaigns, totalConversions, pendingRewards, usedBudget }

  const totalEarnings = conversions.reduce((sum, c) => sum + c.reward, 0)
  const promoterPending = conversions
    .filter((c) => c.status === 'pending' || c.status === 'confirmed')
    .reduce((sum, c) => sum + c.reward, 0)
  const promoterPaid = conversions.filter((c) => c.status === 'paid').reduce((sum, c) => sum + c.reward, 0)

  const promoterStats = {
    totalEarnings,
    pending: promoterPending,
    paid: promoterPaid,
    totalConversions: conversions.length,
    activeCampaigns: new Set(participations.map((p) => p.campaignId)).size,
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
        loading,
        createCampaign,
        fundCampaign,
        joinCampaign,
        getParticipation,
        recordConversion,
        confirmConversion,
        rejectConversion,
        closeCampaign,
        liquidateCampaign,
        refreshData,
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

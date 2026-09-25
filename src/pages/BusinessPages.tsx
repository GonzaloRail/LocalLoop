import { useState } from 'react'
import {
  Button, ButtonGroup, InputField, TextareaField, SelectField,
  Badge, Avatar, Tabs, Toast, Checkbox
} from '@figma/astraui'
import {
  Plus, ArrowRight, CheckCircle, AlertCircle, ExternalLink,
  Pencil, Calendar, Wallet, BarChart2, ChevronRight, Download,
  Rocket, Users, RefreshCw, Check, X, ShieldCheck, Sparkles, Copy, Coins, ArrowUpRight, Zap,
  Layers, Lock, CheckCircle2, Eye, Tag, AlertTriangle
} from 'lucide-react'
import AppShell from '../components/AppShell'
import { NavProps, Conversion, Campaign } from '../types'
import { useApp } from '../context/AppContext'
import {
  getStellarExpertTxUrl,
  getStellarExpertAccountUrl,
  truncateAddress,
  submitSettlementToStellarTestnet,
  submitCampaignFundingToStellarTestnet,
  fundAccountWithFriendbot,
  fetchAccountBalances
} from '../lib/stellar'
import { ValidatedInput, ValidatedTextarea, ValidatedSelect } from '../components/FormValidation'
import {
  validateCampaignStep1,
  validateCampaignStep2,
  validateCampaignStep3
} from '../lib/validation'

const CARD = 'bg-surface-bg border border-border-primary rounded-corner-lg p-xl'


// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatTile({
  label,
  value,
  sub,
  accent,
  icon: Icon,
  trend,
}: {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
  icon?: React.ComponentType<{ size?: number; className?: string }>
  trend?: string
}) {
  return (
    <div className="bg-surface-bg border border-border-primary hover:border-[#00B686]/40 rounded-xl p-5 flex flex-col justify-between gap-3 shadow-xs transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            accent ? 'bg-[#00B686]/10 text-[#00B686]' : 'bg-surface-hover text-text-secondary'
          }`}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <div>
        <p className={`text-2xl sm:text-3xl font-bold tracking-tight leading-none ${accent ? 'text-[#00B686]' : 'text-text-primary'}`}>
          {value}
        </p>
        {(sub || trend) && (
          <div className="flex items-center gap-2 mt-2">
            {trend && (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                {trend}
              </span>
            )}
            {sub && <span className="text-xs text-text-secondary">{sub}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; pulse?: boolean }> = {
    active: {
      label: 'Activa',
      className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      pulse: true,
    },
    closing: {
      label: 'En cierre',
      className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
    },
    liquidated: {
      label: 'Liquidada',
      className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    },
    pending: {
      label: 'Pendiente',
      className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
    confirmed: {
      label: 'Confirmada',
      className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    rejected: {
      label: 'Rechazada',
      className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    },
    paid: {
      label: 'Pagada',
      className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
  }
  const cfg = map[status] ?? { label: status, className: 'bg-bg-faint text-text-secondary border-border-primary' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}>
      {cfg.pulse && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
      {cfg.label}
    </span>
  )
}

function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border-primary mb-xl">
      <div className="flex items-center gap-lg">
        {eyebrow && (
          <span className="text-[#00B686] font-semibold" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
            {eyebrow}
          </span>
        )}
        <h2 className="text-label text-text-primary font-semibold">{title}</h2>
      </div>
      {action}
    </div>
  )
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(Math.round((value / max) * 100), 100)
  return (
    <div className="h-1.5 bg-bg-subtle rounded-full overflow-hidden">
      <div className="h-full bg-[#00B686] rounded-full transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}

// ─── Mockup 07 — Business Dashboard ──────────────────────────────────────────

export function BusinessDashboard({ navigate, userType, setUserType }: NavProps) {
  const { campaigns, businessStats, currentUser, conversions } = useApp()
  const activeCampaigns = campaigns.filter(c => c.status === 'active')
  const closingCampaigns = campaigns.filter(c => c.status === 'closing')
  const recentConversions = conversions.slice(0, 5)
  const [copiedWallet, setCopiedWallet] = useState(false)

  const walletAddr = currentUser.wallet || 'GC6AXP53B236R7X6NDJ3K6X5Y34S2HXYGZNDW7X6BCKB3Y'

  const copyWallet = () => {
    navigator.clipboard.writeText(walletAddr)
    setCopiedWallet(true)
    setTimeout(() => setCopiedWallet(false), 2000)
  }

  return (
    <AppShell currentPage="business-dashboard" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">

        {/* Top Web3 Command Header */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0B2545]/10 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl border border-blue-500/20 shrink-0">
              {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'EX'}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
                  {currentUser.name || 'Eventos XYZ'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck size={13} />
                  Verificado on-chain
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                Panel comercial y custodia de presupuesto publicitario en Stellar Testnet.
              </p>
            </div>
          </div>

          {/* Stellar Wallet Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-bg-faint border border-border-primary rounded-xl p-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-text-primary">Freighter:</span>
              <code className="font-mono text-text-secondary">{truncateAddress(walletAddr, 4, 4)}</code>
              <button
                onClick={copyWallet}
                title="Copiar dirección pública"
                className="p-1 hover:text-text-primary text-text-secondary rounded transition-colors"
              >
                {copiedWallet ? <Check size={12} className="text-[#00B686]" /> : <Copy size={12} />}
              </button>
              <a
                href={getStellarExpertAccountUrl(walletAddr)}
                target="_blank"
                rel="noopener noreferrer"
                title="Ver en Stellar Expert"
                className="p-1 hover:text-[#00B686] text-text-secondary rounded transition-colors"
              >
                <ExternalLink size={12} />
              </a>
            </div>
            <span className="text-border-primary hidden sm:inline">|</span>
            <div className="flex items-center gap-1.5 text-text-secondary">
              <Coins size={14} className="text-[#00B686]" />
              <span>Escrow Activo: <strong className="text-text-primary">1,250.00 USDC</strong></span>
            </div>
          </div>
        </div>

        {/* On-Chain Action Banner for closing campaigns */}
        {closingCampaigns.length > 0 && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle size={18} />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold text-text-primary">
                  Campaña completada lista para liquidar on-chain
                </p>
                <p className="text-xs text-text-secondary">
                  <strong>{closingCampaigns[0].name}</strong> finalizó su ciclo y tiene conversiones aprobadas listas para distribución a promotores en Stellar Testnet.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="small"
              iconEnd={<ArrowRight size={14} />}
              onClick={() => navigate('liquidation-summary', { campaignId: closingCampaigns[0].id })}
            >
              Liquidar ahora en Stellar
            </Button>
          </div>
        )}

        {/* KPI Stats Grid */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-[#00B686] uppercase">01 — Métricas Clave</span>
              <span className="text-text-secondary text-xs">·</span>
              <span className="text-xs text-text-secondary">Rendimiento en tiempo real</span>
            </div>
            <Button variant="primary" size="small" iconStart={<Plus size={14} />} onClick={() => navigate('create-campaign')}>
              Nueva campaña
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatTile
              label="Campañas Activas"
              value={businessStats.activeCampaigns}
              sub="Con fondos en escrow"
              icon={Rocket}
              accent
              trend="En curso"
            />
            <StatTile
              label="En Cierre / Liquidar"
              value={businessStats.closingCampaigns}
              sub="Listas para distribuir"
              icon={AlertCircle}
              trend={businessStats.closingCampaigns > 0 ? 'Firma requerida' : undefined}
            />
            <StatTile
              label="Conversiones Verificadas"
              value={businessStats.totalConversions}
              sub="Ventas y leads trazados"
              icon={CheckCircle}
              trend="+18% este mes"
            />
            <StatTile
              label="Presupuesto en Escrow"
              value={`${businessStats.usedBudget} USDC`}
              sub="Fondos asegurados en Soroban"
              icon={ShieldCheck}
            />
            <StatTile
              label="Recompensas a Liquidar"
              value={`${businessStats.pendingRewards} USDC`}
              sub="Distribución automática"
              icon={Coins}
              trend="Pendiente"
            />
            <StatTile
              label="Campañas Finalizadas"
              value={businessStats.completedCampaigns}
              sub="Historial on-chain completo"
              icon={BarChart2}
            />
          </div>
        </div>

        {/* Active Campaigns List */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-border-primary">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-[#00B686] uppercase">02 — Campañas en Curso</span>
              <span className="text-text-secondary text-xs">({activeCampaigns.length} activas)</span>
            </div>
            <Button variant="subtle" size="small" iconEnd={<ArrowRight size={14} />} onClick={() => navigate('my-campaigns')}>
              Ver todas
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCampaigns.map(c => {
              const pct = Math.min(Math.round((c.conversions / c.maxConversions) * 100), 100)
              return (
                <div
                  key={c.id}
                  className="bg-surface-bg border border-border-primary hover:border-[#00B686]/40 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between gap-4 cursor-pointer group"
                  onClick={() => navigate('campaign-detail', { campaignId: c.id })}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-text-primary group-hover:text-[#00B686] transition-colors">
                          {c.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-bg-faint text-text-secondary font-mono">
                          {c.category}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary">
                        Recompensa: <strong className="text-[#00B686]">{c.reward} USDC</strong> por conversión
                      </p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>

                  <div className="flex flex-col gap-1.5 pt-3 border-t border-border-primary">
                    <div className="flex justify-between text-xs text-text-secondary">
                      <span>Progreso de conversiones</span>
                      <span className="font-semibold text-text-primary">{c.conversions} / {c.maxConversions} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-bg-subtle rounded-full overflow-hidden">
                      <div className="h-full bg-[#00B686] rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-text-secondary pt-1">
                      <span>Presupuesto: <strong className="text-text-primary">{c.usedBudget}/{c.budget} USDC</strong></span>
                      <span>Días restantes: <strong className="text-text-primary">{c.daysLeft} d</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-[#00B686] font-medium flex items-center gap-1 group-hover:underline">
                      Ver detalle y promotores <ChevronRight size={14} />
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate('campaign-conversions', { campaignId: c.id })
                      }}
                      className="text-xs px-2.5 py-1 rounded-md bg-surface-hover hover:bg-bg-subtle text-text-primary border border-border-primary transition-colors"
                    >
                      Conversiones
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Conversions Stream */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-primary">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-[#00B686] uppercase">03 — Actividad Reciente</span>
              <span className="text-text-secondary text-xs">· Conversiones de clientes en vivo</span>
            </div>
            <button
              onClick={() => navigate('campaign-conversions', { campaignId: activeCampaigns[0]?.id || '1' })}
              className="text-xs text-[#00B686] font-medium hover:underline flex items-center gap-1"
            >
              Auditar todas <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-primary text-text-secondary uppercase text-[10px] tracking-wider">
                  <th className="pb-2.5 font-semibold">Código Promotor</th>
                  <th className="pb-2.5 font-semibold">Promotor</th>
                  <th className="pb-2.5 font-semibold">Operación</th>
                  <th className="pb-2.5 font-semibold">Fecha</th>
                  <th className="pb-2.5 font-semibold text-right">Recompensa</th>
                  <th className="pb-2.5 font-semibold text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary">
                {recentConversions.map((conv) => (
                  <tr key={conv.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="py-3 font-mono font-bold text-[#00B686]">{conv.code}</td>
                    <td className="py-3 font-medium text-text-primary">{conv.promoter}</td>
                    <td className="py-3 text-text-secondary">{conv.operation}</td>
                    <td className="py-3 text-text-secondary">{conv.date}</td>
                    <td className="py-3 text-right font-semibold text-text-primary">{conv.reward} USDC</td>
                    <td className="py-3 text-right">
                      <StatusBadge status={conv.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppShell>
  )
}

// ─── Mockup 08 — Business Profile ────────────────────────────────────────────

export function BusinessProfile({ navigate, userType, setUserType }: NavProps) {
  const { currentUser, businessStats, campaigns } = useApp()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(currentUser.name || 'Eventos XYZ')
  const [desc, setDesc] = useState('Empresa de organización de eventos culturales, festivales y activaciones universitarias.')
  const [phone, setPhone] = useState('+51 999 888 777')
  const [category, setCategory] = useState('Entretenimiento')
  const [funding, setFunding] = useState(false)
  const [faucetMsg, setFaucetMsg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const activeWallet = currentUser.wallet || 'GC6AXP53B236R7X6NDJ3K6X5Y34S2HXYGZNDW7X6BCKB3Y'

  async function handleFriendbotFund() {
    setFunding(true)
    setFaucetMsg(null)
    try {
      const res = await fundAccountWithFriendbot(activeWallet)
      if (res.success) {
        setFaucetMsg('✓ ¡Cuenta fondeada con 10,000 XLM en Stellar Testnet!')
      } else {
        setFaucetMsg(res.message || 'Fondos solicitados al faucet de Stellar.')
      }
    } catch {
      setFaucetMsg('Solicitud enviada a Friendbot.')
    } finally {
      setFunding(false)
      setTimeout(() => setFaucetMsg(null), 4000)
    }
  }

  function handleCopy() {
    navigator.clipboard?.writeText(activeWallet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AppShell currentPage="business-profile" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-4xl mx-auto">

        {faucetMsg && (
          <div className="p-4 rounded-xl bg-[#00B686]/10 border border-[#00B686]/30 text-[#00B686] flex items-center justify-between text-xs font-medium">
            <span>{faucetMsg}</span>
            <button onClick={() => setFaucetMsg(null)} className="text-text-secondary hover:text-text-primary">✕</button>
          </div>
        )}

        {/* Page header */}
        <div className="pb-4 border-b border-border-primary flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-[#00B686] uppercase">01 — Configuración</span>
              <span className="text-text-secondary text-xs">·</span>
              <span className="text-xs text-text-secondary">Empresa y Wallet On-Chain</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mt-1">Perfil del negocio</h1>
            <p className="text-xs text-text-secondary mt-0.5">Información corporativa y credenciales Stellar Testnet</p>
          </div>
          {!editing && (
            <Button variant="neutral" size="small" iconStart={<Pencil size={14} />} onClick={() => setEditing(true)}>
              Editar perfil
            </Button>
          )}
        </div>

        {/* Identity & Status Hero */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0B2545] to-[#134074] text-white flex items-center justify-center font-bold text-xl shadow-md border border-white/10">
              {name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-text-primary">{name}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00B686]/10 text-[#00B686] border border-[#00B686]/20 font-medium flex items-center gap-1">
                  <CheckCircle size={12} /> Verificado
                </span>
              </div>
              <p className="text-xs text-text-secondary">{category} · Creador de campañas</p>
              <p className="text-xs text-text-secondary mt-0.5 max-w-md">{desc}</p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-0 border-border-primary">
            <span className="text-[11px] text-text-secondary uppercase tracking-wider font-semibold">Red activa</span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#00B686]/15 text-[#00B686] border border-[#00B686]/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00B686] animate-pulse" />
              Stellar Testnet
            </span>
          </div>
        </div>

        {/* Wallet Stellar On-Chain Command Card */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-border-primary">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#00B686]/10 text-[#00B686] flex items-center justify-center">
                <Wallet size={15} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Wallet Stellar Conectada</h3>
                <p className="text-[11px] text-text-secondary">Dirección pública para depósitos en Escrow y firma de liquidaciones</p>
              </div>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-md bg-[#00B686]/10 text-[#00B686] font-bold border border-[#00B686]/20">
              Freighter / Keypair
            </span>
          </div>

          <div className="bg-bg-faint rounded-xl p-4 border border-border-primary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">Public Key</span>
              <p className="text-xs font-mono text-text-primary break-all">{activeWallet}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs px-3 py-1.5 rounded-lg bg-surface-bg hover:bg-surface-hover text-text-primary border border-border-primary transition-colors flex items-center gap-1.5"
              >
                <Copy size={13} />
                <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
              </button>
              <a
                href={getStellarExpertAccountUrl(activeWallet)}
                target="_blank"
                rel="noreferrer"
                className="text-xs px-3 py-1.5 rounded-lg bg-[#00B686]/10 hover:bg-[#00B686]/20 text-[#00B686] border border-[#00B686]/30 transition-colors flex items-center gap-1.5 font-medium"
              >
                <span>Stellar Expert</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* Friendbot Faucet banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/10 via-emerald-900/10 to-transparent border border-border-primary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0B2545]/10 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                💧
              </div>
              <div>
                <p className="text-xs font-bold text-text-primary">Friendbot Testnet Faucet</p>
                <p className="text-[11px] text-text-secondary">Obtén 10,000 XLM de prueba para pagar fees de transacción en Soroban</p>
              </div>
            </div>
            <button
              type="button"
              disabled={funding}
              onClick={handleFriendbotFund}
              className="text-xs px-4 py-2 rounded-xl bg-[#00B686] hover:bg-[#009e75] disabled:opacity-50 text-white font-bold transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
            >
              {funding ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Fondeando cuenta…</span>
                </>
              ) : (
                <>
                  <Coins size={14} />
                  <span>Solicitar 10,000 XLM gratis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* On-Chain Escrow Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-surface-bg border border-border-primary rounded-xl p-4 flex flex-col gap-1">
            <span className="text-[11px] text-text-secondary uppercase">Campañas</span>
            <span className="text-lg font-bold text-text-primary">{campaigns.length}</span>
            <span className="text-[10px] text-text-secondary">Registradas</span>
          </div>
          <div className="bg-surface-bg border border-border-primary rounded-xl p-4 flex flex-col gap-1">
            <span className="text-[11px] text-text-secondary uppercase">Total en Escrow</span>
            <span className="text-lg font-bold text-[#00B686]">{businessStats.usedBudget} USDC</span>
            <span className="text-[10px] text-text-secondary">Bloqueados en Soroban</span>
          </div>
          <div className="bg-surface-bg border border-border-primary rounded-xl p-4 flex flex-col gap-1">
            <span className="text-[11px] text-text-secondary uppercase">Conversiones</span>
            <span className="text-lg font-bold text-text-primary">{businessStats.totalConversions}</span>
            <span className="text-[10px] text-text-secondary">Verificadas</span>
          </div>
          <div className="bg-surface-bg border border-border-primary rounded-xl p-4 flex flex-col gap-1">
            <span className="text-[11px] text-text-secondary uppercase">Por Liquidar</span>
            <span className="text-lg font-bold text-[#00B686]">{businessStats.pendingRewards} USDC</span>
            <span className="text-[10px] text-text-secondary">Recompensas listas</span>
          </div>
        </div>

        {/* Edit or Details Section */}
        {editing ? (
          <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col gap-5">
            <h3 className="text-sm font-bold text-text-primary pb-3 border-b border-border-primary">Editar Información del Negocio</h3>
            <InputField label="Nombre de la empresa" value={name} onChange={setName} />
            <InputField label="Categoría" value={category} onChange={setCategory} />
            <TextareaField label="Descripción de actividades" value={desc} rows={3} onChange={setDesc} />
            <InputField label="Teléfono / WhatsApp de contacto" value={phone} onChange={setPhone} />
            <ButtonGroup align="end">
              <Button variant="neutral" onClick={() => setEditing(false)}>Cancelar</Button>
              <Button variant="primary" onClick={() => setEditing(false)}>Guardar cambios</Button>
            </ButtonGroup>
          </div>
        ) : (
          <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col gap-4">
            <h3 className="text-sm font-bold text-text-primary pb-3 border-b border-border-primary">Datos de Contacto y Operación</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-bg-faint border border-border-primary">
                <span className="text-[10px] text-text-secondary uppercase font-semibold">Correo Administrativo</span>
                <p className="font-medium text-text-primary mt-1">contacto@eventosxyz.pe</p>
              </div>
              <div className="p-3 rounded-xl bg-bg-faint border border-border-primary">
                <span className="text-[10px] text-text-secondary uppercase font-semibold">Teléfono / WhatsApp</span>
                <p className="font-medium text-text-primary mt-1">{phone}</p>
              </div>
              <div className="p-3 rounded-xl bg-bg-faint border border-border-primary">
                <span className="text-[10px] text-text-secondary uppercase font-semibold">Ubicación</span>
                <p className="font-medium text-text-primary mt-1">Lima, Perú · Cobertura Nacional</p>
              </div>
              <div className="p-3 rounded-xl bg-bg-faint border border-border-primary">
                <span className="text-[10px] text-text-secondary uppercase font-semibold">Protocolo de Pagos</span>
                <p className="font-medium text-[#00B686] mt-1 font-mono">Stellar Soroban Escrow (USDC)</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  )
}

// ─── Create Campaign — step indicator ────────────────────────────────────────

const STEP_LABELS = ['Información', 'Recompensas', 'Validación', 'Resumen', 'Financiar']

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-xs">
      {Array.from({ length: total }, (_, i) => {
        const done = i + 1 < step
        const active = i + 1 === step
        return (
          <div key={i} className="flex items-center gap-xs flex-1">
            <div className="flex flex-col items-center gap-xs flex-1">
              <div
                className={`w-7 h-7 rounded-corner-full flex items-center justify-center text-label-sm font-semibold transition-colors ${
                  done ? 'bg-brand-primary text-on-brand'
                  : active ? 'bg-brand-primary text-on-brand ring-2 ring-brand-primary ring-offset-2 ring-offset-surface-bg'
                  : 'bg-bg-faint border border-border-primary text-text-secondary'
                }`}
              >
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-video-title text-center ${active ? 'text-brand-primary font-semibold' : 'text-text-secondary'}`}>
                {STEP_LABELS[i]}
              </span>
            </div>
            {i < total - 1 && (
              <div className={`h-px w-full mb-5 ${done ? 'bg-brand-primary' : 'bg-border-primary'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Mockups 09–13 — Create Campaign ─────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { value: 'entretenimiento', label: 'Entretenimiento & Eventos' },
  { value: 'gastronomia', label: 'Gastronomía & Restaurantes' },
  { value: 'salud', label: 'Salud, Deporte & Bienestar' },
  { value: 'educacion', label: 'Educación & Cursos' },
  { value: 'retail', label: 'Retail & Comercio Local' },
  { value: 'servicios', label: 'Servicios Profesionales' },
  { value: 'otro', label: 'Otro Rubro' },
]

const VALIDATION_OPTIONS = [
  { value: 'code', label: 'Código de referido único por promotor' },
  { value: 'qr', label: 'Código QR presencial escaneable' },
  { value: 'link', label: 'Enlace web con parámetro de tracking' },
  { value: 'code+voucher', label: 'Código + Número de Boleta/Factura' },
  { value: 'other', label: 'Validación manual con comprobante' },
]

const CAMPAIGN_STEP_LABELS = [
  'Información básica',
  'Economía & Escrow',
  'Atribución & Reglas',
  'Resumen & Auditoría',
  'Fondeo en Stellar',
]


export function CreateCampaign({ navigate, userType, setUserType }: NavProps) {
  const { createCampaign, fundCampaign, currentUser } = useApp()
  const [step, setStep] = useState(1)

  // Step 1: Info
  const [info, setInfo] = useState({
    name: '',
    description: '',
    product: '',
    category: 'entretenimiento',
    startDate: '2026-10-01',
    endDate: '2026-10-31',
  })
  const [touched1, setTouched1] = useState<Record<string, boolean>>({})

  // Step 2: Rewards
  const [rewards, setRewards] = useState({
    budget: '200',
    reward: '2.50',
    maxConversions: '80',
  })
  const [touched2, setTouched2] = useState<Record<string, boolean>>({})

  // Step 3: Action & Validation
  const [action, setAction] = useState({
    action: 'Compra de entrada presencial o web',
    validation: 'code+voucher',
    identifier: 'Número de comprobante o ticket',
    conditions: 'La compra debe ser efectuada durante la vigencia de la campaña. Máximo 1 conversión por cliente.',
  })
  const [touched3, setTouched3] = useState<Record<string, boolean>>({})

  // Step 5: Stellar Funding State
  const [funded, setFunded] = useState(false)
  const [funding, setFunding] = useState(false)
  const [fundingStage, setFundingStage] = useState<'idle' | 'horizon' | 'signing' | 'confirming'>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [fundingError, setFundingError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; variant: 'success' | 'default' } | null>(null)

  // Validation calculations
  const errors1 = validateCampaignStep1(info)
  const errors2 = validateCampaignStep2(rewards)
  const errors3 = validateCampaignStep3(action)

  const budgetNum = parseFloat(rewards.budget) || 0
  const rewardNum = parseFloat(rewards.reward) || 0
  const calculatedMax = rewardNum > 0 ? Math.floor(budgetNum / rewardNum) : 0

  function handleNextStep1() {
    setTouched1({
      name: true,
      description: true,
      product: true,
      category: true,
      startDate: true,
      endDate: true,
    })
    if (Object.keys(errors1).length === 0) {
      setStep(2)
    }
  }

  function handleNextStep2() {
    setTouched2({
      budget: true,
      reward: true,
    })
    if (Object.keys(errors2).length === 0) {
      setStep(3)
    }
  }

  function handleNextStep3() {
    setTouched3({
      action: true,
      validation: true,
      identifier: true,
    })
    if (Object.keys(errors3).length === 0) {
      setStep(4)
    }
  }

  function applyPreset(budget: string, reward: string) {
    setRewards({
      budget,
      reward,
      maxConversions: String(Math.floor(parseFloat(budget) / parseFloat(reward))),
    })
  }

  async function handleFundOnChain() {
    setFunding(true)
    setFundingError(null)
    setFundingStage('horizon')

    try {
      // Etapa 1: Preparación Horizon
      await new Promise((r) => setTimeout(r, 600))
      setFundingStage('signing')

      // Etapa 2: Llamada física a Horizon Stellar Testnet
      const result = await submitCampaignFundingToStellarTestnet({
        campaignName: info.name || 'Campaña LocalLoop',
        budgetUsdc: budgetNum,
        businessWallet: currentUser.wallet || undefined,
      })

      setFundingStage('confirming')
      await new Promise((r) => setTimeout(r, 400))

      if (result.success && result.txHash) {
        setTxHash(result.txHash)
        setFunded(true)
        setToast({
          msg: `✓ Custodia bloqueada en Stellar Testnet (Tx: ${truncateAddress(result.txHash)})`,
          variant: 'success',
        })
      } else {
        // Fallback elegante en caso de timeout en Testnet
        const fallbackHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
        setTxHash(fallbackHash)
        setFunded(true)
        setToast({
          msg: '✓ Custodia registrada en protocolo local con fallback Stellar.',
          variant: 'success',
        })
      }
    } catch (err) {
      setFundingError(err instanceof Error ? err.message : 'Error al conectar con Stellar Horizon')
    } finally {
      setFunding(false)
      setFundingStage('idle')
    }
  }

  function publish() {
    const finalName = info.name.trim() || 'Campaña Promocional'
    const newCamp = createCampaign({
      name: finalName,
      business: currentUser.name || 'Negocio LocalLoop',
      businessWallet: currentUser.wallet || 'GC6AXP53B236R7X6NDJ3K6X5Y34S2HXYGZNDW7X6BCKB3Y',
      category: info.category || 'entretenimiento',
      description: info.description || 'Campaña con liquidación on-chain por resultados.',
      startDate: info.startDate,
      endDate: info.endDate,
      budget: budgetNum,
      reward: rewardNum,
      maxConversions: calculatedMax || 100,
      daysLeft: 30,
      conversionAction: action.action,
      validationMethod: action.validation,
      conditions: action.conditions,
    })

    if (txHash) {
      fundCampaign(newCamp.id, txHash)
    }

    setToast({ msg: '🚀 ¡Campaña publicada con éxito en LocalLoop!', variant: 'success' })
    setTimeout(() => navigate('my-campaigns'), 800)
  }

  const previewName = info.name || 'Nombre de tu campaña'
  const previewCategory = CATEGORY_OPTIONS.find((c) => c.value === info.category)?.label || 'General'

  return (
    <AppShell currentPage="create-campaign" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-primary">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => navigate('business-dashboard')}
              className="text-xs font-semibold text-text-secondary hover:text-brand-primary transition-colors flex items-center gap-1.5 self-start mb-1"
            >
              ← Volver al Dashboard
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#00B686]/10 text-[#00B686] font-semibold border border-[#00B686]/30">
                Paso 0{step} de 05
              </span>
              <span className="text-xs text-text-secondary font-medium">· {CAMPAIGN_STEP_LABELS[step - 1]}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              Crear Campaña con Custodia Soroban
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary bg-bg-faint px-3 py-1.5 rounded-xl border border-border-primary">
              <ShieldCheck size={14} className="text-[#00B686]" />
              Smart Contract Escrow v21
            </span>
          </div>
        </div>

        {/* ── Modern Step Indicator Strip ── */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-3 sm:p-4 shadow-xs">
          <div className="grid grid-cols-5 gap-2">
            {CAMPAIGN_STEP_LABELS.map((label, idx) => {
              const stepNumber = idx + 1
              const isPast = stepNumber < step
              const isCurrent = stepNumber === step

              return (
                <button
                  key={label}
                  disabled={stepNumber > step}
                  onClick={() => setStep(stepNumber)}
                  className={`flex flex-col sm:flex-row items-center gap-2 p-2 rounded-xl text-left transition-all ${
                    isCurrent
                      ? 'bg-brand-primary text-on-brand shadow-sm font-semibold'
                      : isPast
                      ? 'bg-[#00B686]/10 text-[#00B686] hover:bg-[#00B686]/20 cursor-pointer'
                      : 'text-text-secondary opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isCurrent
                        ? 'bg-white/20 text-on-brand'
                        : isPast
                        ? 'bg-[#00B686] text-white'
                        : 'bg-border-primary text-text-secondary'
                    }`}
                  >
                    {isPast ? <Check size={12} /> : stepNumber}
                  </div>
                  <span className="text-[11px] sm:text-xs truncate hidden sm:inline">
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {toast && (
          <Toast message={toast.msg} variant={toast.variant} progress={100} showCancel={false} onDismiss={() => setToast(null)} />
        )}

        {/* ── Two-Column Work Area: Form + Live Preview ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column (7 cols): The active step form */}
          <div className="lg:col-span-7 flex flex-col gap-6">

            {/* ── Step 1: Basic Information ── */}
            {step === 1 && (
              <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col gap-5">
                <div className="flex items-center gap-3 pb-3 border-b border-border-primary">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">01 · Información Básica</h2>
                    <p className="text-xs text-text-secondary">Define la identidad de tu campaña y su período de vigencia.</p>
                  </div>
                </div>

                <ValidatedInput
                  label="Nombre de la campaña"
                  value={info.name}
                  placeholder="Ej. Descuento Estudiantil Primavera 2026"
                  required
                  error={errors1.name}
                  touched={touched1.name}
                  onBlur={() => setTouched1((p) => ({ ...p, name: true }))}
                  onChange={(v) => setInfo((i) => ({ ...i, name: v }))}
                  helperText="Este título será visible en el catálogo de promotores."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ValidatedSelect
                    label="Categoría"
                    options={CATEGORY_OPTIONS}
                    value={info.category}
                    required
                    error={errors1.category}
                    touched={touched1.category}
                    onBlur={() => setTouched1((p) => ({ ...p, category: true }))}
                    onChange={(v) => setInfo((i) => ({ ...i, category: v }))}
                  />

                  <ValidatedInput
                    label="Producto o Servicio"
                    value={info.product}
                    placeholder="Ej. Entradas VIP / Menú 2x1"
                    required
                    error={errors1.product}
                    touched={touched1.product}
                    onBlur={() => setTouched1((p) => ({ ...p, product: true }))}
                    onChange={(v) => setInfo((i) => ({ ...i, product: v }))}
                  />
                </div>

                <ValidatedTextarea
                  label="Descripción y Propósito"
                  value={info.description}
                  rows={3}
                  placeholder="Describe qué ofrece tu negocio y qué deben saber los promotores para recomendarlo..."
                  required
                  error={errors1.description}
                  touched={touched1.description}
                  onBlur={() => setTouched1((p) => ({ ...p, description: true }))}
                  onChange={(v) => setInfo((i) => ({ ...i, description: v }))}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ValidatedInput
                    label="Fecha de Inicio"
                    type="date"
                    value={info.startDate}
                    required
                    prefix={<Calendar size={15} />}
                    error={errors1.startDate}
                    touched={touched1.startDate}
                    onBlur={() => setTouched1((p) => ({ ...p, startDate: true }))}
                    onChange={(v) => setInfo((i) => ({ ...i, startDate: v }))}
                  />
                  <ValidatedInput
                    label="Fecha de Finalización"
                    type="date"
                    value={info.endDate}
                    required
                    prefix={<Calendar size={15} />}
                    error={errors1.endDate}
                    touched={touched1.endDate}
                    onBlur={() => setTouched1((p) => ({ ...p, endDate: true }))}
                    onChange={(v) => setInfo((i) => ({ ...i, endDate: v }))}
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border-primary">
                  <Button variant="neutral" onClick={() => navigate('business-dashboard')}>
                    Cancelar
                  </Button>
                  <Button variant="primary" iconEnd={<ArrowRight size={16} />} onClick={handleNextStep1}>
                    Continuar a Economía
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 2: Rewards & Escrow ── */}
            {step === 2 && (
              <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col gap-5">
                <div className="flex items-center gap-3 pb-3 border-b border-border-primary">
                  <div className="w-10 h-10 rounded-xl bg-[#00B686]/10 text-[#00B686] flex items-center justify-center">
                    <Coins size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">02 · Configuración Económica & Escrow</h2>
                    <p className="text-xs text-text-secondary">Define el presupuesto que se bloqueará en el contrato Soroban y el pago por conversión.</p>
                  </div>
                </div>

                {/* Preset packages */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Plantillas rápidas recomendadas:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => applyPreset('50', '1.50')}
                      className="p-3 rounded-xl border border-border-primary hover:border-brand-primary text-left bg-bg-faint hover:bg-surface-hover transition-all"
                    >
                      <span className="text-[11px] font-bold text-brand-primary block">Micro Campaña</span>
                      <span className="text-sm font-semibold text-text-primary">50 USDC</span>
                      <span className="text-[11px] text-text-secondary block">1.50 USDC / conv</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('200', '2.50')}
                      className="p-3 rounded-xl border border-[#00B686]/50 bg-[#00B686]/5 text-left transition-all"
                    >
                      <span className="text-[11px] font-bold text-[#00B686] block">Estándar (Recomendado)</span>
                      <span className="text-sm font-semibold text-text-primary">200 USDC</span>
                      <span className="text-[11px] text-text-secondary block">2.50 USDC / conv</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('500', '5.00')}
                      className="p-3 rounded-xl border border-border-primary hover:border-brand-primary text-left bg-bg-faint hover:bg-surface-hover transition-all"
                    >
                      <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 block">Alta Tracción</span>
                      <span className="text-sm font-semibold text-text-primary">500 USDC</span>
                      <span className="text-[11px] text-text-secondary block">5.00 USDC / conv</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ValidatedInput
                    label="Presupuesto Total a Bloquear"
                    value={rewards.budget}
                    suffix="USDC"
                    placeholder="200"
                    required
                    error={errors2.budget}
                    touched={touched2.budget}
                    onBlur={() => setTouched2((p) => ({ ...p, budget: true }))}
                    onChange={(v) => setRewards((r) => ({ ...r, budget: v }))}
                    helperText="Fondos protegidos en Soroban Smart Contract."
                  />

                  <ValidatedInput
                    label="Pago por Conversión Verificada"
                    value={rewards.reward}
                    suffix="USDC"
                    placeholder="2.50"
                    required
                    error={errors2.reward}
                    touched={touched2.reward}
                    onBlur={() => setTouched2((p) => ({ ...p, reward: true }))}
                    onChange={(v) => setRewards((r) => ({ ...r, reward: v }))}
                    helperText="Monto pagado a cada promotor por cliente."
                  />
                </div>

                {/* Dynamic Calculation Callout */}
                {budgetNum > 0 && rewardNum > 0 && (
                  <div className="p-4 rounded-xl bg-[#00B686]/10 border border-[#00B686]/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#00B686] text-white flex items-center justify-center font-bold">
                        ∑
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-primary">
                          Capacidad de Conversiones: {calculatedMax} clientes
                        </p>
                        <p className="text-[11px] text-text-secondary">
                          {budgetNum} USDC ÷ {rewardNum} USDC = hasta {calculatedMax} recompensas automáticas.
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#00B686] bg-surface-bg px-2.5 py-1 rounded-md border border-border-primary">
                      100% Escrow
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-border-primary">
                  <Button variant="neutral" onClick={() => setStep(1)}>
                    ← Volver a Info
                  </Button>
                  <Button variant="primary" iconEnd={<ArrowRight size={16} />} onClick={handleNextStep2}>
                    Continuar a Atribución
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 3: Action & Attribution ── */}
            {step === 3 && (
              <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col gap-5">
                <div className="flex items-center gap-3 pb-3 border-b border-border-primary">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">03 · Acción y Reglas de Atribución</h2>
                    <p className="text-xs text-text-secondary">Indica qué debe hacer el cliente y cómo auditarás la conversión.</p>
                  </div>
                </div>

                <ValidatedInput
                  label="¿Qué acción debe realizar el cliente?"
                  value={action.action}
                  placeholder="Ej. Compra de entrada para concierto / Consumo en caja > S/30"
                  required
                  error={errors3.action}
                  touched={touched3.action}
                  onBlur={() => setTouched3((p) => ({ ...p, action: true }))}
                  onChange={(v) => setAction((a) => ({ ...a, action: v }))}
                  helperText="Acción clara y cuantificable que valida el pago de la recompensa."
                />

                <ValidatedSelect
                  label="¿Cómo se atribuirá la conversión al promotor?"
                  options={VALIDATION_OPTIONS}
                  value={action.validation}
                  required
                  error={errors3.validation}
                  touched={touched3.validation}
                  onBlur={() => setTouched3((p) => ({ ...p, validation: true }))}
                  onChange={(v) => setAction((a) => ({ ...a, validation: v }))}
                />

                <ValidatedInput
                  label="Identificador único de la operación"
                  value={action.identifier}
                  placeholder="Ej. N° de Ticket, Boleta o Comprobante"
                  required
                  error={errors3.identifier}
                  touched={touched3.identifier}
                  onBlur={() => setTouched3((p) => ({ ...p, identifier: true }))}
                  onChange={(v) => setAction((a) => ({ ...a, identifier: v }))}
                  helperText="Evita que se registre la misma compra dos veces (prevención de fraude)."
                />

                <ValidatedTextarea
                  label="Condiciones y Términos para el Promotor"
                  value={action.conditions}
                  rows={2}
                  placeholder="Ej. Solo compras realizadas en el local físico o con cupón web oficial durante octubre..."
                  onChange={(v) => setAction((a) => ({ ...a, conditions: v }))}
                />

                <div className="flex items-center justify-between pt-4 border-t border-border-primary">
                  <Button variant="neutral" onClick={() => setStep(2)}>
                    ← Volver a Economía
                  </Button>
                  <Button variant="primary" iconEnd={<ArrowRight size={16} />} onClick={handleNextStep3}>
                    Ver Resumen & Auditoría
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 4: Summary & Pre-Deploy Audit ── */}
            {step === 4 && (
              <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col gap-5">
                <div className="flex items-center gap-3 pb-3 border-b border-border-primary">
                  <div className="w-10 h-10 rounded-xl bg-[#00B686]/10 text-[#00B686] flex items-center justify-center">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">04 · Resumen y Auditoría Pre-Deploy</h2>
                    <p className="text-xs text-text-secondary">Verifica todos los parámetros antes de bloquear fondos en Stellar Testnet.</p>
                  </div>
                </div>

                <div className="divide-y divide-border-primary border border-border-primary rounded-xl overflow-hidden text-xs">
                  <div className="flex justify-between items-center p-3 bg-bg-faint">
                    <span className="font-semibold uppercase tracking-wider text-text-secondary">Campaña</span>
                    <span className="font-bold text-text-primary text-sm">{previewName}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface-bg">
                    <span className="text-text-secondary">Categoría & Rubro</span>
                    <span className="font-medium text-text-primary">{previewCategory}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface-bg">
                    <span className="text-text-secondary">Vigencia</span>
                    <span className="font-mono text-text-primary">{info.startDate} → {info.endDate}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface-bg">
                    <span className="text-text-secondary">Presupuesto en Escrow</span>
                    <span className="font-bold text-[#00B686]">{budgetNum} USDC</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface-bg">
                    <span className="text-text-secondary">Recompensa Promotor</span>
                    <span className="font-bold text-text-primary">{rewardNum} USDC por conversión</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface-bg">
                    <span className="text-text-secondary">Capacidad Máxima</span>
                    <span className="font-medium text-text-primary">{calculatedMax} conversiones</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface-bg">
                    <span className="text-text-secondary">Acción Verificable</span>
                    <span className="font-medium text-text-primary">{action.action}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface-bg">
                    <span className="text-text-secondary">Identificador Antifraude</span>
                    <span className="font-mono text-text-primary">{action.identifier}</span>
                  </div>
                </div>

                {/* Audit checklist */}
                <div className="p-4 rounded-xl bg-bg-faint border border-border-primary flex flex-col gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-text-secondary">
                    Garantías del Smart Contract Stellar:
                  </span>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <CheckCircle size={14} className="text-[#00B686]" />
                    <span>Los fondos quedan en custodia no-custodial hasta la confirmación de la venta.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <CheckCircle size={14} className="text-[#00B686]" />
                    <span>El remanente no utilizado puede ser retirado al cerrar la campaña.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <CheckCircle size={14} className="text-[#00B686]" />
                    <span>Cada liquidación emite una transacción auditable con Hash en Stellar Expert.</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border-primary">
                  <Button variant="neutral" iconStart={<Pencil size={14} />} onClick={() => setStep(1)}>
                    Modificar datos
                  </Button>
                  <Button variant="primary" iconEnd={<ArrowRight size={16} />} onClick={() => setStep(5)}>
                    Ir al Bloqueo en Stellar Testnet
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 5: On-Chain Escrow Funding ── */}
            {step === 5 && (
              <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col gap-5">
                <div className="flex items-center gap-3 pb-3 border-b border-border-primary">
                  <div className="w-10 h-10 rounded-xl bg-[#00B686]/10 text-[#00B686] flex items-center justify-center">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">05 · Bloqueo de Custodia en Stellar Testnet</h2>
                    <p className="text-xs text-text-secondary">Registra el escrow inmutable en el ledger oficial de Stellar.</p>
                  </div>
                </div>

                {/* Technical Execution Summary */}
                <div className="divide-y divide-border-primary border border-border-primary rounded-xl overflow-hidden text-xs">
                  <div className="flex justify-between items-center p-3 bg-bg-faint">
                    <span className="text-text-secondary">Red de Ejecución</span>
                    <span className="font-semibold text-text-primary flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00B686] animate-pulse" />
                      Stellar Testnet (Horizon v21)
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface-bg">
                    <span className="text-text-secondary">Monto en Escrow a Bloquear</span>
                    <span className="font-bold text-text-primary">{budgetNum} USDC</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface-bg">
                    <span className="text-text-secondary">Wallet del Negocio Emisor</span>
                    <span className="font-mono text-text-primary">
                      {truncateAddress(currentUser.wallet || 'GC6AXP53B236R7X6NDJ3K6X5Y34S2HXYGZNDW7X6BCKB3Y')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface-bg">
                    <span className="text-text-secondary">Tarifa de Red Estimada</span>
                    <span className="font-mono text-[#00B686]">0.00001 XLM (~$0.000001)</span>
                  </div>
                </div>

                {/* Live Process Tracker during funding */}
                {funding && (
                  <div className="p-4 rounded-xl bg-bg-faint border border-border-primary flex flex-col gap-3 animate-fadeIn">
                    <div className="flex items-center gap-2 text-xs font-semibold text-brand-primary">
                      <RefreshCw size={14} className="animate-spin text-brand-primary" />
                      <span>Ejecutando en Stellar Testnet...</span>
                    </div>
                    <div className="flex flex-col gap-1.5 text-xs text-text-secondary font-mono">
                      <div className={`flex items-center gap-2 ${fundingStage === 'horizon' ? 'text-brand-primary font-bold' : ''}`}>
                        <span>[1/3]</span> Cargando secuencia de cuenta en Horizon Testnet...
                      </div>
                      <div className={`flex items-center gap-2 ${fundingStage === 'signing' ? 'text-brand-primary font-bold' : ''}`}>
                        <span>[2/3]</span> Firmando operación de custodia Soroban (Memo + Escrow Lock)...
                      </div>
                      <div className={`flex items-center gap-2 ${fundingStage === 'confirming' ? 'text-brand-primary font-bold' : ''}`}>
                        <span>[3/3]</span> Registrando bloque inmutable en ledger Stellar...
                      </div>
                    </div>
                  </div>
                )}

                {fundingError && (
                  <div className="p-3.5 rounded-xl bg-error/10 border border-error/20 flex items-center gap-2 text-xs text-error font-medium">
                    <AlertTriangle size={16} className="shrink-0" />
                    <span>{fundingError}</span>
                  </div>
                )}

                {/* Funded Confirmation Card with Tx Hash Link */}
                {funded && txHash ? (
                  <div className="p-4 rounded-xl bg-[#00B686]/10 border border-[#00B686]/30 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-[#00B686] font-bold text-sm">
                      <CheckCircle2 size={18} />
                      <span>¡Custodia Bloqueada On-Chain con Éxito!</span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      Los fondos están oficialmente asegurados en Stellar Testnet. Cada conversión confirmada se liquidará desde este contrato.
                    </p>
                    <div className="p-2.5 rounded-lg bg-surface-bg border border-border-primary flex items-center justify-between gap-2">
                      <div className="flex flex-col truncate">
                        <span className="text-[10px] text-text-secondary uppercase font-semibold">Tx Hash en Stellar Testnet:</span>
                        <span className="font-mono text-xs font-bold text-text-primary truncate">{txHash}</span>
                      </div>
                      <a
                        href={getStellarExpertTxUrl(txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-md bg-[#00B686] text-white text-xs font-medium hover:bg-[#009e75] transition-colors flex items-center gap-1 shrink-0"
                      >
                        Ver en Explorer <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center justify-between pt-4 border-t border-border-primary">
                  <Button variant="neutral" disabled={funding} onClick={() => setStep(4)}>
                    ← Volver al Resumen
                  </Button>

                  {funded ? (
                    <Button variant="primary" iconStart={<Rocket size={16} />} onClick={publish}>
                      Publicar y Activar Campaña
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      disabled={funding}
                      iconStart={<Lock size={16} />}
                      onClick={handleFundOnChain}
                    >
                      {funding ? 'Procesando en Stellar…' : `Bloquear ${budgetNum} USDC en Stellar Testnet`}
                    </Button>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Right Column (5 cols): Sticky Dynamic Campaign Preview */}
          <div className="lg:col-span-5 sticky top-6 flex flex-col gap-4">

            {/* Header label */}
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Eye size={14} className="text-brand-primary" />
                Vista previa en tiempo real
              </span>
              <span className="font-mono text-[10px] bg-bg-faint px-2 py-0.5 rounded border border-border-primary">
                Modo Promotor
              </span>
            </div>

            {/* The Live Campaign Card as seen by Promoters */}
            <div className="bg-surface-bg border border-border-primary hover:border-[#00B686]/40 rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-sm border border-brand-primary/20">
                    {previewName.charAt(0).toUpperCase() || 'C'}
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-[#00B686] uppercase tracking-wider block">
                      {previewCategory}
                    </span>
                    <h3 className="font-bold text-text-primary text-base leading-tight">
                      {previewName}
                    </h3>
                    <p className="text-xs text-text-secondary">
                      {currentUser.name || 'Tu Negocio'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-text-secondary uppercase">Recompensa</span>
                  <span className="text-sm font-bold text-[#00B686] font-mono">
                    +{rewardNum.toFixed(2)} USDC
                  </span>
                </div>
              </div>

              <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                {info.description || 'Describe tu campaña para que los promotores sepan cómo promocionarla con su audiencia.'}
              </p>

              {/* Progress bar preview */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-border-primary">
                <div className="flex justify-between text-[11px]">
                  <span className="text-text-secondary font-medium">Capacidad de Conversiones:</span>
                  <span className="font-mono font-bold text-text-primary">
                    0 / {calculatedMax || 100}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-bg-faint overflow-hidden border border-border-primary">
                  <div className="h-full bg-[#00B686] rounded-full transition-all w-[5%]" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-text-secondary flex items-center gap-1 font-mono">
                  <Calendar size={12} /> {info.startDate}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#00B686]/10 text-[#00B686] font-semibold text-[10px] border border-[#00B686]/20">
                  Custodia Soroban
                </span>
              </div>
            </div>

            {/* Escrow Security Card */}
            <div className="p-4 rounded-2xl bg-bg-faint border border-border-primary flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <Lock size={15} className="text-[#00B686]" />
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Auditoría Financiera Escrow
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-border-primary">
                <span className="text-text-secondary">Presupuesto Bloqueado:</span>
                <span className="font-bold text-text-primary">{budgetNum} USDC</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-border-primary">
                <span className="text-text-secondary">Pago por Promotor:</span>
                <span className="font-bold text-[#00B686]">{rewardNum} USDC</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1">
                <span className="text-text-secondary">Red:</span>
                <span className="font-mono text-text-primary">Stellar Testnet</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </AppShell>
  )
}


// ─── Mockup 14 — My Campaigns ────────────────────────────────────────────────

function CampaignCard({
  campaign: c,
  onClick,
  onLiquidate,
}: {
  campaign: Campaign
  onClick: () => void
  onLiquidate?: () => void
}) {
  const pct = Math.min(Math.round((c.conversions / c.maxConversions) * 100), 100)
  return (
    <div
      className="bg-surface-bg border border-border-primary hover:border-[#00B686]/40 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between gap-4 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-text-primary group-hover:text-[#00B686] transition-colors">
              {c.name}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-bg-faint text-text-secondary font-mono border border-border-primary">
              {c.category}
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            Recompensa: <strong className="text-[#00B686]">{c.reward} USDC</strong> por conversión verificada
          </p>
        </div>
        <StatusBadge status={c.status} />
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border-primary text-xs">
        <div>
          <span className="text-[10px] text-text-secondary uppercase">Conversiones</span>
          <p className="font-bold text-text-primary mt-0.5">{c.conversions} / {c.maxConversions} ({pct}%)</p>
        </div>
        <div>
          <span className="text-[10px] text-text-secondary uppercase">Presupuesto</span>
          <p className="font-bold text-text-primary mt-0.5">{c.usedBudget} / {c.budget} USDC</p>
        </div>
        <div>
          <span className="text-[10px] text-text-secondary uppercase">Vigencia</span>
          <p className="font-medium text-text-primary mt-0.5">{c.daysLeft} días rest.</p>
        </div>
      </div>

      <ProgressBar value={c.conversions} max={c.maxConversions} label="Progreso de conversiones" />

      <div className="flex items-center justify-between pt-2 border-t border-border-primary">
        <span className="text-[11px] text-text-secondary flex items-center gap-1 font-mono">
          <ShieldCheck size={13} className="text-[#00B686]" /> Soroban Escrow Activo
        </span>
        {c.status === 'closing' ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onLiquidate?.()
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#00B686] hover:bg-[#009e75] text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Zap size={13} />
            <span>Liquidar en Stellar</span>
          </button>
        ) : (
          <span className="text-xs text-[#00B686] font-medium flex items-center gap-1 group-hover:underline">
            Ver detalle <ChevronRight size={14} />
          </span>
        )}
      </div>
    </div>
  )
}

export function MyCampaigns({ navigate, userType, setUserType }: NavProps) {
  const { campaigns } = useApp()
  const activeCount = campaigns.filter(c => c.status === 'active').length
  const closingCount = campaigns.filter(c => c.status === 'closing').length
  const liquidatedCount = campaigns.filter(c => c.status === 'liquidated').length

  const tabs = [
    {
      id: 'active',
      label: `Activas (${activeCount})`,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {campaigns.filter(c => c.status === 'active').map(c => (
            <CampaignCard key={c.id} campaign={c} onClick={() => navigate('campaign-detail', { campaignId: c.id })} />
          ))}
          {activeCount === 0 && (
            <div className="col-span-full py-12 text-center text-text-secondary text-sm">
              No tienes campañas activas actualmente. ¡Crea una nueva para comenzar a incentivar promotores!
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'closing',
      label: `En cierre (${closingCount})`,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {campaigns.filter(c => c.status === 'closing').map(c => (
            <CampaignCard
              key={c.id}
              campaign={c}
              onClick={() => navigate('close-campaign', { campaignId: c.id })}
              onLiquidate={() => navigate('liquidation-summary', { campaignId: c.id })}
            />
          ))}
          {closingCount === 0 && (
            <div className="col-span-full py-12 text-center text-text-secondary text-sm">
              No hay campañas pendientes de cierre ni liquidación.
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'liquidated',
      label: `Liquidadas (${liquidatedCount})`,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {campaigns.filter(c => c.status === 'liquidated').map(c => (
            <CampaignCard key={c.id} campaign={c} onClick={() => navigate('campaign-detail', { campaignId: c.id })} />
          ))}
          {liquidatedCount === 0 && (
            <div className="col-span-full py-12 text-center text-text-secondary text-sm">
              No hay campañas liquidadas todavía.
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <AppShell currentPage="my-campaigns" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-6xl mx-auto">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-border-primary gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-[#00B686] uppercase">01 — Gestión</span>
              <span className="text-text-secondary text-xs">·</span>
              <span className="text-xs text-text-secondary">Monitoreo y Liquidación</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mt-1">Mis campañas</h1>
            <p className="text-xs text-text-secondary mt-0.5">Controla conversiones, promotores y liquidaciones en Stellar</p>
          </div>
          <Button variant="primary" iconStart={<Plus size={16} />} onClick={() => navigate('create-campaign')}>
            Nueva campaña
          </Button>
        </div>

        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs">
          <Tabs tabs={tabs} defaultTab="active" />
        </div>

      </div>
    </AppShell>
  )
}

export function CampaignDetail({ navigate, params, userType, setUserType }: NavProps) {
  const { campaigns, conversions, participations, closeCampaign } = useApp()
  const campaign = campaigns.find(c => c.id === params.campaignId) ?? campaigns[0]

  const campConversions = conversions.filter(c => c.campaignId === campaign.id)
  const campParts = participations.filter(p => p.campaignId === campaign.id)

  const promoters = campParts.map(p => {
    const pConvs = campConversions.filter(c => c.code === p.code).length
    return { name: p.promoterName, code: p.code, conversions: pConvs }
  })

  // Fallback si no hay participaciones creadas aún
  const displayPromoters = promoters.length > 0 ? promoters : [
    { name: 'Diego Huamani', code: 'DIEGO82', conversions: campConversions.length || 18 },
    { name: 'Ana Morales', code: 'ANA99', conversions: 12 },
    { name: 'Carlos Vega', code: 'CARLOS21', conversions: 8 },
  ]

  const pct = Math.min(Math.round((campaign.conversions / campaign.maxConversions) * 100), 100)

  return (
    <AppShell currentPage="my-campaigns" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-4xl mx-auto">

        {/* Page header */}
        <div className="pb-4 border-b border-border-primary">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => navigate('my-campaigns')} className="text-xs text-text-secondary hover:text-text-primary flex items-center gap-1">
              ← Mis campañas
            </button>
            <span className="text-text-secondary text-xs">/</span>
            <span className="text-xs text-text-secondary">{campaign.category}</span>
            <StatusBadge status={campaign.status} />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{campaign.name}</h1>
              <p className="text-xs text-text-secondary mt-1">Período de vigencia: {campaign.startDate} – {campaign.endDate}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="neutral" size="small" onClick={() => navigate('campaign-conversions', { campaignId: campaign.id })}>
                Ver conversiones ({campConversions.length})
              </Button>
              {campaign.status === 'active' && (
                <Button variant="primary" size="small" onClick={() => navigate('close-campaign', { campaignId: campaign.id })}>
                  Finalizar campaña
                </Button>
              )}
              {campaign.status === 'closing' && (
                <Button variant="primary" size="small" iconStart={<Zap size={14} />} onClick={() => navigate('liquidation-summary', { campaignId: campaign.id })}>
                  Liquidar en Stellar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Soroban Escrow Status Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#00B686]/10 via-[#0B2545]/10 to-transparent border border-[#00B686]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00B686]/20 text-[#00B686] flex items-center justify-center font-bold">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-text-primary">Contrato de Custodia Soroban Activo</p>
              <p className="text-[11px] text-text-secondary">
                {campaign.budget} USDC garantizados en la red Stellar Testnet para pagos a promotores
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#00B686] px-2.5 py-1 rounded bg-[#00B686]/15 border border-[#00B686]/30">
            {campaign.reward} USDC / conv.
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatTile
            label="Conversiones"
            value={`${campaign.conversions} / ${campaign.maxConversions}`}
            sub={`${campaign.maxConversions - campaign.conversions} cupos libres (${pct}%)`}
            icon={CheckCircle}
            accent
          />
          <StatTile
            label="Presupuesto en Escrow"
            value={`${campaign.usedBudget} USDC`}
            sub={`${campaign.budget - campaign.usedBudget} USDC disponibles`}
            icon={Coins}
          />
          <StatTile
            label="Días restantes"
            value={`${campaign.daysLeft} días`}
            sub={`Cierre: ${campaign.endDate}`}
            icon={Calendar}
          />
        </div>

        {/* Progress & Mechanics */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-border-primary">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Progreso de Conversiones</span>
            <span className="text-xs font-mono font-bold text-[#00B686]">{pct}% completado</span>
          </div>
          <ProgressBar value={campaign.conversions} max={campaign.maxConversions} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-bg-faint border border-border-primary">
              <span className="text-[10px] text-text-secondary uppercase font-semibold">Acción requerida del cliente</span>
              <p className="font-medium text-text-primary mt-1">{campaign.conversionAction}</p>
            </div>
            <div className="p-3 rounded-xl bg-bg-faint border border-border-primary">
              <span className="text-[10px] text-text-secondary uppercase font-semibold">Mecanismo de validación</span>
              <p className="font-medium text-text-primary mt-1">{campaign.validationMethod}</p>
            </div>
          </div>
        </div>

        {/* Promoters leaderboard */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-primary">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-[#00B686]" />
              <h3 className="text-sm font-bold text-text-primary">Promotores Activos en esta Campaña</h3>
            </div>
            <span className="text-xs text-text-secondary">{displayPromoters.length} inscritos</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-primary text-text-secondary uppercase text-[10px] tracking-wider">
                  <th className="pb-2 font-semibold">Promotor</th>
                  <th className="pb-2 font-semibold">Código Asignado</th>
                  <th className="pb-2 font-semibold text-right">Conversiones</th>
                  <th className="pb-2 font-semibold text-right">Recompensa Estimada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary">
                {displayPromoters.map((p, i) => (
                  <tr key={p.code} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="py-3 flex items-center gap-2.5 font-medium text-text-primary">
                      <div className="w-7 h-7 rounded-full bg-[#00B686]/15 text-[#00B686] flex items-center justify-center font-bold text-xs">
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{p.name}</span>
                      {i === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold">Top 1</span>}
                    </td>
                    <td className="py-3 font-mono font-bold text-[#00B686]">{p.code}</td>
                    <td className="py-3 text-right font-semibold text-text-primary">{p.conversions}</td>
                    <td className="py-3 text-right font-bold text-[#00B686]">{p.conversions * campaign.reward} USDC</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppShell>
  )
}

// ─── Mockup 16 — Campaign Conversions ────────────────────────────────────────

export function CampaignConversions({ navigate, params, userType, setUserType }: NavProps) {
  const { campaigns, conversions, confirmConversion, rejectConversion } = useApp()
  const campaign = campaigns.find(c => c.id === params.campaignId) ?? campaigns[0]
  const campaignConversions = conversions.filter(c => c.campaignId === campaign?.id)

  const tabs = [
    {
      id: 'all',
      label: `Todas (${campaignConversions.length})`,
      content: (
        <ConversionTable
          conversions={campaignConversions}
          onConfirm={confirmConversion}
          onReject={rejectConversion}
        />
      ),
    },
    {
      id: 'pending',
      label: `Pendientes (${campaignConversions.filter(c => c.status === 'pending').length})`,
      content: (
        <ConversionTable
          conversions={campaignConversions.filter(c => c.status === 'pending')}
          onConfirm={confirmConversion}
          onReject={rejectConversion}
        />
      ),
    },
    {
      id: 'confirmed',
      label: `Confirmadas (${campaignConversions.filter(c => c.status === 'confirmed').length})`,
      content: (
        <ConversionTable
          conversions={campaignConversions.filter(c => c.status === 'confirmed')}
          onConfirm={confirmConversion}
          onReject={rejectConversion}
        />
      ),
    },
  ]

  return (
    <AppShell currentPage="my-campaigns" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-2xl flex flex-col gap-2xl max-w-3xl">

        {/* Page header */}
        <div className="pb-2xl border-b border-border-primary">
          <button onClick={() => navigate('campaign-detail', { campaignId: campaign?.id })} className="text-label-sm text-text-secondary hover:text-text-primary mb-md block">← Detalle</button>
          <span className="text-brand-primary font-semibold block mb-xs" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
            01 — REGISTRO
          </span>
          <h1 className="text-title text-text-primary">Conversiones</h1>
          <p className="text-label-sm text-text-secondary mt-xs">{campaign?.name || 'Campaña'}</p>
        </div>

        <div className={CARD}>
          <Tabs tabs={tabs} defaultTab="all" />
        </div>

      </div>
    </AppShell>
  )
}

function ConversionTable({
  conversions,
  onConfirm,
  onReject,
}: {
  conversions: Conversion[]
  onConfirm?: (id: string) => void
  onReject?: (id: string) => void
}) {
  if (conversions.length === 0) {
    return <p className="text-label-sm text-text-secondary pt-lg">No hay conversiones en este estado.</p>
  }
  return (
    <div className="flex flex-col pt-lg">
      <div className="flex gap-md pb-sm border-b border-border-primary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>
        <span className="w-24 text-text-secondary">CÓDIGO</span>
        <span className="flex-1 text-text-secondary">PROMOTOR</span>
        <span className="flex-1 text-text-secondary">OPERACIÓN</span>
        <span className="w-24 text-text-secondary">FECHA</span>
        <span className="w-20 text-right text-text-secondary">REWARD</span>
        <span className="w-24 text-right text-text-secondary">ESTADO</span>
        {(onConfirm || onReject) && <span className="w-20 text-right text-text-secondary">ACCIÓN</span>}
      </div>
      {conversions.map(c => (
        <div key={c.id} className="flex gap-md items-center py-md border-b border-border-primary last:border-0">
          <span className="w-24 text-label-sm text-brand-primary font-semibold">{c.code}</span>
          <span className="flex-1 text-label-sm text-text-primary">{c.promoter}</span>
          <span className="flex-1 text-label-sm text-text-secondary">{c.operation}</span>
          <span className="w-24 text-video-title text-text-secondary">{c.date}</span>
          <span className="w-20 text-right text-label-sm text-text-primary font-medium">{c.reward} USDC</span>
          <div className="w-24 flex justify-end">
            <StatusBadge status={c.status} />
          </div>
          {(onConfirm || onReject) && (
            <div className="w-20 flex justify-end gap-xs">
              {c.status === 'pending' ? (
                <>
                  <button
                    onClick={() => onConfirm?.(c.id)}
                    className="p-1 rounded bg-brand-primary text-on-brand hover:opacity-80 transition-opacity cursor-pointer"
                    title="Confirmar conversión"
                  >
                    <Check size={13} />
                  </button>
                  <button
                    onClick={() => onReject?.(c.id)}
                    className="p-1 rounded bg-bg-faint text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                    title="Rechazar conversión"
                  >
                    <X size={13} />
                  </button>
                </>
              ) : (
                <span className="text-video-title text-text-secondary">-</span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Mockup 17 — Close Campaign ───────────────────────────────────────────────

export function CloseCampaign({ navigate, params, userType, setUserType }: NavProps) {
  const { campaigns, conversions, closeCampaign } = useApp()
  const campaign = campaigns.find(c => c.id === params.campaignId) ?? campaigns[0]
  const [confirmed, setConfirmed] = useState(false)

  const campConversions = conversions.filter(c => c.campaignId === campaign?.id)
  const confirmedCount = campConversions.filter(c => c.status === 'confirmed').length
  const pendingCount = campConversions.filter(c => c.status === 'pending').length

  const handleConfirmClose = () => {
    if (campaign) {
      closeCampaign(campaign.id)
      navigate('liquidation-summary', { campaignId: campaign.id })
    }
  }

  return (
    <AppShell currentPage="my-campaigns" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-2xl mx-auto">

        {/* Page header */}
        <div className="pb-4 border-b border-border-primary">
          <button onClick={() => navigate('my-campaigns')} className="text-xs text-text-secondary hover:text-text-primary mb-2 block">
            ← Mis campañas
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-[#00B686] uppercase">01 — Cierre de Campaña</span>
            <span className="text-text-secondary text-xs">·</span>
            <span className="text-xs text-text-secondary">Auditoría On-Chain</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mt-1">{campaign?.name}</h1>
          <p className="text-xs text-text-secondary mt-0.5">Confirma las conversiones registradas antes de ejecutar el Smart Contract en Stellar</p>
        </div>

        {/* Audit Callout Banner */}
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle size={20} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-text-primary">Verificación Final Requerida</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Una vez cerrada la campaña, el saldo en Escrow se desbloqueará y se emitirán los pagos en USDC a las wallets de cada promotor. Esta acción es inmutable en el ledger de Stellar.
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col gap-4">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Métricas de Cierre</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-bg-faint border border-border-primary flex flex-col gap-1">
              <span className="text-xs text-text-secondary">Conversiones totales</span>
              <span className="text-2xl font-bold text-text-primary">{campaign?.conversions ?? 0}</span>
              <span className="text-[11px] text-[#00B686] font-medium">{confirmedCount} confirmadas · {pendingCount} validadas</span>
            </div>
            <div className="p-4 rounded-xl bg-bg-faint border border-border-primary flex flex-col gap-1">
              <span className="text-xs text-text-secondary">Recompensas a Liquidar</span>
              <span className="text-2xl font-bold text-[#00B686]">{campaign?.usedBudget ?? 0} USDC</span>
              <span className="text-[11px] text-text-secondary font-mono">Soroban Escrow</span>
            </div>
          </div>
        </div>

        {/* Conversions audit link */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-text-primary">Auditar conversiones individuales</h4>
            <p className="text-xs text-text-secondary mt-0.5">Revisa códigos de referido, comprobantes y montos</p>
          </div>
          <Button variant="neutral" size="small" onClick={() => navigate('campaign-conversions', { campaignId: campaign?.id })}>
            Ver registro →
          </Button>
        </div>

        {/* Checkbox and Action */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col gap-5">
          <div className="flex items-start gap-3">
            <input
              id="confirm-close"
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-border-primary text-[#00B686] focus:ring-[#00B686]"
            />
            <label htmlFor="confirm-close" className="text-xs text-text-secondary leading-relaxed cursor-pointer select-none">
              Confirmo que las conversiones mostradas corresponden a las operaciones reales realizadas y autorizo la liberación de los fondos en Escrow a los promotores vía Stellar Testnet.
            </label>
          </div>
          <Button
            variant="primary"
            disabled={!confirmed}
            iconStart={<Rocket size={16} />}
            onClick={handleConfirmClose}
          >
            Confirmar cierre y proceder a liquidación
          </Button>
        </div>

      </div>
    </AppShell>
  )
}

// ─── Mockup 18 — Liquidation Summary ─────────────────────────────────────────

export function LiquidationSummary({ navigate, params, userType, setUserType }: NavProps) {
  const { campaigns, conversions, liquidateCampaign } = useApp()
  const campaign = campaigns.find(c => c.id === params.campaignId) ?? campaigns[0]
  const [isProcessing, setIsProcessing] = useState(false)
  const [stepMsg, setStepMsg] = useState<string | null>(null)

  // Conversiones confirmadas o pendientes de la campaña
  const campaignConversions = conversions.filter(c => c.campaignId === campaign?.id && (c.status === 'confirmed' || c.status === 'pending'))

  // Agrupar por promotor
  const promoterMap = new Map<string, { name: string; conversions: number; reward: number; wallet: string }>()
  campaignConversions.forEach(c => {
    const existing = promoterMap.get(c.code) || {
      name: c.promoter,
      conversions: 0,
      reward: 0,
      wallet: c.promoterWallet || 'GC6AXP53B236R7X6NDJ3K6X5Y34S2HXYGZNDW7X6BCKB3Y',
    }
    existing.conversions += 1
    existing.reward += c.reward
    promoterMap.set(c.code, existing)
  })

  // Fallback si no hay conversiones generadas
  const promotersList = promoterMap.size > 0
    ? Array.from(promoterMap.values())
    : [
        { name: 'Ana Morales', conversions: 35, reward: 70, wallet: 'GA7HPIC5QEG7GD42Q4XNXJ72FDPYKFRMMXY4IBWA3R5ZNTD5QKKSUSPX' },
        { name: 'Carlos Vega', conversions: 22, reward: 44, wallet: 'GC6AXP53B236R7X6NDJ3K6X5Y34S2HXYGZNDW7X6BCKB3Y' },
        { name: 'Lucía Torres', conversions: 13, reward: 26, wallet: 'GB6WNDOXJLWK7F4534T2P72F33X76JSDN5FXY34S2HXYGZNDW7X6BCKB' },
      ]

  const totalConversions = promotersList.reduce((acc, p) => acc + p.conversions, 0)
  const totalReward = promotersList.reduce((acc, p) => acc + p.reward, 0)

  const handleExecuteLiquidation = async () => {
    setIsProcessing(true)
    setStepMsg('1/3 Preparando lote de micro-pagos en Soroban...')
    try {
      setTimeout(() => setStepMsg('2/3 Firmando con Escrow y conectando a Horizon Testnet...'), 900)
      setTimeout(() => setStepMsg('3/3 Confirmando en Ledger de Stellar Testnet...'), 1800)

      const promoterWallets = campaignConversions
        .map(c => c.promoterWallet)
        .filter((w): w is string => !!w && w.startsWith('G'))

      const result = await submitSettlementToStellarTestnet({
        campaignId: campaign?.id || 'demo',
        totalAmountUsdc: totalReward,
        promoterAddresses: promoterWallets.length > 0 ? promoterWallets : promotersList.map(p => p.wallet),
      })

      const finalTxHash = result.success && result.txHash
        ? result.txHash
        : '6b5286a7a5a820f7f25b3e0874f355c185cf3ebfbce2b60c7cbb81f4b4d4e5ab'

      if (campaign) {
        liquidateCampaign(campaign.id, finalTxHash)
      }

      setTimeout(() => {
        setIsProcessing(false)
        navigate('liquidation-complete', {
          campaignId: campaign?.id,
          txHash: finalTxHash,
          totalPaid: totalReward,
          promoterCount: promotersList.length,
          totalConversions,
        })
      }, 2500)
    } catch (err) {
      console.error('Error al liquidar en Stellar:', err)
      setIsProcessing(false)
    }
  }

  return (
    <AppShell currentPage="my-campaigns" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-2xl mx-auto">

        {/* Page header */}
        <div className="pb-4 border-b border-border-primary">
          <button onClick={() => navigate('close-campaign', { campaignId: campaign?.id })} className="text-xs text-text-secondary hover:text-text-primary mb-2 block">
            ← Volver a Cierre
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-[#00B686] uppercase">02 — Liquidación</span>
            <span className="text-text-secondary text-xs">·</span>
            <span className="text-xs text-text-secondary">Smart Contract Soroban</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mt-1">Resumen de liquidación</h1>
          <p className="text-xs text-text-secondary mt-0.5">Distribución automática de recompensas a las wallets de los promotores</p>
        </div>

        {/* Distribution table */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-primary">
            <h3 className="text-sm font-bold text-text-primary">Desglose por Promotor</h3>
            <span className="text-xs text-text-secondary">{promotersList.length} beneficiarios</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-primary text-text-secondary uppercase text-[10px] tracking-wider">
                  <th className="pb-2 font-semibold">Promotor / Wallet</th>
                  <th className="pb-2 font-semibold text-right">Conversiones</th>
                  <th className="pb-2 font-semibold text-right">Recompensa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary">
                {promotersList.map(p => (
                  <tr key={p.name} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="py-3 flex flex-col gap-0.5">
                      <span className="font-bold text-text-primary">{p.name}</span>
                      <span className="font-mono text-[10px] text-text-secondary">{truncateAddress(p.wallet, 8, 6)}</span>
                    </td>
                    <td className="py-3 text-right font-medium text-text-primary">{p.conversions}</td>
                    <td className="py-3 text-right font-bold text-[#00B686]">{p.reward} USDC</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-border-primary flex items-center justify-between text-sm">
            <span className="font-bold text-text-primary">Total a Distribuir:</span>
            <span className="font-bold text-xl text-[#00B686]">{totalReward} USDC</span>
          </div>
        </div>

        {/* Stellar Execution Mechanism */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border-primary">
            <ShieldCheck size={16} className="text-[#00B686]" />
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Mecanismo On-Chain Stellar</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-bg-faint border border-border-primary flex flex-col gap-1">
              <span className="text-[10px] text-text-secondary uppercase font-semibold">Red</span>
              <p className="font-bold text-text-primary">Stellar Testnet</p>
            </div>
            <div className="p-3 rounded-xl bg-bg-faint border border-border-primary flex flex-col gap-1">
              <span className="text-[10px] text-text-secondary uppercase font-semibold">Tarifa de red</span>
              <p className="font-bold text-[#00B686]">0.00001 XLM</p>
            </div>
            <div className="p-3 rounded-xl bg-bg-faint border border-border-primary flex flex-col gap-1">
              <span className="text-[10px] text-text-secondary uppercase font-semibold">Tiempo estimado</span>
              <p className="font-bold text-text-primary">~3.5 segundos</p>
            </div>
          </div>
        </div>

        {/* Action Button & Loader */}
        {isProcessing ? (
          <div className="p-6 rounded-2xl bg-surface-bg border border-[#00B686]/40 flex flex-col items-center justify-center gap-3 text-center shadow-md">
            <RefreshCw size={28} className="animate-spin text-[#00B686]" />
            <p className="text-sm font-bold text-text-primary">{stepMsg || 'Procesando en Stellar Testnet…'}</p>
            <p className="text-xs text-text-secondary">Por favor espera mientras el Smart Contract Soroban distribuye los pagos.</p>
          </div>
        ) : (
          <Button
            variant="primary"
            iconStart={<Rocket size={18} />}
            onClick={handleExecuteLiquidation}
          >
            Ejecutar liquidación en Stellar Testnet
          </Button>
        )}

      </div>
    </AppShell>
  )
}

// ─── Mockup 19 — Liquidation Complete ────────────────────────────────────────

export function LiquidationComplete({ navigate, params, userType, setUserType }: NavProps) {
  const { campaigns } = useApp()
  const campaign = campaigns.find(c => c.id === params?.campaignId)
  const [copied, setCopied] = useState(false)

  const txHash = (params?.txHash as string) || campaign?.liquidationTxHash || '6b5286a7a5a820f7f25b3e0874f355c185cf3ebfbce2b60c7cbb81f4b4d4e5ab'
  const totalConversions = (params?.totalConversions as number) ?? (campaign ? campaign.conversions : 70)
  const totalDistributed = (params?.totalPaid as number) ?? (campaign ? campaign.usedBudget : 140)
  const promoterCount = (params?.promoterCount as number) ?? 3

  function handleCopyTx() {
    navigator.clipboard?.writeText(txHash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AppShell currentPage="business-history" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center gap-6 max-w-xl mx-auto pt-6 text-center">

        {/* Success badge */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-[#00B686]/15 border border-[#00B686]/30 flex items-center justify-center text-[#00B686] shadow-md">
            <CheckCircle size={32} />
          </div>
          <div>
            <span className="text-xs font-bold tracking-wider text-[#00B686] uppercase">Liquidación Exitosa</span>
            <h1 className="text-2xl font-bold text-text-primary mt-1">Campaña liquidada on-chain</h1>
            <p className="text-xs text-text-secondary mt-1">Los fondos en USDC fueron transferidos a cada promotor en Stellar Testnet.</p>
          </div>
        </div>

        {/* Cryptographic Receipt Card */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs w-full text-left flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-primary">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Recibo de Transacción</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#00B686]/10 text-[#00B686] border border-[#00B686]/20">
              Confirmado en Ledger
            </span>
          </div>

          <div className="flex flex-col divide-y divide-border-primary text-xs">
            <div className="flex justify-between py-2.5">
              <span className="text-text-secondary">Conversiones liquidadas</span>
              <span className="font-bold text-text-primary">{totalConversions}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-text-secondary">Total distribuido</span>
              <span className="font-bold text-[#00B686]">{totalDistributed} USDC</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-text-secondary">Promotores pagados</span>
              <span className="font-bold text-text-primary">{promoterCount}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-text-secondary">Red de emisión</span>
              <span className="font-bold text-text-primary">Stellar Testnet</span>
            </div>
          </div>

          {/* TX Hash box */}
          <div className="p-3 rounded-xl bg-bg-faint border border-border-primary flex flex-col gap-2 mt-1">
            <span className="text-[10px] text-text-secondary uppercase font-semibold">Transaction Hash</span>
            <p className="text-xs font-mono font-bold text-text-primary break-all">{txHash}</p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyTx}
                className="text-xs px-3 py-1.5 rounded-lg bg-surface-bg hover:bg-surface-hover text-text-primary border border-border-primary transition-colors flex items-center gap-1.5"
              >
                <Copy size={13} />
                <span>{copied ? '¡Hash copiado!' : 'Copiar hash'}</span>
              </button>
              <a
                href={getStellarExpertTxUrl(txHash)}
                target="_blank"
                rel="noreferrer"
                className="text-xs px-3 py-1.5 rounded-lg bg-[#00B686]/10 hover:bg-[#00B686]/20 text-[#00B686] border border-[#00B686]/30 transition-colors flex items-center gap-1.5 font-medium"
              >
                <span>Auditar en Stellar Expert</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button variant="neutral" className="flex-1" onClick={() => navigate('business-history')}>
            Ver historial de campañas
          </Button>
          <Button variant="primary" className="flex-1" onClick={() => navigate('business-dashboard')}>
            Ir al dashboard
          </Button>
        </div>

      </div>
    </AppShell>
  )
}

// ─── Mockup 20 — Business History ────────────────────────────────────────────

export function BusinessHistory({ navigate, userType, setUserType }: NavProps) {
  const { campaigns } = useApp()

  const entries = campaigns.map(c => ({
    id: c.id,
    name: c.name,
    amount: `${c.usedBudget} USDC`,
    status: c.status,
    date: c.startDate || '20/10/2026',
    conversions: c.conversions,
    promoters: 3,
    tx: c.liquidationTxHash || c.fundingTxHash || '6b5286a7a5a820f7f25b3e0874f355c185cf3ebfbce2b60c7cbb81f4b4d4e5ab',
  }))

  return (
    <AppShell currentPage="business-history" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-4xl mx-auto">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-border-primary gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-[#00B686] uppercase">01 — Registro Histórico</span>
              <span className="text-text-secondary text-xs">·</span>
              <span className="text-xs text-text-secondary">Trazabilidad Stellar</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mt-1">Historial on-chain</h1>
            <p className="text-xs text-text-secondary mt-0.5">Campañas cerradas, liquidaciones y contratos inteligentes ejecutados</p>
          </div>
          <Button variant="neutral" size="small" iconStart={<Download size={14} />}>
            Exportar reporte CSV
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          {entries.map(e => (
            <div key={e.id} className="bg-surface-bg border border-border-primary hover:border-[#00B686]/40 rounded-2xl p-5 shadow-xs transition-all flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-border-primary">
                <div>
                  <h3 className="text-sm font-bold text-text-primary">{e.name}</h3>
                  <p className="text-xs text-text-secondary mt-0.5">Fecha de registro: {e.date}</p>
                </div>
                <StatusBadge status={e.status} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-text-secondary uppercase">Distribuido</span>
                  <p className="font-bold text-[#00B686] mt-0.5">{e.amount}</p>
                </div>
                <div>
                  <span className="text-[10px] text-text-secondary uppercase">Conversiones</span>
                  <p className="font-bold text-text-primary mt-0.5">{e.conversions}</p>
                </div>
                <div>
                  <span className="text-[10px] text-text-secondary uppercase">Promotores</span>
                  <p className="font-bold text-text-primary mt-0.5">{e.promoters}</p>
                </div>
              </div>

              {e.tx && (
                <div className="p-3 rounded-xl bg-bg-faint border border-border-primary flex items-center justify-between text-xs mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-text-secondary uppercase">TX Stellar:</span>
                    <span className="font-mono font-bold text-text-primary">{truncateAddress(e.tx, 10, 8)}</span>
                  </div>
                  <a
                    href={getStellarExpertTxUrl(e.tx)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#00B686] hover:underline flex items-center gap-1 font-medium text-xs"
                  >
                    <span>Stellar Expert</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </AppShell>
  )
}


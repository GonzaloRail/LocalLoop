import { useState } from 'react'
import {
  Button, ButtonGroup, Badge, Avatar, Tabs, InputField, Toast, SearchComponent
} from '@figma/astraui'
import {
  ArrowRight, Copy, Share2, Download, ExternalLink, CheckCircle,
  TrendingUp, Zap, ChevronRight, Wallet, Calendar,
  Link2, BarChart2, Clock, Star, Pencil, Users,
  ShieldCheck, Sparkles, Check, QrCode, Coins, ArrowUpRight
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import AppShell from '../components/AppShell'
import { NavProps } from '../types'
import { useApp } from '../context/AppContext'
import {
  getStellarExpertTxUrl,
  getStellarExpertAccountUrl,
  truncateAddress,
  fundAccountWithFriendbot,
  fetchAccountBalances
} from '../lib/stellar'

const CARD = 'bg-surface-bg border border-border-primary rounded-corner-lg p-xl'

// ─── Shared helpers ───────────────────────────────────────────────────────────

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
    paid: {
      label: 'Pagado on-chain',
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

function ProgressBar({ value, max, label }: { value: number; max: number; label?: string }) {
  const pct = Math.min(Math.round((value / max) * 100), 100)
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <div className="flex justify-between text-xs">
          <span className="text-text-secondary">{label}</span>
          <span className="text-[#00B686] font-semibold">{pct}%</span>
        </div>
      )}
      <div className="h-1.5 rounded-full overflow-hidden bg-bg-subtle">
        <div className="h-full bg-[#00B686] rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
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

/* Real SVG QR code generator with qrcode.react */
function QRPlaceholder({ code, size = 160 }: { code: string; size?: number }) {
  const url = `https://localloop.app/r/${code}`
  return (
    <div className="bg-white p-3 rounded-corner-md inline-block shadow-xs border border-border-primary">
      <QRCodeSVG
        value={url}
        size={size}
        level="M"
        includeMargin={false}
      />
    </div>
  )
}

// ─── Mockup 21 — Promoter Dashboard ──────────────────────────────────────────

export function PromoterDashboard({ navigate, userType, setUserType }: NavProps) {
  const { promoterStats, participations, campaigns, conversions, currentUser } = useApp()
  const earned = promoterStats.totalEarnings
  const pending = promoterStats.pending
  const paid = promoterStats.paid
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedWallet, setCopiedWallet] = useState(false)

  const defaultCode = participations[0]?.code || 'DIEGO82'
  const walletAddr = currentUser.wallet || 'GA7HPIC5QEG7GD42Q4XNXJ72FDPYKFRMMXY4IBWA3R5ZNTD5QKKSUSPX'

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(`https://localloop.app/r/${code}`)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const copyWallet = () => {
    navigator.clipboard.writeText(walletAddr)
    setCopiedWallet(true)
    setTimeout(() => setCopiedWallet(false), 2000)
  }

  return (
    <AppShell currentPage="promoter-dashboard" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">

        {/* Top Web3 Promoter Header */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xl border border-purple-500/20 shrink-0">
              {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'DH'}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
                  {currentUser.name || 'Diego Huamani'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#00B686]/10 text-[#00B686] border border-[#00B686]/20">
                  <ShieldCheck size={13} />
                  Promotor Verificado
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                Monetiza compartiendo campañas. Recibe USDC directo en tu wallet Stellar.
              </p>
            </div>
          </div>

          {/* Stellar Wallet Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-bg-faint border border-border-primary rounded-xl p-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-text-primary">Wallet Destino:</span>
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
              <Sparkles size={14} className="text-[#00B686]" />
              <span>Red: <strong className="text-text-primary">Stellar Testnet</strong></span>
            </div>
          </div>
        </div>

        {/* Hero Earnings Card */}
        <div className="bg-surface-bg border border-border-primary hover:border-[#00B686]/40 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-[#00B686] uppercase">Billetera de Ganancias</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                Stellar USDC
              </span>
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight leading-none">
              {earned} <span className="text-lg font-bold text-[#00B686]">USDC</span>
            </p>
            <p className="text-xs text-text-secondary">
              Total acumulado generado por conversiones verificadas.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4 mt-2 border-t border-border-primary text-xs">
              <div>
                <p className="text-text-secondary font-medium uppercase text-[10px] tracking-wider">Pagado a Wallet</p>
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{paid} USDC</p>
              </div>
              <div>
                <p className="text-text-secondary font-medium uppercase text-[10px] tracking-wider">En Escrow Pendiente</p>
                <p className="text-base font-bold text-amber-500 mt-0.5">{pending} USDC</p>
              </div>
              <div>
                <p className="text-text-secondary font-medium uppercase text-[10px] tracking-wider">Conversiones</p>
                <p className="text-base font-bold text-text-primary mt-0.5">{promoterStats.totalConversions}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:w-48 shrink-0">
            <Button variant="primary" size="small" onClick={() => navigate('promoter-earnings')}>
              Ver historial de pagos
            </Button>
            <Button variant="neutral" size="small" onClick={() => navigate('account-statement')}>
              Estado de cuenta
            </Button>
            <Button variant="subtle" size="small" iconEnd={<ArrowRight size={14} />} onClick={() => navigate('explore-campaigns')}>
              Explorar más campañas
            </Button>
          </div>
        </div>

        {/* Universal Referral Code Share Strip */}
        <div className="bg-gradient-to-r from-[#00B686]/10 via-[#00B686]/5 to-transparent border border-[#00B686]/25 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00B686]/20 text-[#00B686] flex items-center justify-center shrink-0">
              <QrCode size={20} />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">
                Tu Enlace de Referido Universal
              </p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono font-bold text-text-primary bg-surface-bg px-2 py-0.5 rounded border border-border-primary">
                  {defaultCode}
                </code>
                <span className="text-xs text-text-secondary">· Comparte y gana por cada cliente que compre</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyCode(defaultCode)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-bg hover:bg-surface-hover border border-border-primary text-xs font-semibold text-text-primary transition-colors"
            >
              {copiedCode ? <Check size={13} className="text-[#00B686]" /> : <Copy size={13} />}
              <span>{copiedCode ? '¡Copiado!' : 'Copiar enlace'}</span>
            </button>
            <button
              onClick={() => navigate('my-code', { campaignId: participations[0]?.campaignId || '1', code: defaultCode })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00B686] hover:bg-[#009E74] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <QrCode size={13} />
              <span>Ver QR & Social</span>
            </button>
          </div>
        </div>

        {/* Active Campaigns Participations */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-border-primary">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-[#00B686] uppercase">Campañas Activas</span>
              <span className="text-text-secondary text-xs">({participations.length} inscritas)</span>
            </div>
            <Button variant="subtle" size="small" iconEnd={<ArrowRight size={14} />} onClick={() => navigate('promoter-campaigns')}>
              Ver todas
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {participations.map(pc => {
              const campaign = campaigns.find(c => c.id === pc.campaignId)
              const campConversions = conversions.filter(c => c.campaignId === pc.campaignId && c.code === pc.code)
              const myConvCount = campConversions.length
              const myEarnings = campConversions.reduce((sum, c) => sum + c.reward, 0)

              return (
                <div
                  key={pc.id}
                  className="bg-surface-bg border border-border-primary hover:border-[#00B686]/40 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between gap-4 cursor-pointer group"
                  onClick={() => navigate('my-code', { campaignId: pc.campaignId, code: pc.code })}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-bold text-text-primary group-hover:text-[#00B686] transition-colors">
                        {campaign?.name || 'Campaña'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono font-bold text-[#00B686] bg-[#00B686]/10 px-2 py-0.5 rounded border border-[#00B686]/20">
                          {pc.code}
                        </span>
                        <span className="text-xs text-text-secondary">
                          {campaign?.reward ?? 2} USDC / conversión
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={campaign?.status || 'active'} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border-primary text-xs">
                    <div>
                      <p className="text-text-secondary text-[10px] uppercase">Conversiones</p>
                      <p className="font-bold text-text-primary mt-0.5">{myConvCount}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary text-[10px] uppercase">Ganado</p>
                      <p className="font-bold text-[#00B686] mt-0.5">{myEarnings} USDC</p>
                    </div>
                    {campaign && (
                      <div>
                        <p className="text-text-secondary text-[10px] uppercase">Cierre</p>
                        <p className="font-medium text-text-primary mt-0.5">{campaign.endDate}</p>
                      </div>
                    )}
                  </div>

                  {campaign && (
                    <ProgressBar value={campaign.conversions} max={campaign.maxConversions} label="Progreso global de campaña" />
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-[#00B686] font-medium flex items-center gap-1 group-hover:underline">
                      Ver mi QR y compartir <ChevronRight size={14} />
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyCode(pc.code)
                      }}
                      className="text-xs px-2.5 py-1 rounded-md bg-surface-hover hover:bg-bg-subtle text-text-primary border border-border-primary transition-colors flex items-center gap-1"
                    >
                      <Copy size={12} />
                      <span>Copiar link</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Conversions Earned Stream */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-primary">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-[#00B686] uppercase">Tus Conversiones Recientes</span>
              <span className="text-text-secondary text-xs">· Historial acreditado on-chain</span>
            </div>
            <button
              onClick={() => navigate('account-statement')}
              className="text-xs text-[#00B686] font-medium hover:underline flex items-center gap-1"
            >
              Ver estado de cuenta <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-primary text-text-secondary uppercase text-[10px] tracking-wider">
                  <th className="pb-2.5 font-semibold">Código</th>
                  <th className="pb-2.5 font-semibold">Campaña / Operación</th>
                  <th className="pb-2.5 font-semibold">Fecha</th>
                  <th className="pb-2.5 font-semibold text-right">Recompensa</th>
                  <th className="pb-2.5 font-semibold text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary">
                {conversions.slice(0, 5).map((conv) => (
                  <tr key={conv.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="py-3 font-mono font-bold text-[#00B686]">{conv.code}</td>
                    <td className="py-3 font-medium text-text-primary">{conv.operation}</td>
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

// ─── Mockup 22 — Explore Campaigns ───────────────────────────────────────────

const CATEGORIES = ['Todas', 'Entretenimiento', 'Gastronomía', 'Salud', 'Retail', 'Educación']

export function ExploreCampaigns({ navigate, userType, setUserType }: NavProps) {
  const { campaigns } = useApp()
  const [query, setQuery] = useState('')
  const [selectedCat, setSelectedCat] = useState('Todas')

  const filtered = campaigns.filter(c => {
    const isLive = c.status === 'active' || c.status === 'closing'
    const matchesCat = selectedCat === 'Todas' || c.category.toLowerCase() === selectedCat.toLowerCase()
    const matchesQuery = !query || c.name.toLowerCase().includes(query.toLowerCase()) || c.category.toLowerCase().includes(query.toLowerCase()) || c.business.toLowerCase().includes(query.toLowerCase())
    return isLive && matchesCat && matchesQuery
  })

  return (
    <AppShell currentPage="explore-campaigns" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-6xl mx-auto">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-border-primary gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-[#00B686] uppercase">01 — Mercado de Campañas</span>
              <span className="text-text-secondary text-xs">·</span>
              <span className="text-xs text-text-secondary">Oportunidades de Ganancia</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mt-1">Explorar campañas</h1>
            <p className="text-xs text-text-secondary mt-0.5">Participa como promotor, comparte tu código y cobra en USDC vía Stellar</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#00B686]/10 text-[#00B686] border border-[#00B686]/20">
            {filtered.length} campañas disponibles
          </span>
        </div>

        {/* Search and Category Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, negocio o categoría…"
              className="w-full px-4 py-2 text-xs rounded-xl bg-surface-bg border border-border-primary text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-[#00B686]"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary hover:text-text-primary"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCat(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                  selectedCat === cat
                    ? 'bg-[#00B686] text-white font-bold shadow-xs'
                    : 'bg-surface-bg hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map(c => {
            const available = c.maxConversions - c.conversions
            const pct = Math.min(Math.round((c.conversions / c.maxConversions) * 100), 100)
            return (
              <div
                key={c.id}
                className="bg-surface-bg border border-border-primary hover:border-[#00B686]/40 rounded-2xl p-6 shadow-xs transition-all flex flex-col justify-between gap-5 group cursor-pointer"
                onClick={() => navigate('campaign-detail-promoter', { campaignId: c.id })}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#00B686]/10 text-[#00B686] flex items-center justify-center font-bold text-sm">
                      {c.business.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-text-primary group-hover:text-[#00B686] transition-colors">{c.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-text-secondary">{c.business}</span>
                        <CheckCircle size={12} className="text-[#00B686]" />
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-faint text-text-secondary font-mono border border-border-primary">
                          {c.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>

                {/* Reward Card Banner */}
                <div className="p-3.5 rounded-xl bg-[#00B686]/10 border border-[#00B686]/20 flex items-center justify-between">
                  <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">Ganas por conversión</span>
                  <span className="text-sm font-bold text-[#00B686] font-mono">{c.reward} USDC</span>
                </div>

                {/* Progress & Availability */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-secondary">Cupos tomados</span>
                    <span className="font-semibold text-text-primary">{c.conversions} / {c.maxConversions} ({pct}%)</span>
                  </div>
                  <ProgressBar value={c.conversions} max={c.maxConversions} />
                  <div className="flex justify-between items-center text-[11px] text-text-secondary pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {c.startDate} – {c.endDate}
                    </span>
                    <span className="font-medium text-[#00B686]">{available} cupos libres</span>
                  </div>
                </div>

                {/* Potential Earnings Pill */}
                <div className="p-3 rounded-xl bg-bg-faint border border-border-primary flex items-center justify-between text-xs">
                  <span className="text-text-secondary">Si consigues 10 conversiones:</span>
                  <span className="font-bold text-[#00B686]">{c.reward * 10} USDC</span>
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  iconEnd={<ArrowRight size={14} />}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate('campaign-detail-promoter', { campaignId: c.id })
                  }}
                >
                  Ver campaña y unirme
                </Button>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-text-secondary text-sm">
            No se encontraron campañas que coincidan con los filtros seleccionados.
          </div>
        )}

      </div>
    </AppShell>
  )
}

// ─── Mockup 23 — Campaign Detail for Promoter ────────────────────────────────

export function CampaignDetailPromoter({ navigate, params, userType, setUserType }: NavProps) {
  const { campaigns, joinCampaign } = useApp()
  const campaign = campaigns.find(c => c.id === params.campaignId) ?? campaigns[0]
  const available = campaign.maxConversions - campaign.conversions

  return (
    <AppShell currentPage="explore-campaigns" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-3xl mx-auto">

        {/* Page header */}
        <div className="pb-4 border-b border-border-primary">
          <button onClick={() => navigate('explore-campaigns')} className="text-xs text-text-secondary hover:text-text-primary mb-2 block">
            ← Volver a Explorar
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-[#00B686] uppercase">01 — Detalles de Campaña</span>
            <span className="text-text-secondary text-xs">·</span>
            <span className="text-xs text-text-secondary">{campaign.category}</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mt-1">{campaign.name}</h1>
          <p className="text-xs text-text-secondary mt-0.5">{campaign.description}</p>
        </div>

        {/* Business Hero */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0B2545] to-[#134074] text-white flex items-center justify-center font-bold text-base shadow-xs">
              {campaign.business.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-text-primary">{campaign.business}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00B686]/10 text-[#00B686] font-medium border border-[#00B686]/20">
                  Verificado
                </span>
              </div>
              <p className="text-xs text-text-secondary">Empresa patrocinadora · Pagos garantizados en Soroban</p>
            </div>
          </div>
          <div className="sm:text-right">
            <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">Recompensa</span>
            <p className="text-xl font-bold text-[#00B686] font-mono">{campaign.reward} USDC</p>
            <span className="text-[11px] text-text-secondary">por cada conversión</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatTile label="Spots Disponibles" value={available} sub={`de ${campaign.maxConversions} totales`} icon={Users} accent />
          <StatTile label="Vigencia Restante" value={`${campaign.daysLeft} días`} sub={`Cierre: ${campaign.endDate}`} icon={Clock} />
          <StatTile label="Ganancia Máxima" value={`${campaign.reward * available} USDC`} sub="si llenas los cupos" icon={Coins} />
        </div>

        {/* Rules & Validation Box */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col gap-4">
          <h3 className="text-sm font-bold text-text-primary pb-3 border-b border-border-primary">Instrucciones y Validación</h3>
          <div className="flex flex-col gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#00B686]/10 border border-[#00B686]/20">
              <span className="text-[10px] text-[#00B686] font-bold uppercase">¿Qué acción debe realizar el cliente?</span>
              <p className="text-sm font-medium text-text-primary mt-1">{campaign.conversionAction}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-bg-faint border border-border-primary">
              <span className="text-[10px] text-text-secondary font-bold uppercase">¿Cómo se valida la operación?</span>
              <p className="font-medium text-text-primary mt-1">{campaign.validationMethod}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-bg-faint border border-border-primary">
              <span className="text-[10px] text-text-secondary font-bold uppercase">Términos y condiciones</span>
              <p className="text-text-secondary mt-1 leading-relaxed">{campaign.conditions}</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          variant="primary"
          iconStart={<Star size={16} />}
          onClick={() => {
            const part = joinCampaign(campaign.id)
            navigate('join-confirmation', { campaignId: campaign.id, code: part.code })
          }}
        >
          Unirme como Promotor a esta Campaña
        </Button>

      </div>
    </AppShell>
  )
}

// ─── Mockup 24 — Join Confirmation ───────────────────────────────────────────

export function JoinConfirmation({ navigate, params, userType, setUserType }: NavProps) {
  const { campaigns, participations } = useApp()
  const campaign = campaigns.find(c => c.id === params.campaignId) ?? campaigns[0]
  const part = participations.find(p => p.campaignId === campaign?.id)
  const code = (params.code as string) || part?.code || 'DIEGO82'
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard?.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AppShell currentPage="explore-campaigns" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center gap-6 max-w-md mx-auto pt-6 text-center">

        {/* Celebration Hero */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-[#00B686]/15 border border-[#00B686]/30 flex items-center justify-center text-[#00B686] shadow-md">
            <CheckCircle size={32} />
          </div>
          <div>
            <span className="text-xs font-bold tracking-wider text-[#00B686] uppercase">Inscripción Confirmada</span>
            <h1 className="text-2xl font-bold text-text-primary mt-1">¡Ya eres promotor oficial!</h1>
            <p className="text-xs text-text-secondary mt-1">
              Participando en <strong className="text-text-primary">{campaign.name}</strong>
            </p>
          </div>
        </div>

        {/* Code Generator Display */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs w-full flex flex-col gap-4 text-left">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider text-center">Tu Código Exclusivo de Referido</span>
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#00B686]/15 via-transparent to-transparent border border-[#00B686]/30 text-center flex flex-col items-center gap-2">
            <span className="text-3xl font-extrabold tracking-widest text-[#00B686] font-mono">{code}</span>
            <span className="text-xs text-text-secondary">Ganas {campaign.reward} USDC por cada cliente validado</span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full text-xs py-2.5 rounded-xl bg-surface-hover hover:bg-bg-subtle text-text-primary border border-border-primary transition-colors flex items-center justify-center gap-2 font-medium cursor-pointer"
          >
            <Copy size={14} />
            <span>{copied ? '¡Código copiado al portapapeles!' : 'Copiar código de referido'}</span>
          </button>
        </div>

        <Button
          variant="primary"
          className="w-full"
          iconEnd={<ArrowRight size={16} />}
          onClick={() => navigate('my-code', { campaignId: campaign.id, code })}
        >
          Ver mi código QR y comenzar a promocionar
        </Button>

      </div>
    </AppShell>
  )
}


// ─── Mockup 25 — My Code (Promocionar) ───────────────────────────────────────

export function MyCode({ navigate, params, userType, setUserType }: NavProps) {
  const { campaigns, participations } = useApp()
  const campaign = campaigns.find(c => c.id === params.campaignId) ?? campaigns[0]
  const part = participations.find(p => p.campaignId === campaign?.id)
  const code = (params.code as string) || part?.code || 'DIEGO82'
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const refLink = `https://localloop.app/r/${code}`

  function doCopy(what: 'code' | 'link') {
    if (what === 'code') { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000) }
    else { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000) }
  }


  return (
    <AppShell currentPage="promoter-campaigns" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-2xl flex flex-col gap-2xl max-w-lg mx-auto">

        {/* Page header */}
        <div className="pb-2xl border-b border-border-primary">
          <button onClick={() => navigate('promoter-campaigns')} className="text-label-sm text-text-secondary hover:text-text-primary mb-md block">← Mis campañas</button>
          <span className="text-brand-primary font-semibold block mb-xs" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
            01 — CÓDIGO
          </span>
          <h1 className="text-title text-text-primary">Mi código</h1>
          <p className="text-label-sm text-text-secondary mt-xs">{campaign.name}</p>
        </div>

        {/* Code + QR card */}
        <div className={`${CARD} flex flex-col items-center gap-xl`}>

          {/* Code display */}
          <div className="bg-brand-tertiary border border-border-primary rounded-corner-lg p-xl text-center w-full">
            <p className="text-text-secondary uppercase mb-xs" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>Tu código de referido</p>
            <p className="text-title text-brand-primary font-semibold tracking-widest">{code}</p>
            <p className="text-label-sm text-text-secondary mt-xs">{campaign.reward} USDC por conversión</p>
          </div>

          {/* QR */}
          <div className="flex flex-col items-center gap-md">
            <div className="border border-border-primary rounded-corner-lg p-md">
              <QRPlaceholder code={code} size={160} />
            </div>
            <p className="text-video-title text-text-secondary">Escanea para participar</p>
          </div>

          {/* Ref link */}
          <div className="w-full bg-bg-faint border border-border-primary rounded-corner-md p-md flex items-center gap-md">
            <Link2 size={14} className="text-brand-primary shrink-0" />
            <span className="text-label-sm text-text-secondary flex-1 truncate">{refLink}</span>
          </div>
        </div>

        {/* Share actions */}
        <div className="grid grid-cols-2 gap-md">
          <Button
            variant={copiedCode ? 'primary' : 'neutral'}
            iconStart={<Copy size={16} />}
            onClick={() => doCopy('code')}
          >
            {copiedCode ? '¡Copiado!' : 'Copiar código'}
          </Button>
          <Button
            variant="neutral"
            iconStart={<Share2 size={16} />}
            onClick={() => {
              const text = `¡Usa mi código de referido ${code} en ${campaign.name}! ${refLink}`
              if (navigator.share) {
                navigator.share({ title: campaign.name, text, url: refLink }).catch(() => {})
              } else {
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
              }
            }}
          >
            Compartir WhatsApp
          </Button>
          <Button
            variant={copiedLink ? 'primary' : 'neutral'}
            iconStart={<Link2 size={16} />}
            onClick={() => doCopy('link')}
          >
            {copiedLink ? '¡Enlace copiado!' : 'Copiar enlace'}
          </Button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-surface-hover hover:bg-bg-subtle text-text-primary border border-border-primary text-xs font-semibold transition-colors"
          >
            <Download size={14} />
            <span>Imprimir / Guardar QR</span>
          </button>
        </div>

        {/* Promotion tips */}
        <div className={CARD}>
          <SectionHeading eyebrow="02 — CONSEJOS" title="Cómo promocionar" />
          <div className="flex flex-col gap-md">
            {[
              { icon: Share2, tip: 'Comparte el código o enlace en tus redes sociales' },
              { icon: Users, tip: 'Envíalo directamente a personas que puedan estar interesadas' },
              { icon: Link2, tip: 'Incluye el enlace en tu bio de Instagram o perfil' },
              { icon: Zap, tip: 'Cada conversión exitosa se registra automáticamente' },
            ].map(({ icon: Icon, tip }, i) => (
              <div key={i} className="flex items-start gap-md">
                <div className="w-7 h-7 rounded-corner-full bg-brand-tertiary border border-border-primary flex items-center justify-center shrink-0 mt-xs">
                  <Icon size={13} className="text-brand-primary" />
                </div>
                <p className="text-label-sm text-text-secondary">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="neutral"
          iconEnd={<ArrowRight size={16} />}
          onClick={() => navigate('promoter-campaign-detail', { promoterCampaignId: '1' })}
        >
          Ver mis conversiones
        </Button>
      </div>
    </AppShell>
  )
}

// ─── Mockup 26 — Promoter Campaigns ──────────────────────────────────────────

export function PromoterCampaigns({ navigate, userType, setUserType }: NavProps) {
  const { campaigns, participations, conversions, promoterStats } = useApp()

  const promoterCampaigns = participations.map(p => {
    const camp = campaigns.find(c => c.id === p.campaignId)
    const campConvs = conversions.filter(c => c.campaignId === p.campaignId && c.code.toUpperCase() === p.code.toUpperCase())
    const convCount = campConvs.length
    const earnings = campConvs.filter(c => c.status !== 'rejected').reduce((sum, c) => sum + c.reward, 0)

    return {
      id: p.id,
      campaignId: p.campaignId,
      campaignName: camp?.name || 'Campaña',
      category: camp?.category || 'General',
      code: p.code,
      conversions: convCount,
      earnings: earnings,
      status: camp?.status || 'active',
      reward: camp?.reward || 2,
      maxConversions: camp?.maxConversions || 100,
      endDate: camp?.endDate || '30/11/2026',
    }
  })

  const displayCampaigns = promoterCampaigns.length > 0 ? promoterCampaigns : [
    {
      id: '1',
      campaignId: 'c1',
      campaignName: 'Lanzamiento App Móvil',
      category: 'Tecnología',
      code: 'DIEGO82',
      conversions: 18,
      earnings: 36,
      status: 'active' as const,
      reward: 2,
      maxConversions: 50,
      endDate: '30/11/2026',
    },
    {
      id: '2',
      campaignId: 'c2',
      campaignName: 'Feria Gastronómica',
      category: 'Gastronomía',
      code: 'DIEGO44',
      conversions: 9,
      earnings: 27,
      status: 'closing' as const,
      reward: 3,
      maxConversions: 30,
      endDate: '28/10/2026',
    },
  ]

  const activeCount = displayCampaigns.filter(pc => pc.status === 'active').length
  const closingCount = displayCampaigns.filter(pc => pc.status === 'closing').length

  const tabs = [
    {
      id: 'active',
      label: `Activas (${activeCount})`,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {displayCampaigns.filter(pc => pc.status === 'active').map(pc => (
            <PromoterCampaignCard key={pc.id} pc={pc} navigate={navigate} />
          ))}
          {activeCount === 0 && (
            <div className="col-span-full py-12 text-center text-text-secondary text-sm">
              No tienes campañas activas en este momento.
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
          {displayCampaigns.filter(pc => pc.status === 'closing').map(pc => (
            <PromoterCampaignCard key={pc.id} pc={pc} navigate={navigate} />
          ))}
          {closingCount === 0 && (
            <div className="col-span-full py-12 text-center text-text-secondary text-sm">
              No hay campañas en cierre actualmente.
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'all',
      label: `Todas (${displayCampaigns.length})`,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {displayCampaigns.map(pc => (
            <PromoterCampaignCard key={pc.id} pc={pc} navigate={navigate} />
          ))}
        </div>
      ),
    },
  ]

  return (
    <AppShell currentPage="promoter-campaigns" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-6xl mx-auto">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-border-primary gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-[#00B686] uppercase">01 — Mis Campañas</span>
              <span className="text-text-secondary text-xs">·</span>
              <span className="text-xs text-text-secondary">Códigos y Rendimiento</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mt-1">Campañas inscritas</h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Gestiona tus códigos de referido, monitorea tus conversiones y comparte tu material
            </p>
          </div>
          <Button variant="primary" iconStart={<ArrowRight size={16} />} onClick={() => navigate('explore-campaigns')}>
            Explorar más campañas
          </Button>
        </div>

        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs">
          <Tabs tabs={tabs} defaultTab="all" />
        </div>

      </div>
    </AppShell>
  )
}

function PromoterCampaignCard({
  pc, navigate
}: {
  pc: {
    id: string
    campaignId: string
    campaignName: string
    category?: string
    code: string
    conversions: number
    earnings: number
    status: string
    reward: number
    maxConversions: number
    endDate: string
  }
  navigate: NavProps['navigate']
}) {
  return (
    <div
      className="bg-surface-bg border border-border-primary hover:border-[#00B686]/40 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between gap-4 cursor-pointer group"
      onClick={() => navigate('promoter-campaign-detail', { promoterCampaignId: pc.id, campaignId: pc.campaignId })}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-text-primary group-hover:text-[#00B686] transition-colors">
              {pc.campaignName}
            </span>
            {pc.category && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-bg-faint text-text-secondary font-mono border border-border-primary">
                {pc.category}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-mono font-bold text-[#00B686] bg-[#00B686]/10 px-2 py-0.5 rounded border border-[#00B686]/20">
              {pc.code}
            </span>
            <span className="text-xs text-text-secondary">{pc.reward} USDC / conv.</span>
          </div>
        </div>
        <StatusBadge status={pc.status} />
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border-primary text-xs">
        <div>
          <span className="text-[10px] text-text-secondary uppercase">Conversiones</span>
          <p className="font-bold text-text-primary mt-0.5">{pc.conversions}</p>
        </div>
        <div>
          <span className="text-[10px] text-text-secondary uppercase">Ganancias</span>
          <p className="font-bold text-[#00B686] mt-0.5">{pc.earnings} USDC</p>
        </div>
        <div>
          <span className="text-[10px] text-text-secondary uppercase">Cierre</span>
          <p className="font-medium text-text-primary mt-0.5">{pc.endDate}</p>
        </div>
      </div>

      <ProgressBar value={pc.conversions} max={pc.maxConversions} label="Progreso global de campaña" />

      <div className="flex items-center justify-between pt-2 border-t border-border-primary">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            navigate('my-code', { campaignId: pc.campaignId, code: pc.code })
          }}
          className="text-xs text-[#00B686] font-medium flex items-center gap-1 hover:underline cursor-pointer"
        >
          <QrCode size={14} />
          <span>Ver mi QR y compartir</span>
        </button>
        <span className="text-xs text-text-secondary flex items-center gap-1 group-hover:text-text-primary transition-colors">
          Detalle <ChevronRight size={13} />
        </span>
      </div>
    </div>
  )
}

// ─── Mockup 27 — Promoter Campaign Detail ────────────────────────────────────

export function PromoterCampaignDetail({ navigate, params, userType, setUserType }: NavProps) {
  const { campaigns, participations, conversions } = useApp()
  const part = participations.find(p => p.id === params.promoterCampaignId || p.campaignId === params.campaignId) || participations[0]
  const campaign = campaigns.find(c => c.id === part?.campaignId || c.id === params.campaignId) || campaigns[0]

  const campaignConversions = conversions.filter(c => c.campaignId === campaign?.id && (!part || c.code === part.code))
  const confirmed = campaignConversions.filter(c => c.status === 'confirmed' || c.status === 'paid').length
  const pending = campaignConversions.filter(c => c.status === 'pending').length

  const code = part?.code || 'DIEGO82'
  const promoterConversions = campaignConversions.length || 18
  const earnings = campaignConversions.filter(c => c.status !== 'rejected').reduce((sum, c) => sum + c.reward, 0) || 36

  return (
    <AppShell currentPage="promoter-campaigns" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-3xl mx-auto">

        {/* Page header */}
        <div className="pb-4 border-b border-border-primary">
          <button onClick={() => navigate('promoter-campaigns')} className="text-xs text-text-secondary hover:text-text-primary mb-2 block">
            ← Mis campañas
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-[#00B686] uppercase">01 — Detalle de Participación</span>
            <span className="text-text-secondary text-xs">·</span>
            <StatusBadge status={campaign?.status || 'active'} />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mt-1">{campaign?.name || 'Campaña'}</h1>
          <p className="text-xs text-text-secondary mt-0.5">Vigencia: {campaign?.startDate} – {campaign?.endDate}</p>
        </div>

        {/* Code Command Card */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">Tu Código de Promotor</span>
            <span className="text-2xl font-bold font-mono text-[#00B686] tracking-wider">{code}</span>
            <span className="text-xs text-text-secondary">Recompensa: {campaign?.reward ?? 2} USDC por conversión validada</span>
          </div>
          <Button variant="primary" size="small" iconStart={<Share2 size={15} />} onClick={() => navigate('my-code', { campaignId: campaign?.id, code })}>
            Ver QR y Compartir
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatTile label="Conversiones" value={promoterConversions} sub={`${confirmed} conf. · ${pending} pend.`} icon={CheckCircle} accent />
          <StatTile label="Ganancias" value={`${earnings} USDC`} sub="acumuladas" icon={Coins} />
          <StatTile label="Cierre de Campaña" value={campaign?.endDate || '30/11/2026'} icon={Calendar} />
        </div>

        {/* Progress */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col gap-3">
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Tu aporte en la campaña</span>
          <ProgressBar
            value={promoterConversions}
            max={campaign?.maxConversions || 50}
            label={`${promoterConversions} de ${campaign?.maxConversions || 50} cupos globales logrados contigo.`}
          />
        </div>

        {/* Conversions feed */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-primary">
            <h3 className="text-sm font-bold text-text-primary">Conversiones Registradas con tu Código</h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-[#00B686] font-medium">{confirmed} confirmadas</span>
              <span className="text-amber-500 font-medium">{pending} pendientes</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-primary text-text-secondary uppercase text-[10px] tracking-wider">
                  <th className="pb-2 font-semibold">Operación</th>
                  <th className="pb-2 font-semibold">Fecha</th>
                  <th className="pb-2 font-semibold text-right">Recompensa</th>
                  <th className="pb-2 font-semibold text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary">
                {campaignConversions.map(c => (
                  <tr key={c.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="py-3 font-medium text-text-primary">{c.operation}</td>
                    <td className="py-3 text-text-secondary">{c.date}</td>
                    <td className="py-3 text-right font-bold text-[#00B686]">{c.reward} USDC</td>
                    <td className="py-3 text-right">
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-text-secondary pt-2 border-t border-border-primary">
            Las recompensas confirmadas se transferirán a tu wallet cuando la empresa ejecute la liquidación en Stellar Testnet ({campaign?.endDate}).
          </p>
        </div>

      </div>
    </AppShell>
  )
}

// ─── Mockup 28 — Promoter Earnings ───────────────────────────────────────────

export function PromoterEarnings({ navigate, userType, setUserType }: NavProps) {
  const { promoterStats, participations, campaigns, conversions } = useApp()
  const total = promoterStats.totalEarnings || 63
  const paid = promoterStats.paid || 36
  const pending = promoterStats.pending || 27
  const totalConversions = promoterStats.totalConversions || 27

  const campaignBreakdown = participations.length > 0
    ? participations.map(p => {
        const camp = campaigns.find(c => c.id === p.campaignId)
        const campConvs = conversions.filter(c => c.campaignId === p.campaignId && c.code.toUpperCase() === p.code.toUpperCase())
        const convCount = campConvs.length
        const earnings = campConvs.filter(c => c.status !== 'rejected').reduce((sum, c) => sum + c.reward, 0)

        return {
          id: p.id,
          campaignName: camp?.name || 'Campaña',
          status: camp?.status || 'active',
          earnings: earnings,
          conversions: convCount,
          code: p.code,
        }
      })
    : [
        { id: '1', campaignName: 'Lanzamiento App Móvil', status: 'active', earnings: 36, conversions: 18, code: 'DIEGO82' },
        { id: '2', campaignName: 'Feria Gastronómica', status: 'closing', earnings: 27, conversions: 9, code: 'DIEGO44' },
      ]

  return (
    <AppShell currentPage="promoter-earnings" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-4xl mx-auto">

        {/* Page header */}
        <div className="pb-4 border-b border-border-primary">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-[#00B686] uppercase">01 — Finanzas</span>
            <span className="text-text-secondary text-xs">·</span>
            <span className="text-xs text-text-secondary">Liquidaciones Stellar Testnet</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mt-1">Mis ganancias</h1>
          <p className="text-xs text-text-secondary mt-0.5">Resumen de recompensas acreditadas y pagos en custodia</p>
        </div>

        {/* Summary hero */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-baseline justify-between gap-2 pb-4 border-b border-border-primary">
            <div>
              <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Ganancias Totales Acumuladas</span>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#00B686] font-mono mt-1">{total} USDC</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#00B686]/10 text-[#00B686] border border-[#00B686]/20">
              Stellar Testnet
            </span>
          </div>

          {/* Paid vs pending bar */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary font-medium">Pagado vs En Custodia Escrow</span>
              <span className="font-mono text-text-primary">{paid} USDC / {pending} USDC</span>
            </div>
            <div className="h-3 w-full bg-bg-subtle rounded-full overflow-hidden flex">
              <div className="bg-[#00B686] h-full transition-all" style={{ width: `${total > 0 ? (paid / total) * 100 : 50}%` }} />
              <div className="bg-amber-500 h-full flex-1 transition-all" />
            </div>
            <div className="flex items-center gap-4 text-xs pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00B686]" />
                <span className="text-text-secondary">Pagado a tu wallet: <strong className="text-text-primary">{paid} USDC</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-text-secondary">En custodia Soroban: <strong className="text-text-primary">{pending} USDC</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Per-campaign breakdown */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col gap-4">
          <h3 className="text-sm font-bold text-text-primary pb-3 border-b border-border-primary">Desglose por Campaña</h3>
          <div className="flex flex-col gap-4">
            {campaignBreakdown.map(pc => {
              const barW = total > 0 ? Math.round((pc.earnings / total) * 100) : 50
              return (
                <div key={pc.id} className="p-4 rounded-xl bg-bg-faint border border-border-primary flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-primary">{pc.campaignName}</span>
                      <StatusBadge status={pc.status} />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#00B686]">{pc.earnings} USDC</span>
                  </div>
                  <div className="h-2 bg-surface-bg rounded-full overflow-hidden">
                    <div className="h-full bg-[#00B686] rounded-full" style={{ width: `${barW}%` }} />
                  </div>
                  <p className="text-[11px] text-text-secondary">
                    {pc.conversions} conversiones validadas con el código <span className="font-mono font-bold text-[#00B686]">{pc.code}</span>
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Average stat card */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00B686]/10 text-[#00B686] flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-text-primary">{totalConversions} conversiones totales verificadas</p>
              <p className="text-[11px] text-text-secondary">
                Promedio de {totalConversions > 0 ? (total / totalConversions).toFixed(2) : '2.00'} USDC por conversión
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="neutral" size="small" onClick={() => navigate('account-statement')}>
              Estado de cuenta
            </Button>
            <Button variant="primary" size="small" onClick={() => navigate('transaction-history')}>
              Historial Stellar
            </Button>
          </div>
        </div>

      </div>
    </AppShell>
  )
}

// ─── Mockup 29 — Account Statement ───────────────────────────────────────────

export function AccountStatement({ navigate, userType, setUserType }: NavProps) {
  const { promoterStats, transactions } = useApp()
  const total = promoterStats.totalEarnings || 63
  const paid = promoterStats.paid || 36
  const pending = promoterStats.pending || 27

  const movements = transactions.length > 0
    ? transactions.map(t => ({
        id: t.id,
        date: t.date,
        campaign: t.campaign,
        code: 'DIEGO82',
        status: t.status,
        amount: t.amount,
      }))
    : [
        { id: '1', date: '20/10/2026', campaign: 'Concierto Universitario', code: 'DIEGO82', status: 'paid', amount: 36 },
        { id: '2', date: '28/10/2026', campaign: 'Feria Gastronómica', code: 'DIEGO44', status: 'pending', amount: 27 },
      ]

  return (
    <AppShell currentPage="promoter-earnings" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-4xl mx-auto">

        {/* Page header */}
        <div className="pb-4 border-b border-border-primary">
          <button onClick={() => navigate('promoter-earnings')} className="text-xs text-text-secondary hover:text-text-primary mb-2 block">
            ← Volver a Ganancias
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-[#00B686] uppercase">02 — Estado de Cuenta</span>
            <span className="text-text-secondary text-xs">·</span>
            <span className="text-xs text-text-secondary">Consolidado</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mt-1">Estado de cuenta</h1>
          <p className="text-xs text-text-secondary mt-0.5">Movimientos acreditados y liquidaciones ejecutadas por campaña</p>
        </div>

        {/* Balance banner */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">Saldo Acumulado</span>
            <p className="text-3xl font-bold text-[#00B686] font-mono mt-1">{total} USDC</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="p-3 rounded-xl bg-bg-faint border border-border-primary">
              <span className="text-[10px] text-text-secondary uppercase font-semibold">Pagado</span>
              <p className="font-bold text-[#00B686] text-sm mt-0.5">{paid} USDC</p>
            </div>
            <div className="p-3 rounded-xl bg-bg-faint border border-border-primary">
              <span className="text-[10px] text-text-secondary uppercase font-semibold">En Custodia</span>
              <p className="font-bold text-amber-500 text-sm mt-0.5">{pending} USDC</p>
            </div>
          </div>
        </div>

        {/* Movements table */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col gap-4">
          <h3 className="text-sm font-bold text-text-primary pb-3 border-b border-border-primary">Detalle de Movimientos</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-primary text-text-secondary uppercase text-[10px] tracking-wider">
                  <th className="pb-2 font-semibold">Fecha</th>
                  <th className="pb-2 font-semibold">Campaña</th>
                  <th className="pb-2 font-semibold">Código</th>
                  <th className="pb-2 font-semibold">Concepto</th>
                  <th className="pb-2 font-semibold text-right">Monto</th>
                  <th className="pb-2 font-semibold text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary">
                {movements.map(tx => (
                  <tr key={tx.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="py-3 text-text-secondary">{tx.date}</td>
                    <td className="py-3 font-semibold text-text-primary">{tx.campaign}</td>
                    <td className="py-3 font-mono font-bold text-[#00B686]">{tx.code}</td>
                    <td className="py-3 text-text-secondary">
                      {tx.status === 'paid' ? 'Liquidación vía Stellar' : 'Conversiones en custodia'}
                    </td>
                    <td className="py-3 text-right font-bold text-[#00B686]">+{tx.amount} USDC</td>
                    <td className="py-3 text-right">
                      <StatusBadge status={tx.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Button variant="neutral" iconEnd={<ArrowRight size={16} />} onClick={() => navigate('transaction-history')}>
          Ver historial en Stellar Explorer
        </Button>

      </div>
    </AppShell>
  )
}

// ─── Mockup 30 — Transaction History (Stellar) ───────────────────────────────

export function TransactionHistory({ navigate, userType, setUserType }: NavProps) {
  const { transactions } = useApp()

  return (
    <AppShell currentPage="promoter-earnings" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-4xl mx-auto">

        {/* Page header */}
        <div className="pb-4 border-b border-border-primary">
          <button onClick={() => navigate('account-statement')} className="text-xs text-text-secondary hover:text-text-primary mb-2 block">
            ← Volver a Estado de Cuenta
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-[#00B686] uppercase">03 — Blockchain Ledger</span>
            <span className="text-text-secondary text-xs">·</span>
            <span className="text-xs text-text-secondary">Stellar Testnet</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mt-1">Historial de transacciones</h1>
          <p className="text-xs text-text-secondary mt-0.5">Operaciones criptográficas confirmadas en la red Stellar</p>
        </div>

        {/* Stellar network banner */}
        <div className="p-4 rounded-xl bg-[#00B686]/10 border border-[#00B686]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00B686]/20 text-[#00B686] flex items-center justify-center font-bold">
              <Zap size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-text-primary">Red Stellar Testnet Conectada</p>
              <p className="text-[11px] text-text-secondary">Cada transacción cuenta con inmutabilidad y prueba en el ledger</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#00B686] text-white">
            Operativa
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {transactions.map(tx => (
            <div key={tx.id} className="bg-surface-bg border border-border-primary hover:border-[#00B686]/40 rounded-2xl p-5 shadow-xs transition-all flex flex-col gap-3">
              <div className="flex items-start justify-between pb-3 border-b border-border-primary">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00B686]/10 text-[#00B686] flex items-center justify-center font-bold">
                    <Zap size={18} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-[#00B686] font-mono">+{tx.amount} USDC</p>
                    <p className="text-xs text-text-secondary">{tx.campaign}</p>
                  </div>
                </div>
                <StatusBadge status={tx.status} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-text-secondary uppercase">Concepto</span>
                  <p className="font-medium text-text-primary mt-0.5">
                    {tx.type === 'funding' ? 'Depósito Escrow' : 'Liquidación Soroban'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-text-secondary uppercase">Fecha</span>
                  <p className="font-medium text-text-primary mt-0.5">{tx.date}</p>
                </div>
                <div>
                  <span className="text-[10px] text-text-secondary uppercase">Red</span>
                  <p className="font-medium text-text-primary mt-0.5">Stellar Testnet</p>
                </div>
                <div>
                  <span className="text-[10px] text-text-secondary uppercase">Ledger</span>
                  <p className="font-medium text-[#00B686] mt-0.5">Confirmado</p>
                </div>
              </div>

              {tx.txId && (
                <div className="p-3 rounded-xl bg-bg-faint border border-border-primary flex items-center justify-between text-xs mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-text-secondary uppercase">TX Hash:</span>
                    <span className="font-mono font-bold text-text-primary">{truncateAddress(tx.txId, 10, 8)}</span>
                  </div>
                  <a
                    href={getStellarExpertTxUrl(tx.txId)}
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

// ─── Mockup 31 — Promoter Profile + Wallet ───────────────────────────────────

export function PromoterProfile({ navigate, userType, setUserType }: NavProps) {
  const { currentUser, promoterStats, participations } = useApp()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(currentUser.name || 'Diego Huamani')
  const [phone, setPhone] = useState('+51 999 888 777')
  const [funding, setFunding] = useState(false)
  const [faucetMsg, setFaucetMsg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const activeWallet = currentUser.wallet || 'GA7HPIC5QEG7GD42Q4XNXJ72FDPYKFRMMXY4IBWA3R5ZNTD5QKKSUSPX'

  async function handleFriendbotFund() {
    setFunding(true)
    setFaucetMsg(null)
    try {
      const res = await fundAccountWithFriendbot(activeWallet)
      if (res.success) {
        setFaucetMsg('✓ ¡Cuenta fondeada con 10,000 XLM en Stellar Testnet!')
      } else {
        setFaucetMsg(res.message || 'Fondos de prueba solicitados.')
      }
    } catch {
      setFaucetMsg('Fondos de prueba solicitados.')
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
    <AppShell currentPage="promoter-profile" navigate={navigate} userType={userType} setUserType={setUserType}>
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
              <span className="text-xs font-bold tracking-wider text-[#00B686] uppercase">01 — Cuenta de Promotor</span>
              <span className="text-text-secondary text-xs">·</span>
              <span className="text-xs text-text-secondary">Perfil y Wallet Stellar</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mt-1">Mi perfil</h1>
            <p className="text-xs text-text-secondary mt-0.5">Información personal y dirección Stellar para cobro de recompensas</p>
          </div>
          {!editing && (
            <Button variant="neutral" size="small" iconStart={<Pencil size={14} />} onClick={() => setEditing(true)}>
              Editar perfil
            </Button>
          )}
        </div>

        {/* Identity card */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00B686] to-[#0B2545] text-white flex items-center justify-center font-bold text-xl shadow-md">
              {name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-text-primary">{name}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00B686]/10 text-[#00B686] border border-[#00B686]/20 font-medium flex items-center gap-1">
                  <CheckCircle size={12} /> Promotor Activo
                </span>
              </div>
              <p className="text-xs text-text-secondary">Afiliado desde octubre 2026 · Nivel Plata</p>
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

        {/* Stellar Wallet Command Card */}
        <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-border-primary">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#00B686]/10 text-[#00B686] flex items-center justify-center">
                <Wallet size={15} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Wallet Stellar para Recepción de Recompensas</h3>
                <p className="text-[11px] text-text-secondary">Dirección pública donde se depositan tus pagos en USDC</p>
              </div>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-md bg-[#00B686]/10 text-[#00B686] font-bold border border-[#00B686]/20">
              Activa
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

          {/* Friendbot test faucet button */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/10 via-emerald-900/10 to-transparent border border-border-primary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0B2545]/10 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                💧
              </div>
              <div>
                <p className="text-xs font-bold text-text-primary">Friendbot Testnet Faucet</p>
                <p className="text-[11px] text-text-secondary">Recibe 10,000 XLM de prueba para experimentar en la red Stellar</p>
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
                  <span>Fondeando…</span>
                </>
              ) : (
                <>
                  <Coins size={14} />
                  <span>Solicitar 10,000 XLM</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatTile label="Campañas Activas" value={participations.length || 2} icon={Users} />
          <StatTile label="Conversiones Logradas" value={promoterStats.totalConversions || 27} icon={CheckCircle} />
          <StatTile label="Total USDC Ganado" value={`${promoterStats.totalEarnings || 63} USDC`} icon={Coins} accent />
        </div>

        {/* Edit or Details */}
        {editing ? (
          <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col gap-4">
            <h3 className="text-sm font-bold text-text-primary pb-3 border-b border-border-primary">Editar Información</h3>
            <InputField label="Nombre completo" value={name} onChange={setName} />
            <InputField label="Teléfono / WhatsApp" value={phone} onChange={setPhone} />
            <ButtonGroup align="end">
              <Button variant="neutral" onClick={() => setEditing(false)}>Cancelar</Button>
              <Button variant="primary" onClick={() => setEditing(false)}>Guardar cambios</Button>
            </ButtonGroup>
          </div>
        ) : (
          <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 shadow-xs flex flex-col gap-4">
            <h3 className="text-sm font-bold text-text-primary pb-3 border-b border-border-primary">Información de Contacto</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-bg-faint border border-border-primary">
                <span className="text-[10px] text-text-secondary uppercase font-semibold">Correo Electrónico</span>
                <p className="font-medium text-text-primary mt-1">diego.huamani@universidad.pe</p>
              </div>
              <div className="p-3 rounded-xl bg-bg-faint border border-border-primary">
                <span className="text-[10px] text-text-secondary uppercase font-semibold">Teléfono / WhatsApp</span>
                <p className="font-medium text-text-primary mt-1">{phone}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  )
}


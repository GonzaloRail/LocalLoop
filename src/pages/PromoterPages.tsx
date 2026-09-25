import { useState } from 'react'
import {
  Button, ButtonGroup, Badge, Avatar, Tabs, InputField, Toast, SearchComponent
} from '@figma/astraui'
import {
  ArrowRight, Copy, Share2, Download, ExternalLink, CheckCircle,
  TrendingUp, Zap, ChevronRight, Wallet, Calendar,
  Link2, BarChart2, Clock, Star, Pencil, Users
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import AppShell from '../components/AppShell'
import { NavProps } from '../types'
import { useApp } from '../context/AppContext'
import { getStellarExpertTxUrl, getStellarExpertAccountUrl, truncateAddress } from '../lib/stellar'

const CARD = 'bg-surface-bg border border-border-primary rounded-corner-lg p-xl'

// ─── Shared helpers ───────────────────────────────────────────────────────────

function StatTile({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className="bg-surface-bg border border-border-primary rounded-corner-lg p-xl flex flex-col gap-2">
      <p className="text-text-secondary uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>{label}</p>
      <p className={`text-title font-semibold leading-none ${accent ? 'text-brand-primary' : 'text-text-primary'}`}>{value}</p>
      {sub && <p className="text-video-title text-text-secondary mt-xs">{sub}</p>}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: 'success' | 'warning' | 'default' | 'secondary' | 'danger'; label: string }> = {
    active: { variant: 'success', label: 'Activa' },
    closing: { variant: 'warning', label: 'En cierre' },
    liquidated: { variant: 'default', label: 'Liquidada' },
    pending: { variant: 'warning', label: 'Pendiente' },
    confirmed: { variant: 'success', label: 'Confirmada' },
    paid: { variant: 'success', label: 'Pagado' },
  }
  const cfg = map[status] ?? { variant: 'secondary', label: status }
  return <Badge label={cfg.label} variant={cfg.variant} />
}

function ProgressBar({ value, max, label }: { value: number; max: number; label?: string }) {
  const pct = Math.min(Math.round((value / max) * 100), 100)
  return (
    <div className="flex flex-col gap-xs">
      {label && (
        <div className="flex justify-between">
          <span className="text-video-title text-text-secondary">{label}</span>
          <span className="text-video-title text-brand-primary font-semibold">{pct}%</span>
        </div>
      )}
      <div className="rounded-corner-full overflow-hidden" style={{ height: '3px', background: 'var(--bg-subtle)' }}>
        <div className="h-full bg-brand-primary rounded-corner-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border-primary mb-xl">
      <div className="flex items-center gap-lg">
        {eyebrow && (
          <span className="text-brand-primary font-semibold" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
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

  return (
    <AppShell currentPage="promoter-dashboard" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-2xl flex flex-col gap-2xl">

        {/* Page header */}
        <div className="flex items-start justify-between pb-2xl border-b border-border-primary">
          <div>
            <span className="text-brand-primary font-semibold block mb-xs" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
              01 — RESUMEN
            </span>
            <h1 className="text-title text-text-primary">Dashboard</h1>
            <p className="text-label-sm text-text-secondary mt-xs">
              Bienvenido, {currentUser.name || 'Diego Huamani'}
            </p>
          </div>
          <Button variant="primary" iconStart={<ArrowRight size={16} />} onClick={() => navigate('explore-campaigns')}>
            Explorar campañas
          </Button>
        </div>

        {/* Hero earnings card */}
        <div className={`${CARD} flex items-center gap-2xl`}>
          <div className="flex flex-col gap-xs flex-1">
            <span className="text-text-secondary uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>Ganancias totales</span>
            <p className="text-title text-brand-primary font-semibold leading-none">{earned} USDC</p>
            <div className="flex items-center gap-xl mt-md pt-md border-t border-border-primary">
              <div>
                <p className="text-text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>PAGADO</p>
                <p className="text-label-sm text-text-primary font-semibold mt-xs">{paid} USDC</p>
              </div>
              <div className="h-8 w-px bg-border-primary" />
              <div>
                <p className="text-text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>PENDIENTE</p>
                <p className="text-label-sm text-warning font-semibold mt-xs">{pending} USDC</p>
              </div>
              <div className="h-8 w-px bg-border-primary" />
              <div>
                <p className="text-text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>CONVERSIONES</p>
                <p className="text-label-sm text-text-primary font-semibold mt-xs">{promoterStats.totalConversions}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-md shrink-0">
            <Button variant="neutral" size="small" onClick={() => navigate('promoter-earnings')}>
              Ver ganancias
            </Button>
            <Button variant="subtle" size="small" onClick={() => navigate('account-statement')}>
              Estado de cuenta
            </Button>
          </div>
        </div>

        {/* Active campaigns */}
        <div>
          <SectionHeading
            eyebrow="02 — ACTIVAS"
            title="Mis campañas activas"
            action={
              <Button variant="subtle" size="small" iconEnd={<ArrowRight size={16} />} onClick={() => navigate('promoter-campaigns')}>
                Ver todas ({participations.length})
              </Button>
            }
          />
          <div className="flex flex-col gap-lg">
            {participations.map(pc => {
              const campaign = campaigns.find(c => c.id === pc.campaignId)
              const campConversions = conversions.filter(c => c.campaignId === pc.campaignId && c.code === pc.code)
              const myConvCount = campConversions.length
              const myEarnings = campConversions.reduce((sum, c) => sum + c.reward, 0)

              return (
                <div
                  key={pc.id}
                  className="bg-surface-bg border border-border-primary rounded-corner-lg p-xl flex flex-col gap-md cursor-pointer hover:bg-bg-faint transition-colors"
                  onClick={() => navigate('my-code', { campaignId: pc.campaignId, code: pc.code })}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-label text-text-primary font-semibold">{campaign?.name || 'Campaña'}</p>
                      <div className="flex items-center gap-md mt-xs">
                        <Badge label={pc.code} variant="brand" />
                        <span className="text-video-title text-text-secondary">
                          {campaign?.reward ?? 2} USDC / conversión
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-md shrink-0">
                      <StatusBadge status={campaign?.status || 'active'} />
                      <ChevronRight size={14} className="text-text-secondary" />
                    </div>
                  </div>
                  <div className="flex gap-2xl pt-xs border-t border-border-primary">
                    <div>
                      <p className="text-text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>CONVERSIONES</p>
                      <p className="text-label-sm text-text-primary font-semibold mt-xs">{myConvCount}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>GANADO</p>
                      <p className="text-label-sm text-brand-primary font-semibold mt-xs">{myEarnings} USDC</p>
                    </div>
                    {campaign && (
                      <div>
                        <p className="text-text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>CIERRE</p>
                        <p className="text-label-sm text-text-primary mt-xs">{campaign.endDate}</p>
                      </div>
                    )}
                  </div>
                  {campaign && (
                    <ProgressBar value={campaign.conversions} max={campaign.maxConversions} label="Progreso global de campaña" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </AppShell>

  )
}

// ─── Mockup 22 — Explore Campaigns ───────────────────────────────────────────

export function ExploreCampaigns({ navigate, userType, setUserType }: NavProps) {
  const { campaigns } = useApp()
  const [query, setQuery] = useState('')
  const filtered = campaigns.filter(c =>
    (c.status === 'active' || c.status === 'closing') &&
    (!query || c.name.toLowerCase().includes(query.toLowerCase()) || c.category.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <AppShell currentPage="explore-campaigns" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-2xl flex flex-col gap-2xl">

        {/* Page header */}
        <div className="flex items-start justify-between pb-2xl border-b border-border-primary">
          <div>
            <span className="text-brand-primary font-semibold block mb-xs" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
              01 — EXPLORAR
            </span>
            <h1 className="text-title text-text-primary">Explorar campañas</h1>
            <p className="text-label-sm text-text-secondary mt-xs">Encuentra oportunidades para ganar</p>
          </div>
          <Badge label={`${filtered.length} disponibles`} variant="brand" />
        </div>

        <SearchComponent placeholder="Buscar por nombre o categoría" onChange={setQuery} />

        <div className="grid grid-cols-2 gap-xl">
          {filtered.map(c => {
            const available = c.maxConversions - c.conversions
            return (
              <div key={c.id} className={`${CARD} flex flex-col gap-lg`}>

                <div className="flex items-start justify-between pb-md border-b border-border-primary">
                  <div>
                    <p className="text-label text-text-primary font-semibold">{c.name}</p>
                    <div className="flex items-center gap-xs mt-xs">
                      <CheckCircle size={12} className="text-success" />
                      <span className="text-video-title text-text-secondary">{c.business}</span>
                      <Badge label={c.category} variant="secondary" />
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>

                {/* Reward highlight */}
                <div className="bg-brand-tertiary border border-border-primary rounded-corner-md p-md flex items-center justify-between">
                  <span className="text-text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>RECOMPENSA</span>
                  <span className="text-label text-brand-primary font-semibold">{c.reward} USDC / conversión</span>
                </div>

                {/* Stats */}
                <div className="flex flex-col gap-xs">
                  <div className="flex justify-between">
                    <span className="text-video-title text-text-secondary">Spots disponibles</span>
                    <span className="text-label-sm text-text-primary font-medium">{available} de {c.maxConversions}</span>
                  </div>
                  <ProgressBar value={c.conversions} max={c.maxConversions} />
                  <div className="flex justify-between mt-xs">
                    <span className="text-video-title text-text-secondary flex items-center gap-xs">
                      <Calendar size={11} /> Vigencia
                    </span>
                    <span className="text-video-title text-text-primary">{c.startDate} – {c.endDate}</span>
                  </div>
                </div>

                {/* Potential earnings */}
                <div className="flex justify-between items-center bg-bg-faint border border-border-primary rounded-corner-md px-md py-sm">
                  <span className="text-video-title text-text-secondary">Si consigues 10 conversiones</span>
                  <span className="text-label-sm text-brand-primary font-semibold">{c.reward * 10} USDC</span>
                </div>

                <Button
                  variant="primary"
                  onClick={() => navigate('campaign-detail-promoter', { campaignId: c.id })}
                >
                  Ver campaña
                </Button>
              </div>
            )
          })}
        </div>
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
      <div className="p-2xl flex flex-col gap-2xl max-w-2xl">

        {/* Page header */}
        <div className="pb-2xl border-b border-border-primary">
          <button onClick={() => navigate('explore-campaigns')} className="text-label-sm text-text-secondary hover:text-text-primary mb-md block">← Explorar</button>
          <span className="text-brand-primary font-semibold block mb-xs" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
            01 — CAMPAÑA
          </span>
          <h1 className="text-title text-text-primary">{campaign.name}</h1>
          <p className="text-label-sm text-text-secondary mt-xs">{campaign.description}</p>
        </div>

        {/* Business info */}
        <div className={`${CARD} flex items-center gap-lg`}>
          <Avatar type="initial" initials={campaign.business.slice(0, 2).toUpperCase()} size="large" shape="square" />
          <div className="flex-1">
            <p className="text-label text-text-primary font-semibold">{campaign.business}</p>
            <div className="flex items-center gap-xs mt-xs">
              <CheckCircle size={12} className="text-success" />
              <span className="text-label-sm text-text-secondary">Negocio verificado</span>
              <Badge label={campaign.category} variant="secondary" />
            </div>
          </div>
          <div className="text-right">
            <p className="text-text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>RECOMPENSA</p>
            <p className="text-heading text-brand-primary font-semibold mt-xs">{campaign.reward} USDC</p>
            <p className="text-video-title text-text-secondary">por conversión</p>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-lg">
          <StatTile label="Disponibles" value={available} sub={`de ${campaign.maxConversions} spots`} />
          <StatTile label="Vigencia" value={`${campaign.daysLeft}d`} sub={`hasta ${campaign.endDate}`} />
          <StatTile label="Max. ganancias" value={`${campaign.reward * available} USDC`} sub="si llenas todos los spots" accent />
        </div>

        {/* Fill rate */}
        <div className={CARD}>
          <ProgressBar value={campaign.conversions} max={campaign.maxConversions} label="Spots tomados" />
        </div>

        {/* Info sections */}
        <div className={`${CARD} flex flex-col gap-lg`}>
          <SectionHeading eyebrow="02 — ACCIÓN" title="¿Qué debo hacer?" />
          <p className="text-label-sm text-text-secondary">
            Conseguir clientes que realicen la siguiente acción usando tu código de referido:
          </p>
          <div className="bg-brand-tertiary border border-border-primary rounded-corner-md p-md">
            <p className="text-label-sm text-brand-primary font-semibold">{campaign.conversionAction}</p>
          </div>

          <div className="border-t border-border-primary pt-lg">
            <p className="text-label text-text-primary font-semibold mb-xs">¿Cómo se valida?</p>
            <p className="text-label-sm text-text-secondary">
              Validación: <strong className="text-text-primary">{campaign.validationMethod}</strong>.
              El cliente debe utilizar tu código durante la acción.
            </p>
          </div>
          <div className="border-t border-border-primary pt-lg">
            <p className="text-label text-text-primary font-semibold mb-xs">Condiciones</p>
            <p className="text-label-sm text-text-secondary">{campaign.conditions}</p>
          </div>
        </div>

        <Button
          variant="primary"
          iconStart={<Star size={16} />}
          onClick={() => {
            const part = joinCampaign(campaign.id)
            navigate('join-confirmation', { campaignId: campaign.id, code: part.code })
          }}
        >
          Participar en esta campaña
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

  return (
    <AppShell currentPage="explore-campaigns" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-2xl flex flex-col items-center gap-2xl max-w-md mx-auto">

        {/* Celebration */}
        <div className="flex flex-col items-center gap-lg pt-xl text-center">
          <div className="w-16 h-16 rounded-corner-full bg-brand-tertiary border border-border-primary flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center">
              <CheckCircle size={22} className="text-on-brand" />
            </div>
          </div>
          <div>
            <span className="text-brand-primary font-semibold block mb-xs" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
              01 — CONFIRMADO
            </span>
            <h1 className="text-title text-text-primary">¡Te has unido!</h1>
            <p className="text-label-sm text-text-secondary mt-xs">
              Ahora eres promotor oficial de <strong className="text-text-primary">{campaign.name}</strong>.
            </p>
          </div>
        </div>

        {/* Summary card */}
        <div className={`${CARD} w-full flex flex-col`}>
          {[
            { label: 'Campaña', value: campaign.name },
            { label: 'Negocio', value: campaign.business },
            { label: 'Recompensa', value: `${campaign.reward} USDC por conversión`, accent: true },
            { label: 'Vigencia', value: `${campaign.startDate} – ${campaign.endDate}` },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between py-md border-b border-border-primary last:border-0">
              <span className="text-text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>{row.label.toUpperCase()}</span>
              <span className={`text-label-sm font-semibold ${row.accent ? 'text-brand-primary' : 'text-text-primary'}`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Generated code */}
        <div className={`${CARD} w-full flex flex-col gap-md`}>
          <SectionHeading eyebrow="02 — CÓDIGO" title="Tu código generado" />
          <div className="bg-brand-tertiary border border-border-primary rounded-corner-lg p-xl text-center">
            <p className="text-title text-brand-primary font-semibold tracking-widest">{code}</p>
          </div>
          <p className="text-video-title text-text-secondary text-center">
            Comparte este código para rastrear tus conversiones
          </p>
        </div>

        <Button
          variant="primary"
          className="w-full"
          iconEnd={<ArrowRight size={16} />}
          onClick={() => navigate('my-code', { campaignId: campaign.id, code })}
        >
          Ver mi código y comenzar
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
          <Button variant="neutral" iconStart={<Share2 size={16} />}>
            Compartir
          </Button>
          <Button variant="neutral" iconStart={<Download size={16} />}>
            Descargar QR
          </Button>
          <Button
            variant={copiedLink ? 'primary' : 'neutral'}
            iconStart={<Link2 size={16} />}
            onClick={() => doCopy('link')}
          >
            {copiedLink ? '¡Copiado!' : 'Copiar enlace'}
          </Button>
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
      code: 'DIEGO44',
      conversions: 9,
      earnings: 27,
      status: 'closing' as const,
      reward: 3,
      maxConversions: 30,
      endDate: '28/10/2026',
    },
  ]

  const totalConversions = promoterStats.totalConversions || displayCampaigns.reduce((acc, c) => acc + c.conversions, 0)

  const tabs = [
    {
      id: 'active',
      label: 'Activas',
      content: (
        <div className="flex flex-col gap-lg pt-lg">
          {displayCampaigns.filter(pc => pc.status === 'active').map(pc => (
            <PromoterCampaignCard key={pc.id} pc={pc} navigate={navigate} />
          ))}
        </div>
      ),
    },
    {
      id: 'closing',
      label: 'En cierre',
      content: (
        <div className="flex flex-col gap-lg pt-lg">
          {displayCampaigns.filter(pc => pc.status === 'closing').map(pc => (
            <PromoterCampaignCard key={pc.id} pc={pc} navigate={navigate} />
          ))}
        </div>
      ),
    },
    {
      id: 'all',
      label: 'Todas',
      content: (
        <div className="flex flex-col gap-lg pt-lg">
          {displayCampaigns.map(pc => (
            <PromoterCampaignCard key={pc.id} pc={pc} navigate={navigate} />
          ))}
        </div>
      ),
    },
  ]

  return (
    <AppShell currentPage="promoter-campaigns" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-2xl flex flex-col gap-2xl">

        {/* Page header */}
        <div className="flex items-start justify-between pb-2xl border-b border-border-primary">
          <div>
            <span className="text-brand-primary font-semibold block mb-xs" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
              01 — CAMPAÑAS
            </span>
            <h1 className="text-title text-text-primary">Mis campañas</h1>
            <p className="text-label-sm text-text-secondary mt-xs">
              {displayCampaigns.length} campañas · {totalConversions} conversiones totales
            </p>
          </div>
          <Button variant="primary" iconStart={<ArrowRight size={16} />} onClick={() => navigate('explore-campaigns')}>
            Explorar más
          </Button>
        </div>

        <div className={CARD}>
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
      className="bg-surface-bg border border-border-primary rounded-corner-lg p-xl flex flex-col gap-md cursor-pointer hover:bg-bg-faint transition-colors"
      onClick={() => navigate('promoter-campaign-detail', { promoterCampaignId: pc.id, campaignId: pc.campaignId })}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-label text-text-primary font-semibold">{pc.campaignName}</p>
          <div className="flex items-center gap-md mt-xs">
            <Badge label={pc.code} variant="brand" />
            <span className="text-video-title text-text-secondary">{pc.reward} USDC / conv.</span>
          </div>
        </div>
        <div className="flex items-center gap-md shrink-0">
          <StatusBadge status={pc.status} />
          <ChevronRight size={14} className="text-text-secondary" />
        </div>
      </div>
      <div className="flex gap-2xl pt-xs border-t border-border-primary">
        <div>
          <p className="text-text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>CONVERSIONES</p>
          <p className="text-label-sm text-text-primary font-semibold mt-xs">{pc.conversions}</p>
        </div>
        <div>
          <p className="text-text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>GANANCIAS</p>
          <p className="text-label-sm text-brand-primary font-semibold mt-xs">{pc.earnings} USDC</p>
        </div>
        <div>
          <p className="text-text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>CIERRE</p>
          <p className="text-label-sm text-text-primary mt-xs">{pc.endDate}</p>
        </div>
      </div>
      <ProgressBar value={pc.conversions} max={pc.maxConversions} />
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
      <div className="p-2xl flex flex-col gap-2xl max-w-2xl">

        {/* Page header */}
        <div className="pb-2xl border-b border-border-primary">
          <button onClick={() => navigate('promoter-campaigns')} className="text-label-sm text-text-secondary hover:text-text-primary mb-md block">← Mis campañas</button>
          <div className="flex items-center gap-md mb-xs">
            <span className="text-brand-primary font-semibold" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
              01 — DETALLE
            </span>
            <StatusBadge status={campaign?.status || 'active'} />
          </div>
          <h1 className="text-title text-text-primary">{campaign?.name || 'Campaña'}</h1>
          <p className="text-label-sm text-text-secondary mt-xs">{campaign?.startDate} – {campaign?.endDate}</p>
        </div>

        {/* Code card */}
        <div className={`${CARD} flex items-center gap-xl`}>
          <div className="flex-1">
            <p className="text-text-secondary uppercase mb-xs" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>Tu código</p>
            <div className="bg-brand-tertiary border border-border-primary rounded-corner-md p-md inline-block">
              <p className="text-label text-brand-primary font-semibold tracking-widest">{code}</p>
            </div>
          </div>
          <Button variant="neutral" size="small" iconStart={<Share2 size={16} />} onClick={() => navigate('my-code', { campaignId: campaign?.id, code })}>
            Compartir
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-lg">
          <StatTile label="Conversiones" value={promoterConversions} sub={`${confirmed} conf. · ${pending} pend.`} />
          <StatTile label="Ganancias" value={`${earnings} USDC`} accent />
          <StatTile label="Cierre" value={campaign?.endDate || '30/11/2026'} />
        </div>

        {/* Progress */}
        <div className={CARD}>
          <ProgressBar
            value={promoterConversions}
            max={campaign?.maxConversions || 50}
            label="Tu participación en la campaña"
          />
          <p className="text-video-title text-text-secondary mt-md">
            {promoterConversions} de {campaign?.maxConversions || 50} spots de la campaña tomados contigo.
          </p>
        </div>

        {/* Conversions list */}
        <div className={CARD}>
          <SectionHeading
            eyebrow="02 — REGISTRO"
            title="Conversiones"
            action={
              <div className="flex items-center gap-md">
                <div className="flex items-center gap-xs">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-video-title text-text-secondary">{confirmed} conf.</span>
                </div>
                <div className="flex items-center gap-xs">
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--warning)' }} />
                  <span className="text-video-title text-text-secondary">{pending} pend.</span>
                </div>
              </div>
            }
          />
          <div className="flex flex-col">
            {campaignConversions.length > 0 ? (
              campaignConversions.map(c => (
                <div key={c.id} className="flex items-center gap-xl py-md border-b border-border-primary last:border-0">
                  <div className="flex-1">
                    <p className="text-label-sm text-text-primary">{c.operation}</p>
                    <p className="text-video-title text-text-secondary mt-xs">{c.date}</p>
                  </div>
                  <span className="text-label-sm text-brand-primary font-semibold">{c.reward} USDC</span>
                  <StatusBadge status={c.status} />
                </div>
              ))
            ) : (
              <p className="text-label-sm text-text-secondary py-md">Aún no se han registrado conversiones con este código.</p>
            )}
          </div>
          <p className="text-video-title text-text-secondary pt-md border-t border-border-primary mt-xs">
            Las recompensas pendientes se liquidarán al cierre de la campaña ({campaign?.endDate}).
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
      <div className="p-2xl flex flex-col gap-2xl max-w-2xl">

        {/* Page header */}
        <div className="pb-2xl border-b border-border-primary">
          <span className="text-brand-primary font-semibold block mb-xs" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
            01 — GANANCIAS
          </span>
          <h1 className="text-title text-text-primary">Mis ganancias</h1>
          <p className="text-label-sm text-text-secondary mt-xs">Resumen total de tus recompensas</p>
        </div>

        {/* Summary hero */}
        <div className={`${CARD} flex flex-col gap-lg`}>
          <div className="flex items-baseline gap-md">
            <p className="text-title text-brand-primary font-semibold">{total} USDC</p>
            <p className="text-label-sm text-text-secondary">ganancias totales</p>
          </div>

          {/* Paid vs pending bar */}
          <div className="flex flex-col gap-xs">
            <div className="flex justify-between">
              <span className="text-video-title text-text-secondary">Pagado vs Pendiente</span>
              <span className="text-video-title text-text-secondary">{paid} + {pending} USDC</span>
            </div>
            <div className="flex overflow-hidden gap-px" style={{ height: '4px', borderRadius: '2px' }}>
              <div className="bg-brand-primary rounded-l-full" style={{ width: `${total > 0 ? (paid / total) * 100 : 50}%` }} />
              <div className="flex-1 rounded-r-full" style={{ background: 'var(--warning)' }} />
            </div>
            <div className="flex gap-xl mt-xs">
              <div className="flex items-center gap-xs">
                <div className="w-2 h-2 rounded-full bg-brand-primary" />
                <span className="text-video-title text-text-secondary">Pagado: <strong className="text-text-primary">{paid} USDC</strong></span>
              </div>
              <div className="flex items-center gap-xs">
                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--warning)' }} />
                <span className="text-video-title text-text-secondary">Pendiente: <strong className="text-text-primary">{pending} USDC</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Per-campaign breakdown */}
        <div className={CARD}>
          <SectionHeading eyebrow="02 — DESGLOSE" title="Por campaña" />
          <div className="flex flex-col gap-lg">
            {campaignBreakdown.map(pc => {
              const barW = total > 0 ? Math.round((pc.earnings / total) * 100) : 50
              return (
                <div key={pc.id} className="flex flex-col gap-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-md">
                      <span className="text-label-sm text-text-primary font-semibold">{pc.campaignName}</span>
                      <StatusBadge status={pc.status} />
                    </div>
                    <span className="text-label-sm text-brand-primary font-semibold">{pc.earnings} USDC</span>
                  </div>
                  <div className="rounded-corner-full overflow-hidden" style={{ height: '3px', background: 'var(--bg-subtle)' }}>
                    <div className="h-full bg-brand-primary rounded-corner-full" style={{ width: `${barW}%` }} />
                  </div>
                  <p className="text-video-title text-text-secondary">{pc.conversions} conversiones · {pc.code}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Average stat */}
        <div className={`${CARD} flex items-center gap-xl`}>
          <div className="w-9 h-9 rounded-corner-full bg-brand-tertiary border border-border-primary flex items-center justify-center shrink-0">
            <TrendingUp size={16} className="text-brand-primary" />
          </div>
          <div className="flex-1">
            <p className="text-label text-text-primary font-semibold">
              {totalConversions} conversiones totales
            </p>
            <p className="text-label-sm text-text-secondary mt-xs">
              Promedio de {totalConversions > 0 ? (total / totalConversions).toFixed(2) : '2.00'} USDC por conversión
            </p>
          </div>
          <BarChart2 size={18} className="text-text-secondary" />
        </div>

        <div className="grid grid-cols-2 gap-md">
          <Button variant="neutral" onClick={() => navigate('account-statement')}>Estado de cuenta</Button>
          <Button variant="primary" onClick={() => navigate('transaction-history')}>Historial Stellar</Button>
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
      <div className="p-2xl flex flex-col gap-2xl max-w-3xl">

        {/* Page header */}
        <div className="pb-2xl border-b border-border-primary">
          <button onClick={() => navigate('promoter-earnings')} className="text-label-sm text-text-secondary hover:text-text-primary mb-md block">← Ganancias</button>
          <span className="text-brand-primary font-semibold block mb-xs" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
            01 — CUENTA
          </span>
          <h1 className="text-title text-text-primary">Estado de cuenta</h1>
          <p className="text-label-sm text-text-secondary mt-xs">Movimientos consolidados por campaña</p>
        </div>

        {/* Balance banner */}
        <div className="bg-brand-tertiary border border-border-primary rounded-corner-lg p-xl flex items-center justify-between">
          <div>
            <p className="text-text-secondary uppercase mb-xs" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>Saldo acumulado</p>
            <p className="text-title text-brand-primary font-semibold">{total} USDC</p>
          </div>
          <div className="flex gap-xl">
            <div>
              <p className="text-text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>PAGADO</p>
              <p className="text-label-sm text-text-primary font-semibold mt-xs">{paid} USDC</p>
            </div>
            <div>
              <p className="text-text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>PENDIENTE</p>
              <p className="text-label-sm text-warning font-semibold mt-xs">{pending} USDC</p>
            </div>
          </div>
        </div>

        {/* Transactions table */}
        <div className={CARD}>
          <SectionHeading eyebrow="02 — MOVIMIENTOS" title="Detalle de transacciones" />
          <div className="flex flex-col">
            <div className="flex gap-xl pb-sm border-b border-border-primary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>
              <span className="w-20 text-text-secondary">FECHA</span>
              <span className="flex-1 text-text-secondary">CAMPAÑA</span>
              <span className="w-20 text-text-secondary">CÓDIGO</span>
              <span className="flex-1 text-text-secondary">CONCEPTO</span>
              <span className="w-28 text-right text-text-secondary">MONTO</span>
              <span className="w-24 text-right text-text-secondary">ESTADO</span>
            </div>
            {movements.map(tx => (
              <div key={tx.id} className="flex gap-xl items-center py-md border-b border-border-primary last:border-0">
                <span className="w-20 text-label-sm text-text-secondary">{tx.date}</span>
                <span className="flex-1 text-label-sm text-text-primary font-semibold">{tx.campaign}</span>
                <span className="w-20 text-label-sm text-brand-primary font-semibold">{tx.code}</span>
                <span className="flex-1 text-label-sm text-text-secondary">
                  {tx.status === 'paid' ? 'Liquidación via Stellar' : 'Conversiones pendientes de cierre'}
                </span>
                <span className="w-28 text-right text-label text-text-primary font-semibold">
                  +{tx.amount} USDC
                </span>
                <div className="w-24 flex justify-end">
                  <StatusBadge status={tx.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button variant="neutral" iconEnd={<ArrowRight size={16} />} onClick={() => navigate('transaction-history')}>
          Ver historial de transacciones Stellar
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
      <div className="p-2xl flex flex-col gap-2xl max-w-2xl">

        {/* Page header */}
        <div className="pb-2xl border-b border-border-primary">
          <button onClick={() => navigate('account-statement')} className="text-label-sm text-text-secondary hover:text-text-primary mb-md block">← Estado de cuenta</button>
          <span className="text-brand-primary font-semibold block mb-xs" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
            01 — STELLAR
          </span>
          <h1 className="text-title text-text-primary">Historial de transacciones</h1>
          <p className="text-label-sm text-text-secondary mt-xs">Operaciones confirmadas en la red Stellar</p>
        </div>

        {/* Stellar network banner */}
        <div className="bg-bg-faint border border-border-primary rounded-corner-lg p-lg flex items-center gap-md">
          <div className="w-8 h-8 rounded-corner-full bg-brand-tertiary border border-border-primary flex items-center justify-center shrink-0">
            <Zap size={14} className="text-brand-primary" />
          </div>
          <div className="flex-1">
            <p className="text-label-sm text-text-primary font-semibold">Red Stellar · Testnet</p>
            <p className="text-video-title text-text-secondary">Todas las transacciones son verificables on-chain</p>
          </div>
          <Badge label="Conectado" variant="success" />
        </div>

        <div className="flex flex-col gap-lg">
          {transactions.map(tx => (
            <div key={tx.id} className={`${CARD} flex flex-col gap-lg`}>

              {/* Amount + campaign */}
              <div className="flex items-start justify-between pb-lg border-b border-border-primary">
                <div className="flex items-center gap-md">
                  <div className="w-11 h-11 rounded-corner-full bg-brand-tertiary border border-border-primary flex items-center justify-center shrink-0">
                    <Zap size={16} className="text-brand-primary" />
                  </div>
                  <div>
                    <p className="text-heading text-brand-primary font-semibold">+{tx.amount} USDC</p>
                    <p className="text-label-sm text-text-secondary mt-xs">{tx.campaign}</p>
                  </div>
                </div>
                <Badge label={tx.status === 'paid' ? 'Pagado' : 'Pendiente'} variant={tx.status === 'paid' ? 'success' : 'warning'} />
              </div>

              {/* Details grid */}
              <div className="flex flex-col">
                {[
                  { label: 'Concepto', value: tx.type === 'funding' ? 'Depósito de fondos · Escrow' : 'Liquidación de campaña · Soroban' },
                  { label: 'Fecha', value: tx.date },
                  { label: 'Red', value: 'Stellar Testnet' },
                  { label: 'Estado', value: tx.status === 'paid' ? 'Confirmado en ledger' : 'En proceso' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-xs border-b border-border-primary last:border-0">
                    <span className="text-text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>{row.label.toUpperCase()}</span>
                    <span className="text-label-sm text-text-primary">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* TX hash */}
              <div className="bg-bg-faint border border-border-primary rounded-corner-md p-md">
                <p className="text-text-secondary uppercase mb-xs" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>TX Stellar</p>
                <p className="text-label-sm text-brand-primary font-mono font-semibold break-all">{tx.txId || 'Pendiente'}</p>
              </div>

              {tx.txId ? (
                <a
                  href={getStellarExpertTxUrl(tx.txId)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full"
                >
                  <Button variant="neutral" size="small" iconEnd={<ExternalLink size={14} />} className="w-full">
                    Ver transacción en Stellar Expert ↗
                  </Button>
                </a>
              ) : null}
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
  const [toast, setToast] = useState(false)

  function save() {
    setEditing(false)
    setToast(true)
    setTimeout(() => setToast(false), 3000)
  }

  const walletDisplay = currentUser.wallet ? truncateAddress(currentUser.wallet) : 'G...8XK2'

  return (
    <AppShell currentPage="promoter-profile" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-2xl flex flex-col gap-2xl max-w-2xl">

        {toast && (
          <Toast message="Perfil actualizado correctamente" variant="success" progress={100} showCancel={false} onDismiss={() => setToast(false)} />
        )}

        {/* Page header */}
        <div className="flex items-start justify-between pb-2xl border-b border-border-primary">
          <div>
            <span className="text-brand-primary font-semibold block mb-xs" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
              01 — PERFIL
            </span>
            <h1 className="text-title text-text-primary">Mi perfil</h1>
            <p className="text-label-sm text-text-secondary mt-xs">Información personal y wallet Stellar</p>
          </div>
          {!editing && (
            <Button variant="neutral" iconStart={<Pencil size={16} />} onClick={() => setEditing(true)}>Editar perfil</Button>
          )}
        </div>

        {/* Identity */}
        <div className={`${CARD} flex items-center gap-xl`}>
          <Avatar type="initial" initials="DH" size="large" shape="circle" />
          <div className="flex-1">
            <p className="text-heading text-text-primary font-semibold">{name}</p>
            <p className="text-label-sm text-text-secondary mt-xs">Promotor · desde octubre 2026</p>
            <div className="flex items-center gap-md mt-md">
              <Badge label="Promotor activo" variant="success" />
            </div>
          </div>
        </div>

        {editing ? (
          <div className={`${CARD} flex flex-col gap-lg`}>
            <SectionHeading eyebrow="02 — EDITAR" title="Editar información" />
            <InputField label="Nombre completo" value={name} onChange={setName} />
            <InputField label="Teléfono" value={phone} onChange={setPhone} />
            <ButtonGroup align="end">
              <Button variant="neutral" onClick={() => setEditing(false)}>Cancelar</Button>
              <Button variant="primary" onClick={save}>Guardar cambios</Button>
            </ButtonGroup>
          </div>
        ) : (
          <>
            {/* Info */}
            <div className={`${CARD} flex flex-col`}>
              <SectionHeading eyebrow="02 — DATOS" title="Información personal" />
              {[
                { label: 'CORREO', value: 'diego@email.com' },
                { label: 'TELÉFONO', value: phone },
                { label: 'MIEMBRO DESDE', value: 'Octubre 2026' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-md border-b border-border-primary last:border-0">
                  <span className="text-text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>{row.label}</span>
                  <span className="text-label-sm text-text-primary">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Wallet */}
            <div className={`${CARD} flex flex-col gap-lg`}>
              <SectionHeading eyebrow="03 — BLOCKCHAIN" title="Wallet Stellar" />
              <div className="bg-bg-faint border border-border-primary rounded-corner-md p-lg flex items-center gap-md">
                <div className="w-2 h-2 rounded-full bg-success shrink-0" />
                <Wallet size={15} className="text-brand-primary" />
                <div className="flex-1">
                  <p className="text-label-sm text-text-primary font-semibold">{walletDisplay}</p>
                  <p className="text-video-title text-text-secondary">Wallet de recompensas Stellar</p>
                </div>
                <Badge label="Activa" variant="success" />
              </div>
              <p className="text-video-title text-text-secondary">
                Esta wallet recibe tus recompensas en USDC cuando se ejecuta la liquidación on-chain.
              </p>
              {currentUser.wallet && (
                <a
                  href={getStellarExpertAccountUrl(currentUser.wallet)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block"
                >
                  <Button variant="neutral" size="small" iconEnd={<ExternalLink size={13} />}>
                    Ver cuenta en Stellar Expert
                  </Button>
                </a>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-lg">
              <StatTile label="Campañas" value={participations.length || 2} />
              <StatTile label="Conversiones" value={promoterStats.totalConversions || 27} />
              <StatTile label="Ganancias" value={`${promoterStats.totalEarnings || 63} USDC`} accent />
            </div>

            {/* Quick links */}
            <div className={CARD}>
              <SectionHeading eyebrow="04 — ACCESOS" title="Accesos rápidos" />
              <div className="flex flex-col">
                {[
                  { label: 'Mis ganancias', page: 'promoter-earnings' as const, icon: TrendingUp },
                  { label: 'Estado de cuenta', page: 'account-statement' as const, icon: BarChart2 },
                  { label: 'Historial de transacciones', page: 'transaction-history' as const, icon: Zap },
                ].map(({ label, page, icon: Icon }) => (
                  <button
                    key={page}
                    onClick={() => navigate(page)}
                    className="flex items-center gap-md py-md px-lg rounded-corner-md hover:bg-bg-faint transition-colors text-left border-b border-border-primary last:border-0 cursor-pointer"
                  >
                    <Icon size={15} className="text-brand-primary shrink-0" />
                    <span className="text-label-sm text-text-primary flex-1">{label}</span>
                    <ChevronRight size={13} className="text-text-secondary" />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}


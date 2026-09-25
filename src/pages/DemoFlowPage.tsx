import { useState, useEffect, useRef } from 'react'
import { Button, Badge, AstraLogo, useTheme } from '@figma/astraui'
import {
  Building2, User, Zap, ArrowDown, ArrowRight, Play, Pause, RotateCcw,
  CheckCircle, Wallet, Share2, QrCode, BarChart2, Landmark,
  Sun, Moon, ChevronRight, ChevronDown
} from 'lucide-react'
import { NavProps } from '../types'

// ─── Types ───────────────────────────────────────────────────────────────────

type Actor = 'negocio' | 'sistema' | 'promotor' | 'stellar'

interface FlowStep {
  id: number
  actor: Actor
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  description: string
  detail: string
  cta?: { label: string; page: string; params?: Record<string, unknown> }
}

// ─── Flow data ────────────────────────────────────────────────────────────────

const FLOW_STEPS: FlowStep[] = [
  {
    id: 1,
    actor: 'negocio',
    icon: Building2,
    title: 'Negocio crea campaña',
    description: 'Define objetivo, recompensa y fondos',
    detail: 'El negocio configura la campaña: nombre, descripción, acción de conversión, recompensa en USDC, máximo de conversiones y fechas de vigencia.',
    cta: { label: 'Crear campaña', page: 'create-campaign' },
  },
  {
    id: 2,
    actor: 'negocio',
    icon: Wallet,
    title: 'Financia la campaña',
    description: 'Deposita USDC en el contrato Soroban',
    detail: 'Los fondos se transfieren desde la wallet Stellar del negocio al smart contract Soroban. El dinero queda bloqueado hasta la liquidación.',
    cta: { label: 'Ver contrato', page: 'create-campaign' },
  },
  {
    id: 3,
    actor: 'promotor',
    icon: User,
    title: 'Promotor se inscribe',
    description: 'Encuentra y se une a la campaña',
    detail: 'El promotor navega el catálogo de campañas disponibles, revisa condiciones y recompensas, y solicita unirse con un clic.',
    cta: { label: 'Explorar campañas', page: 'explore-campaigns' },
  },
  {
    id: 4,
    actor: 'sistema',
    icon: Zap,
    title: 'LocalLoop genera DIEGO82',
    description: 'Código único + QR de seguimiento',
    detail: 'El sistema asigna automáticamente un código de referido único (ej. DIEGO82) y genera un enlace de rastreo y QR listos para compartir.',
    cta: { label: 'Ver código', page: 'my-code', params: { campaignId: '1', code: 'DIEGO82' } },
  },
  {
    id: 5,
    actor: 'promotor',
    icon: Share2,
    title: 'Promotor comparte código/QR',
    description: 'Difunde en redes, chat y boca a boca',
    detail: 'El promotor comparte su código o enlace QR en WhatsApp, Instagram, TikTok o directamente con amigos. Cada visita queda trazada.',
    cta: { label: 'Ver cómo compartir', page: 'my-code', params: { campaignId: '1', code: 'DIEGO82' } },
  },
  {
    id: 6,
    actor: 'sistema',
    icon: QrCode,
    title: 'Cliente realiza la acción',
    description: 'Usa el código al completar la conversión',
    detail: 'El cliente ingresa al negocio (físico o digital) y realiza la acción definida (compra, registro, reserva) usando el código DIEGO82.',
  },
  {
    id: 7,
    actor: 'sistema',
    icon: CheckCircle,
    title: 'Conversión registrada',
    description: 'LocalLoop valida y registra on-chain',
    detail: 'LocalLoop verifica que la acción cumple las condiciones (primera compra, monto mínimo, etc.) y registra la conversión asociada al promotor.',
    cta: { label: 'Ver conversiones', page: 'campaign-conversions', params: { campaignId: '1' } },
  },
  {
    id: 8,
    actor: 'negocio',
    icon: BarChart2,
    title: 'Campaña finaliza',
    description: 'Alcanzó su fecha límite o cupo máximo',
    detail: 'Cuando la campaña llega a su fecha de cierre o completa todas las conversiones disponibles, entra automáticamente en estado "En cierre".',
    cta: { label: 'Cerrar campaña', page: 'close-campaign', params: { campaignId: '1' } },
  },
  {
    id: 9,
    actor: 'negocio',
    icon: CheckCircle,
    title: 'Negocio confirma conversiones',
    description: 'Aprueba el listado final de conversiones',
    detail: 'El negocio revisa el resumen de conversiones pendientes, confirma que son válidas y aprueba la liquidación para cada promotor.',
    cta: { label: 'Ver resumen', page: 'liquidation-summary', params: { campaignId: '1' } },
  },
  {
    id: 10,
    actor: 'sistema',
    icon: Zap,
    title: 'Soroban ejecuta liquidación',
    description: 'Smart contract distribuye los fondos',
    detail: 'El contrato Soroban calcula los montos (conversiones × recompensa por promotor) y ejecuta la distribución de USDC de forma automática e inmutable.',
    cta: { label: 'Ver liquidación', page: 'liquidation-summary', params: { campaignId: '1' } },
  },
  {
    id: 11,
    actor: 'stellar',
    icon: Landmark,
    title: 'Stellar distribuye USDC',
    description: 'Transferencias on-chain verificables',
    detail: 'La red Stellar procesa las transferencias en segundos con comisiones mínimas. Cada promotor recibe exactamente los USDC que le corresponden en su wallet.',
    cta: { label: 'Ver historial Stellar', page: 'transaction-history' },
  },
  {
    id: 12,
    actor: 'promotor',
    icon: Wallet,
    title: 'Promotor ve su ganancia',
    description: 'USDC reflejado en estado de cuenta',
    detail: 'El promotor puede ver el ingreso en su estado de cuenta, el historial de transacciones en la red Stellar y retirar sus USDC cuando quiera.',
    cta: { label: 'Ver estado de cuenta', page: 'account-statement' },
  },
]

// ─── Actor config ─────────────────────────────────────────────────────────────

const ACTOR_CONFIG: Record<Actor, { label: string; badge: 'brand' | 'secondary' | 'success' | 'default'; dot: string }> = {
  negocio: { label: 'Negocio', badge: 'brand', dot: 'bg-brand-primary' },
  sistema: { label: 'LocalLoop', badge: 'secondary', dot: 'bg-text-secondary' },
  promotor: { label: 'Promotor', badge: 'success', dot: 'bg-success' },
  stellar: { label: 'Stellar', badge: 'default', dot: 'bg-text-primary' },
}

// ─── ThemeToggle ──────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 rounded-corner-full bg-surface-bg border border-border-primary flex items-center justify-center text-text-secondary hover:bg-surface-hover transition-colors"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}

// ─── Step Card ────────────────────────────────────────────────────────────────

function StepCard({
  step, active, expanded, onClick, onNavigate
}: {
  step: FlowStep
  active: boolean
  expanded: boolean
  onClick: () => void
  onNavigate: (page: string, params?: Record<string, unknown>) => void
}) {
  const ac = ACTOR_CONFIG[step.actor]
  const Icon = step.icon

  return (
    <div
      className={`rounded-corner-lg border transition-all cursor-pointer ${
        active
          ? 'border-brand-primary bg-surface-bg shadow-sm'
          : 'border-border-primary bg-bg-faint hover:bg-surface-hover'
      }`}
      onClick={onClick}
    >
      {/* Header row */}
      <div className="flex items-center gap-lg p-lg">
        {/* Step number */}
        <div className={`w-8 h-8 rounded-corner-full flex items-center justify-center shrink-0 text-label-sm font-semibold ${
          active ? 'bg-brand-primary text-on-brand' : 'bg-bg-subtle text-text-secondary'
        }`}>
          {step.id}
        </div>

        {/* Icon */}
        <div className={`w-9 h-9 rounded-corner-md flex items-center justify-center shrink-0 ${
          active ? 'bg-brand-tertiary' : 'bg-bg-subtle'
        }`}>
          <Icon size={18} className={active ? 'text-brand-primary' : 'text-text-secondary'} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-md mb-xs">
            <Badge label={ac.label} variant={ac.badge} />
          </div>
          <p className={`text-label font-semibold truncate ${active ? 'text-text-primary' : 'text-text-secondary'}`}>
            {step.title}
          </p>
          <p className="text-video-title text-text-secondary mt-xs">{step.description}</p>
        </div>

        {/* Expand chevron */}
        <div className={`shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}>
          <ChevronDown size={16} className="text-text-secondary" />
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-lg pb-lg flex flex-col gap-md border-t border-border-primary pt-lg ml-[3.25rem]">
          <p className="text-label-sm text-text-secondary leading-relaxed">{step.detail}</p>
          {step.cta && (
            <button
              className="flex items-center gap-xs text-label-sm text-brand-primary font-semibold hover:underline self-start"
              onClick={e => { e.stopPropagation(); onNavigate(step.cta!.page, step.cta!.params) }}
            >
              {step.cta.label} <ChevronRight size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main demo flow page ──────────────────────────────────────────────────────

export function DemoFlowPage({ navigate, setUserType }: NavProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [expandedStep, setExpandedStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setActiveStep(prev => {
          const next = prev + 1
          if (next >= FLOW_STEPS.length) {
            setPlaying(false)
            return prev
          }
          setExpandedStep(next)
          return next
        })
      }, 2800)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [playing])

  // Scroll active step into view
  useEffect(() => {
    stepRefs.current[activeStep]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [activeStep])

  function handleStepClick(i: number) {
    setActiveStep(i)
    setExpandedStep(expandedStep === i ? -1 : i)
    setPlaying(false)
  }

  function handleNavigate(page: string, params?: Record<string, unknown>) {
    const isPromoterPage = ['explore-campaigns', 'my-code', 'promoter-campaigns', 'account-statement', 'transaction-history'].includes(page)
    const isBusinessPage = ['create-campaign', 'close-campaign', 'liquidation-summary', 'campaign-conversions', 'my-campaigns'].includes(page)
    if (isPromoterPage) setUserType('promoter')
    else if (isBusinessPage) setUserType('business')
    navigate(page as Parameters<typeof navigate>[0], params)
  }

  function reset() {
    setPlaying(false)
    setActiveStep(0)
    setExpandedStep(0)
  }

  const currentStep = FLOW_STEPS[activeStep]
  const pct = Math.round(((activeStep + 1) / FLOW_STEPS.length) * 100)

  return (
    <div className="min-h-screen bg-brand-tertiary">

      {/* Top nav */}
      <header className="sticky top-0 z-10 bg-surface-bg border-b border-border-primary">
        <div className="max-w-5xl mx-auto px-2xl py-lg flex items-center gap-xl">
          <button
            onClick={() => navigate('landing')}
            className="flex items-center gap-md text-text-secondary hover:text-text-primary transition-colors"
          >
            <AstraLogo size={22} />
            <span className="text-label font-semibold text-text-primary">LocalLoop</span>
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-md">
            <Badge label={`Paso ${activeStep + 1} de ${FLOW_STEPS.length}`} variant="secondary" />
            <ThemeToggle />
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-bg-subtle">
          <div className="h-full bg-brand-primary transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-2xl py-2xl">

        {/* Hero */}
        <div className="text-center mb-2xl">
          <h1 className="text-title text-text-primary font-semibold">Flujo completo LocalLoop</h1>
          <p className="text-label-sm text-text-secondary mt-xs max-w-xl mx-auto">
            Desde que un negocio crea su campaña hasta que el promotor recibe sus USDC en Stellar.
            Un ciclo completo de marketing basado en resultados.
          </p>

          {/* Actor legend */}
          <div className="flex items-center justify-center gap-xl mt-lg flex-wrap">
            {(Object.entries(ACTOR_CONFIG) as [Actor, typeof ACTOR_CONFIG[Actor]][]).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-xs">
                <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className="text-video-title text-text-secondary">{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Split layout */}
        <div className="grid grid-cols-5 gap-xl items-start">

          {/* Left — step list */}
          <div className="col-span-3 flex flex-col gap-md">

            {/* Playback controls */}
            <div className="bg-surface-bg rounded-corner-lg border border-border-primary p-lg flex items-center gap-lg mb-xs">
              <button
                className="w-9 h-9 rounded-corner-full bg-brand-primary flex items-center justify-center text-on-brand hover:opacity-90 transition-opacity shrink-0"
                onClick={() => {
                  if (activeStep >= FLOW_STEPS.length - 1 && !playing) reset()
                  setPlaying(p => !p)
                }}
              >
                {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
              </button>
              <div className="flex-1">
                <p className="text-label-sm text-text-primary font-semibold">
                  {playing ? 'Reproduciendo demo...' : 'Tour guiado automático'}
                </p>
                <p className="text-video-title text-text-secondary">
                  {playing ? `Paso ${activeStep + 1}: ${currentStep.title}` : 'Pulsa play para recorrer el flujo paso a paso'}
                </p>
              </div>
              <button
                className="w-8 h-8 rounded-corner-md flex items-center justify-center text-text-secondary hover:bg-surface-hover transition-colors"
                onClick={reset}
              >
                <RotateCcw size={15} />
              </button>
            </div>

            {FLOW_STEPS.map((step, i) => (
              <div key={step.id} ref={el => { stepRefs.current[i] = el }}>
                <StepCard
                  step={step}
                  active={activeStep === i}
                  expanded={expandedStep === i}
                  onClick={() => handleStepClick(i)}
                  onNavigate={handleNavigate}
                />
                {i < FLOW_STEPS.length - 1 && (
                  <div className="flex justify-center py-xs">
                    <ArrowDown size={14} className="text-border-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right — context panel */}
          <div className="col-span-2 sticky top-28 flex flex-col gap-xl">

            {/* Active step detail */}
            <div className="bg-surface-bg rounded-corner-lg border border-border-primary p-xl flex flex-col gap-lg">
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-corner-full bg-brand-tertiary flex items-center justify-center shrink-0">
                  {(() => { const Icon = currentStep.icon; return <Icon size={20} className="text-brand-primary" /> })()}
                </div>
                <div>
                  <Badge label={ACTOR_CONFIG[currentStep.actor].label} variant={ACTOR_CONFIG[currentStep.actor].badge} />
                </div>
              </div>

              <div>
                <p className="text-label text-text-primary font-semibold">{currentStep.title}</p>
                <p className="text-label-sm text-text-secondary mt-xs leading-relaxed">{currentStep.detail}</p>
              </div>

              {currentStep.cta && (
                <Button
                  variant="primary"
                  iconEnd={<ArrowRight size={16} />}
                  onClick={() => handleNavigate(currentStep.cta!.page, currentStep.cta!.params)}
                >
                  {currentStep.cta.label}
                </Button>
              )}

              {/* Prev / next */}
              <div className="flex gap-md pt-xs border-t border-border-primary">
                <Button
                  variant="subtle"
                  size="small"
                  disabled={activeStep === 0}
                  onClick={() => handleStepClick(activeStep - 1)}
                >
                  ← Anterior
                </Button>
                <div className="flex-1" />
                <Button
                  variant={activeStep === FLOW_STEPS.length - 1 ? 'neutral' : 'primary'}
                  size="small"
                  disabled={activeStep === FLOW_STEPS.length - 1}
                  onClick={() => handleStepClick(activeStep + 1)}
                >
                  Siguiente →
                </Button>
              </div>
            </div>

            {/* Quick access */}
            <div className="bg-surface-bg rounded-corner-lg border border-border-primary p-xl flex flex-col gap-md">
              <p className="text-label text-text-primary font-semibold">Acceso rápido</p>
              <div className="flex flex-col gap-xs">
                {[
                  { label: 'App de Negocio', page: 'business-dashboard', ut: 'business' as const },
                  { label: 'App de Promotor', page: 'promoter-dashboard', ut: 'promoter' as const },
                  { label: 'Crear campaña', page: 'create-campaign', ut: 'business' as const },
                  { label: 'Explorar campañas', page: 'explore-campaigns', ut: 'promoter' as const },
                ].map(item => (
                  <button
                    key={item.page}
                    onClick={() => { setUserType(item.ut); navigate(item.page as Parameters<typeof navigate>[0]) }}
                    className="flex items-center gap-md py-sm px-md rounded-corner-md hover:bg-surface-hover transition-colors text-left"
                  >
                    <ChevronRight size={14} className="text-brand-primary shrink-0" />
                    <span className="text-label-sm text-text-primary">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Blockchain badge */}
            <div className="bg-bg-faint border border-border-primary rounded-corner-lg p-lg flex flex-col gap-md">
              <div className="flex items-center gap-md">
                <Zap size={16} className="text-brand-primary" />
                <p className="text-label-sm text-text-primary font-semibold">Powered by Stellar + Soroban</p>
              </div>
              <p className="text-video-title text-text-secondary">
                Los fondos se mantienen en un smart contract hasta la liquidación. Las transferencias son on-chain, verificables y definitivas.
              </p>
            </div>

          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-2xl pt-2xl border-t border-border-primary flex flex-col items-center gap-xl">
          <p className="text-label text-text-secondary text-center">¿Listo para comenzar?</p>
          <div className="flex gap-md">
            <Button
              variant="primary"
              iconStart={<Building2 size={16} />}
              onClick={() => { setUserType('business'); navigate('register-business') }}
            >
              Soy un negocio
            </Button>
            <Button
              variant="neutral"
              iconStart={<User size={16} />}
              onClick={() => { setUserType('promoter'); navigate('register-promoter') }}
            >
              Soy promotor
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}

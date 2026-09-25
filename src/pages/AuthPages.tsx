import { useState } from 'react'
import { Button, ButtonGroup, InputField, TextareaField, SelectField, Badge, useTheme } from '@figma/astraui'
import {
  Building2, User, Zap, Moon, Sun, ArrowRight, CheckCircle, Wallet,
  Share2, BarChart2, Landmark, ExternalLink, ShieldCheck, Sparkles, Copy, Check, ChevronRight
} from 'lucide-react'
import { NavProps } from '../types'
import { WalletConnectBox } from '../components/WalletConnectBox'
import { Logo } from '../components/Logo'

// ─── Shared constants ─────────────────────────────────────────────────────────

const FORM = 'flex flex-col gap-lg'
const LIVE_TESTNET_TX_HASH = '6b5286a7a5a820f7f25b3e0874f355c185cf3ebfbce2b60c7cbb81f4b4d4e5ab'
const LIVE_TESTNET_TX_URL = `https://stellar.expert/explorer/testnet/tx/${LIVE_TESTNET_TX_HASH}`

// Reusable theme toggle button
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label="Cambiar tema"
      className={`w-9 h-9 rounded-full bg-surface-bg border border-border-primary flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors shadow-xs ${className}`}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}

// Shared split-screen wrapper for auth pages
// Left = brand panel · Right = form
function AuthSplit({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 relative">
      <ThemeToggle className="absolute top-4 right-4 z-40" />
      {/* Brand panel */}
      <div className="bg-surface-bg border-r border-border-primary flex flex-col justify-between p-2xl">
        {left}
      </div>
      {/* Form panel */}
      <div className="bg-brand-tertiary flex items-center justify-center p-2xl overflow-y-auto">
        <div className="w-full max-w-sm py-2xl">
          {right}
        </div>
      </div>
    </div>
  )
}

// Brand panel content shared across auth pages
function BrandPanel({
  eyebrow,
  headline,
  sub,
}: { eyebrow: string; headline: string; sub: string }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <Logo size="sm" variant="auto" />
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Stellar Testnet
        </span>
      </div>
      <div className="flex flex-col gap-lg my-auto">
        <div className="flex flex-col gap-md">
          <p className="text-video-title text-[#00B686] font-semibold tracking-widest uppercase">{eyebrow}</p>
          <h2 className="text-title text-text-primary font-semibold leading-snug">{headline}</h2>
          <p className="text-label-sm text-text-secondary max-w-xs leading-relaxed">{sub}</p>
        </div>
        {/* Loop mini-diagram */}
        <div className="flex flex-col gap-xs pt-lg border-t border-border-primary">
          {[
            { n: '01', label: 'Negocio crea y financia campaña' },
            { n: '02', label: 'Promotor recibe código único' },
            { n: '03', label: 'Conversión verificada on-chain' },
            { n: '04', label: 'USDC distribuido por Stellar' },
          ].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-md py-xs">
              <span className="text-video-title text-[#00B686] font-semibold w-6 shrink-0">{n}</span>
              <div className="flex-1 h-px bg-border-primary" />
              <span className="text-label-sm text-text-secondary">{label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-xs text-text-secondary pt-xl border-t border-border-primary/50">
        <Zap size={14} className="text-[#00B686]" />
        <span className="text-video-title">Powered by Stellar Horizon · Soroban Smart Contracts</span>
      </div>
    </>
  )
}

// ─── Landing ──────────────────────────────────────────────────────────────────

const LOOP_STEPS = [
  { n: '01', label: 'Negocio crea campaña', actor: 'Negocio', icon: Building2 },
  { n: '02', label: 'Financia escrow con USDC', actor: 'Negocio', icon: Wallet },
  { n: '03', label: 'Promotor se inscribe', actor: 'Promotor', icon: User },
  { n: '04', label: 'Código & QR único generado', actor: 'LocalLoop', icon: Zap },
  { n: '05', label: 'Promotor comparte en redes', actor: 'Promotor', icon: Share2 },
  { n: '06', label: 'Conversión verificada', actor: 'LocalLoop', icon: CheckCircle },
  { n: '07', label: 'Confirmación y cierre', actor: 'Negocio', icon: BarChart2 },
  { n: '08', label: 'Stellar liquida USDC a wallet', actor: 'Stellar', icon: Landmark },
]

export function LandingPage({ navigate, setUserType }: NavProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyTx = () => {
    navigator.clipboard.writeText(LIVE_TESTNET_TX_HASH)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-brand-tertiary flex flex-col selection:bg-[#00B686]/20 selection:text-[#0B2545] dark:selection:text-[#00B686]">
      {/* ── Sticky Glassmorphic Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-border-primary bg-surface-bg/85 backdrop-blur-md transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <Logo size="sm" variant="auto" />
          </div>

          {/* Quick anchor links */}
          <div className="hidden md:flex items-center gap-6 text-sm text-text-secondary">
            <a href="#como-funciona" className="hover:text-text-primary transition-colors">¿Cómo funciona?</a>
            <a href="#roles" className="hover:text-text-primary transition-colors">Roles</a>
            <a href="#tecnologia" className="hover:text-text-primary transition-colors">Stellar Tech</a>
            <a href="#evidencia" className="hover:text-text-primary transition-colors flex items-center gap-1 text-[#00B686] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B686] animate-pulse"></span>
              On-Chain Live
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('demo-flow')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-brand-primary bg-brand-tertiary hover:bg-surface-hover border border-border-primary transition-colors"
            >
              <Zap size={13} className="text-[#00B686]" />
              Flujo Demo
            </button>
            <ThemeToggle />
            <button
              onClick={() => navigate('login')}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors px-2 py-1 font-medium"
            >
              Ingresar
            </button>
            <Button
              variant="primary"
              size="small"
              onClick={() => navigate('select-type')}
            >
              Crear cuenta
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <div className="flex-1 flex flex-col">
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-12 lg:pt-16 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Live Testnet Status Pill */}
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-[#00B686]/10 border border-[#00B686]/30 text-xs font-medium text-[#00B686]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B686] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00B686]"></span>
              </span>
              <span>Stellar Testnet Live · Protocolo Soroban v21</span>
            </div>

            {/* Headline */}
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text-primary leading-[1.15]">
                Marketing de referidos que liquida{' '}
                <span className="text-[#00B686]">on-chain</span> y paga por resultados.
              </h1>
              <p className="text-base sm:text-lg text-text-secondary max-w-xl leading-relaxed">
                Conecta tu negocio con promotores locales sin intermediarios. Los fondos se bloquean en custodia de smart contracts Soroban y se liquidan automáticamente en USDC a la wallet Freighter al confirmar conversiones.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                iconEnd={<ArrowRight size={16} />}
                onClick={() => { setUserType('business'); navigate('register-business') }}
              >
                Soy un negocio
              </Button>
              <Button
                variant="neutral"
                onClick={() => { setUserType('promoter'); navigate('register-promoter') }}
              >
                Soy promotor
              </Button>
              <button
                type="button"
                onClick={() => navigate('demo-flow')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors ml-1 font-medium"
              >
                Ver simulador interactivo <ChevronRight size={15} />
              </button>
            </div>

            {/* Trust Badges Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-border-primary mt-2">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <ShieldCheck size={16} className="text-[#00B686] shrink-0" />
                <span>Fondos en Escrow</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Zap size={16} className="text-[#00B686] shrink-0" />
                <span>Liquidación en ~3.5s</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Wallet size={16} className="text-[#00B686] shrink-0" />
                <span>Pagos en USDC</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <ExternalLink size={16} className="text-[#00B686] shrink-0" />
                <span>Stellar Expert Live</span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Interactive Cycle & Live Proof Card */}
          <div id="como-funciona" className="lg:col-span-5 bg-surface-bg border border-border-primary rounded-2xl p-5 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-primary">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00B686] animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                  Ciclo de Liquidación On-Chain
                </span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-bg-faint text-text-secondary border border-border-primary">
                Soroban Escrow
              </span>
            </div>

            {/* Mini Timeline of the 8 steps */}
            <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
              {LOOP_STEPS.map(({ n, label, actor, icon: Icon }, i) => {
                const isNegocio = actor === 'Negocio'
                const isPromotor = actor === 'Promotor'
                const isStellar = actor === 'Stellar'
                return (
                  <div key={n} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-surface-hover transition-colors">
                    <span className="text-[10px] font-mono font-bold text-[#00B686] w-4 shrink-0">{n}</span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      isStellar ? 'bg-[#00B686]/20 text-[#00B686]' : isNegocio ? 'bg-[#0B2545]/10 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    }`}>
                      <Icon size={11} />
                    </div>
                    <span className="text-xs font-medium text-text-primary flex-1 truncate">{label}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-faint text-text-secondary font-mono">
                      {actor}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Live On-Chain Settlement Card */}
            <div className="mt-1 p-3.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-primary flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[#00B686]" />
                  Última liquidación en Testnet
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  Ledger #4866336
                </span>
              </div>
              <div className="flex items-center justify-between bg-surface-bg/80 border border-border-primary rounded-lg p-2 text-xs font-mono">
                <span className="truncate max-w-[200px] text-text-secondary" title={LIVE_TESTNET_TX_HASH}>
                  tx/{LIVE_TESTNET_TX_HASH.slice(0, 10)}...{LIVE_TESTNET_TX_HASH.slice(-8)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopyTx}
                    title="Copiar hash de transacción"
                    className="p-1 hover:text-text-primary text-text-secondary rounded transition-colors"
                  >
                    {copied ? <Check size={12} className="text-[#00B686]" /> : <Copy size={12} />}
                  </button>
                  <a
                    href={LIVE_TESTNET_TX_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver en Stellar Expert"
                    className="p-1 hover:text-[#00B686] text-text-secondary rounded transition-colors"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-text-secondary">
                <span>Data Entry: <code className="text-[#00B686]">54 USDC Settlement</code></span>
                <a
                  href={LIVE_TESTNET_TX_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00B686] font-medium hover:underline inline-flex items-center gap-0.5"
                >
                  Stellar Expert ↗
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Key Metrics Strip ── */}
        <div className="border-y border-border-primary bg-surface-bg/50 backdrop-blur-xs py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-text-primary">~3.5s</p>
              <p className="text-xs text-text-secondary mt-1">Tiempo de liquidación en Stellar</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-[#00B686]">0.00001 XLM</p>
              <p className="text-xs text-text-secondary mt-1">Tarifa mínima por transacción</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-text-primary">100%</p>
              <p className="text-xs text-text-secondary mt-1">Custodia auditable en smart contract</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-[#00B686]">USDC</p>
              <p className="text-xs text-text-secondary mt-1">Moneda estable sin volatilidad</p>
            </div>
          </div>
        </div>

        {/* ── Section 01: Roles ── */}
        <div id="roles" className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-widest text-[#00B686] uppercase">01 — Ecosistema Bilateral</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mt-2">
              Diseñado para negocios reales y promotores locales
            </h2>
            <p className="text-sm text-text-secondary mt-2">
              Sin burocracia, sin retenciones indebidas. La confianza está escrita en el código.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Business card */}
            <div className="bg-surface-bg border border-border-primary hover:border-[#00B686]/40 transition-colors rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary">Para Negocios</h3>
                  <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                    Crea campañas de referidos con presupuesto bloqueado en escrow. Paga únicamente cuando se generan conversiones verificadas.
                  </p>
                </div>
                <div className="flex flex-col gap-2.5 pt-2">
                  {[
                    'Define la recompensa fija en USDC por conversión',
                    'Financia con Freighter en Stellar Testnet',
                    'Dashboard en tiempo real con estadísticas y ROI',
                    'Liquidación masiva automática en 1 clic al cierre',
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-xs text-text-secondary">
                      <CheckCircle size={14} className="text-[#00B686] shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-6 mt-6 border-t border-border-primary">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => { setUserType('business'); navigate('register-business') }}
                >
                  Empezar como negocio
                </Button>
              </div>
            </div>

            {/* Promoter card */}
            <div className="bg-surface-bg border border-border-primary hover:border-purple-500/40 transition-colors rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary">Para Promotores</h3>
                  <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                    Elige campañas activas, comparte tu código único o QR y recibe USDC directamente en tu wallet Stellar por cada conversión confirmada.
                  </p>
                </div>
                <div className="flex flex-col gap-2.5 pt-2">
                  {[
                    'Código y enlace QR de atribución únicos',
                    'Pagos garantizados gracias al escrow previo de fondos',
                    'Estado de cuenta e historial on-chain en tiempo real',
                    'Retiro directo a tu wallet personal sin intermediarios',
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-xs text-text-secondary">
                      <CheckCircle size={14} className="text-[#00B686] shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-6 mt-6 border-t border-border-primary">
                <Button
                  variant="neutral"
                  className="w-full"
                  onClick={() => { setUserType('promoter'); navigate('register-promoter') }}
                >
                  Empezar como promotor
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 02: Por qué Stellar (Open Build Track) ── */}
        <div id="tecnologia" className="border-t border-border-primary bg-surface-bg/30 py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold tracking-widest text-[#00B686] uppercase">02 — Infraestructura Blockchain</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mt-2">
                ¿Por qué Stellar es el motor perfecto para LocalLoop?
              </h2>
              <p className="text-sm text-text-secondary mt-2">
                Aprovechamos la velocidad, economía y contratos inteligentes de Stellar para transformar el marketing de afiliados.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-xl bg-surface-bg border border-border-primary flex flex-col gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#00B686]/10 text-[#00B686] flex items-center justify-center font-bold">
                  01
                </div>
                <h4 className="font-semibold text-text-primary">Soroban Escrow</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Los fondos de la campaña quedan bloqueados criptográficamente. Ninguna parte puede desviar los fondos sin cumplir las reglas de liquidación.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-surface-bg border border-border-primary flex flex-col gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#00B686]/10 text-[#00B686] flex items-center justify-center font-bold">
                  02
                </div>
                <h4 className="font-semibold text-text-primary">Pagos Nativos USDC</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Liquidamos en la stablecoin líder del mercado. Ni el negocio ni el promotor asumen el riesgo de volatilidad cripto.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-surface-bg border border-border-primary flex flex-col gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#00B686]/10 text-[#00B686] flex items-center justify-center font-bold">
                  03
                </div>
                <h4 className="font-semibold text-text-primary">Micropagos Viables</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Con comisiones de 0.00001 XLM por transacción, recompensar $1 o $5 USDC por conversión es 100% rentable y sostenible.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-surface-bg border border-border-primary flex flex-col gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#00B686]/10 text-[#00B686] flex items-center justify-center font-bold">
                  04
                </div>
                <h4 className="font-semibold text-text-primary">Freighter Wallet</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Firmas no custodiales seguras desde el navegador con soporte directo para Testnet y Mainnet.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 03: Evidencia On-Chain para el Jurado ── */}
        <div id="evidencia" className="border-t border-border-primary py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-surface-bg border border-border-primary rounded-2xl p-6 sm:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex flex-col gap-3 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-medium self-start">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Entregable Hackathon · Open Build
                </div>
                <h3 className="text-2xl font-bold text-text-primary">
                  Evidencia On-Chain en Stellar Testnet
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Esta dApp emite transacciones reales y verificables en la red pública de Stellar Testnet. Puedes consultar el ledger, firmas y metadatos del escrow directamente en el explorador oficial.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href={LIVE_TESTNET_TX_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00B686] hover:bg-[#009E74] text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <span>Ver TX en Stellar Expert</span>
                    <ExternalLink size={14} />
                  </a>
                  <a
                    href="https://github.com/GonzaloRail/LocalLoop"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-bg hover:bg-surface-hover border border-border-primary text-text-primary text-xs font-semibold transition-colors"
                  >
                    <span>Repositorio con Licencia MIT</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {/* Box detail */}
              <div className="w-full md:w-auto min-w-[280px] sm:min-w-[340px] p-4 rounded-xl bg-bg-faint border border-border-primary text-xs font-mono flex flex-col gap-2">
                <div className="flex justify-between items-center pb-2 border-b border-border-primary/50 text-[11px] text-text-secondary">
                  <span>RED</span>
                  <span className="text-[#00B686] font-semibold">STELLAR TESTNET</span>
                </div>
                <div className="flex justify-between items-center text-text-secondary">
                  <span>LEDGER</span>
                  <span className="text-text-primary font-bold">#4866336</span>
                </div>
                <div className="flex justify-between items-center text-text-secondary">
                  <span>ESTADO</span>
                  <span className="text-emerald-500 font-bold">SUCCESSFUL</span>
                </div>
                <div className="flex justify-between items-center text-text-secondary">
                  <span>TARIFA</span>
                  <span>0.00001 XLM</span>
                </div>
                <div className="flex justify-between items-center text-text-secondary">
                  <span>MEMO TEXT</span>
                  <span className="text-text-primary">TEw6MjA5MzQxOjZV</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>{/* end flex-1 */}

      {/* ── Footer ── */}
      <footer className="border-t border-border-primary bg-surface-bg shrink-0 mt-auto py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" variant="auto" />
            <span className="text-xs text-text-secondary hidden sm:inline">·</span>
            <span className="text-xs text-text-secondary">
              Marketing de afiliados descentralizado en Stellar Testnet
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs text-text-secondary">
            <button onClick={() => navigate('demo-flow')} className="hover:text-text-primary transition-colors">
              Flujo Demo
            </button>
            <a href={LIVE_TESTNET_TX_URL} target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors">
              Stellar Expert
            </a>
            <button onClick={() => navigate('login')} className="hover:text-text-primary transition-colors">
              Iniciar sesión
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}


// ─── Select type ──────────────────────────────────────────────────────────────

export function SelectTypePage({ navigate, setUserType }: NavProps) {
  return (
    <AuthSplit
      left={
        <BrandPanel
          eyebrow="Crear cuenta"
          headline="¿Cómo usarás LocalLoop?"
          sub="Elige tu rol para personalizar tu experiencia."
        />
      }
      right={
        <div className="flex flex-col gap-xl">
          <div>
            <button
              onClick={() => navigate('landing')}
              className="text-label-sm text-text-secondary hover:text-text-primary transition-colors mb-xl block"
            >
              ← Volver
            </button>
            <h1 className="text-title text-text-primary font-semibold">Elige tu perfil</h1>
            <p className="text-label-sm text-text-secondary mt-xs">Cada perfil tiene un flujo distinto</p>
          </div>
          <div className="flex flex-col gap-md">
            <button
              onClick={() => { setUserType('business'); navigate('register-business') }}
              className="bg-surface-bg border border-border-primary rounded-corner-lg p-xl flex gap-lg items-start hover:border-brand-primary transition-colors text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-corner-lg bg-brand-tertiary flex items-center justify-center shrink-0 group-hover:bg-brand-tertiary">
                <Building2 size={18} className="text-brand-primary" />
              </div>
              <div>
                <p className="text-label text-text-primary font-semibold">Soy un negocio</p>
                <p className="text-label-sm text-text-secondary mt-xs">Crea campañas y paga por resultados verificados.</p>
              </div>
              <ArrowRight size={16} className="text-text-secondary ml-auto mt-1 group-hover:text-brand-primary transition-colors" />
            </button>
            <button
              onClick={() => { setUserType('promoter'); navigate('register-promoter') }}
              className="bg-surface-bg border border-border-primary rounded-corner-lg p-xl flex gap-lg items-start hover:border-brand-primary transition-colors text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-corner-lg bg-bg-faint flex items-center justify-center shrink-0">
                <User size={18} className="text-text-secondary" />
              </div>
              <div>
                <p className="text-label text-text-primary font-semibold">Soy un promotor</p>
                <p className="text-label-sm text-text-secondary mt-xs">Promociona campañas y gana USDC por conversión.</p>
              </div>
              <ArrowRight size={16} className="text-text-secondary ml-auto mt-1 group-hover:text-brand-primary transition-colors" />
            </button>
          </div>
          <p className="text-label-sm text-text-secondary text-center">
            ¿Ya tienes cuenta?{' '}
            <button onClick={() => navigate('login')} className="text-brand-primary hover:underline">Iniciar sesión</button>
          </p>
        </div>
      }
    />
  )
}

// ─── Register Business ────────────────────────────────────────────────────────

export function RegisterBusinessPage({ navigate, setUserType }: NavProps) {
  const [form, setForm] = useState({
    name: '', email: '', password: '', category: '', description: '', phone: '', address: ''
  })
  const [wallet, setWallet] = useState<string | null>(null)

  const CATEGORY_OPTIONS = [
    { value: 'entretenimiento', label: 'Entretenimiento' },
    { value: 'gastronomia', label: 'Gastronomía' },
    { value: 'salud', label: 'Salud y Bienestar' },
    { value: 'educacion', label: 'Educación' },
    { value: 'retail', label: 'Retail' },
    { value: 'servicios', label: 'Servicios' },
    { value: 'otro', label: 'Otro' },
  ]

  return (
    <AuthSplit
      left={
        <BrandPanel
          eyebrow="Registro · Negocio"
          headline="Crea tu primera campaña de resultados."
          sub="Registra tu empresa. Fondos bloqueados hasta verificar cada conversión."
        />
      }
      right={
        <div className="flex flex-col gap-xl">
          <div>
            <button onClick={() => navigate('select-type')} className="text-label-sm text-text-secondary hover:text-text-primary transition-colors mb-xl block">← Volver</button>
            <p className="text-video-title text-brand-primary font-semibold tracking-widest uppercase mb-xs" style={{ fontSize: '0.65rem' }}>Negocio</p>
            <h1 className="text-title text-text-primary font-semibold">Crear cuenta</h1>
          </div>
          <div className={FORM}>
            <InputField label="Nombre del negocio" value={form.name} placeholder="Ej. Eventos XYZ" onChange={v => setForm(f => ({ ...f, name: v }))} />
            <div className="flex gap-lg">
              <div className="flex-1">
                <InputField label="Correo" value={form.email} placeholder="negocio@email.com" onChange={v => setForm(f => ({ ...f, email: v }))} />
              </div>
              <div className="flex-1">
                <InputField label="Teléfono" value={form.phone} placeholder="+51 999..." onChange={v => setForm(f => ({ ...f, phone: v }))} />
              </div>
            </div>
            <InputField label="Contraseña" value={form.password} placeholder="••••••••" onChange={v => setForm(f => ({ ...f, password: v }))} />
            <SelectField
              label="Categoría"
              options={CATEGORY_OPTIONS}
              value={form.category}
              onChange={v => setForm(f => ({ ...f, category: v }))}
              placeholder="Selecciona categoría"
            />
            <TextareaField
              label="Descripción"
              value={form.description}
              placeholder="Describe tu negocio..."
              rows={2}
              onChange={v => setForm(f => ({ ...f, description: v }))}
            />
            <WalletConnectBox
              wallet={wallet}
              onWalletChange={setWallet}
              helperText="Solo se recibe tu dirección pública para gestionar la custodia en Stellar."
            />
          </div>
          <Button variant="primary" onClick={() => { setUserType('business'); navigate('account-created') }}>
            Crear cuenta de negocio
          </Button>
          <p className="text-label-sm text-text-secondary text-center">
            ¿Ya tienes cuenta?{' '}
            <button onClick={() => navigate('login')} className="text-brand-primary hover:underline">Iniciar sesión</button>
          </p>
        </div>
      }
    />
  )
}

// ─── Register Promoter ────────────────────────────────────────────────────────

export function RegisterPromoterPage({ navigate, setUserType }: NavProps) {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [wallet, setWallet] = useState<string | null>(null)

  return (
    <AuthSplit
      left={
        <BrandPanel
          eyebrow="Registro · Promotor"
          headline="Gana USDC por cada conversión que generes."
          sub="Únete a campañas activas, comparte tu código y recibe pagos automáticos en Stellar."
        />
      }
      right={
        <div className="flex flex-col gap-xl">
          <div>
            <button onClick={() => navigate('select-type')} className="text-label-sm text-text-secondary hover:text-text-primary transition-colors mb-xl block">← Volver</button>
            <p className="text-video-title text-brand-primary font-semibold tracking-widest uppercase mb-xs" style={{ fontSize: '0.65rem' }}>Promotor</p>
            <h1 className="text-title text-text-primary font-semibold">Crear cuenta</h1>
          </div>
          <div className={FORM}>
            <InputField label="Nombre completo" value={form.name} placeholder="Diego Huamani" onChange={v => setForm(f => ({ ...f, name: v }))} />
            <InputField label="Correo electrónico" value={form.email} placeholder="promotor@email.com" onChange={v => setForm(f => ({ ...f, email: v }))} />
            <InputField label="Contraseña" value={form.password} placeholder="••••••••" onChange={v => setForm(f => ({ ...f, password: v }))} />
            <InputField label="Teléfono (opcional)" value={form.phone} placeholder="+51 999 999 999" onChange={v => setForm(f => ({ ...f, phone: v }))} />
            <WalletConnectBox
              wallet={wallet}
              onWalletChange={setWallet}
              helperText="Esta wallet recibirá tus recompensas en USDC mediante Stellar."
            />
          </div>
          <Button variant="primary" onClick={() => { setUserType('promoter'); navigate('account-created') }}>
            Crear cuenta de promotor
          </Button>
          <p className="text-label-sm text-text-secondary text-center">
            ¿Ya tienes cuenta?{' '}
            <button onClick={() => navigate('login', { userType: 'promoter' })} className="text-brand-primary hover:underline">Iniciar sesión</button>
          </p>
        </div>
      }
    />
  )
}

// ─── Account Created ──────────────────────────────────────────────────────────

export function AccountCreatedPage({ navigate, userType }: NavProps) {
  return (
    <AuthSplit
      left={
        <BrandPanel
          eyebrow="Cuenta creada"
          headline="Ya formas parte de LocalLoop."
          sub={userType === 'business'
            ? 'Tu empresa está lista para crear campañas y medir resultados reales.'
            : 'Ya puedes explorar campañas activas y empezar a ganar USDC.'}
        />
      }
      right={
        <div className="flex flex-col items-center gap-xl text-center">
          {/* Confirmation mark */}
          <div className="relative">
            <div className="w-20 h-20 rounded-corner-full bg-brand-tertiary flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center">
                <CheckCircle size={24} className="text-on-brand" />
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-title text-text-primary font-semibold">¡Todo listo!</h1>
            <p className="text-label-sm text-text-secondary mt-xs">
              {userType === 'business'
                ? 'Tu cuenta empresarial fue creada. Inicia sesión para crear tu primera campaña.'
                : 'Tu cuenta de promotor fue creada. Inicia sesión para explorar campañas.'}
            </p>
          </div>
          <Button
            variant="primary"
            iconEnd={<ArrowRight size={16} />}
            onClick={() => navigate('login', { userType: userType ?? 'business' })}
          >
            Iniciar sesión
          </Button>
        </div>
      }
    />
  )
}

// ─── Login ────────────────────────────────────────────────────────────────────

export function LoginPage({ navigate, params, setUserType }: NavProps) {
  const initial = (params.userType as 'business' | 'promoter') ?? 'business'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selected, setSelected] = useState<'business' | 'promoter'>(initial)

  function handleLogin() {
    setUserType(selected)
    navigate(selected === 'business' ? 'business-dashboard' : 'promoter-dashboard')
  }

  return (
    <AuthSplit
      left={
        <BrandPanel
          eyebrow="Bienvenido"
          headline="Resultados reales. Pagos automáticos."
          sub="Accede a tu cuenta para gestionar campañas o ver tus ganancias."
        />
      }
      right={
        <div className="flex flex-col gap-xl">
          <div>
            <button
              onClick={() => navigate('landing')}
              className="text-label-sm text-text-secondary hover:text-text-primary transition-colors mb-xl block"
            >
              ← Inicio
            </button>
            <h1 className="text-title text-text-primary font-semibold">Iniciar sesión</h1>
            <p className="text-label-sm text-text-secondary mt-xs">Accede a tu cuenta</p>
          </div>

          <div className={FORM}>
            {/* Role switcher */}
            <div className="flex border border-border-primary rounded-corner-md overflow-hidden">
              {(['business', 'promoter'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setSelected(t)}
                  className={`flex-1 py-2.5 px-md text-label-sm font-medium transition-colors ${
                    selected === t
                      ? 'bg-surface-bg text-brand-primary border-r border-border-primary last:border-r-0'
                      : 'text-text-secondary hover:text-text-primary bg-bg-faint'
                  }`}
                >
                  {t === 'business' ? 'Negocio' : 'Promotor'}
                </button>
              ))}
            </div>
            <InputField label="Correo electrónico" value={email} placeholder="correo@email.com" onChange={setEmail} />
            <InputField label="Contraseña" value={password} placeholder="••••••••" onChange={setPassword} />
          </div>

          <Button variant="primary" onClick={handleLogin}>
            Ingresar como {selected === 'business' ? 'negocio' : 'promotor'}
          </Button>

          <p className="text-label-sm text-text-secondary text-center">
            ¿No tienes cuenta?{' '}
            <button onClick={() => navigate('select-type')} className="text-brand-primary hover:underline">
              Crear cuenta
            </button>
          </p>
        </div>
      }
    />
  )
}

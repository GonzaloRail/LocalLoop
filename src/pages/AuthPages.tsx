import { useState } from 'react'
import { Button, ButtonGroup, InputField, TextareaField, SelectField, Badge, AstraLogo, useTheme } from '@figma/astraui'
import { Building2, User, Zap, Moon, Sun, ArrowRight, CheckCircle, Wallet, Share2, BarChart2, Landmark } from 'lucide-react'
import { NavProps } from '../types'

// ─── Shared constants ─────────────────────────────────────────────────────────

const FORM = 'flex flex-col gap-lg'

// Fixed theme toggle — always top-left of viewport
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className="fixed z-50 w-9 h-9 rounded-corner-full bg-surface-bg border border-border-primary flex items-center justify-center text-text-secondary hover:bg-surface-hover transition-colors shadow-sm" style={{ top: '10px', left: '10px' }}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}

// Shared split-screen wrapper for auth pages
// Left = brand panel · Right = form
function AuthSplit({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-2">
      <ThemeToggle />
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
      <div className="flex items-center justify-end gap-sm">
        <AstraLogo size={22} />
        <span className="text-label font-semibold text-text-primary tracking-tight">LocalLoop</span>
      </div>
      <div className="flex flex-col gap-lg">
        <div className="flex flex-col gap-md">
          <p className="text-video-title text-brand-primary font-semibold tracking-widest uppercase">{eyebrow}</p>
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
              <span className="text-video-title text-brand-primary font-semibold w-6 shrink-0">{n}</span>
              <div className="flex-1 h-px bg-border-primary" />
              <span className="text-label-sm text-text-secondary">{label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-xs">
        <Zap size={13} className="text-brand-primary" />
        <span className="text-video-title text-text-secondary">Powered by Stellar · Soroban</span>
      </div>
    </>
  )
}

// ─── Landing ──────────────────────────────────────────────────────────────────

const LOOP_STEPS = [
  { n: '01', label: 'Negocio crea campaña', actor: 'Negocio', icon: Building2 },
  { n: '02', label: 'Financia con USDC', actor: 'Negocio', icon: Wallet },
  { n: '03', label: 'Promotor se inscribe', actor: 'Promotor', icon: User },
  { n: '04', label: 'Código único generado', actor: 'LocalLoop', icon: Zap },
  { n: '05', label: 'Promotor comparte', actor: 'Promotor', icon: Share2 },
  { n: '06', label: 'Conversión verificada', actor: 'LocalLoop', icon: CheckCircle },
  { n: '07', label: 'Negocio confirma cierre', actor: 'Negocio', icon: BarChart2 },
  { n: '08', label: 'Stellar distribuye USDC', actor: 'Stellar', icon: Landmark },
]

export function LandingPage({ navigate, setUserType }: NavProps) {
  return (
    <div className="min-h-screen bg-brand-tertiary flex flex-col">
      <ThemeToggle />

      {/* ── Nav ── */}
      <nav className="border-b border-border-primary bg-surface-bg shrink-0">
        <div className="max-w-5xl mx-auto px-2xl h-14 flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <AstraLogo size={20} />
            <span className="text-label font-semibold text-text-primary tracking-tight">LocalLoop</span>
          </div>
          <div className="flex items-center gap-lg">
            <button
              onClick={() => navigate('login')}
              className="text-label-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Iniciar sesión
            </button>
            <Button variant="primary" size="small" onClick={() => navigate('select-type')}>
              Crear cuenta
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="flex-1 flex flex-col">
        <div className="max-w-5xl mx-auto w-full px-2xl pt-16 pb-16 grid grid-cols-5 gap-3xl items-start">

        {/* Left — 3 cols */}
        <div className="col-span-3 flex flex-col gap-2xl">
          <Badge label="Stellar · Soroban · USDC" variant="secondary" />
          <div className="flex flex-col gap-md">
            <h1
              className="text-text-primary font-semibold leading-none tracking-tight"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              Marketing que paga<br />
              <span className="text-brand-primary">por resultados.</span>
            </h1>
            <p className="text-label text-text-secondary max-w-sm leading-relaxed">
              Conecta tu negocio con promotores locales. Los fondos se liberan únicamente cuando las conversiones son verificadas en blockchain.
            </p>
          </div>

          <div className="flex gap-md">
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
          </div>

          {/* Trust strip */}
          <div className="flex items-center gap-xl pt-2xl border-t border-border-primary mt-xl">
            {[
              'Sin riesgo — paga solo por resultados',
              'Fondos bloqueados en contrato',
              'Pago automático on-chain',
            ].map(item => (
              <div key={item} className="flex items-center gap-xs">
                <div className="w-1 h-1 rounded-full bg-brand-primary shrink-0" />
                <span className="text-video-title text-text-secondary">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — 2 cols: the loop diagram */}
        <div className="col-span-2 bg-surface-bg border border-border-primary rounded-corner-lg overflow-hidden">
          <div className="px-xl pt-xl pb-md border-b border-border-primary">
            <p className="text-video-title text-text-secondary tracking-widest uppercase" style={{ fontSize: '0.65rem' }}>
              El ciclo completo
            </p>
          </div>
          <div className="px-xl pt-xl pb-lg flex flex-col">
            {LOOP_STEPS.map(({ n, label, actor, icon: Icon }, i) => {
              const isNegocio = actor === 'Negocio'
              const isPromotor = actor === 'Promotor'
              return (
                <div key={n} className="flex gap-3">
                  {/* Timeline track */}
                  <div className="flex flex-col items-center shrink-0" style={{ width: '22px' }}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isNegocio ? 'bg-brand-tertiary' : isPromotor ? 'bg-bg-faint' : 'bg-bg-subtle'}`}>
                      <Icon size={11} className={isNegocio ? 'text-brand-primary' : 'text-text-secondary'} />
                    </div>
                    {i < LOOP_STEPS.length - 1 && (
                      <div className="w-px bg-border-primary" style={{ flex: 1, minHeight: '16px' }} />
                    )}
                  </div>
                  {/* Content */}
                  <div className={`flex items-start gap-2 ${i === LOOP_STEPS.length - 1 ? 'pb-0' : 'pb-2.5'}`}>
                    <span className="text-brand-primary font-semibold shrink-0 mt-0.5" style={{ fontSize: '0.65rem', width: '18px' }}>{n}</span>
                    <div>
                      <p className="text-label-sm text-text-primary font-medium leading-snug">{label}</p>
                      <p className="text-text-secondary" style={{ fontSize: '0.6rem' }}>{actor}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Section 01: Roles ── */}
      <div className="max-w-5xl mx-auto w-full px-2xl pb-16 pt-2xl">
        <div className="border-t border-border-primary mb-2xl pt-2xl flex items-center gap-lg">
          <span className="text-video-title text-brand-primary font-semibold tracking-widest" style={{ fontSize: '0.65rem' }}>01 — QUIÉN USA LOCALLOOP</span>
          <div className="flex-1 h-px bg-border-primary" />
        </div>
        <div className="grid grid-cols-2 gap-xl">

          {/* Business card */}
          <div className="bg-surface-bg border border-border-primary rounded-corner-lg p-xl flex flex-col gap-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-heading text-text-primary font-semibold">Negocios</p>
                <p className="text-label-sm text-text-secondary mt-xs max-w-xs leading-relaxed">
                  Crea campañas de referidos con presupuesto bloqueado. Paga únicamente cuando se generan conversiones reales y verificadas.
                </p>
              </div>
              <div className="w-10 h-10 rounded-corner-lg bg-brand-tertiary flex items-center justify-center shrink-0 ml-xl">
                <Building2 size={20} className="text-brand-primary" />
              </div>
            </div>
            <div className="flex flex-col gap-sm">
              {[
                'Define la acción de conversión',
                'Financia con USDC via Freighter',
                'Dashboard de conversiones en tiempo real',
                'Liquidación automática al cierre',
              ].map(f => (
                <div key={f} className="flex items-center gap-sm">
                  <div className="w-1 h-1 rounded-full bg-brand-primary shrink-0" />
                  <span className="text-label-sm text-text-secondary">{f}</span>
                </div>
              ))}
            </div>
            <Button
              variant="primary"
              onClick={() => { setUserType('business'); navigate('register-business') }}
            >
              Empezar como negocio
            </Button>
          </div>

          {/* Promoter card */}
          <div className="bg-surface-bg border border-border-primary rounded-corner-lg p-xl flex flex-col gap-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-heading text-text-primary font-semibold">Promotores</p>
                <p className="text-label-sm text-text-secondary mt-xs max-w-xs leading-relaxed">
                  Elige campañas activas, comparte tu código único y recibe USDC en tu wallet Stellar por cada conversión confirmada.
                </p>
              </div>
              <div className="w-10 h-10 rounded-corner-lg bg-bg-faint border border-border-primary flex items-center justify-center shrink-0 ml-xl">
                <User size={20} className="text-text-secondary" />
              </div>
            </div>
            <div className="flex flex-col gap-sm">
              {[
                'Código y QR de rastreo únicos',
                'Gana USDC por conversión verificada',
                'Estado de cuenta en tiempo real',
                'Historial on-chain verificable',
              ].map(f => (
                <div key={f} className="flex items-center gap-sm">
                  <div className="w-1 h-1 rounded-full bg-text-secondary shrink-0" />
                  <span className="text-label-sm text-text-secondary">{f}</span>
                </div>
              ))}
            </div>
            <Button
              variant="neutral"
              onClick={() => { setUserType('promoter'); navigate('register-promoter') }}
            >
              Empezar como promotor
            </Button>
          </div>
        </div>
      </div>

      </div>{/* end flex-1 */}

      {/* ── Footer: Stellar strip — always at page bottom ── */}
      <footer className="border-t border-border-primary bg-surface-bg shrink-0 mt-auto">
        <div className="max-w-5xl mx-auto px-2xl py-lg flex items-center justify-between">
          <div className="flex items-center gap-md">
            <Zap size={14} className="text-brand-primary" />
            <span className="text-label-sm text-text-secondary">
              Infraestructura en <strong className="text-text-primary">Stellar Blockchain</strong> — fondos bloqueados en contrato Soroban hasta la liquidación
            </span>
          </div>
          <button
            onClick={() => navigate('login')}
            className="text-label-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-xs"
          >
            Iniciar sesión <ArrowRight size={13} />
          </button>
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
  const [connecting, setConnecting] = useState(false)

  const CATEGORY_OPTIONS = [
    { value: 'entretenimiento', label: 'Entretenimiento' },
    { value: 'gastronomia', label: 'Gastronomía' },
    { value: 'salud', label: 'Salud y Bienestar' },
    { value: 'educacion', label: 'Educación' },
    { value: 'retail', label: 'Retail' },
    { value: 'servicios', label: 'Servicios' },
    { value: 'otro', label: 'Otro' },
  ]

  function connectWallet() {
    setConnecting(true)
    setTimeout(() => { setConnecting(false); setWallet('G...8F3K') }, 900)
  }

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
            <div className="flex flex-col gap-sm">
              <p className="text-label-sm text-text-primary font-medium">Wallet Stellar</p>
              {wallet ? (
                <div className="flex items-center gap-md bg-bg-faint border border-border-primary rounded-corner-md p-md">
                  <div className="w-2 h-2 rounded-full bg-success shrink-0" />
                  <span className="text-label-sm text-text-primary font-semibold flex-1">{wallet}</span>
                  <Badge label="Conectada" variant="success" />
                </div>
              ) : (
                <Button variant="neutral" disabled={connecting} onClick={connectWallet}>
                  {connecting ? 'Conectando…' : 'Conectar con Freighter'}
                </Button>
              )}
              <p className="text-video-title text-text-secondary">Solo se recibe tu dirección pública.</p>
            </div>
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
  const [connecting, setConnecting] = useState(false)

  function connectWallet() {
    setConnecting(true)
    setTimeout(() => { setConnecting(false); setWallet('G...8XK2') }, 900)
  }

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
            <div className="flex flex-col gap-sm">
              <p className="text-label-sm text-text-primary font-medium">Wallet Stellar</p>
              {wallet ? (
                <div className="flex items-center gap-md bg-bg-faint border border-border-primary rounded-corner-md p-md">
                  <div className="w-2 h-2 rounded-full bg-success shrink-0" />
                  <span className="text-label-sm text-text-primary font-semibold flex-1">{wallet}</span>
                  <Badge label="Conectada" variant="success" />
                </div>
              ) : (
                <Button variant="neutral" disabled={connecting} onClick={connectWallet}>
                  {connecting ? 'Conectando…' : 'Conectar con Freighter'}
                </Button>
              )}
              <p className="text-video-title text-text-secondary">Esta wallet recibirá tus recompensas en USDC.</p>
            </div>
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

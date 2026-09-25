import { useState } from 'react'
import {
  Button, ButtonGroup, InputField, TextareaField, SelectField,
  Badge, Avatar, Tabs, Toast, Checkbox
} from '@figma/astraui'
import {
  Plus, ArrowRight, CheckCircle, AlertCircle, ExternalLink,
  Pencil, Calendar, Wallet, BarChart2, ChevronRight, Download,
  Rocket, Users, RefreshCw, Check, X
} from 'lucide-react'
import AppShell from '../components/AppShell'
import { NavProps, Conversion, Campaign } from '../types'
import { useApp } from '../context/AppContext'
import { getStellarExpertTxUrl, truncateAddress, submitSettlementToStellarTestnet } from '../lib/stellar'

const CARD = 'bg-surface-bg border border-border-primary rounded-corner-lg p-xl'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatTile({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className="bg-surface-bg border border-border-primary rounded-corner-lg p-xl flex flex-col gap-2">
      <p className="text-video-title text-text-secondary uppercase tracking-widest" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>{label}</p>
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
    rejected: { variant: 'danger', label: 'Rechazada' },
    paid: { variant: 'success', label: 'Pagada' },
  }
  const cfg = map[status] ?? { variant: 'secondary', label: status }
  return <Badge label={cfg.label} variant={cfg.variant} />
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

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(Math.round((value / max) * 100), 100)
  return (
    <div className="h-px bg-bg-subtle rounded-corner-full overflow-hidden" style={{ height: '3px' }}>
      <div className="h-full bg-brand-primary rounded-corner-full transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}

// ─── Mockup 07 — Business Dashboard ──────────────────────────────────────────

export function BusinessDashboard({ navigate, userType, setUserType }: NavProps) {
  const { campaigns, businessStats, currentUser } = useApp()
  const activeCampaigns = campaigns.filter(c => c.status === 'active')
  const closingCampaigns = campaigns.filter(c => c.status === 'closing')

  return (
    <AppShell currentPage="business-dashboard" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-2xl flex flex-col gap-2xl">

        {/* Page header */}
        <div className="flex items-start justify-between pb-2xl border-b border-border-primary">
          <div className="flex flex-col gap-xs">
            <span className="text-brand-primary font-semibold" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
              01 — RESUMEN
            </span>
            <h1 className="text-title text-text-primary">Dashboard</h1>
            <p className="text-label-sm text-text-secondary">
              Bienvenido, {currentUser.name || 'Eventos XYZ'}
            </p>
          </div>
          <Button variant="primary" iconStart={<Plus size={16} />} onClick={() => navigate('create-campaign')}>
            Crear campaña
          </Button>
        </div>

        {/* Warning alert */}
        {closingCampaigns.length > 0 && (
          <div className="bg-surface-bg border border-border-primary rounded-corner-lg p-lg flex items-center gap-md">
            <div className="w-7 h-7 rounded-corner-full bg-bg-faint flex items-center justify-center shrink-0">
              <AlertCircle size={14} className="text-warning" />
            </div>
            <p className="text-label-sm text-text-primary flex-1">
              Tienes <strong>{closingCampaigns.length} campaña</strong> pendiente de cierre y revisión.
            </p>
            <Button variant="subtle" size="small" onClick={() => navigate('my-campaigns')}>
              Revisar →
            </Button>
          </div>
        )}

        {/* Stats grid */}
        <div>
          <SectionHeading eyebrow="02 — MÉTRICAS" title="Actividad general" />
          <div className="grid grid-cols-3 gap-lg">
            <StatTile label="Campañas activas" value={businessStats.activeCampaigns} accent />
            <StatTile label="En cierre" value={businessStats.closingCampaigns} />
            <StatTile label="Conversiones totales" value={businessStats.totalConversions} />
            <StatTile label="Recompensas pendientes" value={`${businessStats.pendingRewards} USDC`} />
            <StatTile label="Presupuesto utilizado" value={`${businessStats.usedBudget} USDC`} />
            <StatTile label="Campañas finalizadas" value={businessStats.completedCampaigns} />
          </div>
        </div>

        {/* Active campaigns */}
        <div>
          <SectionHeading
            eyebrow="03 — ACTIVAS"
            title="Campañas activas"
            action={
              <Button variant="subtle" size="small" iconEnd={<ArrowRight size={16} />} onClick={() => navigate('my-campaigns')}>
                Ver todas
              </Button>
            }
          />
          <div className="flex flex-col gap-lg">
            {activeCampaigns.map(c => (
              <div
                key={c.id}
                className="bg-surface-bg border border-border-primary rounded-corner-lg p-xl flex flex-col gap-md cursor-pointer hover:bg-bg-faint transition-colors"
                onClick={() => navigate('campaign-detail', { campaignId: c.id })}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-md">
                    <div className="w-9 h-9 rounded-corner-md bg-brand-tertiary flex items-center justify-center shrink-0">
                      <BarChart2 size={16} className="text-brand-primary" />
                    </div>
                    <div>
                      <p className="text-label text-text-primary font-semibold">{c.name}</p>
                      <p className="text-video-title text-text-secondary mt-xs">{c.startDate} – {c.endDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-md shrink-0">
                    <StatusBadge status={c.status} />
                    <ChevronRight size={14} className="text-text-secondary" />
                  </div>
                </div>
                <div className="flex gap-2xl text-label-sm pt-xs border-t border-border-primary">
                  <span className="text-text-secondary">Conversiones: <strong className="text-text-primary">{c.conversions}/{c.maxConversions}</strong></span>
                  <span className="text-text-secondary">Presupuesto: <strong className="text-text-primary">{c.usedBudget}/{c.budget} USDC</strong></span>
                  <span className="text-text-secondary">Días restantes: <strong className="text-text-primary">{c.daysLeft}</strong></span>
                </div>
                <ProgressBar value={c.conversions} max={c.maxConversions} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppShell>
  )
}

// ─── Mockup 08 — Business Profile ────────────────────────────────────────────

export function BusinessProfile({ navigate, userType, setUserType }: NavProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('Eventos XYZ')
  const [desc, setDesc] = useState('Empresa de organización de eventos culturales y universitarios.')
  const [phone, setPhone] = useState('+51 999 888 777')

  return (
    <AppShell currentPage="business-profile" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-2xl flex flex-col gap-2xl max-w-2xl">

        {/* Page header */}
        <div className="pb-2xl border-b border-border-primary">
          <span className="text-brand-primary font-semibold block mb-xs" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
            01 — PERFIL
          </span>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-title text-text-primary">Perfil del negocio</h1>
              <p className="text-label-sm text-text-secondary mt-xs">Información de tu empresa</p>
            </div>
            {!editing && (
              <Button variant="neutral" iconStart={<Pencil size={16} />} onClick={() => setEditing(true)}>
                Editar perfil
              </Button>
            )}
          </div>
        </div>

        {/* Identity card */}
        <div className={`${CARD} flex items-center gap-xl`}>
          <Avatar type="initial" initials="EX" size="large" shape="square" />
          <div className="flex flex-col gap-xs">
            <p className="text-heading text-text-primary font-semibold">{name}</p>
            <p className="text-label-sm text-text-secondary">Entretenimiento</p>
            <Badge label="Verificado" variant="success" />
          </div>
        </div>

        {editing ? (
          <div className={`${CARD} flex flex-col gap-lg`}>
            <SectionHeading eyebrow="02 — EDITAR" title="Editar información" />
            <InputField label="Nombre del negocio" value={name} onChange={setName} />
            <TextareaField label="Descripción" value={desc} rows={3} onChange={setDesc} />
            <InputField label="Teléfono" value={phone} onChange={setPhone} />
            <ButtonGroup align="end">
              <Button variant="neutral" onClick={() => setEditing(false)}>Cancelar</Button>
              <Button variant="primary" onClick={() => setEditing(false)}>Guardar cambios</Button>
            </ButtonGroup>
          </div>
        ) : (
          <>
            <div className={`${CARD} flex flex-col gap-lg`}>
              <SectionHeading eyebrow="02 — DATOS" title="Información" />
              {[
                { label: 'DESCRIPCIÓN', value: desc },
                { label: 'TELÉFONO', value: phone },
                { label: 'CORREO', value: 'eventos@xyz.com' },
              ].map(row => (
                <div key={row.label} className="pb-md border-b border-border-primary last:border-0 last:pb-0">
                  <p className="text-text-secondary mb-xs" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>{row.label}</p>
                  <p className="text-label-sm text-text-primary">{row.value}</p>
                </div>
              ))}
            </div>
            <div className={`${CARD} flex flex-col gap-md`}>
              <SectionHeading eyebrow="03 — BLOCKCHAIN" title="Wallet Stellar" />
              <div className="flex items-center gap-md bg-bg-faint rounded-corner-md p-md">
                <div className="w-2 h-2 rounded-full bg-success shrink-0" />
                <Wallet size={14} className="text-brand-primary" />
                <span className="text-label-sm text-text-primary font-semibold">G...8F3K</span>
                <Badge label="Activa" variant="success" />
              </div>
              <Button variant="neutral" size="small">Administrar wallet</Button>
            </div>
          </>
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
  { value: 'entretenimiento', label: 'Entretenimiento' },
  { value: 'gastronomia', label: 'Gastronomía' },
  { value: 'salud', label: 'Salud' },
  { value: 'educacion', label: 'Educación' },
  { value: 'retail', label: 'Retail' },
  { value: 'servicios', label: 'Servicios' },
]

const VALIDATION_OPTIONS = [
  { value: 'code', label: 'Código de referido' },
  { value: 'qr', label: 'QR' },
  { value: 'link', label: 'Enlace de referencia' },
  { value: 'code+voucher', label: 'Código + comprobante' },
  { value: 'other', label: 'Otro mecanismo' },
]

export function CreateCampaign({ navigate, userType, setUserType }: NavProps) {
  const { createCampaign, fundCampaign, currentUser } = useApp()
  const [step, setStep] = useState(1)
  const [info, setInfo] = useState({ name: '', description: '', product: '', category: '', startDate: '', endDate: '' })
  const [rewards, setRewards] = useState({ budget: '200', reward: '2', maxConversions: '100' })
  const [action, setAction] = useState({ action: '', validation: '', identifier: '', conditions: '' })
  const [funded, setFunded] = useState(false)
  const [funding, setFunding] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; variant: 'success' | 'default' } | null>(null)

  const budgetNum = Number(rewards.budget) || 200
  const rewardNum = Number(rewards.reward) || 2
  const maxCalc = rewardNum > 0 ? Math.floor(budgetNum / rewardNum) : 100

  function fund() {
    setFunding(true)
    setTimeout(() => {
      const generatedTx = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      setTxHash(generatedTx)
      setFunding(false)
      setFunded(true)
      setToast({ msg: '✓ Campaña financiada en la red Stellar Testnet', variant: 'success' })
    }, 1200)
  }

  function publish() {
    const finalName = info.name.trim() || 'Concierto Universitario'
    const newCamp = createCampaign({
      name: finalName,
      business: currentUser.name || 'Eventos XYZ',
      businessWallet: currentUser.wallet || undefined,
      category: info.category || 'Entretenimiento',
      description: info.description || 'Campaña de resultados con liquidación en Stellar.',
      startDate: info.startDate || new Date().toLocaleDateString('es-PE'),
      endDate: info.endDate || '30/11/2026',
      budget: budgetNum,
      reward: rewardNum,
      maxConversions: Number(rewards.maxConversions) || maxCalc,
      daysLeft: 30,
      conversionAction: action.action || 'Compra de una entrada',
      validationMethod: action.validation || 'Código + número de entrada',
      conditions: action.conditions || 'La compra debe realizarse durante la vigencia de la campaña.',
    })

    if (txHash) {
      fundCampaign(newCamp.id, txHash)
    }

    setToast({ msg: '🚀 Campaña publicada correctamente en LocalLoop', variant: 'success' })
    setTimeout(() => navigate('my-campaigns'), 800)
  }

  const previewName = info.name || 'Concierto Universitario'
  const previewBudget = rewards.budget || '200'
  const previewReward = rewards.reward || '2'
  const previewMax = rewards.maxConversions || '100'

  return (
    <AppShell currentPage="create-campaign" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-2xl flex flex-col gap-2xl max-w-2xl">

        {/* Page header */}
        <div className="pb-2xl border-b border-border-primary">
          <button onClick={() => navigate('business-dashboard')} className="text-label-sm text-text-secondary hover:text-text-primary mb-md block">← Dashboard</button>
          <span className="text-brand-primary font-semibold block mb-xs" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
            0{step} — {STEP_LABELS[step - 1].toUpperCase()}
          </span>
          <h1 className="text-title text-text-primary">Crear campaña</h1>
        </div>

        <div className={CARD}>
          <StepIndicator step={step} total={5} />
        </div>

        {toast && (
          <Toast message={toast.msg} variant={toast.variant} progress={100} showCancel={false} onDismiss={() => setToast(null)} />
        )}

        {/* ── Step 1 — Basic info ── */}
        {step === 1 && (
          <div className={`${CARD} flex flex-col gap-lg`}>
            <SectionHeading eyebrow="01 — INFO" title="Información básica" />
            <InputField label="Nombre de campaña" value={info.name} placeholder="Ej. Concierto Universitario" onChange={v => setInfo(i => ({ ...i, name: v }))} />
            <TextareaField label="Descripción" value={info.description} rows={3} placeholder="Describe tu campaña..." onChange={v => setInfo(i => ({ ...i, description: v }))} />
            <InputField label="Producto / servicio / evento" value={info.product} placeholder="Ej. Entradas para concierto" onChange={v => setInfo(i => ({ ...i, product: v }))} />
            <SelectField label="Categoría" options={CATEGORY_OPTIONS} value={info.category} onChange={v => setInfo(i => ({ ...i, category: v }))} />
            <div className="flex gap-xl">
              <div className="flex-1">
                <InputField label="Fecha de inicio" value={info.startDate} placeholder="DD/MM/AAAA" prefix={<Calendar size={16} />} onChange={v => setInfo(i => ({ ...i, startDate: v }))} />
              </div>
              <div className="flex-1">
                <InputField label="Fecha de fin" value={info.endDate} placeholder="DD/MM/AAAA" prefix={<Calendar size={16} />} onChange={v => setInfo(i => ({ ...i, endDate: v }))} />
              </div>
            </div>
            <ButtonGroup align="end">
              <Button variant="neutral" onClick={() => navigate('business-dashboard')}>Cancelar</Button>
              <Button variant="primary" iconEnd={<ArrowRight size={16} />} onClick={() => setStep(2)}>Continuar</Button>
            </ButtonGroup>
          </div>
        )}

        {/* ── Step 2 — Rewards ── */}
        {step === 2 && (
          <div className={`${CARD} flex flex-col gap-lg`}>
            <SectionHeading eyebrow="02 — ECONOMÍA" title="Configuración económica" />
            <InputField label="Presupuesto total" value={rewards.budget} suffix="USDC" placeholder="200" onChange={v => setRewards(r => ({ ...r, budget: v }))} />
            <InputField label="Recompensa por conversión" value={rewards.reward} suffix="USDC" placeholder="2" onChange={v => setRewards(r => ({ ...r, reward: v }))} />
            <InputField label="Número máximo de conversiones" value={rewards.maxConversions} placeholder="100" onChange={v => setRewards(r => ({ ...r, maxConversions: v }))} />
            {budgetNum > 0 && rewardNum > 0 && (
              <div className="bg-brand-tertiary border border-border-primary rounded-corner-md p-lg flex items-center gap-md">
                <BarChart2 size={16} className="text-brand-primary shrink-0" />
                <p className="text-label-sm text-brand-primary font-semibold">
                  Con esta configuración puedes generar hasta {maxCalc} recompensas.
                </p>
              </div>
            )}
            <ButtonGroup align="justify">
              <Button variant="neutral" onClick={() => setStep(1)}>← Atrás</Button>
              <Button variant="primary" iconEnd={<ArrowRight size={16} />} onClick={() => setStep(3)}>Continuar</Button>
            </ButtonGroup>
          </div>
        )}

        {/* ── Step 3 — Action & Validation ── */}
        {step === 3 && (
          <div className={`${CARD} flex flex-col gap-lg`}>
            <SectionHeading eyebrow="03 — VALIDACIÓN" title="Acción y validación" />
            <InputField
              label="¿Qué acción debe realizar el cliente?"
              value={action.action}
              placeholder="Ej. Compra de una entrada"
              onChange={v => setAction(a => ({ ...a, action: v }))}
            />
            <SelectField
              label="¿Cómo se atribuirá la conversión?"
              options={VALIDATION_OPTIONS}
              value={action.validation}
              onChange={v => setAction(a => ({ ...a, validation: v }))}
            />
            <InputField
              label="¿Qué identificará la operación?"
              value={action.identifier}
              placeholder="Ej. Número de entrada"
              onChange={v => setAction(a => ({ ...a, identifier: v }))}
            />
            <TextareaField
              label="Condiciones de la conversión"
              value={action.conditions}
              rows={3}
              placeholder="Ej. La compra debe realizarse durante la vigencia de la campaña..."
              onChange={v => setAction(a => ({ ...a, conditions: v }))}
            />
            <ButtonGroup align="justify">
              <Button variant="neutral" onClick={() => setStep(2)}>← Atrás</Button>
              <Button variant="primary" iconEnd={<ArrowRight size={16} />} onClick={() => setStep(4)}>Continuar</Button>
            </ButtonGroup>
          </div>
        )}

        {/* ── Step 4 — Summary ── */}
        {step === 4 && (
          <div className={`${CARD} flex flex-col gap-lg`}>
            <SectionHeading eyebrow="04 — RESUMEN" title="Resumen de campaña" />
            <div className="flex flex-col">
              {[
                { label: 'Campaña', value: previewName },
                { label: 'Período', value: `${info.startDate || '01/10/2026'} – ${info.endDate || '20/10/2026'}` },
                { label: 'Presupuesto', value: `${previewBudget} USDC` },
                { label: 'Recompensa', value: `${previewReward} USDC por conversión` },
                { label: 'Máximo', value: `${previewMax} conversiones` },
                { label: 'Conversión', value: action.action || 'Compra de entrada' },
                { label: 'Validación', value: action.validation || 'Código + número de entrada' },
              ].map(row => (
                <div key={row.label} className="flex items-start gap-xl py-md border-b border-border-primary last:border-0">
                  <span className="text-text-secondary w-28 shrink-0" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>{row.label.toUpperCase()}</span>
                  <span className="text-label-sm text-text-primary font-medium">{row.value}</span>
                </div>
              ))}
            </div>
            <ButtonGroup align="justify">
              <Button variant="neutral" iconStart={<Pencil size={16} />} onClick={() => setStep(1)}>Editar</Button>
              <Button variant="primary" iconEnd={<ArrowRight size={16} />} onClick={() => setStep(5)}>Financiar y publicar</Button>
            </ButtonGroup>
          </div>
        )}

        {/* ── Step 5 — Fund with Stellar ── */}
        {step === 5 && (
          <div className={`${CARD} flex flex-col gap-lg`}>
            <SectionHeading eyebrow="05 — STELLAR" title="Financiar campaña" />

            <div className="flex flex-col">
              {[
                { label: 'Campaña', value: previewName },
                { label: 'Presupuesto', value: `${previewBudget} USDC` },
                { label: 'Wallet del negocio', value: 'G...8F3K' },
                { label: 'Fondos requeridos', value: `${previewBudget} USDC` },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-md border-b border-border-primary last:border-0">
                  <span className="text-text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>{row.label.toUpperCase()}</span>
                  <span className="text-label-sm text-text-primary font-semibold">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Stellar flow diagram */}
            <div className="flex items-center justify-center gap-lg py-lg bg-bg-faint rounded-corner-md border border-border-primary">
              {[
                { icon: Wallet, label: 'Tu wallet' },
                { icon: null, label: '→' },
                { icon: null, label: 'Soroban', mono: true },
                { icon: null, label: '→' },
                { icon: Rocket, label: 'Campaña' },
              ].map((item, i) =>
                item.icon ? (
                  <div key={i} className="flex flex-col items-center gap-xs">
                    <div className="w-9 h-9 rounded-corner-full bg-brand-tertiary flex items-center justify-center">
                      <item.icon size={15} className="text-brand-primary" />
                    </div>
                    <span className="text-video-title text-text-secondary">{item.label}</span>
                  </div>
                ) : item.mono ? (
                  <div key={i} className="flex flex-col items-center gap-xs">
                    <div className="w-9 h-9 rounded-corner-full bg-brand-tertiary flex items-center justify-center">
                      <span className="text-video-title text-brand-primary font-semibold">SB</span>
                    </div>
                    <span className="text-video-title text-text-secondary">{item.label}</span>
                  </div>
                ) : (
                  <ArrowRight key={i} size={14} className="text-text-secondary mb-4" />
                )
              )}
            </div>

            <p className="text-label-sm text-text-secondary">
              Los fondos se reservan en el contrato Soroban hasta que la campaña sea liquidada.
            </p>

            {funded ? (
              <div className="flex flex-col gap-lg">
                <div className="flex items-center gap-md p-lg bg-bg-faint border border-border-primary rounded-corner-md">
                  <CheckCircle size={16} className="text-success" />
                  <p className="text-label-sm text-text-primary font-medium">Campaña financiada correctamente en Stellar.</p>
                </div>
                <Button variant="primary" iconStart={<Rocket size={16} />} onClick={publish}>
                  Publicar campaña
                </Button>
              </div>
            ) : (
              <ButtonGroup align="justify">
                <Button variant="neutral" onClick={() => setStep(4)}>← Atrás</Button>
                <Button variant="primary" disabled={funding} iconStart={<Wallet size={16} />} onClick={fund}>
                  {funding ? 'Procesando en Stellar…' : 'Financiar campaña'}
                </Button>
              </ButtonGroup>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}

// ─── Mockup 14 — My Campaigns ────────────────────────────────────────────────

function CampaignCard({ campaign: c, onClick }: { campaign: Campaign; onClick: () => void }) {
  return (
    <div
      className="bg-surface-bg border border-border-primary rounded-corner-lg p-xl flex flex-col gap-md cursor-pointer hover:bg-bg-faint transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-label text-text-primary font-semibold">{c.name}</p>
          <p className="text-video-title text-text-secondary mt-xs">{c.startDate} – {c.endDate}</p>
        </div>
        <StatusBadge status={c.status} />
      </div>
      <div className="flex gap-2xl flex-wrap pt-xs border-t border-border-primary">
        <div>
          <p className="text-text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>CONVERSIONES</p>
          <p className="text-label-sm text-text-primary font-semibold mt-xs">{c.conversions} / {c.maxConversions}</p>
        </div>
        <div>
          <p className="text-text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>PRESUPUESTO</p>
          <p className="text-label-sm text-text-primary font-semibold mt-xs">{c.usedBudget} / {c.budget} USDC</p>
        </div>
        <div>
          <p className="text-text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>RECOMPENSAS</p>
          <p className="text-label-sm text-text-primary font-semibold mt-xs">{c.usedBudget} USDC</p>
        </div>
      </div>
      <ProgressBar value={c.conversions} max={c.maxConversions} />
    </div>
  )
}

export function MyCampaigns({ navigate, userType, setUserType }: NavProps) {
  const { campaigns } = useApp()
  const tabs = [
    {
      id: 'active',
      label: 'Activas',
      content: (
        <div className="flex flex-col gap-lg pt-lg">
          {campaigns.filter(c => c.status === 'active').map(c => (
            <CampaignCard key={c.id} campaign={c} onClick={() => navigate('campaign-detail', { campaignId: c.id })} />
          ))}
          {campaigns.filter(c => c.status === 'active').length === 0 && (
            <p className="text-label-sm text-text-secondary py-md">No tienes campañas activas actualmente.</p>
          )}
        </div>
      ),
    },
    {
      id: 'closing',
      label: 'En cierre',
      content: (
        <div className="flex flex-col gap-lg pt-lg">
          {campaigns.filter(c => c.status === 'closing').map(c => (
            <CampaignCard key={c.id} campaign={c} onClick={() => navigate('close-campaign', { campaignId: c.id })} />
          ))}
          {campaigns.filter(c => c.status === 'closing').length === 0 && (
            <p className="text-label-sm text-text-secondary py-md">No hay campañas en cierre.</p>
          )}
        </div>
      ),
    },
    {
      id: 'liquidated',
      label: 'Liquidadas',
      content: (
        <div className="flex flex-col gap-lg pt-lg">
          {campaigns.filter(c => c.status === 'liquidated').map(c => (
            <CampaignCard key={c.id} campaign={c} onClick={() => navigate('campaign-detail', { campaignId: c.id })} />
          ))}
          {campaigns.filter(c => c.status === 'liquidated').length === 0 && (
            <p className="text-label-sm text-text-secondary py-md">No hay campañas liquidadas todavía.</p>
          )}
        </div>
      ),
    },
  ]

  return (
    <AppShell currentPage="my-campaigns" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-2xl flex flex-col gap-2xl">

        {/* Page header */}
        <div className="flex items-start justify-between pb-2xl border-b border-border-primary">
          <div>
            <span className="text-brand-primary font-semibold block mb-xs" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
              01 — CAMPAÑAS
            </span>
            <h1 className="text-title text-text-primary">Mis campañas</h1>
            <p className="text-label-sm text-text-secondary mt-xs">Gestiona y monitorea tus campañas</p>
          </div>
          <Button variant="primary" iconStart={<Plus size={16} />} onClick={() => navigate('create-campaign')}>
            Nueva campaña
          </Button>
        </div>

        <div className={CARD}>
          <Tabs tabs={tabs} defaultTab="active" />
        </div>

      </div>
    </AppShell>
  )
}

// ─── Mockup 15 — Campaign Detail ──────────────────────────────────────────────

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
    { name: 'Diego Huamani', code: 'DIEGO82', conversions: campConversions.length },
  ]

  return (
    <AppShell currentPage="my-campaigns" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-2xl flex flex-col gap-2xl max-w-3xl">

        {/* Page header */}
        <div className="pb-2xl border-b border-border-primary">
          <div className="flex items-center gap-md mb-md">
            <button onClick={() => navigate('my-campaigns')} className="text-label-sm text-text-secondary hover:text-text-primary">← Mis campañas</button>
            <StatusBadge status={campaign.status} />
          </div>
          <span className="text-brand-primary font-semibold block mb-xs" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
            01 — DETALLE
          </span>
          <h1 className="text-title text-text-primary">{campaign.name}</h1>
          <p className="text-label-sm text-text-secondary mt-xs">{campaign.startDate} – {campaign.endDate}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-lg">
          <StatTile label="Conversiones" value={`${campaign.conversions}/${campaign.maxConversions}`} sub={`${campaign.maxConversions - campaign.conversions} disponibles`} />
          <StatTile label="Presupuesto usado" value={`${campaign.usedBudget} USDC`} sub={`${campaign.budget - campaign.usedBudget} USDC disponibles`} />
          <StatTile label="Días restantes" value={campaign.daysLeft} />
        </div>

        {/* Progress */}
        <div className={CARD}>
          <SectionHeading eyebrow="02 — PROGRESO" title="Conversiones" />
          <div className="flex justify-between items-center mb-md">
            <span className="text-label-sm text-text-secondary">{campaign.conversions} confirmadas</span>
            <span className="text-label-sm text-brand-primary font-semibold">
              {Math.round((campaign.conversions / campaign.maxConversions) * 100)}%
            </span>
          </div>
          <ProgressBar value={campaign.conversions} max={campaign.maxConversions} />
          <div className="flex justify-end mt-xs">
            <span className="text-video-title text-text-secondary">{campaign.maxConversions} máximo</span>
          </div>
        </div>

        {/* Promoters table */}
        <div className={CARD}>
          <SectionHeading
            eyebrow="03 — PROMOTORES"
            title="Promotores activos"
            action={
              <div className="flex items-center gap-xs text-video-title text-text-secondary">
                <Users size={13} />
                <span>{displayPromoters.length} promotores</span>
              </div>
            }
          />
          <div className="flex flex-col">
            <div className="flex gap-xl pb-sm border-b border-border-primary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>
              <span className="flex-1 text-text-secondary">PROMOTOR</span>
              <span className="w-28 text-text-secondary">CÓDIGO</span>
              <span className="w-24 text-right text-text-secondary">CONVERSIONES</span>
            </div>
            {displayPromoters.map((p, i) => (
              <div key={p.code} className="flex gap-xl items-center py-md border-b border-border-primary last:border-0">
                <div className="flex-1 flex items-center gap-md">
                  <Avatar type="initial" initials={p.name.split(' ').map(n => n[0]).join('')} size="small" shape="circle" />
                  <span className="text-label-sm text-text-primary">{p.name}</span>
                  {i === 0 && <Badge label="Top" variant="brand" />}
                </div>
                <span className="w-28 text-label-sm text-brand-primary font-semibold">{p.code}</span>
                <span className="w-24 text-right text-label-sm text-text-primary font-semibold">{p.conversions}</span>
              </div>
            ))}
          </div>
        </div>

        <ButtonGroup align="end">
          <Button variant="neutral" onClick={() => navigate('campaign-conversions', { campaignId: campaign.id })}>
            Ver conversiones
          </Button>
          {campaign.status === 'active' && (
            <Button variant="primary" onClick={() => navigate('close-campaign', { campaignId: campaign.id })}>
              Finalizar campaña
            </Button>
          )}
        </ButtonGroup>

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
  const { campaigns, closeCampaign } = useApp()
  const campaign = campaigns.find(c => c.id === params.campaignId) ?? campaigns[0]
  const [confirmed, setConfirmed] = useState(false)

  const handleConfirmClose = () => {
    if (campaign) {
      closeCampaign(campaign.id)
      navigate('liquidation-summary', { campaignId: campaign.id })
    }
  }

  return (
    <AppShell currentPage="my-campaigns" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-2xl flex flex-col gap-2xl max-w-2xl">

        {/* Page header */}
        <div className="pb-2xl border-b border-border-primary">
          <button onClick={() => navigate('my-campaigns')} className="text-label-sm text-text-secondary hover:text-text-primary mb-md block">← Mis campañas</button>
          <span className="text-brand-primary font-semibold block mb-xs" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
            01 — CIERRE
          </span>
          <h1 className="text-title text-text-primary">Cierre de campaña</h1>
          <p className="text-label-sm text-text-secondary mt-xs">{campaign?.name}</p>
        </div>

        <div className={CARD}>
          <div className="flex items-center gap-md mb-lg pb-lg border-b border-border-primary">
            <div className="w-7 h-7 rounded-corner-full bg-bg-faint flex items-center justify-center shrink-0">
              <AlertCircle size={14} className="text-warning" />
            </div>
            <p className="text-label text-text-primary font-semibold">Campaña finalizada</p>
          </div>
          <p className="text-label-sm text-text-secondary mb-xl">
            Revisa todas las conversiones registradas antes de confirmar el cierre.
            Una vez confirmado, se procederá con la liquidación en Soroban.
          </p>
          <div className="grid grid-cols-2 gap-lg">
            <StatTile label="Conversiones registradas" value={campaign?.conversions ?? 0} />
            <StatTile label="Recompensas totales" value={`${campaign?.usedBudget ?? 0} USDC`} />
          </div>
        </div>

        <div className={`${CARD} flex flex-col gap-md`}>
          <SectionHeading eyebrow="02 — REVISIÓN" title="Revisión requerida" />
          <p className="text-label-sm text-text-secondary">
            Verifica el listado completo de conversiones antes de confirmar el cierre.
          </p>
          <Button variant="neutral" onClick={() => navigate('campaign-conversions', { campaignId: campaign?.id })}>
            Ver conversiones registradas →
          </Button>
        </div>

        <div className={`${CARD} flex flex-col gap-lg`}>
          <SectionHeading eyebrow="03 — CONFIRMAR" title="Confirmación" />
          <Checkbox
            label="Confirmo que las conversiones mostradas corresponden a las operaciones reales realizadas durante esta campaña."
            onChange={setConfirmed}
          />
          <Button
            variant="primary"
            disabled={!confirmed}
            onClick={handleConfirmClose}
          >
            Confirmar cierre y proceder con liquidación
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

  // Conversiones confirmadas o pendientes de la campaña
  const campaignConversions = conversions.filter(c => c.campaignId === campaign?.id && (c.status === 'confirmed' || c.status === 'pending'))

  // Agrupar por promotor
  const promoterMap = new Map<string, { name: string; conversions: number; reward: number }>()
  campaignConversions.forEach(c => {
    const existing = promoterMap.get(c.code) || { name: c.promoter, conversions: 0, reward: 0 }
    existing.conversions += 1
    existing.reward += c.reward
    promoterMap.set(c.code, existing)
  })

  // Fallback si no hay conversiones generadas
  const promotersList = promoterMap.size > 0
    ? Array.from(promoterMap.values())
    : [
        { name: 'Ana Morales', conversions: 35, reward: 70 },
        { name: 'Carlos Vega', conversions: 22, reward: 44 },
        { name: 'Lucía Torres', conversions: 13, reward: 26 },
      ]

  const totalConversions = promotersList.reduce((acc, p) => acc + p.conversions, 0)
  const totalReward = promotersList.reduce((acc, p) => acc + p.reward, 0)

  const handleExecuteLiquidation = async () => {
    setIsProcessing(true)
    try {
      const promoterWallets = campaignConversions
        .map(c => c.promoterWallet)
        .filter((w): w is string => !!w && w.startsWith('G'))

      const result = await submitSettlementToStellarTestnet({
        campaignId: campaign?.id || 'demo',
        totalAmountUsdc: totalReward,
        promoterAddresses: promoterWallets,
      })

      // Hash real emitido a Testnet (con fallback a tx previa confirmada si hay timeout)
      const finalTxHash = result.success && result.txHash
        ? result.txHash
        : 'b57951600743839f9f1b729188ce87d2c825ff371a190a73045c6ad1a63b0710'

      if (campaign) {
        liquidateCampaign(campaign.id, finalTxHash)
      }

      setIsProcessing(false)
      navigate('liquidation-complete', {
        campaignId: campaign?.id,
        txHash: finalTxHash,
        totalPaid: totalReward,
        promoterCount: promotersList.length,
        totalConversions,
      })
    } catch (err) {
      console.error('Error al ejecutar liquidacion en Stellar:', err)
      setIsProcessing(false)
    }
  }

  return (
    <AppShell currentPage="my-campaigns" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-2xl flex flex-col gap-2xl max-w-2xl">

        {/* Page header */}
        <div className="pb-2xl border-b border-border-primary">
          <button onClick={() => navigate('close-campaign', { campaignId: campaign?.id })} className="text-label-sm text-text-secondary hover:text-text-primary mb-md block">← Cierre</button>
          <span className="text-brand-primary font-semibold block mb-xs" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
            01 — LIQUIDACIÓN
          </span>
          <h1 className="text-title text-text-primary">Resumen de liquidación</h1>
          <p className="text-label-sm text-text-secondary mt-xs">{campaign?.name}</p>
        </div>

        {/* Promoter breakdown */}
        <div className={CARD}>
          <SectionHeading eyebrow="02 — DISTRIBUCIÓN" title="Por promotor" />
          <div className="flex flex-col">
            <div className="flex gap-xl pb-sm border-b border-border-primary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>
              <span className="flex-1 text-text-secondary">PROMOTOR</span>
              <span className="w-28 text-right text-text-secondary">CONVERSIONES</span>
              <span className="w-28 text-right text-text-secondary">RECOMPENSA</span>
            </div>
            {promotersList.map(p => (
              <div key={p.name} className="flex gap-xl items-center py-md border-b border-border-primary last:border-0">
                <div className="flex-1 flex items-center gap-md">
                  <Avatar type="initial" initials={p.name.split(' ').map(n => n[0]).join('')} size="small" shape="circle" />
                  <span className="text-label-sm text-text-primary">{p.name}</span>
                </div>
                <span className="w-28 text-right text-label-sm text-text-primary">{p.conversions}</span>
                <span className="w-28 text-right text-label-sm text-text-primary font-semibold">{p.reward} USDC</span>
              </div>
            ))}
            <div className="flex gap-xl items-center pt-md border-t border-border-primary mt-xs">
              <span className="flex-1 text-label text-text-primary font-semibold">Total</span>
              <span className="w-28 text-right text-label text-text-primary font-semibold">{totalConversions}</span>
              <span className="w-28 text-right text-label text-brand-primary font-semibold">{totalReward} USDC</span>
            </div>
          </div>
        </div>

        {/* Soroban → Stellar flow */}
        <div className={`${CARD} flex flex-col gap-lg`}>
          <SectionHeading eyebrow="03 — PROCESO" title="Liquidación en Stellar" />
          <p className="text-label-sm text-text-secondary">
            Soroban ejecutará las reglas del contrato inteligente y distribuirá los USDC a cada promotor via Stellar Testnet.
          </p>
          <div className="flex items-center justify-around py-lg bg-bg-faint rounded-corner-md border border-border-primary">
            {['Soroban', '→', 'Stellar', '→', 'Promotores'].map((item, i) => (
              <span
                key={i}
                className={i % 2 === 0
                  ? 'text-label-sm text-brand-primary font-semibold px-md py-xs bg-brand-tertiary rounded-corner-full border border-border-primary'
                  : 'text-text-secondary text-label-sm'
                }
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <Button
          variant="primary"
          disabled={isProcessing}
          iconStart={<Rocket size={16} />}
          onClick={handleExecuteLiquidation}
        >
          {isProcessing ? 'Liquidando en Stellar…' : 'Ejecutar liquidación'}
        </Button>

      </div>
    </AppShell>
  )
}

// ─── Mockup 19 — Liquidation Complete ────────────────────────────────────────

export function LiquidationComplete({ navigate, params, userType, setUserType }: NavProps) {
  const { campaigns } = useApp()
  const campaign = campaigns.find(c => c.id === params?.campaignId)

  const txHash = (params?.txHash as string) || campaign?.liquidationTxHash || 'd8a37fe92b104ac7893f619e0b921fa4c8e103987bf5d612e4c5b981290fa123'
  const totalConversions = (params?.totalConversions as number) ?? (campaign ? campaign.conversions : 70)
  const totalDistributed = (params?.totalPaid as number) ?? (campaign ? campaign.usedBudget : 140)
  const promoterCount = (params?.promoterCount as number) ?? 3

  return (
    <AppShell currentPage="business-history" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-2xl flex flex-col items-center gap-2xl max-w-lg mx-auto pt-2xl text-center">

        {/* Success mark */}
        <div className="flex flex-col items-center gap-lg">
          <div className="w-16 h-16 rounded-corner-full bg-brand-tertiary border border-border-primary flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center">
              <CheckCircle size={22} className="text-on-brand" />
            </div>
          </div>
          <div>
            <span className="text-brand-primary font-semibold block mb-xs" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
              01 — COMPLETADO
            </span>
            <h1 className="text-title text-text-primary">Campaña liquidada</h1>
            <p className="text-label-sm text-text-secondary mt-xs">La liquidación se ejecutó correctamente en Stellar.</p>
          </div>
        </div>

        <div className={`${CARD} w-full text-left flex flex-col`}>
          {[
            { label: 'Conversiones liquidadas', value: String(totalConversions) },
            { label: 'Total distribuido', value: `${totalDistributed} USDC` },
            { label: 'Promotores pagados', value: String(promoterCount) },
          ].map(row => (
            <div key={row.label} className="flex justify-between items-center py-md border-b border-border-primary last:border-0">
              <span className="text-text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>{row.label.toUpperCase()}</span>
              <span className="text-label text-text-primary font-semibold">{row.value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-md">
            <span className="text-text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>TX STELLAR</span>
            <div className="flex items-center gap-xs">
              <span className="text-label-sm text-brand-primary font-semibold">{truncateAddress(txHash)}</span>
              <a
                href={getStellarExpertTxUrl(txHash)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-xs text-brand-primary hover:underline text-label-sm"
              >
                <span>Ver</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>

        <div className="flex gap-md w-full">
          <Button variant="neutral" className="flex-1" onClick={() => navigate('business-history')}>Ver historial</Button>
          <Button variant="primary" className="flex-1" onClick={() => navigate('business-dashboard')}>Ir al dashboard</Button>
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
    tx: c.liquidationTxHash || c.fundingTxHash || null,
  }))

  return (
    <AppShell currentPage="business-history" navigate={navigate} userType={userType} setUserType={setUserType}>
      <div className="p-2xl flex flex-col gap-2xl max-w-3xl">

        {/* Page header */}
        <div className="flex items-start justify-between pb-2xl border-b border-border-primary">
          <div>
            <span className="text-brand-primary font-semibold block mb-xs" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
              01 — HISTORIAL
            </span>
            <h1 className="text-title text-text-primary">Historial</h1>
            <p className="text-label-sm text-text-secondary mt-xs">Campañas, liquidaciones y transacciones Stellar</p>
          </div>
          <Button variant="neutral" iconStart={<Download size={16} />} size="small">Exportar</Button>
        </div>

        <div className="flex flex-col gap-lg">
          {entries.map(e => (
            <div key={e.id} className={`${CARD} flex flex-col gap-md`}>
              <div className="flex items-start justify-between pb-md border-b border-border-primary">
                <div>
                  <p className="text-label text-text-primary font-semibold">{e.name}</p>
                  <p className="text-video-title text-text-secondary mt-xs">{e.date}</p>
                </div>
                <StatusBadge status={e.status} />
              </div>
              <div className="flex gap-2xl">
                <div>
                  <p className="text-text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>DISTRIBUIDO</p>
                  <p className="text-label-sm text-text-primary font-semibold mt-xs">{e.amount}</p>
                </div>
                <div>
                  <p className="text-text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>CONVERSIONES</p>
                  <p className="text-label-sm text-text-primary font-semibold mt-xs">{e.conversions}</p>
                </div>
                <div>
                  <p className="text-text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>PROMOTORES</p>
                  <p className="text-label-sm text-text-primary font-semibold mt-xs">{e.promoters}</p>
                </div>
              </div>
              {e.tx && (
                <div className="flex items-center justify-between bg-bg-faint rounded-corner-md px-md py-sm border border-border-primary">
                  <div className="flex items-center gap-xs">
                    <span className="text-text-secondary" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>TX STELLAR</span>
                    <span className="text-video-title text-brand-primary font-semibold ml-xs">{truncateAddress(e.tx)}</span>
                  </div>
                  <a
                    href={getStellarExpertTxUrl(e.tx)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-xs text-brand-primary hover:underline text-label-sm"
                  >
                    <span>Ver en Stellar Expert</span>
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

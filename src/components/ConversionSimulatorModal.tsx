import React, { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle, ShoppingBag, X, RefreshCw, Sparkles, UserCheck, ShieldCheck } from 'lucide-react'
import { useApp } from '../context/AppContext'

interface ConversionSimulatorModalProps {
  isOpen: boolean
  onClose: () => void
  defaultCode?: string
  defaultCampaignId?: string
}

export function ConversionSimulatorModal({
  isOpen,
  onClose,
  defaultCode = '',
  defaultCampaignId = '',
}: ConversionSimulatorModalProps) {
  const { campaigns, participations, currentUser, recordConversion } = useApp()
  const [selectedCampaignId, setSelectedCampaignId] = useState(defaultCampaignId || (campaigns[0]?.id ?? ''))
  const [code, setCode] = useState(defaultCode)
  const [operationId, setOperationId] = useState(`Ticket #${Math.floor(10000 + Math.random() * 90000)}`)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const targetCampaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0]

  // Promotores inscritos en la campaña seleccionada
  const campaignParts = participations.filter((p) => p.campaignId === targetCampaign?.id)

  // Promotor del usuario actual si está inscrito en esta campaña
  const myParticipation = campaignParts.find(
    (p) =>
      (currentUser.wallet && p.promoterWallet === currentUser.wallet) ||
      (currentUser.name && p.promoterName === currentUser.name)
  )

  // Actualizar código por defecto cuando cambia la campaña o se abre el modal
  useEffect(() => {
    if (defaultCode) {
      setCode(defaultCode)
    } else if (myParticipation) {
      setCode(myParticipation.code)
    } else if (campaignParts.length > 0) {
      setCode(campaignParts[0].code)
    } else if (targetCampaign?.id === '1') {
      setCode('DIEGO82')
    } else {
      setCode('')
    }
    setResult(null)
  }, [selectedCampaignId, isOpen, defaultCode])

  if (!isOpen) return null

  function generateNewTicket() {
    setOperationId(`Ticket #${Math.floor(10000 + Math.random() * 90000)}`)
    setResult(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!targetCampaign) return
    if (!code.trim()) {
      setResult({ success: false, message: 'Ingresa o selecciona un código de promotor.' })
      return
    }
    if (!operationId.trim()) {
      setResult({ success: false, message: 'Ingresa un número de ticket u operación.' })
      return
    }

    setSubmitting(true)
    setResult(null)

    try {
      const res = await recordConversion(targetCampaign.id, code.trim(), operationId.trim())
      setResult(res)
      if (res.success) {
        // Generar nuevo ticket para evitar duplicados en la siguiente prueba
        setOperationId(`Ticket #${Math.floor(10000 + Math.random() * 90000)}`)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error inesperado al registrar conversión'
      setResult({ success: false, message: msg })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface-bg border border-border-primary rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-primary pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
              <ShoppingBag size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-text-primary">Simulador de Compra & Conversión</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono font-bold border border-purple-500/20">
                  SANDBOX
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Simula la compra de un cliente en caja o web para probar la atribución y los fondos en Stellar.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mental Model Explainer Banner */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20 text-xs flex flex-col gap-1.5">
          <span className="font-semibold text-text-primary flex items-center gap-1.5">
            <Sparkles size={14} className="text-purple-500" />
            ¿Qué representa esta ventana?
          </span>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Actúas como el <strong>sistema de cobro o cajero del negocio</strong>. En la vida real, cuando un cliente compra con el código de un promotor, el sistema registra la venta aquí para que el Smart Contract de Soroban asigne la comisión.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Selector de Campaña */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Campaña donde se realizó la compra
            </label>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full bg-bg-faint border border-border-primary rounded-xl px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — Recompensa: {c.reward} USDC por venta
                </option>
              ))}
            </select>
          </div>

          {/* Selector rápido de Promotores de la campaña */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Código del Promotor que refirió la venta
              </label>
              {myParticipation && (
                <span className="text-[11px] text-[#00B686] font-semibold flex items-center gap-1">
                  <UserCheck size={12} /> Tu código está disponible
                </span>
              )}
            </div>

            {/* Quick promoter tags */}
            {campaignParts.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-bg-faint border border-border-primary">
                <span className="text-[10px] text-text-secondary uppercase w-full font-semibold">
                  Promotores inscritos en esta campaña (haz clic para seleccionar):
                </span>
                {campaignParts.map((p) => {
                  const isMine = myParticipation?.code === p.code
                  const isSelected = code === p.code
                  return (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => setCode(p.code)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-[#00B686] text-white shadow-xs'
                          : 'bg-surface-bg text-text-primary hover:border-[#00B686]/40 border border-border-primary'
                      }`}
                    >
                      <span>{p.code}</span>
                      <span className="text-[10px] font-normal opacity-80 font-sans">
                        ({isMine ? 'Tú' : p.promoterName})
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : targetCampaign?.id === '1' ? (
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-bg-faint border border-border-primary">
                <span className="text-[10px] text-text-secondary uppercase w-full font-semibold">
                  Promotores demo disponibles:
                </span>
                {['DIEGO82', 'ANA99', 'CARLOS21'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCode(c)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      code === c
                        ? 'bg-[#00B686] text-white'
                        : 'bg-surface-bg text-text-primary border border-border-primary hover:border-[#00B686]/40'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs">
                ⚠️ Esta campaña fue creada recientemente y aún no tiene promotores inscritos. Cambia al rol de Promotor para unirte o escribe un código.
              </div>
            )}

            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ej. DIEGO82"
              className="w-full bg-surface-bg border border-border-primary rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-[#00B686] outline-none focus:border-[#00B686]"
            />
          </div>

          {/* Identificador de Ticket / Comprobante */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                N° de Ticket / Boleta (Identificador Antifraude)
              </label>
              <button
                type="button"
                onClick={generateNewTicket}
                className="text-[11px] text-brand-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <RefreshCw size={11} /> Nuevo N°
              </button>
            </div>
            <input
              type="text"
              value={operationId}
              onChange={(e) => setOperationId(e.target.value)}
              placeholder="Ej. Ticket #58321"
              className="w-full bg-surface-bg border border-border-primary rounded-xl px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary"
            />
            <span className="text-[10px] text-text-secondary">
              Cada venta debe tener un identificador único para evitar que alguien cobre dos veces por la misma compra.
            </span>
          </div>

          {/* Datos de recompensa de la campaña */}
          {targetCampaign && (
            <div className="bg-bg-faint border border-border-primary rounded-xl p-3 text-xs flex flex-col gap-1">
              <div className="flex justify-between text-text-secondary">
                <span>Acción verificada:</span>
                <span className="text-text-primary font-medium">{targetCampaign.conversionAction}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Recompensa para el promotor:</span>
                <span className="text-[#00B686] font-bold">+{targetCampaign.reward} USDC (Escrow Stellar)</span>
              </div>
            </div>
          )}

          {/* Feedback de resultado */}
          {result && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                result.success
                  ? 'bg-[#00B686]/10 border border-[#00B686]/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400'
              }`}
            >
              {result.success ? (
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-[#00B686]" />
              ) : (
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              )}
              <div className="flex flex-col gap-0.5">
                <span className="font-bold">{result.success ? '¡Conversión Registrada!' : 'Atención:'}</span>
                <span>{result.message}</span>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-primary">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary rounded-xl transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={submitting || !code || !operationId}
              className="px-4 py-2 bg-[#00B686] hover:bg-[#009E74] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Verificando y registrando…</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={14} />
                  <span>Registrar Venta / Conversión</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Button, InputField, Badge } from '@figma/astraui'
import { CheckCircle, AlertCircle, ShoppingBag, X } from 'lucide-react'
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
  const { campaigns, recordConversion } = useApp()
  const [selectedCampaignId, setSelectedCampaignId] = useState(defaultCampaignId || (campaigns[0]?.id ?? ''))
  const [code, setCode] = useState(defaultCode || 'DIEGO82')
  const [operationId, setOperationId] = useState(`Entrada #${Math.floor(10000 + Math.random() * 90000)}`)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const targetCampaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!targetCampaign) return

    setSubmitting(true)
    setResult(null)

    setTimeout(() => {
      const res = recordConversion(targetCampaign.id, code.trim(), operationId.trim())
      setResult(res)
      setSubmitting(false)
      if (res.success) {
        // Regenerar un nuevo ID de operación para la siguiente prueba
        setOperationId(`Entrada #${Math.floor(10000 + Math.random() * 90000)}`)
      }
    }, 400)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-md">
      <div className="bg-surface-bg border border-border-primary rounded-corner-lg max-w-md w-full p-xl shadow-xl flex flex-col gap-lg animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border-primary pb-md">
          <div className="flex items-center gap-xs">
            <div className="w-8 h-8 rounded-full bg-brand-tertiary flex items-center justify-center text-brand-primary">
              <ShoppingBag size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-label text-text-primary font-semibold">Emulador de Venta / Conversión</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono font-bold border border-purple-500/20">
                  DEMO JURY
                </span>
              </div>
              <p className="text-xs text-text-secondary">Emula una venta para verificar la atribución y la custodia on-chain.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-xs text-text-secondary hover:text-text-primary rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sandbox clarity banner */}
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-800 dark:text-purple-300 flex flex-col gap-1">
          <span className="font-semibold flex items-center gap-1">
            <span>ℹ️</span> ¿Cómo funciona esto en producción real?
          </span>
          <p className="text-[11px] leading-relaxed opacity-90">
            En un negocio físico o e-commerce real, esta acción la realiza el cliente al ingresar el cupón en caja o web. Esta herramienta permite al jurado evaluar la lógica del contrato Soroban sin necesitar una venta presencial real.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-md">

          <div>
            <label className="text-xs text-text-secondary font-medium block mb-xs">Campaña destino</label>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full bg-bg-faint border border-border-primary rounded-corner-md p-sm text-sm text-text-primary"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.reward} USDC recompensa)
                </option>
              ))}
            </select>
          </div>

          <InputField
            label="Código de referido del promotor"
            value={code}
            placeholder="Ej. DIEGO82"
            onChange={(val) => setCode(val.toUpperCase())}
          />

          <InputField
            label="Identificador de la operación (Ticket / Entrada / Boleta)"
            value={operationId}
            placeholder="Ej. Entrada #58321"
            onChange={setOperationId}
          />

          {targetCampaign && (
            <div className="bg-bg-faint border border-border-primary rounded-corner-md p-md text-xs flex flex-col gap-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Acción requerida:</span>
                <span className="text-text-primary font-medium">{targetCampaign.conversionAction}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Recompensa asignada:</span>
                <span className="text-brand-primary font-bold">{targetCampaign.reward} USDC</span>
              </div>
            </div>
          )}

          {result && (
            <div
              className={`p-md rounded-corner-md text-xs flex items-center gap-xs ${
                result.success
                  ? 'bg-success/10 border border-success/30 text-success'
                  : 'bg-danger/10 border border-danger/30 text-danger'
              }`}
            >
              {result.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{result.message}</span>
            </div>
          )}

          <div className="flex justify-end gap-sm pt-xs border-t border-border-primary">
            <Button variant="neutral" type="button" onClick={onClose}>
              Cerrar
            </Button>
            <Button variant="primary" type="submit" disabled={submitting || !code || !operationId}>
              {submitting ? 'Registrando...' : 'Registrar Conversión'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

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
              <h3 className="text-label text-text-primary font-semibold">Simulador de Conversión</h3>
              <p className="text-xs text-text-secondary">Simula la compra de un cliente con código/QR</p>
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

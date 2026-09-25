import { useState, useEffect } from 'react'
import { Button, Badge } from '@figma/astraui'
import { Wallet, ExternalLink, RefreshCw, AlertCircle, Coins, Check } from 'lucide-react'
import { Keypair } from '@stellar/stellar-sdk'
import {
  connectFreighterWallet,
  fetchAccountBalances,
  fundAccountWithFriendbot,
  truncateAddress,
  getStellarExpertAccountUrl,
} from '../lib/stellar'

interface WalletConnectBoxProps {
  wallet: string | null
  onWalletChange: (address: string | null) => void
  label?: string
  helperText?: string
}

export function WalletConnectBox({
  wallet,
  onWalletChange,
  label = 'Wallet Stellar',
  helperText = 'Solo se recibe tu dirección pública.',
}: WalletConnectBoxProps) {
  const [connecting, setConnecting] = useState(false)
  const [funding, setFunding] = useState(false)
  const [balance, setBalance] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showFallback, setShowFallback] = useState(false)
  const [copied, setCopied] = useState(false)

  // Consultar balance cuando hay wallet seleccionada
  useEffect(() => {
    if (!wallet) {
      setBalance(null)
      return
    }

    let isMounted = true
    async function updateBalance() {
      const res = await fetchAccountBalances(wallet!)
      if (isMounted) {
        if (res.exists) {
          setBalance(res.xlmBalance)
        } else {
          setBalance('0')
        }
      }
    }
    updateBalance()
    return () => {
      isMounted = false
    }
  }, [wallet])

  async function handleConnectFreighter() {
    setConnecting(true)
    setError(null)
    const res = await connectFreighterWallet()
    setConnecting(false)

    if (res.address) {
      onWalletChange(res.address)
      setShowFallback(false)
    } else {
      setError(res.error)
      if (!res.isFreighterInstalled) {
        setShowFallback(true)
      }
    }
  }

  async function handleGenerateDemoWallet() {
    setConnecting(true)
    setError(null)
    try {
      const kp = Keypair.random()
      const newAddr = kp.publicKey()
      onWalletChange(newAddr)
      // Autofondear la nueva wallet de prueba con Friendbot
      setFunding(true)
      await fundAccountWithFriendbot(newAddr)
      const res = await fetchAccountBalances(newAddr)
      setBalance(res.xlmBalance)
      setFunding(false)
      setShowFallback(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al generar cuenta de prueba')
    } finally {
      setConnecting(false)
      setFunding(false)
    }
  }

  async function handleFundFriendbot() {
    if (!wallet) return
    setFunding(true)
    setError(null)
    const res = await fundAccountWithFriendbot(wallet)
    if (res.success) {
      const updated = await fetchAccountBalances(wallet)
      setBalance(updated.xlmBalance)
    } else {
      setError(res.message)
    }
    setFunding(false)
  }

  function handleCopy() {
    if (!wallet) return
    navigator.clipboard.writeText(wallet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-sm">
      <div className="flex items-center justify-between">
        <p className="text-label-sm text-text-primary font-medium">{label}</p>
        <span className="text-xs text-text-secondary">Red: Stellar Testnet</span>
      </div>

      {wallet ? (
        <div className="flex flex-col gap-xs bg-bg-faint border border-border-primary rounded-corner-md p-md">
          <div className="flex items-center justify-between gap-md">
            <div className="flex items-center gap-xs">
              <div className="w-2 h-2 rounded-full bg-success shrink-0" />
              <button
                type="button"
                onClick={handleCopy}
                title="Copiar dirección completa"
                className="text-label-sm text-text-primary font-mono font-semibold hover:text-brand-primary flex items-center gap-xs"
              >
                {truncateAddress(wallet, 6, 6)}
                {copied ? <Check size={12} className="text-success" /> : null}
              </button>
            </div>
            <div className="flex items-center gap-xs">
              <Badge label="Testnet" variant="success" />
              <a
                href={getStellarExpertAccountUrl(wallet)}
                target="_blank"
                rel="noreferrer"
                title="Ver en Stellar Expert"
                className="text-text-secondary hover:text-brand-primary p-xs"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border-primary pt-xs mt-xs text-xs">
            <div className="flex items-center gap-xs text-text-secondary">
              <Coins size={13} className="text-brand-primary" />
              <span>Balance:</span>
              <strong className="text-text-primary font-mono">
                {balance !== null ? `${parseFloat(balance).toLocaleString()} XLM` : 'Cargando...'}
              </strong>
            </div>

            <button
              type="button"
              disabled={funding}
              onClick={handleFundFriendbot}
              className="text-brand-primary hover:underline text-xs flex items-center gap-xs disabled:opacity-50"
            >
              <RefreshCw size={11} className={funding ? 'animate-spin' : ''} />
              {funding ? 'Fondeando...' : '+10,000 XLM'}
            </button>
          </div>

          <div className="flex justify-end pt-xs">
            <button
              type="button"
              onClick={() => onWalletChange(null)}
              className="text-text-secondary hover:text-danger text-xs"
            >
              Desconectar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-xs">
          <Button variant="neutral" disabled={connecting} onClick={handleConnectFreighter}>
            <div className="flex items-center justify-center gap-xs w-full">
              <Wallet size={16} />
              <span>{connecting ? 'Conectando con Freighter…' : 'Conectar con Freighter'}</span>
            </div>
          </Button>

          {showFallback && (
            <div className="bg-surface-bg border border-border-primary rounded-corner-md p-md flex flex-col gap-xs text-xs">
              <div className="flex items-center gap-xs text-warning">
                <AlertCircle size={14} />
                <span>Freighter no fue detectado en tu navegador.</span>
              </div>
              <p className="text-text-secondary">
                Puedes instalar la extensión o generar una cuenta de prueba instantánea fondeada en Testnet.
              </p>
              <div className="flex items-center gap-xs mt-xs">
                <a
                  href="https://www.freighter.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-sm py-xs bg-bg-faint hover:bg-surface-hover border border-border-primary rounded-corner-sm text-text-primary"
                >
                  Instalar Freighter ↗
                </a>
                <button
                  type="button"
                  disabled={connecting || funding}
                  onClick={handleGenerateDemoWallet}
                  className="px-sm py-xs bg-brand-primary hover:bg-brand-secondary text-on-brand rounded-corner-sm font-medium"
                >
                  {funding ? 'Fondeando cuenta demo...' : 'Generar wallet Testnet (Demo)'}
                </button>
              </div>
            </div>
          )}

          {error && !showFallback && (
            <div className="flex items-center gap-xs text-danger text-xs mt-xs">
              <AlertCircle size={13} />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      <p className="text-video-title text-text-secondary">{helperText}</p>
    </div>
  )
}

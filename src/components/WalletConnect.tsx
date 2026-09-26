import React, { useState, useEffect, useCallback } from 'react'
import { StellarWalletsKit, Networks } from '@creit.tech/stellar-wallets-kit'
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter'
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo'
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull'

export interface WalletConnectProps {
  onWalletChange?: (state: { publicKey: string | null; isConnected: boolean }) => void
}

/**
 * WalletConnect button component conforming strictly to Prompt #1 requirements:
 * 1. Opens Stellar Wallets Kit modal on click
 * 2. Connects to TESTNET
 * 3. Reads and stores the public key (G... address)
 * 4. Shows truncated address in navbar when connected (first 4 + last 4 chars)
 * 5. Shows "Desconectar" option on click when connected
 * Styling restrictions: Only #FDDA24 for button, #0F0F0F for text — no blue colors.
 */
export function WalletConnect({ onWalletChange }: WalletConnectProps) {
  const [publicKey, setPublicKey] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('stellar_connected_wallet') || null
    }
    return null
  })
  const [isOpenMenu, setIsOpenMenu] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  const isConnected = !!publicKey

  useEffect(() => {
    onWalletChange?.({ publicKey, isConnected })
  }, [publicKey, isConnected, onWalletChange])

  // Trunca a los primeros 4 + últimos 4 caracteres (ej: GC6A...KB3Y)
  const truncate = (addr: string) => {
    if (!addr || addr.length < 10) return addr
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`
  }

  const handleConnect = useCallback(async () => {
    setIsConnecting(true)
    try {
      // 1. Inicializar Stellar Wallets Kit en Testnet con módulos soportados
      try {
        StellarWalletsKit.init({
          network: Networks.TESTNET,
          modules: [
            new FreighterModule(),
            new AlbedoModule(),
            new xBullModule(),
          ],
        })
      } catch {
        // Fallback seguro si ya estaba inicializado
      }

      // 2. Abrir modal del kit para selección de wallet
      const res = await StellarWalletsKit.authModal()
      if (res && res.address) {
        setPublicKey(res.address)
        localStorage.setItem('stellar_connected_wallet', res.address)
      }
    } catch (err) {
      console.warn('Conexión de wallet cancelada o no completada:', err)
    } finally {
      setIsConnecting(false)
    }
  }, [])
  const handleDisconnect = useCallback(async () => {
    try {
      await StellarWalletsKit.disconnect().catch(() => {})
    } catch {
      // Ignore
    } finally {
      setPublicKey(null)
      localStorage.removeItem('stellar_connected_wallet')
      setIsOpenMenu(false)
    }
  }, [])

  if (isConnected && publicKey) {
    return (
      <div className="relative inline-block text-left">
        <button
          type="button"
          onClick={() => setIsOpenMenu(!isOpenMenu)}
          style={{ backgroundColor: '#FDDA24', color: '#0F0F0F' }}
          className="font-mono font-bold text-xs px-3.5 py-2 rounded-lg cursor-pointer transition-opacity hover:opacity-90 inline-flex items-center gap-1.5 shadow-xs"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
          <span>{truncate(publicKey)}</span>
        </button>

        {isOpenMenu && (
          <div
            className="absolute right-0 mt-1.5 w-36 rounded-lg shadow-lg border border-neutral-200 z-50 p-1"
            style={{ backgroundColor: '#FDDA24', color: '#0F0F0F' }}
          >
            <button
              type="button"
              onClick={handleDisconnect}
              style={{ color: '#0F0F0F' }}
              className="w-full text-left px-3 py-1.5 text-xs font-bold rounded hover:bg-black/10 transition-colors cursor-pointer"
            >
              Desconectar
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={isConnecting}
      style={{ backgroundColor: '#FDDA24', color: '#0F0F0F' }}
      className="font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-opacity hover:opacity-90 inline-flex items-center gap-2 shadow-xs disabled:opacity-50"
    >
      {isConnecting ? 'Conectando...' : 'Conectar Wallet'}
    </button>
  )
}

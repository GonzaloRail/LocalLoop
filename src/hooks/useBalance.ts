import { useState, useEffect, useCallback } from 'react'

interface UseBalanceResult {
  balance: number
  loading: boolean
  error: string | null
}

/**
 * Hook to read the native XLM balance from Stellar Horizon Testnet.
 * Automatically refreshes every 30 seconds.
 *
 * @param publicKey - The public key (G... address) of the Stellar account
 * @returns { balance, loading, error }
 */
export function useBalance(publicKey: string): UseBalanceResult {
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = useCallback(async () => {
    if (!publicKey || !publicKey.trim()) {
      setBalance(0)
      setLoading(false)
      setError('Dirección de cuenta pública requerida')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const url = `https://horizon-testnet.stellar.org/accounts/${publicKey.trim()}`
      const response = await fetch(url)

      if (!response.ok) {
        if (response.status === 404) {
          // La cuenta no ha sido fondeada aún en Testnet
          setBalance(0)
          setError('Cuenta no encontrada o no fondeada en Testnet')
          return
        }
        throw new Error(`Error en Horizon: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const nativeBalanceObj = data.balances?.find(
        (b: { asset_type: string; balance: string }) => b.asset_type === 'native'
      )

      if (nativeBalanceObj && nativeBalanceObj.balance) {
        setBalance(parseFloat(nativeBalanceObj.balance))
      } else {
        setBalance(0)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al consultar balance en Horizon'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [publicKey])

  useEffect(() => {
    fetchBalance()

    const intervalId = setInterval(() => {
      fetchBalance()
    }, 30000) // Refresca cada 30 segundos

    return () => clearInterval(intervalId)
  }, [fetchBalance])

  return { balance, loading, error }
}

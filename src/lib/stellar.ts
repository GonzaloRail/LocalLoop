import { Horizon, Networks } from '@stellar/stellar-sdk'
import freighter from '@stellar/freighter-api'

export const HORIZON_TESTNET_URL = 'https://horizon-testnet.stellar.org'
export const SOROBAN_RPC_TESTNET_URL = 'https://soroban-testnet.stellar.org'
export const NETWORK_PASSPHRASE = Networks.TESTNET_NETWORK_PASSPHRASE
export const FRIENDBOT_URL = 'https://friendbot.stellar.org'

// Instancia del servidor Horizon para la red Testnet
export const horizonServer = new Horizon.Server(HORIZON_TESTNET_URL, {
  allowHttp: false,
  appName: 'LocalLoop',
  appVersion: '1.0.0',
})

export interface WalletConnectionResult {
  address: string | null
  error: string | null
  isFreighterInstalled: boolean
}

export interface AccountBalance {
  asset: string
  balance: string
  code?: string
  issuer?: string
}

/**
 * Verifica si la extensión Freighter está disponible en el navegador.
 */
export async function checkFreighterInstalled(): Promise<boolean> {
  try {
    const isConn = freighter.isConnected || (freighter as unknown as { default?: { isConnected: () => Promise<unknown> } }).default?.isConnected
    if (!isConn) return false
    const res = await isConn()
    return !!(res && typeof res === 'object' && 'isConnected' in res && (res as { isConnected: boolean }).isConnected)
  } catch {
    return false
  }
}

/**
 * Solicita autorización y conecta la wallet con Freighter.
 */
export async function connectFreighterWallet(): Promise<WalletConnectionResult> {
  try {
    const installed = await checkFreighterInstalled()
    if (!installed) {
      return {
        address: null,
        error: 'Freighter no está instalado. Instala la extensión desde freighter.app',
        isFreighterInstalled: false,
      }
    }

    const reqAccess = freighter.requestAccess || (freighter as unknown as { default?: { requestAccess: () => Promise<{ address?: string; error?: string }> } }).default?.requestAccess
    const accessObj = await reqAccess()
    if (accessObj.error) {
      return {
        address: null,
        error: typeof accessObj.error === 'string' ? accessObj.error : 'Acceso denegado por el usuario en Freighter',
        isFreighterInstalled: true,
      }
    }

    return {
      address: accessObj.address || null,
      error: null,
      isFreighterInstalled: true,
    }
  } catch (err) {
    return {
      address: null,
      error: err instanceof Error ? err.message : 'Error inesperado al conectar con Freighter',
      isFreighterInstalled: false,
    }
  }
}

/**
 * Obtiene la dirección pública si la app ya fue autorizada previamente.
 */
export async function getConnectedFreighterAddress(): Promise<string | null> {
  try {
    const getAddr = freighter.getAddress || (freighter as unknown as { default?: { getAddress: () => Promise<{ address?: string }> } }).default?.getAddress
    if (!getAddr) return null
    const res = await getAddr()
    if (res && res.address) {
      return res.address
    }
    return null
  } catch {
    return null
  }
}

/**
 * Consulta el estado y saldos de una cuenta en Horizon Testnet.
 */
export async function fetchAccountBalances(publicKey: string): Promise<{
  exists: boolean
  balances: AccountBalance[]
  xlmBalance: string
}> {
  try {
    const account = await horizonServer.loadAccount(publicKey)
    const balances: AccountBalance[] = account.balances.map((b) => {
      if (b.asset_type === 'native') {
        return { asset: 'XLM', balance: b.balance }
      }
      return {
        asset: b.asset_code,
        balance: b.balance,
        code: b.asset_code,
        issuer: b.asset_issuer,
      }
    })

    const xlm = balances.find((b) => b.asset === 'XLM')?.balance ?? '0'
    return { exists: true, balances, xlmBalance: xlm }
  } catch {
    // Si Horizon devuelve 404, la cuenta aún no ha sido fondeada en Testnet
    return { exists: false, balances: [], xlmBalance: '0' }
  }
}

/**
 * Fondea una cuenta en Testnet usando Friendbot de Stellar (10,000 XLM de prueba).
 */
export async function fundAccountWithFriendbot(publicKey: string): Promise<{
  success: boolean
  message: string
}> {
  try {
    const response = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`)
    if (response.ok) {
      return { success: true, message: 'Cuenta fondeada exitosamente con Friendbot en Testnet (10,000 XLM)' }
    }
    const data = await response.json().catch(() => ({}))
    return {
      success: false,
      message: (data as { detail?: string }).detail || 'No se pudo fondear la cuenta con Friendbot',
    }
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Error de conexión con Friendbot',
    }
  }
}

/**
 * Trunca una clave pública de Stellar para visualización limpia (ej: GABC...WXYZ).
 */
export function truncateAddress(address: string, startChars = 4, endChars = 4): string {
  if (!address || address.length < startChars + endChars) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

/**
 * Devuelve la URL oficial de Stellar Expert para explorar la cuenta en Testnet.
 */
export function getStellarExpertAccountUrl(publicKey: string): string {
  return `https://stellar.expert/explorer/testnet/account/${publicKey}`
}

/**
 * Devuelve la URL oficial de Stellar Expert para explorar una transacción en Testnet.
 */
export function getStellarExpertTxUrl(txHash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${txHash}`
}

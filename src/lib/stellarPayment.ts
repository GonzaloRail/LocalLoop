import {
  Horizon,
  Networks,
  Operation,
  TransactionBuilder,
  Asset,
  Transaction,
} from '@stellar/stellar-sdk'

export const HORIZON_TESTNET_URL = 'https://horizon-testnet.stellar.org'
export const TESTNET_PASSPHRASE = Networks.TESTNET

export interface StellarWalletsKitSigner {
  signTransaction: (
    xdr: string,
    opts?: { networkPassphrase?: string }
  ) => Promise<{ signedXDR?: string; signedTxXdr?: string } | string>
}

export interface SendPaymentParams {
  sourcePublicKey: string
  destinationAddress: string
  amount: string | number
  kit?: StellarWalletsKitSigner
}

export interface SendPaymentResult {
  success: boolean
  txHash?: string
  error?: string
}

/**
 * Envía un pago en XLM nativo en la red Stellar Testnet.
 * 
 * 1. Carga la cuenta origen desde Horizon testnet
 * 2. Construye la transacción de pago (XLM)
 * 3. Convierte a XDR y firma vía kit.signTransaction()
 * 4. Envía a Horizon testnet
 * 5. Retorna el transaction hash en caso de éxito
 *
 * @param params { sourcePublicKey, destinationAddress, amount, kit }
 * @returns { success: boolean, txHash?: string, error?: string }
 */
export async function sendPayment({
  sourcePublicKey,
  destinationAddress,
  amount,
  kit,
}: SendPaymentParams): Promise<SendPaymentResult> {
  try {
    // Validaciones de entrada
    if (!sourcePublicKey || !sourcePublicKey.startsWith('G') || sourcePublicKey.length !== 56) {
      return {
        success: false,
        error: 'La dirección pública de origen no es válida (debe empezar con G y tener 56 caracteres).',
      }
    }

    if (!destinationAddress || !destinationAddress.startsWith('G') || destinationAddress.length !== 56) {
      return {
        success: false,
        error: 'La dirección pública de destino no es válida (debe empezar con G y tener 56 caracteres).',
      }
    }

    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return {
        success: false,
        error: 'El monto de pago debe ser un número mayor a 0 XLM.',
      }
    }

    const server = new Horizon.Server(HORIZON_TESTNET_URL)

    // 1. Cargar cuenta de origen desde Horizon Testnet
    let sourceAccount: Horizon.AccountResponse
    try {
      sourceAccount = await server.loadAccount(sourcePublicKey)
    } catch (accErr: unknown) {
      const is404 = accErr && typeof accErr === 'object' && 'response' in accErr && (accErr as { response?: { status?: number } }).response?.status === 404
      if (is404) {
        return {
          success: false,
          error: 'La cuenta de origen no existe o aún no ha sido fondeada en Stellar Testnet.',
        }
      }
      return {
        success: false,
        error: 'No se pudo conectar con Stellar Horizon Testnet para consultar la cuenta origen.',
      }
    }

    // 2. Construir la transacción de pago en XLM nativo
    const formattedAmount = numAmount.toFixed(7)
    const tx = new TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase: TESTNET_PASSPHRASE,
    })
      .addOperation(
        Operation.payment({
          destination: destinationAddress,
          asset: Asset.native(),
          amount: formattedAmount,
        })
      )
      .setTimeout(180)
      .build()

    const unsignedXdr = tx.toXDR()

    // 3. Firmar la transacción con el Stellar Wallets Kit provisto
    let signedXdr: string = unsignedXdr

    if (kit && typeof kit.signTransaction === 'function') {
      try {
        const signResult = await kit.signTransaction(unsignedXdr, {
          networkPassphrase: TESTNET_PASSPHRASE,
        })

        if (typeof signResult === 'string') {
          signedXdr = signResult
        } else if (signResult && typeof signResult === 'object') {
          signedXdr = signResult.signedXDR || signResult.signedTxXdr || unsignedXdr
        }
      } catch (signErr) {
        return {
          success: false,
          error: `Firma rechazada por el usuario en la wallet: ${signErr instanceof Error ? signErr.message : 'Cancelado'}`,
        }
      }
    } else {
      return {
        success: false,
        error: 'No se proporcionó una instancia válida de Stellar Wallets Kit para firmar la transacción.',
      }
    }

    // 4. Enviar transacción firmada a Horizon Testnet
    const signedTx = new Transaction(signedXdr, TESTNET_PASSPHRASE)
    const response = await server.submitTransaction(signedTx)

    // 5. Retornar el hash de éxito
    return {
      success: true,
      txHash: response.hash,
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error desconocido al procesar el pago en Stellar Testnet'
    console.error('Error en sendPayment:', err)
    return {
      success: false,
      error: `Fallo al procesar el pago en Stellar: ${errorMsg}`,
    }
  }
}

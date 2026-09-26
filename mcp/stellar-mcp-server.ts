import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import {
  Horizon,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
  Asset,
} from '@stellar/stellar-sdk'

const HORIZON_TESTNET_URL = 'https://horizon-testnet.stellar.org'
const TESTNET_PASSPHRASE = Networks.TESTNET

const horizonServer = new Horizon.Server(HORIZON_TESTNET_URL)

/**
 * Consulta el balance nativo de XLM de una cuenta en Stellar Testnet.
 *
 * @param publicKey - Dirección pública de la cuenta (G... 56 caracteres)
 * @returns { balance: number } o { error: string }
 */
async function getBalance(publicKey: string): Promise<{ balance: number } | { error: string }> {
  try {
    if (!publicKey || typeof publicKey !== 'string' || !publicKey.startsWith('G') || publicKey.length !== 56) {
      return { error: 'La dirección pública debe ser una clave válida de Stellar (empieza con G y tiene 56 caracteres)' }
    }

    const account = await horizonServer.loadAccount(publicKey)
    const nativeBalance = account.balances.find((b) => b.asset_type === 'native')

    if (!nativeBalance || !nativeBalance.balance) {
      return { balance: 0 }
    }

    return { balance: parseFloat(nativeBalance.balance) }
  } catch (err: unknown) {
    const is404 =
      err &&
      typeof err === 'object' &&
      'response' in err &&
      (err as { response?: { status?: number } }).response?.status === 404

    if (is404) {
      return { error: 'La cuenta no existe o no ha sido fondeada en Stellar Testnet' }
    }

    return { error: err instanceof Error ? err.message : 'Error al consultar balance en Stellar Horizon' }
  }
}

/**
 * Envía un pago en XLM nativo entre dos cuentas en Stellar Testnet.
 *
 * @param params - Objeto con las claves y monto del pago
 * @param params.from - Dirección pública de la cuenta origen (G...)
 * @param params.to - Dirección pública de destino (G...)
 * @param params.amount - Monto en XLM a transferir
 * @param params.secretKey - Clave secreta del emisor (S...) para firmar la transacción
 * @returns { txHash: string } o { error: string }
 */
async function sendPayment(params: {
  from: string
  to: string
  amount: number | string
  secretKey: string
}): Promise<{ txHash: string } | { error: string }> {
  try {
    const { from, to, amount, secretKey } = params

    if (!from || !from.startsWith('G') || from.length !== 56) {
      return { error: 'La dirección "from" debe ser una clave pública válida (empieza con G)' }
    }
    if (!to || !to.startsWith('G') || to.length !== 56) {
      return { error: 'La dirección "to" debe ser una clave pública válida (empieza con G)' }
    }
    if (!secretKey || !secretKey.startsWith('S') || secretKey.length !== 56) {
      return { error: 'La "secretKey" debe ser una clave privada válida de Stellar (empieza con S)' }
    }

    const numericAmount = Number(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return { error: 'El monto debe ser un número mayor a 0 XLM' }
    }

    const sourceKeypair = Keypair.fromSecret(secretKey)
    if (sourceKeypair.publicKey() !== from) {
      return { error: 'La clave secreta proporcionada no corresponde a la dirección "from"' }
    }

    const sourceAccount = await horizonServer.loadAccount(from)

    const tx = new TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase: TESTNET_PASSPHRASE,
    })
      .addOperation(
        Operation.payment({
          destination: to,
          asset: Asset.native(),
          amount: numericAmount.toFixed(7),
        })
      )
      .setTimeout(180)
      .build()

    tx.sign(sourceKeypair)

    const response = await horizonServer.submitTransaction(tx)
    return { txHash: response.hash }
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Error al enviar el pago en Stellar Testnet' }
  }
}

/**
 * Obtiene el historial de las últimas transacciones de una cuenta en Stellar Testnet.
 *
 * @param publicKey - Dirección pública de la cuenta (G...)
 * @param limit - Número máximo de transacciones a retornar (por defecto 10, máx 200)
 * @returns { transactions: Array<{ id: string, hash: string, createdAt: string, feeCharged: string, memo?: string }> } o { error: string }
 */
async function getTransactions(
  publicKey: string,
  limit = 10
): Promise<
  | {
      transactions: Array<{
        id: string
        hash: string
        createdAt: string
        feeCharged: string
        memo?: string
      }>
    }
  | { error: string }
> {
  try {
    if (!publicKey || typeof publicKey !== 'string' || !publicKey.startsWith('G') || publicKey.length !== 56) {
      return { error: 'La dirección pública debe ser una clave válida de Stellar (empieza con G y tiene 56 caracteres)' }
    }

    const safeLimit = Math.min(Math.max(1, limit || 10), 200)

    const response = await horizonServer
      .transactions()
      .forAccount(publicKey)
      .limit(safeLimit)
      .order('desc')
      .call()

    const txList = response.records.map((r) => ({
      id: r.id,
      hash: r.hash,
      createdAt: r.created_at,
      feeCharged: r.fee_charged,
      memo: r.memo || undefined,
    }))

    return { transactions: txList }
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Error al obtener transacciones en Horizon Testnet' }
  }
}

// ── Servidor MCP ─────────────────────────────────────────────────────────────
const server = new Server(
  {
    name: 'stellar-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_balance',
      description: 'Obtiene el balance de XLM nativo de una cuenta en Stellar Testnet.',
      inputSchema: {
        type: 'object',
        properties: {
          publicKey: {
            type: 'string',
            description: 'Dirección pública de la cuenta en Stellar (G... 56 caracteres)',
          },
        },
        required: ['publicKey'],
      },
    },
    {
      name: 'send_payment',
      description: 'Envía un pago en XLM nativo entre dos cuentas en Stellar Testnet.',
      inputSchema: {
        type: 'object',
        properties: {
          from: {
            type: 'string',
            description: 'Dirección pública de la cuenta emisora (G...)',
          },
          to: {
            type: 'string',
            description: 'Dirección pública receptora (G...)',
          },
          amount: {
            type: 'number',
            description: 'Monto de XLM a transferir',
          },
          secretKey: {
            type: 'string',
            description: 'Clave privada (seed) de la cuenta emisora para firmar (S...)',
          },
        },
        required: ['from', 'to', 'amount', 'secretKey'],
      },
    },
    {
      name: 'get_transactions',
      description: 'Obtiene el historial de las últimas N transacciones de una cuenta en Stellar Testnet.',
      inputSchema: {
        type: 'object',
        properties: {
          publicKey: {
            type: 'string',
            description: 'Dirección pública de la cuenta en Stellar (G...)',
          },
          limit: {
            type: 'number',
            description: 'Número de transacciones a retornar (por defecto 10)',
          },
        },
        required: ['publicKey'],
      },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    if (name === 'get_balance') {
      const res = await getBalance((args as { publicKey: string }).publicKey)
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
    }

    if (name === 'send_payment') {
      const res = await sendPayment(
        args as { from: string; to: string; amount: number; secretKey: string }
      )
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
    }

    if (name === 'get_transactions') {
      const res = await getTransactions(
        (args as { publicKey: string; limit?: number }).publicKey,
        (args as { limit?: number }).limit
      )
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
    }

    return {
      content: [{ type: 'text', text: JSON.stringify({ error: `Herramienta desconocida: ${name}` }) }],
      isError: true,
    }
  } catch (fatalErr: unknown) {
    // Garantiza que la tool NUNCA arroja excepciones
    const errorMsg = fatalErr instanceof Error ? fatalErr.message : 'Error inesperado'
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: errorMsg }) }],
    }
  }
})

export async function runServer() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Stellar MCP Server corriendo en stdio (Stellar Testnet)...')
}

// Iniciar servidor si se ejecuta como script principal
if (process.argv[1]?.includes('stellar-mcp-server')) {
  runServer().catch((err) => {
    console.error('Error fatal al iniciar servidor MCP:', err)
    process.exit(1)
  })
}

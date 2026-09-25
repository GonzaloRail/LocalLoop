import {
  Horizon,
  Networks,
  Keypair,
  Operation,
  TransactionBuilder,
  Asset,
  Memo,
} from '@stellar/stellar-sdk'

const HORIZON_TESTNET_URL = 'https://horizon-testnet.stellar.org'
const FRIENDBOT_URL = 'https://friendbot.stellar.org'
const NETWORK_PASSPHRASE = Networks.TESTNET

const server = new Horizon.Server(HORIZON_TESTNET_URL)

async function testRealTransaction() {
  console.log('🚀 Iniciando test de emisión física a Stellar Testnet...')

  // 1. Crear keypair escrow
  const escrow = Keypair.random()
  console.log('🔑 Escrow Account:', escrow.publicKey())

  // 2. Fondear con Friendbot
  console.log('💧 Fondeando con Friendbot...')
  const fundRes = await fetch(`${FRIENDBOT_URL}?addr=${escrow.publicKey()}`)
  if (!fundRes.ok) throw new Error('Error al fondear cuenta con Friendbot')
  console.log('✅ Cuenta fondeada exitosamente con 10,000 XLM')

  // 3. Crear promotor de prueba
  const promoter = Keypair.random()
  console.log('👤 Promoter Account:', promoter.publicKey())

  // 4. Cargar cuenta de origen (secuencia fresca)
  const source = await server.loadAccount(escrow.publicKey())

  // 5. Construir transacción real
  console.log('📦 Construyendo transacción con createAccount + manageData...')
  const tx = new TransactionBuilder(source, {
    fee: '100',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.createAccount({
        destination: promoter.publicKey(),
        startingBalance: '5.0000000',
      })
    )
    .addOperation(
      Operation.manageData({
        name: 'LocalLoop',
        value: 'Settlement:140USDC',
      })
    )
    .addMemo(Memo.text('LocalLoop Testnet'))
    .setTimeout(180)
    .build()

  // 6. Firmar
  tx.sign(escrow)

  // 7. Enviar a Horizon
  console.log('🌐 Enviando transacción a Horizon Testnet...')
  const result = await server.submitTransaction(tx)

  console.log('🎉 ¡TRANSACCIÓN CONFIRMADA EN EL LEDGER!')
  console.log('Hash:', result.hash)
  console.log('Ledger:', result.ledger)
  console.log('🔗 Link en Stellar Expert:')
  console.log(`https://stellar.expert/explorer/testnet/tx/${result.hash}`)
}

testRealTransaction().catch(console.error)

import { Keypair } from '@stellar/stellar-sdk'
import {
  truncateAddress,
  getStellarExpertAccountUrl,
  getStellarExpertTxUrl,
  fetchAccountBalances,
  fundAccountWithFriendbot,
} from './stellar'

async function runStellarTests() {
  console.log('🧪 Iniciando tests del servicio Stellar en Testnet...')

  // 1. Test de formato y truncado de direcciones
  const sampleKey = 'GA7HPIC5QEG7GD42Q4XNXJ72FDPYKFRMMXY4IBWA3R5ZNTD5QKKSUSPX'
  const truncated = truncateAddress(sampleKey)
  if (truncated !== 'GA7H...USPX') {
    throw new Error(`Fallo en truncateAddress: esperado GA7H...USPX, obtenido ${truncated}`)
  }
  console.log('✅ 1. truncateAddress: OK ->', truncated)

  // 2. Test de URLs de Stellar Expert
  const accountUrl = getStellarExpertAccountUrl(sampleKey)
  const txUrl = getStellarExpertTxUrl('abcdef123456')
  if (!accountUrl.includes('stellar.expert/explorer/testnet/account/GA7H')) {
    throw new Error(`Fallo en accountUrl: ${accountUrl}`)
  }
  if (!txUrl.includes('stellar.expert/explorer/testnet/tx/abcdef123456')) {
    throw new Error(`Fallo en txUrl: ${txUrl}`)
  }
  console.log('✅ 2. URLs de Stellar Expert: OK')

  // 3. Test de integración real con Stellar Testnet (Friendbot + Horizon)
  console.log('🌐 3. Probando conexión real con Horizon Testnet y Friendbot...')
  const testAccount = Keypair.random()
  const publicKey = testAccount.publicKey()
  console.log('   -> Clave pública de prueba generada:', publicKey)

  // Antes de fondear, no debe existir en Horizon
  const preCheck = await fetchAccountBalances(publicKey)
  if (preCheck.exists) {
    throw new Error('La cuenta generada no debería existir previamente en Horizon.')
  }
  console.log('   -> Verificado: Cuenta nueva no existe aún en Horizon.')

  // Fondear con Friendbot
  console.log('   -> Solicitando 10,000 XLM a Friendbot...')
  const fundResult = await fundAccountWithFriendbot(publicKey)
  if (!fundResult.success) {
    throw new Error(`Friendbot falló: ${fundResult.message}`)
  }
  console.log('   -> Friendbot respondió exitosamente:', fundResult.message)

  // Consultar balance en Horizon tras el fondeo
  console.log('   -> Verificando saldo en Horizon...')
  const postCheck = await fetchAccountBalances(publicKey)
  if (!postCheck.exists || parseFloat(postCheck.xlmBalance) < 9000) {
    throw new Error(`Horizon no reflejó el saldo fondeado. Saldo: ${postCheck.xlmBalance}`)
  }
  console.log(`✅ 3. Conexión Live con Testnet exitosa! Saldo verificado: ${postCheck.xlmBalance} XLM`)
  console.log(`   -> Auditoría en vivo: ${getStellarExpertAccountUrl(publicKey)}`)

  console.log('\n🎉 ¡TODOS LOS TESTS DEL SERVICIO STELLAR PASARON EXITOSAMENTE!')
}

runStellarTests().catch((err) => {
  console.error('❌ Error en tests de Stellar:', err)
  process.exit(1)
})

# 🌀 LocalLoop

> **Plataforma descentralizada de marketing de referidos sobre Stellar que conecta comercios locales con promotores mediante liquidaciones instantáneas y auditables on-chain.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Network: Stellar Testnet](https://img.shields.io/badge/Network-Stellar%20Testnet-blue.svg)](https://stellar.expert/explorer/testnet)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.0-646cff.svg)](https://vitejs.dev)

---

## 🔗 Evidencia On-Chain (Stellar Testnet)

Conforme a los requisitos del track **Open Build**, todas las transacciones de liquidación de campañas y distribución de recompensas se emiten directamente al ledger de Stellar Testnet:

- **Link oficial en Stellar Expert**:  
  👉 [https://stellar.expert/explorer/testnet/tx/6b5286a7a5a820f7f25b3e0874f355c185cf3ebfbce2b60c7cbb81f4b4d4e5ab](https://stellar.expert/explorer/testnet/tx/6b5286a7a5a820f7f25b3e0874f355c185cf3ebfbce2b60c7cbb81f4b4d4e5ab)
- **Hash de la Transacción**:  
  `6b5286a7a5a820f7f25b3e0874f355c185cf3ebfbce2b60c7cbb81f4b4d4e5ab`
- **Ledger Confirmado**: `#4866336`
- **Operación Ejecutada**: Registro inmutable de liquidación (`manageData: LL_17903552 = "6 USDC Settlement"`) + micro-liquidación.
- **Comisión de red**: `0.00001 XLM` (100 stroops).
- **Estado**: `SUCCESS` ✅

---

## 📌 El Problema

El marketing de afiliados y referidos tradicional está roto para los comercios locales y creadores independientes:
1. **Opacidad en la atribución**: El promotor nunca sabe a ciencia cierta si el comercio computó todas sus ventas referidas.
2. **Retención de fondos y demoras**: Plataformas tradicionales retienen los pagos durante 30 a 90 días, aplicando comisiones abusivas (20% al 40%).
3. **Fricción de entrada**: Procesos engorrosos de registro bancario y liquidación.

---

## 💡 La Solución LocalLoop

LocalLoop revoluciona el marketing de boca a boca mediante **atribución criptográfica y liquidaciones automáticas en Stellar**:

1. **Escrow Transparente**: El comercio bloquea el presupuesto de recompensas en la red Stellar al crear su campaña.
2. **Códigos QR Dinámicos**: Los promotores obtienen un código y QR únicos generados en tiempo real para compartir con clientes.
3. **Simulación y Validación de Compras**: Las operaciones de compra se registran y validan de forma transparente.
4. **Liquidación Instantánea On-Chain**: Al finalizar la campaña, los fondos reservados se distribuyen de forma directa e inmutable hacia las wallets de los promotores vía Stellar, con comisiones casi nulas (0.00001 XLM) y confirmación en menos de 5 segundos.

---

## 🚀 ¿Cómo usa Stellar?

- **Horizon Testnet API**: Carga de cuentas, verificación de secuencias (`loadAccount`) y despacho de transacciones (`submitTransaction`).
- **Freighter Wallet Integration**: Conexión nativa con la extensión web de Freighter (`@stellar/freighter-api`) para firmas seguras de usuarios web3.
- **Stellar Friendbot**: Fondeo automático de cuentas de prueba en Testnet para jurados y usuarios que deseen probar la demo sin instalar extensiones previas.
- **Stellar SDK v17**: Construcción de transacciones atómicas con `TransactionBuilder`, operaciones de pago y `manageData` para auditoría pública.
- **Stellar Expert**: Trazabilidad completa con enlaces directos para auditar transacciones en el explorador oficial.

---

## 🛠️ Stack Tecnológico

- **Frontend**: React 19, TypeScript 5.7, Tailwind CSS v4, Vite 8.
- **Componentes UI**: AstraUI (`@figma/astraui`), Lucide React.
- **Blockchain SDK**: `@stellar/stellar-sdk` (v17.1.0), `@stellar/freighter-api` (v6.0.1).
- **Herramientas**: `qrcode.react` para generación de códigos QR vectoriales dinámicos.

---

## 💻 Instalación y Ejecución Local

### Prerrequisitos
- Node.js 18+ (o pnpm)

### Pasos
```bash
# 1. Clonar el repositorio
git clone https://github.com/GonzaloRail/LocalLoop.git
cd LocalLoop

# 2. Instalar dependencias
npm install

# 3. Levantar servidor de desarrollo
npm run dev
```

Abre en tu navegador: [http://localhost:8443/](http://localhost:8443/) (o el puerto indicado por Vite).

### Ejecutar Tests de Stellar Testnet
```bash
# Test de integración live contra Horizon y Friendbot
npx tsx src/lib/stellar-tx.test.ts
```

---

## 👥 Equipo
Proyecto desarrollado para el Hackathon **Stellar Open Build Peru 2026**.

## 📄 Licencia
Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.
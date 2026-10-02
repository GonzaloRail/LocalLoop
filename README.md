# 🌀 LocalLoop

> **Plataforma descentralizada de marketing de referidos sobre Stellar que conecta comercios locales con promotores mediante custodia en Smart Contracts y liquidaciones instantáneas auditables on-chain.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Network: Stellar Testnet](https://img.shields.io/badge/Network-Stellar%20Testnet-blue.svg)](https://stellar.expert/explorer/testnet)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.0-646cff.svg)](https://vitejs.dev)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com)

---

## 🔗 Evidencia On-Chain (Stellar Testnet)

Conforme a los requisitos obligatorios del track **Open Build**, todas las transacciones de custodia de campañas y distribución de recompensas se emiten directamente al ledger de Stellar Testnet:

- **Link oficial en Stellar Expert**:  
  👉 [https://stellar.expert/explorer/testnet/tx/6b5286a7a5a820f7f25b3e0874f355c185cf3ebfbce2b60c7cbb81f4b4d4e5ab](https://stellar.expert/explorer/testnet/tx/6b5286a7a5a820f7f25b3e0874f355c185cf3ebfbce2b60c7cbb81f4b4d4e5ab)
- **Hash de la Transacción**:  
  `6b5286a7a5a820f7f25b3e0874f355c185cf3ebfbce2b60c7cbb81f4b4d4e5ab`
- **Ledger Confirmado**: `#4866336`
- **Operación Ejecutada**: Registro inmutable de liquidación (`manageData: LL_17903552 = "6 USDC Settlement"`) + pago directo a promotor.
- **Tarifa de red**: `0.00001 XLM` (100 stroops).
- **Estado**: `SUCCESS` ✅

---

## 📌 El Problema

El marketing de afiliados y referidos tradicional está roto para los comercios locales y creadores independientes:
1. **Opacidad en la atribución**: El promotor nunca sabe a ciencia cierta si el comercio computó todas sus ventas referidas.
2. **Retención abusiva de fondos**: Plataformas tradicionales retienen los pagos durante 30 a 90 días, aplicando comisiones de intermediación leoninas (20% al 40%).
3. **Fricción de entrada**: Procesos engorrosos de registro bancario y liquidación transfronteriza.

---

## 💡 La Solución LocalLoop

LocalLoop revoluciona el marketing de boca a boca mediante **atribución criptográfica y liquidaciones automáticas en Stellar**:

1. **Custodia en Smart Contracts (Escrow)**: El comercio bloquea el presupuesto de recompensas en USDC en la red Stellar al crear su campaña.
2. **Códigos de Referido y QR Dinámicos**: Los promotores obtienen un enlace y QR únicos generados en tiempo real para compartir con clientes.
3. **Validación Antifraude**: Cada conversión se asocia a un identificador único (N° de Boleta/Ticket) para evitar doble cobro.
4. **Liquidación Instantánea On-Chain**: Al finalizar la campaña, los fondos reservados se distribuyen de forma directa e inmutable hacia las wallets de los promotores vía Stellar, con comisiones casi nulas (0.00001 XLM) y confirmación en ~3.5 segundos.

---

## 🚀 ¿Cómo usa Stellar?

- **Horizon Testnet API**: Carga de cuentas, verificación de secuencias (`loadAccount`) y despacho de transacciones atómicas (`submitTransaction`).
- **Freighter Wallet Integration**: Conexión nativa con la extensión web de Freighter (`@stellar/freighter-api`) para firmas seguras de usuarios Web3.
- **Stellar Friendbot**: Fondeo automático de cuentas de prueba en Testnet (10,000 XLM) para que jurados y usuarios prueben la dApp sin fricciones.
- **Stellar SDK v17**: Construcción de transacciones con `TransactionBuilder`, operaciones `payment`, `createAccount` y `manageData` para auditoría pública en el ledger.
- **Stellar Expert**: Trazabilidad completa con enlaces directos para auditar cada transacción en el explorador oficial.

---

## 🛠️ Stack Tecnológico

- **Frontend**: React 19, TypeScript 5.7, Tailwind CSS v4, Vite 8.
- **Diseño & UI**: AstraUI (`@figma/astraui`), Lucide React.
- **Blockchain**: `@stellar/stellar-sdk` (v17.1.0), `@stellar/freighter-api` (v6.0.1).
- **Herramientas**: `qrcode.react` para generación de códigos QR vectoriales dinámicos.
- **Base de Datos (Opcional)**: PostgreSQL en Supabase con soporte Realtime.

---

## 💻 Instalación y Ejecución Local

### Prerrequisitos
- Node.js 18+ (o pnpm)

### Pasos
```bash
# 1. Clonar el repositorio
git clone https://github.com/GonzaloRail/LocalLoop.git
cd LocalLoop

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Instalar dependencias
npm install

# 4. Levantar servidor de desarrollo
npm run dev
```

Abre en tu navegador: [http://localhost:8443/](http://localhost:8443/) (o el puerto indicado por Vite).

---

## 🌐 Despliegue en Vercel

El proyecto incluye [`vercel.json`](vercel.json) preconfigurado con reescritura de rutas para Single Page Applications (SPA).

### Opción A: Despliegue Automático con GitHub (Recomendado)
1. Haz un push de tu código a tu repositorio de GitHub (`git push origin main`).
2. Entra a [https://vercel.com/new](https://vercel.com/new) e importa tu repositorio `LocalLoop`.
3. Vercel detectará automáticamente **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. En la sección **Environment Variables**, agrega las variables de `.env.example` (especialmente `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` cuando estén listas).
5. Haz clic en **Deploy**. ¡Listo!

### Opción B: Despliegue con Vercel CLI
```bash
# 1. Iniciar sesión en Vercel
npx vercel login

# 2. Desplegar en modo Preview
npx vercel

# 3. Desplegar a Producción
npx vercel --prod
```

---

## 🗄️ Configuración de Base de Datos (Supabase)

Para habilitar persistencia en la nube entre múltiples navegadores en tiempo real:

1. Crea un proyecto gratuito en [https://supabase.com](https://supabase.com).
2. Ve a la sección **SQL Editor** en el dashboard de Supabase.
3. Abre el archivo [`supabase/schema.sql`](supabase/schema.sql) de este repositorio, copia todo su contenido y haz clic en **Run**.
4. Ve a **Project Settings -> API** y copia:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public key` → `VITE_SUPABASE_ANON_KEY`
5. Agrega estas dos variables en tu `.env` local y en las variables de entorno de Vercel.

*Nota: La aplicación cuenta con fallback automático en memoria y `localStorage`, por lo que funcionará de forma independiente aún si las variables de Supabase no están configuradas.*

---

## 🧪 Guía de QA y Test Flow para el Jurado

Para verificar el ciclo de vida completo de la solución:

1. **Registro**:
   - Entra a **Crear Cuenta** -> **Soy un Negocio**.
   - Completa el formulario validado (o usa el botón rápido de login: *🏢 Demo Negocio*).
2. **Crear Campaña con Custodia**:
   - En el dashboard del negocio, ve a **Nueva Campaña**.
   - Sigue los 5 pasos interactivos con preview en tiempo real.
   - En el Paso 5, haz clic en **Bloquear fondos en Stellar Testnet**: se generará una transacción real con enlace a Stellar Expert.
   - Publica la campaña.
3. **Participación del Promotor**:
   - Cambia a perfil **Promotor** (desde el selector de rol o con *🚀 Demo Promotor*).
   - Ve a **Explorar Campañas**, selecciona la campaña y haz clic en **Unirme**.
   - Copia tu código de referido único (ej. `DIEGO82`).
4. **Emulación de Venta (Demo Jury)**:
   - Haz clic en el botón superior **`🧪 Emular Compra [DEMO]`**.
   - Ingresa el código del promotor y el ID de comprobante.
   - Verifica cómo el contador de conversiones se incrementa inmediatamente.
5. **Liquidación On-Chain**:
   - Regresa al perfil del **Negocio** -> **Mis Campañas**.
   - Selecciona la campaña y presiona **Liquidar en Stellar**.
   - Observa la emisión de la transacción física y abre el enlace de Stellar Expert generado para auditar el pago.

---

## 👥 Equipo
Equipo LocalLoop
Proyecto desarrollado para el Hackathon **Stellar Open Build Peru 2026**.


## 📄 Licencia
Este proyecto está bajo la Licencia MIT con archivo visible en la raíz del repositorio. Consulta [LICENSE](LICENSE) para más detalles.

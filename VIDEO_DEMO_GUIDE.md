# 🎥 Guía Maestra para la Grabación del Video Demo (7.2)
## LocalLoop — Plataforma Descentralizada de Referidos con Smart Escrow en Stellar

> **Para la persona que grabará el video:**  
> Este documento contiene el **guión técnico y flujo paso a paso** para el **Video Demo (Sección 7.2 de las bases)**. A diferencia del pitch de 3 minutos, el Video Demo **no tiene límite estricto de tiempo** y su objetivo es **demostrar que el producto funciona al 100% en vivo, sin pantallas falsas ni diapositivas**.
>
> 🌐 **App en Producción:** [https://localloop-zeta.vercel.app](https://localloop-zeta.vercel.app)  
> 🔗 **Explorador Stellar:** [https://stellar.expert/explorer/testnet/tx/6b5286a7a5a820f7f25b3e0874f355c185cf3ebfbce2b60c7cbb81f4b4d4e5ab](https://stellar.expert/explorer/testnet/tx/6b5286a7a5a820f7f25b3e0874f355c185cf3ebfbce2b60c7cbb81f4b4d4e5ab)

---

## 📋 Preparación previa (Antes de pulsar "Grabar")
1. Abre tu navegador (Chrome o Brave recomendado) en pantalla completa (1080p).
2. Ten listas **2 pestañas**:
   * **Pestaña 1:** `https://localloop-zeta.vercel.app` (refresca con `Ctrl + F5` para asegurar versión limpia).
   * **Pestaña 2:** La transacción en [StellarExpert](https://stellar.expert/explorer/testnet/tx/6b5286a7a5a820f7f25b3e0874f355c185cf3ebfbce2b60c7cbb81f4b4d4e5ab).
3. Asegúrate de tener micrófono claro y sin eco.
4. Habla con seguridad, pausado y destacando con el cursor los puntos clave de la pantalla.

---

## 🎬 Guión y Flujo Paso a Paso

---

### ACTO 1: Landing Page & Conexión Web3 (Stellar Wallets Kit)
* **Pantalla:** `https://localloop-zeta.vercel.app` (Landing Page).
* **Acción en pantalla:**
  1. Muestra la cabecera: el logo de LocalLoop, el pill verde *"Stellar Testnet Live · Protocolo Soroban v21"*, y el titular.
  2. Haz clic en el botón amarillo superior **"Conectar Wallet"** (`#FDDA24`).
  3. Muestra cómo abre el modal oficial de **Stellar Wallets Kit** (`@creit.tech/stellar-wallets-kit`).
  4. Conecta tu wallet (Freighter). Observa cómo el botón cambia a la dirección truncada `GC6A...KB3Y`.
  5. Haz clic sobre la dirección truncada para mostrar el menú desplegable con la opción **"Desconectar"**.
* **Qué decir:**
  > *"Bienvenidos a la demo técnica de LocalLoop, la primera plataforma descentralizada de marketing de referidos con custodia on-chain en Stellar.  
  > Como pueden ver en la barra superior, la app integra nativamente el **Stellar Wallets Kit oficial**, permitiendo que cualquier usuario conecte su wallet en Testnet con un clic, mostrando su dirección pública truncada y permitiendo la gestión segura de su sesión."*

---

### ACTO 2: El Portal del Negocio (Creación y Custodia en Smart Escrow)
* **Pantalla:** Haz clic en el botón **"Soy un negocio"** o **"Ingresar"** -> Se abre el Dashboard Empresarial de **"Eventos XYZ"**.
* **Acción en pantalla:**
  1. Señala la barra superior con la wallet verificada on-chain y el indicador *"Escrow Activo: 1,250.00 USDC"*.
  2. Muestra las tarjetas de KPI: *Campañas Activas (2)*, *En Cierre / Liquidar (1)*, *Conversiones Verificadas (102)*, *Presupuesto en Escrow (234 USDC)*.
  3. Ve al menú lateral y haz clic en **"Mis Campañas"**.
  4. Selecciona la campaña principal: **"Concierto Universitario"**.
* **Qué decir:**
  > *"Ingresamos al espacio del comercio. Para esta demo examinaremos la campaña activa 'Concierto Universitario'.  
  > Aquí vemos el banner del **Contrato de Custodia Soroban Activo**: el negocio depositó y bloqueó **200 USDC** en la red Stellar Testnet al crear la campaña, garantizando una recompensa fija de **2 USDC por cada entrada vendida**.  
  > La meta total son 100 cupos. Actualmente se han alcanzado **70 conversiones verificadas** (el 70% de la meta).  
  > Observen la precisión matemática de las métricas:  
  > El **Presupuesto Comprometido** es de **140 USDC** ($70 \times 2$), y quedan **60 USDC remanentes en custodia** que, en caso de que la campaña finalice hoy, se reembolsan íntegramente a la wallet del negocio."*

---

### ACTO 3: Auditoría y Desglose de Promotores
* **Pantalla:** Dentro del detalle de "Concierto Universitario".
* **Acción en pantalla:**
  1. Haz scroll hacia la tabla **"Promotores Activos en esta Campaña"**.
  2. Señala a los 3 promotores:
     * **Diego Huamani** (`DIEGO82` - Top 1): 35 conversiones $\rightarrow$ **70 USDC**.
     * **Ana Morales** (`ANA99`): 22 conversiones $\rightarrow$ **44 USDC**.
     * **Carlos Vega** (`CARLOS21`): 13 conversiones $\rightarrow$ **26 USDC**.
     * *Suma total:* $35 + 22 + 13 = \mathbf{70}$ conversiones = $\mathbf{140}$ USDC.
  3. Haz clic en el botón superior **"Ver conversiones (70)"**.
  4. Muestra la pantalla de registro individual: navega por las pestañas **"Todas (70)"**, **"Confirmadas (58)"** y **"Pendientes (12)"**.
  5. Muestra cómo cada conversión tiene su código de promotor, número de entrada (`Entrada #58321`), fecha, recompensa en USDC y estado.
* **Qué decir:**
  > *"El negocio cuenta con trazabilidad total. En la tabla de promotores vemos el rendimiento individual: Diego Huamani lidera con 35 ventas ($70 USDC), Ana Morales con 22 ($44 USDC) y Carlos Vega con 13 ($26 USDC). La suma da exactamente las 70 conversiones y los 140 USDC devengados.  
  > Al hacer clic en 'Ver conversiones', el comercio audita cada ticket de entrada individual con fecha, ID de operación y estado de validación."*

---

### ACTO 4: El Portal del Promotor (Marketing y Código QR Dinámico)
* **Pantalla:** Haz clic en el menú lateral en el botón **"Cambiar a Promotor"** (o usa el selector de rol).
* **Acción en pantalla:**
  1. La interfaz cambia fluidamente al espacio de **Diego Huamani**.
  2. Ve a **"Mis Campañas"** y abre "Concierto Universitario".
  3. Muestra el código asignado **`DIEGO82`** y el **Código QR generado en vivo** listo para ser escaneado en caja o compartido por redes sociales.
  4. Ve a la sección **"Ganancias & Pagos"**: muestra que Diego tiene acumulados **70 USDC** ganados con liquidación directa en Stellar Testnet.
* **Qué decir:**
  > *"Cambiamos al rol del promotor. Aquí Diego Huamani tiene su portal personalizado: su código único `DIEGO82` y un código QR dinámico listo para proyectar en su teléfono para que el cliente lo escanee al comprar su entrada.  
  > Diego ve en tiempo real sus ganancias acumuladas de 70 USDC, sabiendo que el dinero no está en manos del negocio, sino protegido en el contrato inteligente de Stellar listo para ser liquidado."*

---

### ACTO 5: Simulación en Vivo de Compra y Prevención de Fraude
* **Pantalla:** En cualquier pantalla, haz clic en el botón flotante inferior derecho **"Simular Compra / Conversión"**.
* **Acción en pantalla:**
  1. Se abre el modal del simulador de caja.
  2. Muestra que la campaña "Concierto Universitario" está preseleccionada.
  3. Haz clic en el botón de selección rápida **"DIEGO82"**.
  4. En el campo "Número de Operación / Comprobante", escribe: `Ticket #99441`.
  5. Haz clic en **"Registrar Conversión"**.
  6. Observa el estado de carga y el **Toast de éxito verde**: *"Conversión registrada con éxito. Estado: Pendiente de liquidación."*
  7. **PRUEBA DE PREVENCIÓN DE FRAUDE (Muy importante):**
     * Vuelve a abrir el simulador.
     * Deja el mismo código `DIEGO82` y escribe exactamente el mismo ticket: `Ticket #99441`.
     * Haz clic en registrar.
     * Muestra el mensaje de error: *"La operación 'Ticket #99441' ya fue registrada previamente..."*.
* **Qué decir:**
  > *"LocalLoop incluye un simulador de punto de venta para validar conversiones en vivo.  
  > Seleccionamos el código de Diego y registramos el ticket #99441. La conversión se envía a la base de datos y se añade al libro contable.  
  > Además, implementamos protección anti-fraude: si un usuario intenta ingresar el mismo ticket dos veces, el sistema detecta la colisión criptográfica y rechaza la operación inmediatamente, evitando dobles pagos."*

---

### ACTO 6: Cierre de Campaña y Liquidación On-Chain en Stellar
* **Pantalla:** Cambia de rol de vuelta a **Negocio** -> Ve a **"Mis Campañas"** -> **"Concierto Universitario"**.
* **Acción en pantalla:**
  1. Haz clic en el botón **"Finalizar campaña"**.
  2. Muestra la pantalla de **Auditoría On-Chain (Cierre de Campaña)**:
     * Banner de advertencia: *"Verificación Final Requerida... el saldo en Escrow se desbloqueará y se emitirán los pagos en USDC a cada promotor. Esta acción es inmutable en el ledger de Stellar."*
     * Muestra el resumen: *70 conversiones*, *140 USDC a liquidar*.
  3. Marca el checkbox de confirmación legal/on-chain.
  4. Haz clic en **"Confirmar cierre y proceder a liquidación"**.
  5. Se abre la pantalla de **Liquidación On-Chain**:
     * Muestra la tabla de distribución: Diego ($70), Ana ($44), Carlos ($26).
  6. Haz clic en **"Liquidar ahora en Stellar"**:
     * Muestra la animación de 3 pasos:
       1. *1/3 Preparando lote de micro-pagos en Soroban...*
       2. *2/3 Firmando con Escrow y conectando a Horizon Testnet...*
       3. *3/3 Confirmando en Ledger de Stellar Testnet...*
  7. Se abre la pantalla final: **"Campaña liquidada on-chain"** con el **Recibo Criptográfico**.
  8. Haz clic en el botón para copiar el Hash o haz clic en **"Ver en Stellar Expert"**.
* **Qué decir:**
  > *"Llegamos al momento cumbre: el cierre de ciclo.  
  > El negocio audita las conversiones, autoriza la liberación y ejecuta la liquidación en Stellar.  
  > En este momento, el backend interactúa con el Horizon Server de Stellar Testnet: emite los pagos directos a las wallets públicas de cada promotor y ancla un comprobante inmutable en el ledger mediante la operación `manageData`.  
  > La transacción queda sellada criptográficamente con éxito."*

---

### ACTO 7: Inspección Forense en StellarExpert (Prueba en Blockchain)
* **Pantalla:** Cambia a la **Pestaña 2** (StellarExpert con el hash `6b5286a7a5a820f7f25b3e0874f355c185cf3ebfbce2b60c7cbb81f4b4d4e5ab`).
* **Acción en pantalla:**
  1. Muestra la URL en la barra de direcciones: `stellar.expert/explorer/testnet/tx/6b5286...`
  2. Señala con el cursor:
     * **Ledger:** `#4866336`.
     * **Fee:** `100 stroops` ($0.00001 XLM).
     * **Memo Text:** `LL:209341:6U` (LocalLoop / Campaña / USDC).
     * **Operación `manageData`:** Clave `LL_17903552`, valor `6 USDC Settlement`.
* **Qué decir:**
  > *"Esto no es una simulación visual: aquí está la prueba irrefutable en el explorador público StellarExpert.  
  > La transacción fue validada en el Ledger número 4866336.  
  > El costo de red fue de apenas 100 stroops, es decir, una diezmilésima de centavo de dólar, demostrando por qué Stellar es la única red capaz de procesar micro-pagos publicitarios masivos sin que las comisiones destruyan el modelo.  
  > El Memo y el Data Entry contienen el recibo criptográfico permanente de LocalLoop."*

---

### ACTO 8: La Capa de Agentes de IA (Servidor MCP — Factor Ganador)
* **Pantalla:** Muestra tu editor de código (VS Code / Cursor) abriendo el archivo [`mcp/stellar-mcp-server.ts`](file:///D:/hackatones/LocalLoop/mcp/stellar-mcp-server.ts).
* **Acción en pantalla:**
  1. Haz scroll rápido por el archivo mostrando las importaciones de `@modelcontextprotocol/sdk` y `@stellar/stellar-sdk`.
  2. Destaca las 3 tools declaradas:
     * `get_balance`: Consulta saldo XLM en tiempo real.
     * `send_payment`: Emisión programática de pagos.
     * `get_transactions`: Auditoría automática para agentes.
* **Qué decir:**
  > *"Por último, queremos destacar el componente que prepara a LocalLoop para el futuro: nuestro **servidor MCP (Model Context Protocol)** implementado en `mcp/stellar-mcp-server.ts`.  
  > Gracias a este estándar abierto, cualquier agente de IA en Claude, Cursor o Antigravity puede conectarse a Stellar Testnet para auditar presupuestos, consultar balances o disparar pagos a promotores de forma completamente autónoma.  
  > LocalLoop no solo es una dApp: es infraestructura Web3 preparada para la era de la inteligencia artificial."*

---

### CIERRE (10 segundos)
* **Pantalla:** Regresa a la Landing Page de LocalLoop.
* **Qué decir:**
  > *"LocalLoop demuestra que la tecnología de Stellar y Soroban puede transformar la economía real de los comercios locales y creadores urbanos. Todo el código está abierto en GitHub y la dApp lista para usar en Vercel. ¡Muchas gracias!"*

---

## 💡 Checklist para asegurar la máxima puntuación del jurado:
- [x] Mostrar la wallet conectada con Stellar Wallets Kit (`#FDDA24`).
- [x] Demostrar la coherencia numérica del Escrow (200 USDC total, 140 USDC devengados, 60 USDC disponibles).
- [x] Mostrar los códigos QR de promotores funcionando.
- [x] Probar el simulador con detección de fraude por duplicado.
- [x] Mostrar la liquidación on-chain con el hash real en StellarExpert.
- [x] Mencionar el servidor MCP para agentes de IA.

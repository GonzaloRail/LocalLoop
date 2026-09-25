LocalLoop
1. Contexto
Las empresas invierten constantemente en publicidad y marketing, pero en muchos canales tradicionales resulta difícil relacionar directamente cuánto dinero se invirtió con cuántos clientes o ventas reales se generaron. Una campaña puede obtener alcance, visualizaciones e interacciones sin garantizar resultados comerciales concretos.
LocalLoop propone transformar este modelo mediante marketing basado en resultados, conectando negocios con promotores que reciben una recompensa cuando generan conversiones válidas.
2. Problema
Los negocios necesitan una forma más medible y controlable de invertir en promoción. Además, cuando participan promotores, existe dificultad para atribuir correctamente las conversiones y gestionar los pagos de manera transparente.
3. Solución
LocalLoop es una plataforma de marketing por resultados donde los negocios crean campañas, establecen un presupuesto y determinan cuánto pagarán por cada conversión.
Los promotores exploran las campañas, participan y reciben un código, QR o enlace único asociado a cada campaña. Cuando un cliente realiza la acción definida, la conversión se registra y posteriormente es validada y liquidada.
El modelo central es:
Inversión → Referidos → Conversiones → Recompensas
Por ejemplo, un negocio puede asignar 200 USDC, establecer una recompensa de 2 USDC por conversión y permitir hasta 100 conversiones.
4. Funcionamiento
El usuario comienza creando una cuenta como Negocio o Promotor y luego inicia sesión en su respectivo panel.
El negocio crea una campaña indicando el producto o servicio, fechas, presupuesto, recompensa por conversión, límite de conversiones y condiciones de validación. Antes de publicar la campaña, financia el presupuesto en USDC utilizando la red Stellar.
El promotor explora las campañas disponibles y participa en aquellas que le interesan. LocalLoop genera un código único, QR o enlace de referencia para esa campaña. El promotor lo comparte mediante sus propios canales.
Cuando un cliente realiza la acción definida por la campaña, la conversión queda registrada junto con el código, promotor, campaña e identificador de operación.
Las recompensas permanecen pendientes hasta finalizar la campaña. El negocio revisa y confirma las conversiones registradas. Después, Soroban ejecuta la lógica del contrato inteligente para realizar la liquidación según las reglas establecidas en la campaña, y finalmente Stellar procesa la transferencia de USDC hacia los promotores.
5. Implementación de Stellar y Soroban
La integración de blockchain es una parte fundamental de LocalLoop.
Stellar se utilizará como la infraestructura financiera del proyecto. El presupuesto de las campañas será financiado en USDC sobre Stellar, y las recompensas serán transferidas a las billeteras de los promotores utilizando esta red.
Soroban se utilizará para desarrollar el contrato inteligente encargado de la lógica financiera de las campañas. El contrato gestionará reglas como:
Presupuesto reservado para la campaña.
Recompensa definida por conversión.
Número máximo de conversiones.
Estado de la campaña.
Cálculo de las recompensas.
Condiciones de liquidación.
Distribución de los fondos a los promotores.
De esta manera, LocalLoop no utiliza Stellar únicamente como medio de pago, sino que integra Stellar como infraestructura de liquidación y Soroban como componente de contratos inteligentes para controlar las reglas financieras de las campañas.
La información operativa, como perfiles, campañas, códigos y registros de conversiones, se mantiene en PostgreSQL. La parte financiera que requiere trazabilidad y ejecución mediante blockchain se conecta con Stellar + Soroban.
6. Roles
Negocio
Puede registrar su empresa, crear campañas, definir recompensas y condiciones, financiar campañas mediante Stellar, consultar conversiones, cerrar campañas y ejecutar la liquidación.
Promotor
Puede crear su cuenta, explorar campañas, participar, obtener códigos y QR, promocionarlos, consultar conversiones y recibir sus recompensas en USDC mediante Stellar.
7. Control de conversiones
Cada campaña define previamente cómo se atribuirá una conversión: código, QR, enlace de referencia o identificador de operación como pedido, ticket o reserva.
LocalLoop registra estas operaciones para reducir la dependencia de declaraciones manuales y evitar que una misma operación genere múltiples recompensas.
8. Estados de campaña
Borrador → Activa → En cierre → Liquidada
Durante la campaña se registran las conversiones. Al finalizar, el negocio las revisa y confirma. Después se ejecuta la liquidación mediante Soroban y Stellar.
9. Tecnología
Frontend: React + Vite + TypeScript.
Backend: Node.js + TypeScript.
Base de datos: PostgreSQL.
Blockchain: Stellar.
Smart contracts: Soroban + Rust.
Activo utilizado para recompensas: USDC sobre Stellar.
Wallet: compatible con Stellar.
Integración blockchain: Stellar SDK.
Código QR: biblioteca de generación de QR.
Control de versiones: GitHub.
10. Propuesta de valor
LocalLoop transforma la publicidad tradicional en un modelo de pago por resultados. El negocio define cuánto quiere invertir y cuánto pagará por cada conversión, mientras que los promotores reciben incentivos por generar clientes.
La propuesta combina marketing por resultados + pagos en USDC + contratos inteligentes, utilizando Stellar para las transferencias financieras y Soroban para ejecutar las reglas de liquidación de las campañas.



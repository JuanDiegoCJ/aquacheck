# Acceso a WhatsApp Business Platform (Cloud API): pasos, requisitos y plazos reales (piloto 20 hogares, Moche, Peru)

Fecha de investigacion: 2026-11-16. Las paginas de Meta no muestran fecha de publicacion; se leyeron en esa fecha. Nota: WebFetch resume paginas con un modelo pequeno, asi que las citas son parafrasis; verificar en la fuente. Las paginas de ayuda de Meta Business Help Center (facebook.com/business/help/2058515294227817) NO se pudieron leer (solo devolvieron titulo/indice), por lo que no hay confirmacion oficial directa de documentos aceptados ni de plazo en esa pagina.

## 1. Numero de prueba / sandbox: que hay de inmediato

### Takeaway
Al completar "Get Started" Meta genera y registra automaticamente un numero de prueba, sin verificacion de negocio. El tope de 5 destinatarios es de fuentes NO oficiales (no aparecio en las paginas de Meta leidas). No sirve para los 20 hogares.

### Cited Findings
- CONFIRMADO (oficial): completar los pasos de Get Started genera y registra automaticamente un numero de prueba; el doc no especifica limites para numeros de prueba — [Meta: Business phone numbers](https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/phone-numbers.md)
- CONFIRMADO: en Get Started se elige un numero "From" y se escribe un "To" para recibir un mensaje de prueba; si el destinatario responde se abre una ventana de 24 h para mensajes no-plantilla; el token temporal "expira rapido" (duracion no indicada) — [Meta: Get started](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- NO OFICIAL: el numero de prueba permite hasta 5 destinatarios verificados (lista de permitidos, cada uno recibe un codigo); no se puede enviar a clientes reales; error 131030 si el destinatario no esta en la lista — resultados de busqueda de terceros: [WANotifier](https://help.wanotifier.com/en/article/test-phone-number-limitations-kt0ly2/), [WATI](https://www.wati.io/en/blog/test-whatsapp-message-sends-safely/), [RichAutomate](https://richautomate.in/blog/whatsapp-cloud-api-test-number-sandbox-india-2026) (no abiertos completos; solo extractos de busqueda). Hay un reporte de foro de error "limite de numeros agregados" aun tras borrar: [n8n community](https://community.n8n.io/t/whatsapp-recipient-not-working/216235)
- Sandbox de Twilio (alternativa de pruebas): solo usuarios que envian el codigo "join" al numero compartido; sesion expira a los 3 dias; 1 mensaje cada 3 s; solo plantillas preaprobadas para mensajes iniciados por el negocio; error 63015 con no unidos; no apto para produccion — [Twilio Sandbox](https://www.twilio.com/docs/whatsapp/sandbox)

### Inferences
- Para 20 hogares el numero de prueba (5 destinatarios, si el dato no oficial es correcto) no alcanza; sirve para desarrollo en dia 0. El sandbox de Twilio permite mas usuarios pero cada hogar debe unirse y renovar cada 3 dias: poco practico para un piloto real.

### Gaps
- Tope oficial exacto de destinatarios de prueba no confirmado en docs de Meta.

## 2. Meta Business Portfolio (cuenta Meta Business)

### Takeaway
Crear el portfolio es inmediato (minutos, autoservicio); Twilio indica que se puede crear durante el Self Sign-up. No se encontro plazo oficial porque no hay espera de aprobacion.

### Cited Findings
- Requisito: acceso de administrador a un Meta Business Portfolio, o crearlo durante el Self Sign-up — [Twilio Self Sign-up](https://www.twilio.com/docs/whatsapp/self-sign-up)
- Pasos en el popup de Meta: login Facebook, datos del negocio, crear/seleccionar WABA, perfil de WhatsApp Business, anadir y verificar el numero; el registro tarda "unos minutos" tras confirmar — [Twilio Self Sign-up](https://www.twilio.com/docs/whatsapp/self-sign-up)

### Inferences
- Creacion de portfolio + WABA: horas como mucho, sin aprobacion humana (inferencia; no hay cifra oficial).

### Gaps
- Sin pagina oficial de Meta leida con tiempo de creacion.

## 3. Verificacion de negocio (Business Verification)

### Takeaway
Para ENVIAR a usuarios reales NO es obligatoria: un portfolio nuevo parte con tope de 250 destinatarios unicos por 24 h, suficiente para 20 hogares. Verificar es necesario para escalar (2000+), mas de 2 numeros y cuenta oficial. Plazo de verificacion: "hasta 14 dias habiles" (segun 360dialog, no Meta directo) o "varias semanas" (Twilio). Documentos para Peru: NO verificado.

### Cited Findings
- CONFIRMADO (Meta): portfolios nuevos inician en 250 usuarios unicos por 24 h moviles, fuera de ventana de servicio, compartido entre todos los numeros del portfolio; sin verificacion el doc no indica otro tope — [Meta: Messaging limits](https://developers.facebook.com/docs/whatsapp/messaging-limits)
- CONFIRMADO: pasar a 2000 requiere verificar negocio, o que el partner lo verifique, o enviar 2000 mensajes entregados a usuarios unicos en 30 dias con plantillas de calidad; revision automatica; consulta en WhatsApp Manager > Account tools > Messaging limits — [Meta: Messaging limits](https://developers.facebook.com/docs/whatsapp/messaging-limits)
- CONFIRMADO: portfolios nuevos limitados a 2 numeros registrados; sin verificacion de negocio sigue en 2 salvo que se alcance limite de 2000 (entonces 20) — [Meta: Business phone numbers](https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/phone-numbers.md)
- CONFIRMADO: para proveedores, la verificacion se exige para limites mas altos, mas numeros y Official Business Account; no se dice obligatoria para onboarding; verificacion liderada por partner tiene "mucho mas rapido" tiempo que la del cliente; sin cifras — [Meta: Solution providers overview](https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/overview.md)
- Twilio: la verificacion de Meta es requerida "antes de pasar a produccion" si el portfolio es nuevo/no verificado, es gratuita y "puede tardar varias semanas" — [Twilio Self Sign-up](https://www.twilio.com/docs/whatsapp/self-sign-up). NOTA: esto contradice parcialmente a Meta e Infobip (no obligatoria para empezar); la politica de Twilio puede ser mas estricta que la de Meta.
- Infobip: se puede empezar a enviar tras registrar el sender sin esperar verificacion de negocio ni revision del display name; verificacion es opcional posterior — [Infobip: When can I start sending](https://support.infobip.com/when-can-i-start-sending-whatsapp-messages) (solo extracto de busqueda)
- 360dialog (documentos): prueba de nombre legal (licencia comercial, acta de constitucion, registro fiscal) y prueba de direccion/telefono (recibo o estado bancario con nombre legal); subida por representante autorizado en Security Centre (partners no pueden subirlos); Meta revisa "hasta 14 dias habiles"; requiere sitio web activo con SSL y mismos nombre/direccion/telefono, email del mismo dominio, nombre coherente en documentos, web y Pagina de Facebook — [360dialog: standard business verification](https://docs.360dialog.com/docs/resources/meta-business-verification/standard-business-verification). Aclara que lista oficial de Meta debe consultarse.
- 360dialog: no es obligatoria para todos; necesaria para escalar en la plataforma; alternativas: Partner-led Business Verification (PLBV, la mas rapida), verificacion clasica desde Security Centre, Meta Verified for Business (suscripcion paga); rechazos sin motivo detallado, se puede apelar/reenviar — [360dialog: Meta business verification](https://docs.360dialog.com/docs/resources/meta-business-verification)
- Plazos reportados por terceros: 1-5 dias habiles hasta 10-14; un hilo de foro (marzo 2026) reporta verificacion de Colombia "In review" 6 dias habiles; otro caso en foro Meta con verificacion atascada desde 28 oct — [resultados de busqueda: Leadsales](https://leadsales.io/blog/verificar-negocio-meta-business-para-usar-api/), [Meta community](https://communityforums.atmeta.com/questions-and-discussions-26/business-verification-stuck-in-review-since-oct-28-blocks-tech-provider-whatsapp-embedded-signup-portfolio-id-1069631804666432-181888) (NO oficial, anecdotico)
- Documentos Peru/RUC/SUNAT: la guia de WATI por pais NO incluye Peru — [WATI](https://support.wati.io/en/articles/11463208-meta-business-verification-required-documents-by-country). Verifik solo es herramienta de consulta de RUC, no de Meta — [Verifik Peru](https://docs.verifik.co/business-validation/peru/)
- Terceros afirman que negocios no listados en Meta pueden verificarse subiendo documentos, y que documentos expirados/alterados o con nombres no coincidentes se rechazan — [MyOperator](https://support.myoperator.com/portal/en/kb/articles/what-documents-are-required-for-facebook-business-verification-20-9-2025) (NO oficial)

### Inferences
- Equipo informal sin RUC: no hay evidencia de que pueda verificar (se piden documentos legales del negocio). Pero para 20 hogares no hace falta verificar si el tope de 250 aplica; riesgo: Twilio puede exigirla antes de produccion.
- Alternativas para verificar: persona juridica registrada (UPAO, incubadora como DNT Startups, o un RUC de persona natural con negocio si Meta lo acepta). NO VERIFICADO si Meta acepta RUC de persona natural ni si una universidad/incubadora puede prestar su verificacion; ademas el portfolio debe ser propiedad de un representante autorizado de la entidad.

### Gaps
- Lista oficial de documentos aceptados en Peru (RUC/SUNAT/ficha RUC) no encontrada.
- Pagina oficial Meta Help Center de verificacion no legible (solo indice).
- No se hallo si estudiantes sin entidad pueden verificar.

## 4. Requisitos del numero emisor

### Takeaway
Debe ser un numero dedicado que NO este en la app de WhatsApp (salvo coexistence), capaz de recibir SMS o llamada de voz para el codigo.

### Cited Findings
- CONFIRMADO: numeros ya en uso con WhatsApp no pueden registrarse salvo que se eliminen primero; numeros baneados requieren apelacion; fijos permitidos si reciben voz/SMS, con codigo de pais y area (OTP por voz estandar para fijos) — [Meta: Business phone numbers](https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/phone-numbers.md)
- Verificacion: code_method SMS o VOICE; anadir el numero en el panel no lo registra para Cloud API, hay que llamar al endpoint de registro; el estado debe ser "connected" — misma fuente
- Coexistence (usar la app Business y la API a la vez) existe: [Meta: onboarding Business app users](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users.md) (solo URL del indice; requisitos no leidos)
- Twilio: numero compatible, no registrado en WhatsApp, capaz de recibir OTP — [Twilio Self Sign-up](https://www.twilio.com/docs/whatsapp/self-sign-up)
- Display name: aparece en chats solo tras aprobacion; cambio permitido 10 veces por 30 dias; tras aprobacion hay 14 dias para volver a registrar; el doc no da plazo de revision — [Meta: Display names](https://developers.facebook.com/documentation/business-messaging/whatsapp/display-names.md). Twilio: si Meta rechaza el nombre, el numero queda limitado a 250 mensajes iniciados por el negocio/24 h y puede desconectarse.

### Gaps
- Plazo de aprobacion del display name no indicado por Meta.

## 5. Plantillas de mensajes

### Takeaway
Categorias: authentication, marketing, utility. Revision automatica; Meta dice "puede tardar hasta 24 horas".

### Cited Findings
- CONFIRMADO: tres categorias; revision automatica al crear o editar; "Review can take up to 24 hours"; estados In-Review, Rejected, Active (Quality pending/High/Medium/Low), Paused, Disabled, Appeal Requested; webhook message_template_status_update — [Meta: Template guidelines](https://developers.facebook.com/docs/whatsapp/message-templates/guidelines)
- Mensajes no-plantilla solo dentro de ventana de 24 h de atencion tras respuesta del usuario — [Meta: Get started](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)

### Gaps
- Tiempo tipico (minutos) no indicado en la pagina; rechazos especificos estan en otra pagina (Template review guide) no leida. El consentimiento/opt-in queda fuera de este alcance (otro investigador).

## 6. Intermediarios (BSP / Tech Providers)

### Takeaway
Reducen el trabajo tecnico y pueden acelerar la verificacion (PLBV "mucho mas rapida" segun Meta, sin cifras), pero no eliminan los requisitos del numero ni de documentos legales. Costos adicionales no verificados.

### Cited Findings
- Solution Partners ofrecen mensajeria, facturacion y soporte, pueden dar linea de credito; Tech Providers no tienen credito: el cliente anade su metodo de pago a Meta — [Meta: Solution providers](https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/overview.md)
- Un Select/Premier Solution Partner puede presentar la verificacion en nombre del cliente; PLBV puede iniciarse al final del Embedded Signup — misma fuente y [360dialog](https://docs.360dialog.com/docs/resources/meta-business-verification). Documentos aun los sube el representante en vias clasicas (360dialog).
- Twilio: registro tras confirmar en minutos; codigo por voz puede tardar hasta 10 min; todos los senders de una cuenta Twilio en la misma WABA — [Twilio Self Sign-up](https://www.twilio.com/docs/whatsapp/self-sign-up)
- Infobip: registro del sender y envio sin esperar verificacion — [Infobip](https://support.infobip.com/when-can-i-start-sending-whatsapp-messages). Pagina de registro de sender: [Infobip sender registration](https://www.infobip.com/docs/whatsapp/get-started/sender-registration) (no leida).
- Un FAQ de BizMagnets (tercero) menciona una revision de politica de comercio de 2-7 dias, separada de la verificacion — [BizMagnets](https://docs.bizmagnets.ai/whatsapp-channel/faqs) (NO oficial, no verificado)

### Gaps
- Precios/costo adicional de Twilio, 360dialog, Infobip y tarifas de Meta por mensaje en Peru: NO investigados.
- Gupshup no investigado.

## 7. Como verificar los plazos uno mismo

### Takeaway
Seguir el flujo real y medir: cada fase tiene un indicador en WhatsApp Manager / Security Centre / webhooks.

### Cited Findings
- Tope de mensajes: WhatsApp Manager > Account tools > Messaging limits, o campo API whatsapp_business_manager_messaging_limit — [Meta: Messaging limits](https://developers.facebook.com/docs/whatsapp/messaging-limits)
- Estado de plantillas: WhatsApp Manager (In-Review/Active/Rejected) o webhook message_template_status_update / campo status en Template API — [Meta: Template guidelines](https://developers.facebook.com/docs/whatsapp/message-templates/guidelines)
- Display name: webhook phone_number_name_update y notificacion de Meta Business Suite — [Meta: Display names](https://developers.facebook.com/documentation/business-messaging/whatsapp/display-names.md)
- Estado del numero: "connected" y code_verification_status — [Meta: Business phone numbers](https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/phone-numbers.md)
- Verificacion de negocio: boton "Start Verification" en Meta Business Portfolio > Security Centre; solo aparece con info de negocio completa; estado ("In review") consultable alli — [360dialog](https://docs.360dialog.com/docs/resources/meta-business-verification/standard-business-verification), [WATI](https://support.wati.io/en/articles/11463208-meta-business-verification-required-documents-by-country)
- Indices oficiales para seguir leyendo: https://developers.facebook.com/documentation/business-messaging/whatsapp/llms.txt (lista de paginas, incluye partner-led-business-verification.md, localized-business-verification.md, embedded-signup, coexistence)
- Pagina oficial de ayuda de verificacion: https://www.facebook.com/business/help/2058515294227817 (no se pudo leer su texto aqui; el equipo debe abrirla en el navegador)

### Inferences
- Prueba practica sugerida (dia 0): crear portfolio y WABA, mandar mensaje de prueba, crear plantilla utility y cronometrar su estado; iniciar la verificacion en paralelo y anotar fecha de envio y cambio de estado; revisar el tope actual en Messaging limits. Esto da plazos reales para Peru sin depender de blogs.

### Gaps
- No se pudieron abrir paginas de Meta Business Help Center; documentos aceptados en Peru y elegibilidad de equipos sin entidad legal siguen sin confirmar.
- Posible desactualizacion: el doc de messaging limits menciona el campo max_daily_conversation_per_phone vigente "hasta febrero 2026" y marca messaging_limit_tier como obsoleto; el modelo de limites por portfolio es reciente, por lo que articulos anteriores (ej. tiers de 1K/10K por numero) pueden estar obsoletos.

# WhatsApp Business Platform (Cloud API) en Peru: precios, opt-in, ventana 24h y limites (vigente al 2026-11-16)

Nota de metodo: las paginas oficiales de Meta se obtuvieron via WebFetch (resumen automatico). Las tarifas por pais de Peru NO aparecen en el texto capturado de las paginas de Meta (las tablas son dinamicas/CSV); los montos de Peru provienen de terceros (BSP/blogs) y estan marcados como NO VERIFICADO oficialmente.

## 1. Modelo de precios y tarifas para Peru

### Takeaway
Desde 2025-07-01 Meta cobra por mensaje entregado (no por conversacion), segun categoria y mercado. Peru (+51) es mercado propio (no "Rest of Latin America"). Desde 2026-10-01 las plantillas utility se cobran tambien dentro de la ventana de 24h. Tarifa Peru utility aprox. US$0.0240 (pre oct-2026) a US$0.0345 (oct-2026) segun terceros; el monto exacto debe confirmarse en el rate card oficial (USD o PEN).

### Cited Findings
CONFIRMADO por docs oficiales:
- Precio por mensaje desde 2025-07-01, reemplazando conversaciones; se cobra solo mensaje de negocio a usuario y solo si se entrega; tarifa depende de categoria y del prefijo del pais del destinatario. Categorias plantilla: marketing, utility, authentication; no plantilla (dentro de ventana 24h): service (y Meta Business Agent desde 2026-07-01) — [Meta pricing](https://developers.facebook.com/docs/whatsapp/pricing)
- Peru (+51) es mercado independiente; "Rest of Latin America" agrupa otros 15 mercados (Bolivia, Costa Rica, Rep. Dominicana, Ecuador, Guatemala, Panama, Uruguay, Venezuela, etc.) — [Meta pricing](https://developers.facebook.com/docs/whatsapp/pricing)
- Las tarifas utility y authentication de Peru subieron el 2026-10-01; marketing y service no figuran con cambio — [Meta pricing (documentation URL)](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/)
- Gratis: (a) service messages hasta 1,000 por numero de negocio por mes (sin acumulacion; cobro desde el 1,001); desde 2026-10-01 los service ya se cobran sobre ese nivel gratuito; (b) ventana de Free Entry Point (anuncio Click-to-WhatsApp, hasta 7 dias): marketing, utility, authentication y service gratis; (c) exencion para gobiernos/ONG elegibles hasta 2027-12-31 — [Meta pricing](https://developers.facebook.com/docs/whatsapp/pricing)
- Utility dentro de una ventana de servicio abierta fue gratis desde 2025-07-01; desde 2026-10-01 se cobra a la tarifa publicada — [Meta pricing](https://developers.facebook.com/docs/whatsapp/pricing)
- Descuentos por volumen solo para utility y authentication, por mercado y categoria, reinician mensualmente — [Meta pricing](https://developers.facebook.com/docs/whatsapp/pricing)
- PEN (sol peruano) esta disponible como moneda de facturacion; tarifas por moneda en CSV/PDF — [Meta platform pricing](https://whatsappbusiness.com/es-la/products/platform-pricing/)
- Fechas clave: 2025-07-01 inicio; 2026-01-01, 2026-04-01, 2026-07-01 actualizaciones de tarifas; 2026-10-01 cobro de service sobre tier gratis, utility en ventana, 40 cambios de tarifa — [Meta pricing](https://developers.facebook.com/docs/whatsapp/pricing)

NO VERIFICADO oficialmente (terceros), tarifas Peru por mensaje en USD:
- Sleekflow, "efectivas 2026-10-01": marketing 0.08085; utility 0.03450; authentication 0.03450; service 0.0300 — [Sleekflow](https://help.sleekflow.io/en_US/whatsapp/pricing)
- Chatalog (verificado contra Meta el 2026-09-15, probablemente tarifa previa al cambio de oct): marketing 0.0844; utility 0.0240; authentication 0.0240; service 0.0240 (service "indicativo") — [Chatalog](https://docs.chatalog.ai/platform-setup/whatsapp-connection-guide/whatsapp-pricing-update)
- Conflicto: las dos fuentes difieren (utility 0.0240 vs 0.0345; marketing 0.0844 vs 0.08085). Es coherente con que Meta subio utility en Peru el 2026-10-01, pero no se pudo confirmar la cifra final ni la discrepancia en marketing.

### Inferences
- Para un recordatorio de mantenimiento enviado como plantilla utility, el costo vigente a nov-2026 probablemente es ~US$0.0345 por mensaje (Sleekflow) con margen de error por la discrepancia.
- Si un BSP revende, puede agregar markup; con Cloud API directo se paga a Meta.

### Gaps
- No se obtuvo el CSV oficial de Meta con la fila de Peru (tablas dinamicas); verificar en el selector de https://whatsappbusiness.com/es-la/products/platform-pricing/ (Peru, USD o PEN) o en WhatsApp Manager.
- Tarifa en PEN no encontrada.
- Tramos de volumen de Peru no encontrados.
- Cambios posteriores a 2026-10-01 (nov-2026) no verificados.

## 2. Categoria de un recordatorio de mantenimiento de filtro

### Takeaway
Un aviso "toca limpiar tu filtro en 3 dias" ligado al servicio/equipo del cliente y sin contenido promocional encaja en UTILITY; si incluye oferta, upsell o busca renovar/vender, pasa a MARKETING.

### Cited Findings
- Utility: no promocional; especifica del usuario o solicitada por el (pedido, cuenta, servicios, transacciones) o esencial (seguridad). Ejemplos oficiales: confirmaciones, actualizaciones de envio, recordatorios de pago, recordatorios de recarga, avisos de balance — [Meta template categorization](https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-categorization)
- Mensajes de pedido/cuenta no deben promocionar, hacer upsell/cross-sell, incluir ofertas ni buscar renovaciones; recordatorios de renovacion de suscripcion con descuento son marketing — mismo enlace
- Contenido mixto utility+marketing se categoriza como marketing; contenido ambiguo ("Felicidades!") tambien — mismo enlace
- Meta puede recategorizar utility a marketing (aviso de 1 dia; desde 2025-04-09 se aprueba directo como marketing si Meta lo determina; sin aviso para negocios con advertencia por mal uso desde 2025-04-16). Mal uso repetido lleva a limites y restricciones — mismo enlace

### Inferences
- El ejemplo oficial de "recordatorio" mas cercano es payment/top-up reminder; un recordatorio de mantenimiento de un servicio ya contratado es analogo, pero Meta no lista ejemplos de mantenimiento: la clasificacion final la decide Meta al aprobar la plantilla (NO VERIFICADO para este caso exacto).
- Evitar frases comerciales ("agenda tu servicio con 10% dscto") para no caer en marketing (~2.3x mas caro segun tarifas de terceros).

### Gaps
- No hay ejemplo oficial de recordatorio de mantenimiento de producto.

## 3. Requisitos de opt-in

### Takeaway
La politica exige consentimiento explicito, separado por categoria de mensaje, y respetar opt-outs; NO especifica metodos permitidos (verbal, casilla, QR, formulario) ni formato de registro: solo exige legalidad aplicable y flujos claros.

### Cited Findings
- Solo se puede contactar a quien dio su numero y acepto (opt-in); el negocio es "el unico responsable" de determinar como obtener consentimiento explicito y debe cumplir la ley aplicable — [WhatsApp Business Messaging Policy](https://whatsappbusiness.com/es-la/policy/)
- Recomienda opt-in separado por categoria (ej. actualizaciones de pedido vs promociones) y por llamadas; comunicar claramente el valor y los avisos requeridos; mantener politica de privacidad publicada — mismo enlace
- La pagina no enumera metodos concretos (verbal, checkbox en app, QR, formulario web) ni indica requisitos de conservacion de registros — mismo enlace
- Se deben respetar todas las solicitudes de bloqueo/baja (dentro o fuera de WhatsApp), con instrucciones claras de baja; Meta puede revisar flujos de consentimiento, incluso reactivamente por feedback de usuarios — mismo enlace
- Independientemente de la ventana, solo se puede escribir a usuarios que dieron opt-in — [Meta send messages](https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/send-messages)

### Inferences
- Como la politica no prohibe metodos, un checkbox en la app, formulario o consentimiento verbal registrado serian plausibles, pero la validez legal depende de la ley peruana de proteccion de datos personales (no investigada aqui; NO VERIFICADO).
- Buena practica (no exigida expresamente por la politica): guardar fecha, canal, texto aceptado y numero por cada cliente.

### Gaps
- Meta documentacion de opt-in mas detallada (paginas de "get opt-in") no se pudo extraer; los metodos y el registro quedan sin confirmacion oficial.
- Ley 29733 (Peru) y consentimiento: no investigado.

## 4. Ventana de servicio de 24 horas y plantillas

### Takeaway
La ventana de 24h se abre cuando el usuario escribe o llama y se reinicia con cada mensaje; fuera de ella solo se pueden enviar plantillas aprobadas. Un recordatorio proactivo (sin que el cliente haya escrito) siempre requiere plantilla.

### Cited Findings
- La ventana se abre cuando el usuario escribe o llama, dura 24h y se reinicia con cada nuevo mensaje/llamada del usuario — [Meta send messages](https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/send-messages)
- Dentro: cualquier tipo de mensaje libre (texto, media, interactivos, etc.), sin aprobacion previa, facturados como SERVICE; fuera: solo plantillas pre-aprobadas — mismo enlace
- Las plantillas deben estar APPROVED y estan sujetas a limites de mensajeria, pacing y pausa — [Meta template overview](https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/overview)

### Inferences
- Para 20 hogares con recordatorios mensuales iniciados por el negocio, casi todos los envios caeran fuera de ventana: se cobran como utility (desde oct-2026 tambien si hubiera ventana abierta).

### Gaps
- Codigo de error 131047 y detalle de pausa/pacing no confirmados en las paginas leidas.

## 5. Limites de mensajeria y calidad

### Takeaway
Portafolios nuevos parten en 250 usuarios unicos por 24h moviles fuera de ventana; verificar el negocio (o enviar 2,000 mensajes de calidad en 30 dias) permite subir a 2,000 y luego escalar automaticamente. Para 20 hogares el limite inicial de 250 sobra.

### Cited Findings
- Portafolios nuevos: limite 250; tiers: 250, 2,000, 10,000, 100,000, ilimitado; limite es por portafolio de negocio, compartido por todos sus numeros; cuenta usuarios unicos contactados fuera de ventanas de servicio en 24h moviles — [Meta messaging limits](https://developers.facebook.com/docs/whatsapp/messaging-limits)
- Para llegar a 2,000: verificar el negocio, o que un partner lo verifique, o enviar 2,000 mensajes entregados a numeros unicos en 30 dias con plantillas de alta calidad; Meta aprueba o niega elegibilidad — mismo enlace
- Escalado automatico desde 2,000: mensajes de alta calidad y usar al menos la mitad del limite en 7 dias; sube un nivel en ~6 horas — mismo enlace
- Campo `messaging_limit_tier` deprecado; usar `whatsapp_business_manager_messaging_limit` — mismo enlace
- La pagina no define umbrales numericos del quality rating ni diferencia explicita "antes/despues de verificacion" mas alla de 250 -> 2,000 — mismo enlace

### Inferences
- Con ~20 destinatarios no se necesita verificacion de negocio para volumen; la verificacion puede igualmente ser requerida por otros motivos (no investigado).

### Gaps
- Umbrales de quality rating y reglas de throttling por calidad no cubiertos en la pagina leida.
- Requisitos de verificacion de negocio en Peru (documentos) no investigados.

## 6. Costo mensual estimado: 20 hogares x 4 recordatorios = 80 mensajes/mes

### Takeaway
Con plantilla utility el costo es aprox. US$1.9 a US$2.8 al mes (USD, sin impuestos ni markup de BSP); si se clasifica como marketing, aprox. US$6.5 a US$6.8. Calculo propio sobre tarifas de terceros (no verificadas).

### Cited Findings
- Tarifas de entrada: utility 0.0345 (Sleekflow) o 0.0240 (Chatalog); marketing 0.08085 (Sleekflow) o 0.0844 (Chatalog) — ver seccion 1
- Calculo: 80 x 0.0345 = US$2.76; 80 x 0.0240 = US$1.92; 80 x 0.08085 = US$6.47; 80 x 0.0844 = US$6.75 (aritmetica propia)

### Inferences
- Descuentos por volumen irrelevantes a esta escala.
- Si el hogar responde, esas respuestas libres dentro de 24h serian service y caerian en los 1,000 gratis/mes.
- Posibles costos extra no incluidos: markup de BSP, impuestos (IGV), conversion USD/PEN.

### Gaps
- Tarifa oficial final de Peru sin confirmar; impuestos aplicables no investigados.

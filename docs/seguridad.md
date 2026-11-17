# Revisión de seguridad de AquaCheck (17/11/2026)

Revisión hecha por el propio autor del diseño (Claude) con pruebas reales contra el sistema publicado. **No sustituye una revisión independiente**: conviene que otra persona con experiencia la repita antes de usar datos reales de familias.

## Qué se probó y resultado
| Prueba | Resultado |
|---|---|
| Leer/escribir las 5 tablas con la llave pública y sin sesión | Bloqueado (permiso denegado) |
| Llamar funciones internas (`es_equipo`, `privado.borrar_vencidos`) desde la API | Bloqueado / no expuestas |
| Listar o leer el bucket de fotos sin sesión; subir sin enlace firmado | Bloqueado |
| Enlace de subida de foto: segundo uso, otra ruta | Rechazado |
| Registro público de usuarios en Supabase Auth | Desactivado |
| Código inexistente, clave falsa, inyección en el código | Misma respuesta 401 (no revela qué filtros existen) |
| Cuerpo mayor de 16 KB, JSON inválido, fecha inexistente o futura, id no válido | Rechazado (413 / 400) |
| Límite de intentos: 12 claves falsas seguidas, luego la clave real | 10 × 401, luego 429; **la clave real sigue funcionando** |
| CORS desde un origen ajeno | Ya no se permite `*` |
| Claves de los hogares y llaves secretas en el historial de git | No aparecen (solo la llave pública, que es pública por diseño) |
| `npm audit` (dependencias de producción) | 0 vulnerabilidades |
| Cabeceras web (CSP, nosniff, sin Referer, sin iframes, permisos) | Añadidas; la app, el escáner de QR, las fotos y el PDF funcionan sin violaciones de CSP |

## Corregido en esta revisión
1. **Bloqueo de familias por terceros**: antes, 10 claves falsas bloqueaban 10 minutos a la familia real. Ahora solo cuentan los intentos fallidos y una clave correcta nunca se bloquea (las claves de 192 bits no se pueden adivinar).
2. **Crecimiento sin límite de `intentos_acceso`**: los intentos de más de 10 minutos se borran.
3. **Entradas sin validar**: fechas reales entre 2020 y mañana, tamaño máximo de cuerpo, texto de consentimiento acotado, ids con forma de UUID.
4. **Abuso con una clave válida**: máximo 500 mantenimientos y 200 reportes por hogar.
5. **Errores de base de datos silenciados**: ahora devuelven 500 en vez de "ok".
6. **CORS `*`**: restringido al dominio de la app (y localhost para pruebas).
7. **Sin cabeceras de seguridad**: `vercel.json` agrega CSP, `X-Content-Type-Options`, `Referrer-Policy: no-referrer`, `X-Frame-Options`, `Permissions-Policy`.

## Riesgos aceptados o pendientes (decisión del equipo)
- **Quien tenga el QR (o una foto de él) tiene acceso a ese hogar**: puede ver su historial, agregar registros y cambiar el celular registrado. Es inherente al diseño "sin contraseña". Mitigación: pegar el QR en el filtro dentro del hogar; si se pierde o se fotografía indebidamente, rotar la clave de ese hogar (nuevo hash en `hogares.secreto_hash` y nueva ficha).
- **La clave queda guardada en el celular de la familia** (localStorage) para funcionar sin internet; el celular y el consentimiento NO.
- **El equipo puede leer `secreto_hash`** (SHA-256 de claves aleatorias de 192 bits: no sirve para nada sin la clave). Es aceptable.
- **Contraseñas del equipo**: la fuerza la define Supabase Auth. Recomendado: contraseña larga y única, y revisar en Authentication → Sign In / Providers → Email la longitud mínima. No hay segundo factor (MFA) activado.
- **Sesión del equipo en `sessionStorage`**: se borra al cerrar la pestaña. Un XSS podría leerla; la CSP y React (que escapa el contenido) reducen ese riesgo, pero no lo eliminan.
- **`style-src 'unsafe-inline'`** en la CSP: React usa estilos en línea. El riesgo es bajo porque `script-src` es solo `'self'`.
- **Borrado de datos al final del piloto es manual** (a partir del 02/03/2027; ver `supabase/README.md`). No se programó `pg_cron`.
- **Plan gratis de Supabase**: sin copias de seguridad automáticas y el proyecto se pausa tras 1 semana sin actividad (restaurable hasta 1 año).
- **Fotos**: pueden mostrar el interior del hogar o personas. Hay que decirle a las familias que fotografíen solo el filtro (el aviso de privacidad debería mencionarlo).
- **Un solo proyecto de Supabase** guarda pruebas y datos reales: antes del piloto, comprobar que `contactos`, `mantenimientos` y `reportes` están vacíos.
- **Revisión legal** del texto de consentimiento (Ley 29733) por UPAO u otra persona competente.

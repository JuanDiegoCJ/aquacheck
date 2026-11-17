# Supabase · diseño del backend de AquaCheck

Todo el backend es Supabase (sin servidor aparte). La app (Vercel) solo habla con Supabase.

```
Familia (QR con clave)  →  Edge Function `hogar`  →  tablas CERRADAS (RLS + sin permisos para anon)
Equipo (correo + clave) →  Supabase Auth          →  tablas, solo si app_metadata.rol = 'equipo'
```

## Archivos
- `migrations/0003_fotos.sql`: bucket privado `fotos-fallas` (solo JPEG, máx. 1 MB) y política de lectura para el equipo. Las familias suben con un enlace firmado de un solo uso que entrega la función.
- `migrations/0002_permisos_servicio.sql`: permisos del rol de servidor (necesario porque el proyecto se creó sin exponer tablas; sin esto la función no puede leer).
- `migrations/0001_esquema.sql`: tablas, RLS, permisos revocados, rol de equipo y función de borrado (`privado.borrar_vencidos`).
- `functions/hogar/index.ts`: puerta de las familias (valida código + clave, limita intentos, nunca devuelve celulares).

## Cómo aplicarlo (cuando exista el proyecto)
1. Editor SQL de Supabase → pegar y ejecutar `0001_esquema.sql`.
2. Crear a los hogares AQ-001…AQ-020 con una clave aleatoria larga cada uno (guardar solo el SHA-256 en `secreto_hash`; la clave va en el QR).
3. Desplegar la función `hogar` (Edge Functions → desplegar; o `supabase functions deploy hogar`).
4. Crear a los usuarios del equipo (Auth) y ponerles `app_metadata = {"rol": "equipo"}` desde el panel.
5. En la app: reemplazar `src/data/repo.js` por un adaptador que llame a la función y conserve la cola sin internet.
6. Las variables públicas van en Vercel como `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`. La llave secreta NUNCA va en el frontend.

## Clave del QR
Aleatoria de 128 bits o más, en la parte `#` de la dirección (no viaja al servidor ni en el encabezado Referer):
`https://aquacheck-moche.vercel.app/#/f/AQ-007?k=<clave>`. Si se pierde un QR, se rota la clave del hogar.

## Fichas definitivas
`npm run build` y luego `node tools/generar_fichas.mjs <claves.csv> <salida.html>` crea las 20 fichas con el QR de cada hogar (código + clave). El CSV y la salida contienen claves: guardarlos FUERA del repositorio. Se imprimen desde el navegador (o a PDF).

## Pendientes y supuestos (no verificados)
- Que `pg_cron` esté disponible en el plan gratis: probar con `create extension pg_cron;`. El borrado manual es el respaldo.
- Que SUPABASE_SERVICE_ROLE_KEY esté disponible por defecto en las Edge Functions (según la documentación, sí; confirmar al desplegar).
- Fotos: implementadas (0003). Borrar filas de storage.objects con SQL NO borra los archivos: al terminar el plazo, vaciar el bucket desde Storage > fotos-fallas (seleccionar todo > Delete).
- Este diseño es propio, apoyado en la guía oficial de RLS y Edge Functions; conviene una revisión de seguridad antes del piloto real.

## Estado (17/11/2026)
Proyecto `aquacheck` creado en São Paulo, esquemas 0001 y 0002 aplicados, 20 hogares creados (claves fuera del repo) y función `hogar` desplegada con la verificación de JWT desactivada. Probado desde fuera: clave real 200; clave falsa, ajena o filtro inexistente 401 con el mismo mensaje; el celular nunca se devuelve; límite de intentos (429). App conectada (cola sin internet) y fichas definitivas generadas. Pendiente: panel del equipo con Auth, fotos, desactivar el registro público de Auth.

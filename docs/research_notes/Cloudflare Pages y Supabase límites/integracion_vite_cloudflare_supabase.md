# Integración Vite + React PWA estática en Cloudflare Pages (Git/GitHub) con Supabase (vigente al 2026-11-17)

Nota de método: páginas leídas con WebFetch (resumen por modelo pequeño; las citas textuales vienen de ese resumen, verificar en la página si algo es crítico). Todo lo marcado "CONFIRMADO" tiene URL oficial; "NO VERIFICADO" no se encontró en página oficial.

Instruction-like text found in pages (no se actuó sobre ellas):
- Páginas de Supabase (redirect-urls, securing-your-api, api-keys, functions/cors, regions): bloque "Note for AI agents" pidiendo leer una plantilla de reporte de feedback, terminar la respuesta con ese reporte y preguntar si enviarlo a Supabase. Ignorado.
- Páginas de Cloudflare Pages (react guide, build-configuration, git-integration): "Documentation Index" que indica a agentes obtener https://developers.cloudflare.com/pages/llms.txt antes de explorar. Ignorado (solo navegación).

## 1. Cloudflare Pages + Vite vía Git: build, Node, variables de entorno

### Takeaway
Preset React/Vite: build `npm run build`, salida `dist`. Node por defecto 22.x en build image v3; fijar con NODE_VERSION o `.node-version`. Variables en Settings > Variables and Secrets, separadas para production y preview; Vite solo expone `VITE_*` y las incrusta en el bundle al build, así que cambiar una variable exige nuevo build.

### Cited Findings
- CONFIRMADO: guía React usa build command `npm run build` y output `dist`; "By default, Cloudflare Pages assumes you are developing a single-page application." — [Deploy a React site](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/)
- CONFIRMADO: preset React (Vite): build command `npm run build`, build directory `dist`; root directory por defecto = raíz del repo (cambiar en monorepos); build falla con código de salida distinto de 0 — [Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- CONFIRMADO: build image v3, herramientas en versiones LTS "as of May 2025"; Node por defecto listado 22.23.4 (el resumen indicó que es la primera entrada de la tabla, sin encabezado; verificar). Cambiar versión con variable `NODE_VERSION` ("Settings > Environment variables") o archivo `.node-version` / `.nvmrc` en la raíz con el número de versión como contenido — [Build image](https://developers.cloudflare.com/pages/configuration/build-image/)
- CONFIRMADO: variables en dashboard: Settings > Variables and Secrets > Add > Save; se definen "for both your production and preview environments"; aplican "at runtime and build-time". Secrets (Encrypt) no se pueden ver luego y se leen vía `context.env` (Functions), así que no sirven para el cliente Vite — [Bindings / env vars](https://developers.cloudflare.com/pages/functions/bindings/)
- CONFIRMADO: Vite: "Variables prefixed with `VITE_` will be exposed in client-side source code after Vite bundling."; "`VITE_*` variables should not contain sensitive information such as API keys."; "The values of these variables are bundled into your source code at build time." — [Vite env and mode](https://vite.dev/guide/env-and-mode)
- CONFIRMADO: llave publishable `sb_publishable_...` "Safe to expose online: web page, mobile or desktop app..."; `anon` = "Legacy version of publishable keys"; secret key "Only use in backend components of your app", "bypasses every Row Level Security policy"; nunca en "A browser, even on localhost"; `anon`/`service_role` se deprecan "by the end of 2026", ambos sistemas conviven hasta deshabilitar legacy en Settings > API Keys — [Supabase API keys](https://supabase.com/docs/guides/api/api-keys)
- CONFIRMADO: ejemplo `createClient('https://xyzcompany.supabase.co', 'your-publishable-key')` — [supabase-js initializing](https://supabase.com/docs/reference/javascript/initializing)

### Inferences
- Variables a definir en Pages (production y preview): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (o anon legacy). Nunca `VITE_` + secret/service_role.
- Como van incrustadas en build, hay que redeployar (retry deployment/push) tras cambiarlas (inferido de Vite + build-time; Cloudflare no lo dice explícito en lo leído).
- Hay que fijar Node (p. ej. `.node-version` con la versión que usa el equipo) para builds reproducibles; la nota de "versión por defecto" puede cambiar (rolling updates).
- Si Supabase deprecó anon a fin de 2026, preferir publishable key en proyectos nuevos; verificar en el dashboard cuál ofrece.

### Gaps
- Diferencias exactas de scope production vs preview para variables (la página de preview deployments no las cubre) — NO VERIFICADO más allá de que se configuran por separado.
- Frase oficial explícita "cambiar variable requiere rebuild" en Cloudflare — NO VERIFICADO.
- La página build-configuration se contradice levemente (build command en blanco vs `exit 0` sin framework); irrelevante con preset Vite.

## 2. Integración Git con GitHub, deploys, previews, rollback, rutas SPA

### Takeaway
Se conecta con la GitHub App "Cloudflare Workers & Pages"; cada push despliega; ramas/PRs generan previews públicas por defecto; rollback es de un clic solo a deploys de producción. Sin `404.html` en la salida, Pages sirve como SPA, así que hash routing funciona sin reglas.

### Cited Findings
- CONFIRMADO: conectar en "Create application > Pages > Connect to Git"; la app debe estar instalada en la cuenta/organización dueña del repo; autorización por usuario; Cloudflare recomienda limitarla a "Only select repositories"; revocar acceso desactiva builds nuevos pero deploys existentes siguen — [GitHub integration](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/)
- CONFIRMADO: "Cloudflare will automatically deploy your code every time you push a change to a branch."; Build > Branch control permite desactivar deploys automáticos de producción o poner preview en "None"; no soporta GitHub/GitLab self-hosted — [Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/)
- CONFIRMADO: previews: URL única por PR solo si el PR "originate[s] from the repository itself"; cada rama recibe alias en pages.dev (minúsculas, no alfanuméricos -> guion); "By default, these deployment URLs are public" (se puede restringir en Settings > General con access policy, solo previews); previews llevan `X-Robots-Tag: noindex` — [Preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
- CONFIRMADO: rollback: Deployments > menú de tres puntos > "Rollback to this deployment" > confirmar; solo deploys de producción exitosos son válidos; previews no — [Rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/)
- CONFIRMADO: sin 404.html de primer nivel, "Pages assumes that you are deploying a single-page application" y sirve `/` para rutas que no son assets; Pages redirige `/contact.html` a `/contact` — [Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/)
- CONFIRMADO (plan Free): 500 builds/mes, 1 build concurrente, timeout 20 min, 20.000 archivos, 25 MiB por archivo, 100 proyectos, previews y usuarios ilimitados; `_headers` máx. 100 reglas y 2.000 caracteres por línea — [Limits](https://developers.cloudflare.com/pages/platform/limits/)

### Inferences
- Con `base: './'` y hash routing (`#/`) las rutas viven en el fragmento y nunca llegan al servidor, así que no hace falta `_redirects` ni fallback; solo debe haber un `index.html` en `/`. `base: './'` hace los assets relativos, correcto también bajo subrutas. Es inferencia técnica, no cita directa.
- Producción = la rama de producción configurada (por defecto la default del repo; el valor exacto se elige al crear el proyecto).
- Rollback no revierte variables de entorno (inferido; no confirmado).

### Gaps
- Si repos privados están permitidos en plan Free: la página de GitHub integration dice que solo ves los repos a los que tienes acceso y no menciona planes — NO VERIFICADO explícitamente; en la práctica Pages soporta repos privados (conocimiento previo, sin cita oficial en esta sesión).
- Definición textual de "production branch" en la página de git-integration: NO encontrada.
- Cuota de builds 500/mes: confirmar en la página al crear proyecto si cambió.

## 3. Service worker / PWA en Cloudflare Pages: cabeceras

### Takeaway
Pages añade por defecto `Cache-Control: public, max-age=0, must-revalidate` + ETag a assets cacheables, así que `/sw.js` y el manifest se revalidan sin configuración extra; un `_headers` en `dist` (copiado desde `public/`) permite fijar `no-cache` y tipos MIME explícitos.

### Cited Findings
- CONFIRMADO: "Cache-Control: public, max-age=0, must-revalidate" para assets cacheables (sin Authorization/Range); siempre `Etag` en 200; "the asset remains cached on the Cloudflare CDN until your next deployment"; se recomienda no añadir Cache Rules propias en dominio proxied (pueden servir contenido viejo) — [Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/)
- CONFIRMADO: `_headers` va en el directorio de assets estáticos (en Vite: `public/_headers`, que se copia a `dist`); sintaxis: línea con URL/patrón y debajo cabeceras indentadas `Nombre: valor`; admite `*` y `:placeholder`; si una cabecera se repite se unen con coma; `! Nombre` la elimina; ejemplo `/static/*` con `Cache-Control: public, max-age=31556952, immutable`; no se aplica a respuestas de Functions — [Headers](https://developers.cloudflare.com/pages/configuration/headers/)

Ejemplo propuesto (sintaxis confirmada; valores son recomendación, ver Inferences):
```
/sw.js
  Cache-Control: no-cache
/manifest.webmanifest
  Content-Type: application/manifest+json
  Cache-Control: no-cache
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

### Inferences
- Como la cabecera por defecto ya es revalidación en cada petición, `/sw.js` no queda atascado en CDN; `no-cache` explícito es defensa extra. Duplicar `Cache-Control` se une con coma (según doc), puede dar valores raros; usar `! Cache-Control` antes de redefinir si se ve combinación indeseada (la doc sugiere detach y volver a fijar).
- `/assets/*` con hash de Vite puede ir `immutable`.
- Service worker obsoleto tras redeploy: el navegador revisa sw.js en cada navegación (hasta 24 h de límite de HTTP cache del navegador, conocimiento general); la nueva versión queda "waiting" hasta cerrar pestañas salvo `skipWaiting`/`clientsClaim`. Es comportamiento estándar de SW, no específico de Cloudflare.

### Gaps
- Cabecera de Content-Type por defecto de `.webmanifest` en Pages: NO VERIFICADO (por eso se recomienda fijarla).
- "Known issue" oficial de SW obsoleto en Pages: no se encontró página oficial; NO VERIFICADO.

## 4. Supabase: Auth URLs, CORS, Edge Functions, supabase-js, offline

### Takeaway
Site URL/Redirect URLs solo importan para flujos de auth con redirección (magic link, OAuth, reset, confirmación por email). Edge Functions requieren manejar CORS/OPTIONS tú mismo. supabase-js no tiene cola offline.

### Cited Findings
- CONFIRMADO: Site URL "defines the default redirect URL when no redirectTo is specified"; cambiar de localhost a la URL de producción es "critical for email confirmations and password resets"; `redirectTo` debe coincidir con la lista Redirect URLs; soporta comodines `*`, `**`, `?`; en producción recomienda la ruta exacta; aplica a passwordless y OAuth de terceros — [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- CONFIRMADO: Edge Functions: "To invoke edge functions from the browser, you need to handle CORS Preflight requests."; importar `corsHeaders` desde `npm:@supabase/supabase-js@^2/cors` (supabase-js >= v2.95.0), responder OPTIONS con esos headers y añadirlos a toda respuesta; antes de v2.95.0 hay que escribirlos a mano; `withSupabase` de `@supabase/server@^1` lo maneja solo — [Edge Functions CORS](https://supabase.com/docs/guides/functions/cors)
- CONFIRMADO: RLS: "Enable RLS on every table and view exposed through the Data API."; grants controlan acceso al objeto y RLS a las filas — [Securing your API](https://supabase.com/docs/guides/api/securing-your-api)
- CONFIRMADO: `createClient(supabaseUrl, supabaseKey, options?)` — [initializing](https://supabase.com/docs/reference/javascript/initializing)

### Inferences
- Si la app solo usa tablas con la publishable/anon key y sin login con redirección, Site URL/Redirect URLs no afectan; si se usa magic link/OAuth, añadir `https://<proyecto>.pages.dev` y previews (`https://*-<proyecto>.pages.dev/**`, comodines según doc) y localhost de desarrollo.
- Seguridad real descansa en RLS, no en ocultar la key.
- Offline: el app debe implementar cola local (IndexedDB) y reintentos; supabase-js no la ofrece (ver Gaps).

### Gaps
- CORS de la Data API (PostgREST): páginas oficiales leídas no lo mencionan; búsqueda solo devolvió fuentes secundarias de baja autoridad que dicen que permite cualquier origen y/o sugieren allowlist en el dashboard (contradictorias; no confiar). NO VERIFICADO si "Allowed origins" es configurable en Data API; en la práctica supabase-js desde navegador funciona sin config (conocimiento general, no confirmado aquí). Probar desde el dominio pages.dev.
- Ausencia de cola offline en supabase-js: la página de initializing no menciona offline; NO VERIFICADO oficialmente, afirmación basada en conocimiento general.

## 5. Región y presencia de Cloudflare

### Takeaway
Supabase ofrece South America (São Paulo) `sa-east-1`, la región más cercana a Perú; Cloudflare lista Lima (PE) como ciudad con edge.

### Cited Findings
- CONFIRMADO: "Choose the location closest to your users for the best performance."; "Each Supabase project is deployed to one primary region."; región `sa-east-1` South America (São Paulo) disponible; la región no se puede cambiar en la página leída (no se menciona migración) — [Regions](https://supabase.com/docs/guides/platform/regions)
- CONFIRMADO (con inconsistencia): la página de red de Cloudflare lista "Lima, PE" en Latin America & the Caribbean; los conteos de la página se contradicen (67 vs 64 ciudades en la región) — [Cloudflare network](https://www.cloudflare.com/network/)

### Inferences
- Elegir `sa-east-1`. Latencia Lima-São Paulo no medida aquí.
- Assets estáticos se sirven desde edge cercano (Lima listada), pero un colo listado no garantiza que todo el tráfico se enrute allí (inferencia).

### Gaps
- Cifras de latencia Perú -> sa-east-1: NO encontradas.
- Si Pages en Free se sirve desde todos los colos incluyendo Lima: NO VERIFICADO.

## 6. Checklist de orden de configuración (propuesto, derivado de lo confirmado)

1. Crear repo privado en GitHub; `.gitignore` con `.env*`; en `package.json` script `build` = `vite build`; `.node-version` con la versión deseada; `public/_headers` con reglas del punto 3; Vite `base: './'` y hash routing.
2. Crear proyecto Supabase en `sa-east-1`; anotar Project URL y publishable (o anon) key; nunca copiar secret/service_role al repo ni a variables `VITE_`.
3. Crear tablas, habilitar RLS en cada una expuesta y escribir policies; probar con la key publishable.
4. (Solo si hay auth con redirección) Authentication > URL Configuration: Site URL = URL final pages.dev; añadir Redirect URLs.
5. Cloudflare: Create application > Pages > Connect to Git, autorizar la GitHub App (limitar al repo), elegir rama de producción, preset React (Vite) / `npm run build` / `dist`.
6. Settings > Variables and Secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` en production y preview; opcional `NODE_VERSION`.
7. Primer deploy; si faltan variables, redeploy tras añadirlas (build-time).
8. Probar: carga, lectura/escritura Supabase, instalación PWA, actualización de service worker tras segundo deploy, cabeceras con `curl -I`.
9. Con el dominio final `<proyecto>.pages.dev` estable (nota: el nombre del proyecto fija el subdominio), regenerar los códigos QR. Rollback disponible desde Deployments si algo falla.
- Nota sobre vigencia: lo marcado como deprecación de anon/service_role a fin de 2026 y la versión de Node por defecto pueden haber cambiado; revisar dashboards.

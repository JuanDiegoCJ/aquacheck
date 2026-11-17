# AquaCheck (prototipo – Desafío UPAO 2026)

Aplicación web instalable (PWA) para que las familias de Moche lleven el mantenimiento de su filtro doméstico de 3 etapas:
escanean el QR del filtro, ven un semáforo y registran limpiezas y cambios de cartucho. Funciona sin internet.

> Proyecto independiente. Alcance y límites según `AQUACHECK_resumen_y_responsabilidades.docx` y la Metodología del Desafío.

## Límites (siempre visibles en la app)
- No mide la calidad del agua ni certifica potabilidad.
- Solo recoge los datos necesarios (código del filtro, modelo, fecha de instalación, celular con consentimiento, historial).
- No afirma que el agua esté contaminada.
- El vínculo con El Niño es una hipótesis por validar en Moche (SENAMHI, CENEPRED, SEDALIB, entrevistas).

## Cómo ejecutarlo
```bash
npm install
npm run dev       # desarrollo
npm run build     # compila a /dist
npm run preview   # sirve lo compilado (aquí se prueba el modo sin internet)
```

## Estado: Tandas 1 y 2
**Familia:** inicio/escanear QR · registro (celular + consentimiento) · panel con semáforo · registrar mantenimiento · historial ·
reportar un problema (con foto opcional) · modo "corte de agua" (lista de pasos) · ficha imprimible con QR · "qué hace y qué no hace".

**Equipo** (`#/equipo`, PIN de demostración `2026`): indicadores, estado de los 20 hogares, botón "Avisar por WhatsApp" (abre el mensaje
ya escrito), fallas abiertas (marcar resuelta), exportar 3 CSV (sin celulares ni fotos) y fichas de todos los filtros para imprimir.

Incluye modo demostración con 20 filtros ficticios (AQ-001 a AQ-020; AQ-018 a AQ-020 sin registrar).

## Cómo probarlo en un celular
- **Rápido (con internet):** publicar `dist/` en Netlify/Vercel/Cloudflare Pages (gratis, da HTTPS) y abrir esa dirección en el celular.
  Con HTTPS ya se puede escanear con la cámara e instalar la app; el modo sin internet funciona desde la segunda visita.
- **Solo por Wi‑Fi local** (`npm run preview`, abrir `http://IP-de-tu-PC:4173`): carga la app, pero el celular NO registrará el modo sin internet
  ni dará acceso a la cámara, porque exigen HTTPS (o `localhost`).
- Probar sin internet: abrir la app una vez, activar el modo avión, volver a abrirla.

## Pruebas realizadas (Chrome en Windows, automatizadas)
Sin internet (service worker): abrir panel/inicio, registrar mantenimiento y reporte, ficha con QR. QR: decodificación con la misma librería.
Falta probar en un celular real: escaneo con la cámara y la instalación como app.

## Decisiones y pendientes
- **Identificación:** el QR lleva el código del filtro (`AQ-007`), no datos de la persona. La tabla código ↔ familia la guarda el equipo fuera de la app.
- **Intervalos de mantenimiento** (`src/domain/reglas.js`): 30 / 180 / 90 días son valores de EJEMPLO; reemplazar por los del fabricante.
- **Consentimiento y aviso de privacidad** (`src/domain/consentimiento.js`): BORRADOR en dos capas (frase corta + aviso completo). Responsable: el equipo
  estudiantil. Contacto: aquacheck26@gmail.com. Plazo: fin del piloto + 30 días (definir la FECHA de fin del piloto y cumplir el borrado/anonimización al vencer). Revisar con UPAO/asesoría
  antes del piloto real.
- **Intervalos de mantenimiento:** pendientes de la ficha técnica del proveedor del Módulo B (ver `src/domain/reglas.js`).
- **WhatsApp:** semiautomático (el equipo abre el mensaje ya escrito con `wa.me`). La API real queda para el piloto; ver `docs/reports/`.
- **PIN del equipo** (`src/data/repo.js`): es de demostración, NO es seguridad real. En el piloto debe ser un inicio de sesión en el servidor.
- **Pasos del modo corte de agua** (`src/domain/fallas.js`): contenido de ejemplo; validar con SEDALIB y salud.
- **QR de las fichas:** guarda la dirección con la que abriste la app; imprímelas desde la dirección FINAL publicada.
- **Datos:** hoy en `localStorage` del celular. Para el piloto se cambia solo `src/data/repo.js` por un servidor.
- **Modo sin internet:** el service worker se genera en `npm run build`; probar con `npm run preview` en Chrome/Android.

## Estructura del código
```text
src/
  app/          App.jsx, main.jsx, ruta.js, estilos.css
  domain/       reglas.js, fallas.js, consentimiento.js   (reglas puras, sin React)
  data/         repo.js, datos_demo.js, csv.js            (lo único que cambia al pasar a un servidor)
  family/       pantallas de la familia
  team/         pantallas del equipo del proyecto
  components/   piezas compartidas
```n
## Documentos
`docs/reports/API WhatsApp plazos y consentimiento.md` y sus notas en `docs/research_notes/`.

## Dashboard del equipo
En el panel del equipo (#/equipo): indicadores, 4 gráficos interactivos hechos a mano en SVG/CSS (hogares por estado, cumplimiento por tarea,
mantenimientos por semana y fallas por tipo), filtros por estado y buscador. Tocar un gráfico filtra la tabla de hogares.
Descargas generadas en el navegador (funcionan sin internet, sin celulares ni fotos): **Excel** (.xlsx, 7 hojas), **Word** (.docx), **informe PDF**
(pantalla #/equipo/informe + "Guardar como PDF") y 3 CSV. Excel y Word se arman con flate (src/data/exportar.js).
Los cálculos están en src/team/resumen.js y los gráficos en src/components/Graficos.jsx.

## Publicación en Netlify (plan gratuito: cuidar los créditos)
Cada publicación a producción cuesta **15 créditos** de los 300 mensuales (el ciclo se reinicia cada mes). Si los créditos llegan a 0, Netlify **pausa todos los
proyectos** ("Site not available") hasta el siguiente ciclo. Por eso: juntar los cambios y publicar lo mínimo, y NO publicar durante los días del Desafío salvo
una falla grave. Ver el consumo en Netlify > Usage & billing.
# AquaCheck

Aplicación web instalable (PWA) para cuidar el agua del hogar **antes, durante y después** de un corte: recordatorios de mantenimiento,
guía paso a paso para los cortes y fuentes oficiales para informarse. Funciona sin internet, es gratuita y no necesita hardware.

**Aplicación en línea:** https://aquacheck-moche.vercel.app/

Proyecto del equipo **SINERGIA** (Desafío UPAO 2026), pensado para familias de Moche (La Libertad) frente al Fenómeno El Niño y utilizable en cualquier hogar.

## Límites (siempre visibles en la app)
- No mide la calidad del agua ni certifica que sea potable.
- No afirma que el agua esté contaminada.
- Solo recoge los datos necesarios. En el uso personal no se envía ningún dato personal a un servidor.
- El vínculo entre El Niño y la calidad del agua es una hipótesis por validar; la app no depende de ella.
- Es una aplicación estudiantil: no tiene certificaciones (ISO u otras). Los intervalos de mantenimiento son referenciales.

## Qué hace
**Familia**
- Escanear el QR del hogar (o abrir el enlace de la ficha), registrar la instalación y ver un semáforo de tareas.
- Registrar mantenimientos, ver el historial y reportar un problema (foto opcional).
- Guía «Si hay corte de agua» (antes, durante y después).
- Ficha imprimible con QR y funcionamiento sin internet (cola de envío cuando vuelve la señal).

**Equipo** (`#/equipo`, con inicio de sesión)
- Indicadores y gráficos, lista de hogares con búsqueda y filtros, fallas con fotos, informes (Excel, Word, PDF, CSV),
  fichas con QR, alta de hogares y mensajes de WhatsApp ya escritos (los envía una persona).

## Cómo ejecutarlo
```bash
npm install
npm run dev       # desarrollo
npm run build     # compila a /dist
npm run preview   # sirve lo compilado (aquí se prueba el modo sin internet)
```
Para la cámara y el modo sin internet en un celular hace falta HTTPS (la publicación en Vercel ya lo da) o `localhost`.

## Arquitectura
- **Frontend:** React + Vite + vite-plugin-pwa. Rutas con hash (`#/f/AQ-007`, `#/equipo`).
- **Datos:** capa única en `src/data/repo.js` (copia local en el celular, cola sin internet y sincronización).
- **Backend:** Supabase (tablas con RLS cerrado, función `hogar` como única puerta de las familias, Auth para el equipo,
  Storage privado para fotos). Migraciones en `supabase/migrations/`.
- **Publicación:** Vercel, desde la rama `main`. Cabeceras de seguridad en `vercel.json`.

```text
src/
  app/          App.jsx, main.jsx, ruta.js, estilos.css
  domain/       reglas.js, fallas.js, consentimiento.js   (reglas puras, sin React)
  data/         repo.js, remoto.js, csv.js, exportar.js
  family/       pantallas de la familia
  team/         pantallas del equipo
  components/   piezas compartidas
supabase/       migraciones y función `hogar`
docs/           seguridad y notas de investigación
```

## Flujo de trabajo (ramas)
- `main`: producción. Solo recibe cambios probados desde `develop`.
- `develop`: integración. Recibe las ramas de trabajo mediante pull request.
- Ramas de trabajo desde `develop`: `feature/…`, `fix/…`, `docs/…`, `chore/…`.
- Commits con prefijo (`feat:`, `fix:`, `docs:`, `chore:`) y un pull request por cambio. Más detalle en [CONTRIBUTING.md](CONTRIBUTING.md).

## Seguridad y privacidad
- Revisión propia (no es una auditoría independiente) en `docs/seguridad.md`.
- Nunca se suben al repositorio claves, contraseñas ni los QR con clave de los hogares.
- Aviso de consentimiento en `src/domain/consentimiento.js`: pendiente de revisión legal antes de un piloto con familias reales.
- Contacto del proyecto: aquacheck26@gmail.com

## Pendientes conocidos
- Probar la cámara y el QR impreso en más celulares (Android y iPhone).
- Revisión legal del aviso de consentimiento y, si hay datos de familias reales, inscripción del banco de datos.
- Confirmar con el proveedor los intervalos de mantenimiento que no son del fabricante.

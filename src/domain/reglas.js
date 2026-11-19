// Reglas de mantenimiento y manejo de fechas.
// Intervalos de los hogares acompañados por el equipo:
//  - cambio_cartucho: 180 días (ficha del fabricante del equipo de referencia: sedimentos y carbones cada 6 meses).
//  - limpieza_tanque: 180 días (SUNASS recomienda limpiar y desinfectar tanques y cisternas al menos dos veces al año).
//  - limpieza_filtro: 30 días, REFERENCIAL: no viene del fabricante; confirmar con el proveedor.
// Faltan la lámpara UV, la membrana y el mantenimiento anual: agregarlas exige ampliar TIPOS_MANT en la función `hogar` de Supabase.

export const DIAS_PRONTO = 7 // desde cuántos días antes se avisa "pronto"

export const TAREAS = {
  limpieza_filtro: {
    id: 'limpieza_filtro',
    etiqueta: 'Limpieza del filtro',
    boton: 'Limpié el filtro',
    icono: 'limpieza_filtro',
    cadaDias: 30,
    referencial: true,
  },
  cambio_cartucho: {
    id: 'cambio_cartucho',
    etiqueta: 'Cambio de cartucho',
    boton: 'Cambié el cartucho',
    icono: 'cambio_cartucho',
    cadaDias: 180,
  },
  limpieza_tanque: {
    id: 'limpieza_tanque',
    etiqueta: 'Limpieza del tanque',
    boton: 'Limpié el tanque',
    icono: 'limpieza_tanque',
    cadaDias: 180,
  },
}

export const ORDEN_TAREAS = ['limpieza_filtro', 'cambio_cartucho', 'limpieza_tanque']

// ---- Fechas (siempre como texto AAAA-MM-DD en hora local, sin zonas horarias) ----
function aISO(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${dia}`
}
export const hoyISO = () => aISO(new Date())
function desdeISO(s) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export function sumarDias(iso, n) {
  const d = desdeISO(iso)
  d.setDate(d.getDate() + n)
  return aISO(d)
}
/** Días desde a hasta b (positivo si b es posterior). */
export function diferenciaDias(aIso, bIso) {
  return Math.round((desdeISO(bIso) - desdeISO(aIso)) / 86400000)
}
const formato = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
export const formatoFecha = (iso) => formato.format(desdeISO(iso))
const formatoCorto = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short' })
export const formatoFechaCorta = (iso) => formatoCorto.format(desdeISO(iso))

// ---- Estados ----
/** Estado de una tarea: 'aldia' | 'pronto' | 'vencido'. */
function estadoTarea(tipo, hogar, mantenimientos, hoy = hoyISO()) {
  const t = TAREAS[tipo]
  const fechas = mantenimientos.filter((m) => m.tipo === tipo).map((m) => m.fecha).sort()
  const ultima = fechas.length ? fechas[fechas.length - 1] : null
  const base = ultima ?? hogar.fechaInstalacion
  const vence = sumarDias(base, t.cadaDias)
  const dias = diferenciaDias(hoy, vence)
  const estado = dias < 0 ? 'vencido' : dias <= DIAS_PRONTO ? 'pronto' : 'aldia'
  return { tipo, dias, vence, estado, ultima }
}

const PESO = { aldia: 0, pronto: 1, vencido: 2 }
function estadoGeneral(tareas) {
  return tareas.reduce((peor, t) => (PESO[t.estado] > PESO[peor] ? t.estado : peor), 'aldia')
}

/** Todas las tareas de un hogar + estado general. */
export function resumenHogar(hogar, mantenimientos, hoy = hoyISO()) {
  if (!hogar.fechaInstalacion) return { tareas: [], general: 'aldia' }
  const tareas = ORDEN_TAREAS.map((t) => estadoTarea(t, hogar, mantenimientos, hoy))
  return { tareas, general: estadoGeneral(tareas) }
}

// ---- Textos para la familia (lenguaje simple, sin alarmar) ----
export const TEXTO_ESTADO = {
  aldia: { etiqueta: 'Al día', titulo: 'Todo al día', detalle: 'Tu filtro está bien cuidado.' },
  pronto: { etiqueta: 'Pronto', titulo: 'Pronto toca mantenimiento', detalle: 'Revisa qué tarea se acerca.' },
  vencido: { etiqueta: 'Pendiente', titulo: 'Hay mantenimiento pendiente', detalle: 'Haz la tarea y regístrala cuando termines.' },
}

export function textoDias(dias) {
  if (dias > 1) return `Faltan ${dias} días`
  if (dias === 1) return 'Falta 1 día'
  if (dias === 0) return 'Toca hoy'
  if (dias === -1) return 'Pasó hace 1 día'
  return `Pasaron ${-dias} días`
}

/** Texto del recordatorio (el mismo que verá la familia y que el equipo envía por WhatsApp). */
export function mensajeAviso(codigo, tareas) {
  const t = tareas.filter((x) => x.estado !== 'aldia').sort((a, b) => a.dias - b.dias)[0]
  if (!t) return null
  const nombre = TAREAS[t.tipo].etiqueta.toLowerCase()
  const cuando = t.dias < 0 ? 'ya toca' : t.dias === 0 ? 'toca hoy' : `toca en ${t.dias} ${t.dias === 1 ? 'día' : 'días'}`
  const articulo = nombre.startsWith('cambio') ? 'el' : 'la'
  const registrala = articulo === 'el' ? 'regístralo' : 'regístrala'
  return `Hola 👋 Te recordamos que ${articulo} ${nombre} (filtro ${codigo}) ${cuando}. Cuando termines, ${registrala} en AquaCheck.`
}

// ---- Código del filtro (el QR pegado en el equipo) ----
export function extraerCodigo(texto) {
  const m = String(texto ?? '').toUpperCase().match(/AQ-?\s?(\d{3})/)
  return m ? `AQ-${m[1]}` : null
}

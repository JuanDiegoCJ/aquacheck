// Lógica pura del modo personal («Mi plan de agua»): sin React y sin servidor.
// Los datos viven solo en el celular de la persona (ver almacen.js).
import { hoyISO, sumarDias, diferenciaDias, DIAS_PRONTO } from '../domain/reglas.js'

export const LITROS_BIDON = 20
export const LITROS_POR_PERSONA_DIA = 4 // referencial: solo para beber y cocinar

// Tareas de mantenimiento. Los intervalos son REFERENCIALES: la persona puede cambiarlos.
export const CATALOGO = {
  tanque: {
    id: 'tanque',
    etiqueta: 'Limpieza del tanque o cisterna',
    boton: 'Limpié el tanque',
    icono: 'limpieza_tanque',
    cadaDias: 180,
    origen: 'SUNASS recomienda limpiar y desinfectar tanques y cisternas al menos dos veces al año.',
  },
  cartuchos: {
    id: 'cartuchos',
    etiqueta: 'Cambio de cartuchos del filtro',
    boton: 'Cambié los cartuchos',
    icono: 'cambio_cartucho',
    cadaDias: 180,
    origen: 'Referencia: ficha de un equipo de ósmosis inversa (cada 6 meses). Sigue el manual de tu equipo.',
  },
  uv: {
    id: 'uv',
    etiqueta: 'Cambio de lámpara UV',
    boton: 'Cambié la lámpara',
    icono: 'cambio_cartucho',
    cadaDias: 365,
    origen: 'Referencia: ficha de un equipo con desinfección UV (cada 12 meses). Solo si tu equipo la tiene.',
  },
  membrana: {
    id: 'membrana',
    etiqueta: 'Cambio de membrana',
    boton: 'Cambié la membrana',
    icono: 'cambio_cartucho',
    cadaDias: 730,
    origen: 'Referencia: ficha de un equipo de ósmosis inversa (cerca de 2 años). Solo si tu equipo la tiene.',
  },
  preventivo: {
    id: 'preventivo',
    etiqueta: 'Mantenimiento preventivo anual',
    boton: 'Hice el mantenimiento',
    icono: 'limpieza_filtro',
    cadaDias: 365,
    origen: 'Referencia: ficha de un equipo de ósmosis inversa (una vez al año).',
  },
}
export const ORDEN_TAREAS_PERSONAL = ['tanque', 'cartuchos', 'uv', 'membrana', 'preventivo']
export const TAREAS_DEL_FILTRO = ['cartuchos', 'uv', 'membrana', 'preventivo']

// «¿Cuándo lo hiciste por última vez?» → días atrás (null = no sé, se muestra como pendiente hoy).
export const OPCIONES_ULTIMA_VEZ = [
  { valor: '0', etiqueta: 'Hoy' },
  { valor: '30', etiqueta: 'Hace 1 mes' },
  { valor: '90', etiqueta: 'Hace 3 meses' },
  { valor: '180', etiqueta: 'Hace 6 meses o más' },
  { valor: 'nose', etiqueta: 'No lo sé' },
]

export function ultimaDesdeOpcion(valor, cadaDias, hoy = hoyISO()) {
  if (valor === 'nose') return sumarDias(hoy, -cadaDias) // toca hoy
  return sumarDias(hoy, -Number(valor))
}

export const numero = (v) => {
  const n = Number(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? n : 0
}

export function litrosTotales(p) {
  const l = p.litros ?? {}
  return Math.round(numero(l.tanque) + numero(l.cisterna) + numero(l.bidones) * LITROS_BIDON)
}

export function consumoDiario(p) {
  return Math.max(1, Math.round(numero(p.personas))) * (numero(p.litrosPorPersona) || LITROS_POR_PERSONA_DIA)
}

/** Días que alcanza el agua guardada (solo para beber y cocinar). */
export function diasDeReserva(p) {
  return Math.floor(litrosTotales(p) / consumoDiario(p))
}

export function diasDeCorte(p, hoy = hoyISO()) {
  return p.corte ? Math.max(0, diferenciaDias(p.corte.desde, hoy)) : 0
}

export function reservaRestante(p, hoy = hoyISO()) {
  return Math.max(0, diasDeReserva(p) - diasDeCorte(p, hoy))
}

/** Estado de una tarea: 'aldia' | 'pronto' | 'vencido'. */
export function estadoTareaPersonal(id, perfil, hoy = hoyISO()) {
  const t = perfil.tareas[id]
  const vence = sumarDias(t.ultima, t.cadaDias)
  const dias = diferenciaDias(hoy, vence)
  const estado = dias < 0 ? 'vencido' : dias <= DIAS_PRONTO ? 'pronto' : 'aldia'
  return { id, dias, vence, estado, ultima: t.ultima, cadaDias: t.cadaDias, sinRegistro: Boolean(t.sinRegistro) }
}

/** Pasos de la guía: los que hablan del filtro solo se muestran si la persona tiene uno. */
const PASOS_DE_FILTRO = ['filtro', 'manual']
export function pasosPersonales(grupos, perfil) {
  return grupos.map((g) => ({ ...g, pasos: g.pasos.filter((p) => perfil.tieneFiltro || !PASOS_DE_FILTRO.includes(p.id)) }))
}

const PESO = { aldia: 0, pronto: 1, vencido: 2 }
export function resumenPersonal(perfil, hoy = hoyISO()) {
  const tareas = ORDEN_TAREAS_PERSONAL.filter((id) => perfil.tareas[id]).map((id) => estadoTareaPersonal(id, perfil, hoy))
  const general = tareas.reduce((peor, t) => (PESO[t.estado] > PESO[peor] ? t.estado : peor), 'aldia')
  return { tareas, general }
}

/** Texto para compartir (sin datos personales: solo lo que la persona decide enviar). */
export function textoParaCompartir(perfil, hoy = hoyISO()) {
  const { tareas } = resumenPersonal(perfil, hoy)
  const proximas = tareas
    .filter((t) => t.estado !== 'aldia')
    .slice(0, 3)
    .map((t) => `• ${CATALOGO[t.id].etiqueta}: ${t.dias < 0 ? 'pendiente' : t.dias === 0 ? 'toca hoy' : `en ${t.dias} días`}`)
  const lineas = [
    '💧 Mi plan de agua (AquaCheck)',
    `Somos ${perfil.personas} ${perfil.personas === 1 ? 'persona' : 'personas'}. Tenemos agua guardada para unos ${diasDeReserva(perfil)} días (solo beber y cocinar).`,
  ]
  if (proximas.length) lineas.push('Pendiente:', ...proximas)
  lineas.push('Prepara el tuyo: https://aquacheck-moche.vercel.app/')
  return lineas.join('\n')
}

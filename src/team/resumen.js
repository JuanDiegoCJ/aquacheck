// Cálculos del dashboard del equipo. Todo sale de los datos guardados; no hay estadística inventada.
import { listarHogares, listarMantenimientosTodos, listarReportes } from '../data/repo.js'
import { ORDEN_TAREAS, TAREAS, TEXTO_ESTADO, resumenHogar, sumarDias, hoyISO } from '../domain/reglas.js'
import { ORDEN_FALLAS, TIPOS_FALLA } from '../domain/fallas.js'

/** Estados que se muestran en los gráficos (el color nunca es lo único que los distingue: llevan texto y número). */
export const ESTADOS = [
  { id: 'aldia', etiqueta: TEXTO_ESTADO.aldia.etiqueta, color: 'var(--verde)' },
  { id: 'pronto', etiqueta: TEXTO_ESTADO.pronto.etiqueta, color: '#d98e04' },
  { id: 'vencido', etiqueta: TEXTO_ESTADO.vencido.etiqueta, color: 'var(--rojo)' },
  { id: 'sinregistrar', etiqueta: 'Sin registrar', color: '#8aa0b3' },
]
export const etiquetaEstado = (id) => ESTADOS.find((e) => e.id === id)?.etiqueta ?? id

export function calcularResumen(hoy = hoyISO()) {
  const hogares = listarHogares()
  const mantenimientos = listarMantenimientosTodos()
  const reportes = listarReportes()
  const abiertas = reportes.filter((r) => r.estado === 'abierta')

  const filas = hogares.map((h) => {
    const m = mantenimientos.filter((x) => x.codigo === h.codigo)
    const { tareas, general } = resumenHogar(h, m, hoy)
    const siguiente = [...tareas].sort((a, b) => a.dias - b.dias)[0]
    return {
      h,
      tareas,
      general: h.registrado ? general : 'sinregistrar',
      siguiente,
      fallas: abiertas.filter((r) => r.codigo === h.codigo).length,
    }
  })
  const registrados = filas.filter((f) => f.h.registrado)

  const porEstado = { aldia: 0, pronto: 0, vencido: 0, sinregistrar: 0 }
  filas.forEach((f) => porEstado[f.general]++)

  const porTarea = ORDEN_TAREAS.map((tipo, i) => {
    const c = { aldia: 0, pronto: 0, vencido: 0 }
    registrados.forEach((f) => c[f.tareas[i].estado]++)
    return { tipo, etiqueta: TAREAS[tipo].etiqueta, ...c }
  })

  // Últimas 8 semanas (bloques de 7 días que terminan hoy)
  const semanas = []
  for (let k = 7; k >= 0; k--) {
    const fin = sumarDias(hoy, -7 * k)
    const ini = sumarDias(fin, -6)
    semanas.push({ ini, fin, n: mantenimientos.filter((m) => m.fecha >= ini && m.fecha <= fin).length })
  }

  const fallasPorTipo = ORDEN_FALLAS.map((id) => ({
    id,
    etiqueta: TIPOS_FALLA[id].etiqueta,
    icono: TIPOS_FALLA[id].icono,
    abiertas: reportes.filter((r) => r.tipo === id && r.estado === 'abierta').length,
    resueltas: reportes.filter((r) => r.tipo === id && r.estado === 'resuelta').length,
  }))

  const pctAlDia = registrados.length ? Math.round((porEstado.aldia / registrados.length) * 100) : 0

  return {
    hoy,
    filas,
    hogares,
    mantenimientos,
    reportes,
    abiertas,
    registrados: registrados.length,
    total: hogares.length,
    porEstado,
    porTarea,
    semanas,
    fallasPorTipo,
    pctAlDia,
    conTareaPendiente: porEstado.pronto + porEstado.vencido,
  }
}

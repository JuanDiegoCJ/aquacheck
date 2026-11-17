// Capa de datos. Hoy guarda todo en el celular (localStorage), así la app funciona sin internet.
// Para el piloto real, esta es la ÚNICA parte que se cambia por un servidor (p. ej. Supabase):
// las pantallas solo usan las funciones exportadas de aquí.
//
// Privacidad: el celular y el consentimiento viven en 'contactos', separados del historial.
import { useSyncExternalStore } from 'react'
import { crearDatosDemo } from './datos_demo.js'

const PREFIJO = 'aquacheck:v1:'
const cache = {}
let version = 0
const oyentes = new Set()

function leer(clave, porDefecto) {
  if (clave in cache) return cache[clave]
  let valor = porDefecto
  try {
    const bruto = localStorage.getItem(PREFIJO + clave)
    if (bruto !== null) valor = JSON.parse(bruto)
  } catch {
    /* sin almacenamiento: se usa solo la memoria */
  }
  cache[clave] = valor
  return valor
}

function escribir(clave, valor) {
  cache[clave] = valor
  try {
    localStorage.setItem(PREFIJO + clave, JSON.stringify(valor))
  } catch {
    /* sin almacenamiento: queda en memoria */
  }
  version++
  oyentes.forEach((f) => f())
}

export const suscribir = (f) => {
  oyentes.add(f)
  return () => oyentes.delete(f)
}
export const obtenerVersion = () => version
/** Hace que el componente se vuelva a dibujar cuando cambian los datos. */
export const useDatos = () => useSyncExternalStore(suscribir, obtenerVersion)

const VERSION_SEMILLA = 2 // subir si cambia la forma de los datos de ejemplo

function sembrar() {
  const d = crearDatosDemo()
  escribir('hogares', d.hogares)
  escribir('contactos', d.contactos)
  escribir('mantenimientos', d.mantenimientos)
  escribir('reportes', d.reportes)
  escribir('fotos', {})
  escribir('cortes', {})
  escribir('semilla', VERSION_SEMILLA)
}

export function iniciar() {
  if (leer('semilla', 0) < VERSION_SEMILLA) sembrar()
}

export function reiniciarDemo() {
  escribir('mi-filtro', null)
  sembrar()
}

// ---- Lectura ----
export const listarHogares = () => Object.values(leer('hogares', {})).sort((a, b) => a.codigo.localeCompare(b.codigo))
export const obtenerHogar = (codigo) => leer('hogares', {})[codigo] ?? null
export const listarMantenimientos = (codigo) =>
  leer('mantenimientos', [])
    .filter((m) => m.codigo === codigo)
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id.localeCompare(a.id))
export const miFiltro = () => leer('mi-filtro', null)
export const recordarFiltro = (codigo) => {
  if (miFiltro() !== codigo) escribir('mi-filtro', codigo)
}

// ---- Escritura ----
export function guardarRegistro({ codigo, modelo, fechaInstalacion, celular, consentimiento }) {
  const hogares = { ...leer('hogares', {}) }
  hogares[codigo] = { codigo, registrado: true, modelo, fechaInstalacion }
  escribir('hogares', hogares)
  escribir('contactos', { ...leer('contactos', {}), [codigo]: { celular, consentimiento } })
}

const nuevoId = () => (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `m-${Date.now()}-${Math.random().toString(16).slice(2)}`)

export function agregarMantenimiento(codigo, tipo, fecha) {
  const id = nuevoId()
  escribir('mantenimientos', [...leer('mantenimientos', []), { id, codigo, tipo, fecha }])
  return id
}

export function quitarMantenimiento(id) {
  escribir('mantenimientos', leer('mantenimientos', []).filter((m) => m.id !== id))
}

// ---- Fallas ----
export const listarMantenimientosTodos = () => leer('mantenimientos', [])
export const listarReportes = (codigo) =>
  leer('reportes', [])
    .filter((r) => !codigo || r.codigo === codigo)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
export const obtenerFoto = (id) => leer('fotos', {})[id] ?? null

export function agregarReporte({ codigo, tipo, foto }) {
  const id = nuevoId()
  if (foto) escribir('fotos', { ...leer('fotos', {}), [id]: foto })
  escribir('reportes', [...leer('reportes', []), { id, codigo, tipo, fecha: new Date().toISOString(), estado: 'abierta', conFoto: !!foto }])
  return id
}

export function marcarReporteResuelto(id) {
  escribir('reportes', leer('reportes', []).map((r) => (r.id === id ? { ...r, estado: 'resuelta' } : r)))
}

// ---- Modo corte de agua (pasos marcados por hogar) ----
export const pasosCorteHechos = (codigo) => leer('cortes', {})[codigo] ?? []
export function alternarPasoCorte(codigo, paso) {
  const cortes = leer('cortes', {})
  const actuales = new Set(cortes[codigo] ?? [])
  if (actuales.has(paso)) actuales.delete(paso)
  else actuales.add(paso)
  escribir('cortes', { ...cortes, [codigo]: [...actuales] })
}
export function reiniciarPasosCorte(codigo) {
  escribir('cortes', { ...leer('cortes', {}), [codigo]: [] })
}

// ---- Equipo del proyecto ----
export const obtenerContacto = (codigo) => leer('contactos', {})[codigo] ?? null

// PIN de DEMOSTRACIÓN. No es seguridad real: en el piloto el panel del equipo
// debe ir detrás de un inicio de sesión en el servidor.
export const PIN_EQUIPO = '2026'
let equipoActivo = false
try {
  equipoActivo = sessionStorage.getItem('aquacheck:equipo') === '1'
} catch {
  /* sin sessionStorage */
}
export const equipoAutorizado = () => equipoActivo
export function entrarEquipo(pin) {
  if (pin !== PIN_EQUIPO) return false
  equipoActivo = true
  try {
    sessionStorage.setItem('aquacheck:equipo', '1')
  } catch {
    /* ignorado */
  }
  version++
  oyentes.forEach((f) => f())
  return true
}
export function salirEquipo() {
  equipoActivo = false
  try {
    sessionStorage.removeItem('aquacheck:equipo')
  } catch {
    /* ignorado */
  }
  version++
  oyentes.forEach((f) => f())
}

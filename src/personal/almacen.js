// Almacén del modo personal: todo queda en el celular (localStorage). No se envía nada a ningún servidor.
import { useSyncExternalStore } from 'react'
import { CATALOGO, ultimaDesdeOpcion } from './plan.js'
import { hoyISO } from '../domain/reglas.js'

const CLAVE = 'aquacheck.personal.v1'
const EVENTO = 'aquacheck-personal'

let cacheTexto = null
let cacheValor = null

function leerTexto() {
  try {
    return localStorage.getItem(CLAVE)
  } catch {
    return null
  }
}

/** Perfil guardado o null. Siempre devuelve el mismo objeto mientras no cambie. */
export function leerPerfil() {
  const texto = leerTexto()
  if (texto === cacheTexto) return cacheValor
  cacheTexto = texto
  try {
    cacheValor = texto ? JSON.parse(texto) : null
  } catch {
    cacheValor = null
  }
  return cacheValor
}

export function guardarPerfil(perfil) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(perfil))
  } catch {
    // Sin almacenamiento disponible (modo privado muy restringido): el plan se verá solo en esta sesión.
    cacheTexto = null
    cacheValor = perfil
  }
  window.dispatchEvent(new Event(EVENTO))
}

export function actualizarPerfil(cambio) {
  const actual = leerPerfil()
  if (!actual) return
  guardarPerfil(cambio(structuredClone(actual)))
}

export function borrarPerfil() {
  try {
    localStorage.removeItem(CLAVE)
  } catch {
    /* nada que borrar */
  }
  cacheTexto = null
  cacheValor = null
  window.dispatchEvent(new Event(EVENTO))
}

const suscribir = (f) => {
  window.addEventListener(EVENTO, f)
  window.addEventListener('storage', f)
  return () => {
    window.removeEventListener(EVENTO, f)
    window.removeEventListener('storage', f)
  }
}
export const usePerfil = () => useSyncExternalStore(suscribir, leerPerfil)

/** Arma el perfil a partir de lo que respondió la persona en «Crear mi plan». */
export function construirPerfil(f, anterior = null, hoy = hoyISO()) {
  const tareas = {}
  for (const id of f.tareasElegidas) {
    const previa = anterior?.tareas?.[id]
    const cadaDias = previa?.cadaDias ?? CATALOGO[id].cadaDias
    const eleccion = f.ultimaVez[id] === 'igual' ? undefined : f.ultimaVez[id]
    if (previa && eleccion === undefined) {
      tareas[id] = { ...previa, cadaDias }
      continue
    }
    tareas[id] = {
      cadaDias,
      ultima: ultimaDesdeOpcion(eleccion ?? 'nose', cadaDias, hoy),
      sinRegistro: (eleccion ?? 'nose') === 'nose', // «No lo sé»: no se muestra una fecha inventada
    }
  }
  return {
    version: 1,
    creado: anterior?.creado ?? hoy,
    personas: f.personas,
    litrosPorPersona: anterior?.litrosPorPersona ?? null,
    litros: { tanque: f.tanque, cisterna: f.cisterna, bidones: f.bidones },
    tieneFiltro: f.tieneFiltro,
    tareas,
    pasos: anterior?.pasos ?? [],
    corte: anterior?.corte ?? null,
  }
}

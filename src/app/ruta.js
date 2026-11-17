// Enrutador mínimo basado en el # de la dirección. Así el QR puede abrir directo un filtro
// (https://.../#/f/AQ-007) y funciona sin configurar nada en el servidor.
import { useSyncExternalStore } from 'react'

const suscribir = (f) => {
  window.addEventListener('hashchange', f)
  return () => window.removeEventListener('hashchange', f)
}
const instantanea = () => window.location.hash.replace(/^#/, '') || '/'

export const useRuta = () => useSyncExternalStore(suscribir, instantanea)
export const irA = (ruta) => {
  window.location.hash = ruta
}

/** '/f/AQ-007/historial' -> { pantalla: 'historial', codigo: 'AQ-007' } */
export function resolverRuta(ruta) {
  const p = ruta.split('?')[0].split('/').filter(Boolean)
  if (p.length === 0) return { pantalla: 'inicio' }
  if (p[0] === 'acerca') return { pantalla: 'acerca' }
  if (p[0] === 'equipo') return { pantalla: p[1] === 'fichas' ? 'fichas' : p[1] === 'informe' ? 'informe' : 'equipo' }
  if (p[0] === 'f' && p[1]) {
    const codigo = decodeURIComponent(p[1]).toUpperCase()
    const sub = p[2]
    if (!sub) return { pantalla: 'panel', codigo }
    if (['registro', 'mantenimiento', 'historial', 'falla', 'corte', 'ficha'].includes(sub)) return { pantalla: sub, codigo }
  }
  return { pantalla: 'inicio' }
}

/** Clave secreta del QR ('/f/AQ-007?k=…'), o null. */
export function claveDeRuta(ruta) {
  const q = ruta.split('?')[1]
  const k = q ? new URLSearchParams(q).get('k') : null
  return k && k.length >= 16 ? k : null
}

export const rutaFiltro = (codigo, sub = '') => `#/f/${codigo}${sub ? '/' + sub : ''}`

// Capa de datos. Hoy guarda todo en el celular (localStorage), así la app funciona sin internet.
// Para el piloto real, esta es la ÚNICA parte que se cambia por un servidor (p. ej. Supabase):
// las pantallas solo usan las funciones exportadas de aquí.
//
// Privacidad: el celular y el consentimiento viven en 'contactos', separados del historial.
import { useSyncExternalStore } from 'react'
import { llamarHogar, ErrorRemoto, iniciarSesionEquipo, renovarSesionEquipo, cerrarSesionEquipo, consultarTabla, actualizarTabla, insertarTabla, subirFotoFirmada, firmarFotos } from './remoto.js'

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

// Antes la app traía 20 filtros de ejemplo en cada celular. Ya no: un filtro existe solo si se abrió su QR con clave.
// Una sola vez, se borra lo que haya quedado de aquellos datos de ejemplo (y de cualquier filtro sin clave).
function limpiarDemo() {
  if (leer('demo-limpiada', false)) return
  const conClave = new Set(Object.keys(claves()))
  const soloReales = (obj) => Object.fromEntries(Object.entries(obj ?? {}).filter(([c]) => conClave.has(c)))
  escribir('hogares', soloReales(leer('hogares', {})))
  escribir('contactos', {})
  escribir('mantenimientos', leer('mantenimientos', []).filter((m) => conClave.has(m.codigo)))
  escribir('reportes', leer('reportes', []).filter((r) => conClave.has(r.codigo)))
  escribir('fotos', {})
  escribir('cortes', soloReales(leer('cortes', {})))
  if (!conClave.has(leer('mi-filtro', null))) escribir('mi-filtro', null)
  escribir('demo-limpiada', true)
}

export function iniciar() {
  limpiarDemo()
  // Modo real: al volver la conexión (o al abrir la app) se envía lo pendiente y se trae lo del servidor.
  if (typeof window !== 'undefined') window.addEventListener('online', () => sincronizar())
  sincronizar()
  cargarEquipo()
  // Actualización automática: el panel del equipo cada 2 s y los filtros conectados cada 10 s, solo con la pantalla visible.
  if (typeof document !== 'undefined') {
    const visible = () => document.visibilityState === 'visible'
    // Panel del equipo: cada 2 s mientras hay cambios; tras 30 s sin cambios espacia a 5 s (menos datos y menos energía).
    // Cualquier cambio, una acción propia o volver a la pantalla restablece los 2 s.
    const turnoEquipo = async () => {
      if (visible() && sesionEquipo) {
        const cambio = await cargarEquipo(true)
        sinCambiosEquipo = cambio ? 0 : sinCambiosEquipo + 1
      }
      setTimeout(turnoEquipo, sinCambiosEquipo >= 15 ? 5000 : 2000)
    }
    setTimeout(turnoEquipo, 2000)
    setInterval(() => visible() && sincronizar(), 10_000)
    const alVolver = () => {
      if (!visible()) return
      sinCambiosEquipo = 0
      cargarEquipo(true)
      sincronizar()
    }
    document.addEventListener('visibilitychange', alVolver)
    window.addEventListener('focus', alVolver)
  }
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
const nuevoId = () => (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `m-${Date.now()}-${Math.random().toString(16).slice(2)}`)

export function guardarRegistro({ codigo, modelo, fechaInstalacion, celular, consentimiento }) {
  const real = esReal(codigo)
  const hogares = { ...leer('hogares', {}) }
  hogares[codigo] = { codigo, registrado: true, modelo, fechaInstalacion, ...(real ? { real: true } : {}) }
  escribir('hogares', hogares)
  // El celular es opcional: sin celular no hay consentimiento y no se envía ni se guarda ningún contacto.
  const conCelular = Boolean(celular)
  if (real) {
    // En modo real el celular NO se guarda en el celular de la familia: viaja al servidor (queda en la cola solo hasta enviarse).
    encolar(codigo, 'registrar', {
      fecha_instalacion: fechaInstalacion,
      ...(conCelular ? { celular, consentimiento: { version: consentimiento.version, texto: consentimiento.texto } } : {}),
    })
  } else if (conCelular) {
    escribir('contactos', { ...leer('contactos', {}), [codigo]: { celular, consentimiento } })
  }
}

export function agregarMantenimiento(codigo, tipo, fecha) {
  const id = nuevoId()
  escribir('mantenimientos', [...leer('mantenimientos', []), { id, codigo, tipo, fecha }])
  encolar(codigo, 'mantenimiento_agregar', { tipo, fecha, localId: id })
  return id
}

export function quitarMantenimiento(id) {
  const idServidor = leer('idmap', {})[id] ?? id // si ya se envió, el servidor le puso otro id
  const lista = leer('mantenimientos', [])
  const m = lista.find((x) => x.id === id || x.id === idServidor)
  escribir('mantenimientos', lista.filter((x) => x !== m))
  if (!m || !esReal(m.codigo)) return
  const pendiente = cola().find((o) => o.accion === 'mantenimiento_agregar' && o.datos.localId === id)
  if (pendiente) escribir('cola', cola().filter((o) => o !== pendiente)) // aún no se envió: se cancela
  else encolar(m.codigo, 'mantenimiento_quitar', { id: idServidor })
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
  if (foto) escribir('fotos', { ...leer('fotos', {}), [id]: foto }) // en modo real se borra de aquí cuando se sube
  escribir('reportes', [...leer('reportes', []), { id, codigo, tipo, fecha: new Date().toISOString(), estado: 'abierta', conFoto: !!foto }])
  encolar(codigo, 'reporte_agregar', { tipo, foto: !!foto, localId: id })
  return id
}

export async function marcarReporteResuelto(id) {
  if (sesionEquipo) {
    try {
      await actualizarTabla('reportes', 'id=eq.' + encodeURIComponent(id), { estado: 'resuelta' }, await tokenVigente())
      await cargarEquipo()
    } catch {
      estadoPanel = { cargando: false, error: 'No se pudo marcar como resuelta. Revisa tu internet.' }
      avisar()
    }
    return
  }
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

// ---- Modo real (Supabase) ----
// Un filtro pasa a "real" cuando se abre su QR con clave (#/f/AQ-007?k=…). Desde ahí sus datos viven en Supabase;
// el celular guarda una copia para trabajar sin internet y una COLA de acciones pendientes de enviar.
const claves = () => leer('claves', {})
const cola = () => leer('cola', [])
export const esReal = (codigo) => !!claves()[codigo]
/** Clave del QR de un filtro conectado (solo está en el celular de esa familia); null si es de demostración. */
export const claveDe = (codigo) => claves()[codigo] ?? null
export const pendientesDe = (codigo) => cola().filter((o) => o.codigo === codigo).length
let enCurso = false
const errores = {} // codigo -> mensaje (solo en memoria)

export function estadoSync(codigo) {
  return { real: esReal(codigo), pendientes: pendientesDe(codigo), error: errores[codigo] ?? null, enCurso }
}

function notificar() {
  version++
  oyentes.forEach((f) => f())
}

function encolar(codigo, accion, datos) {
  if (!esReal(codigo)) return
  escribir('cola', [...cola(), { id: nuevoId(), codigo, accion, datos }])
  sincronizar()
}

export function adoptarClave(codigo, secreto) {
  if (claves()[codigo] === secreto) return
  escribir('claves', { ...claves(), [codigo]: secreto })
  // Los datos de ejemplo de ese código se descartan: desde ahora vale lo que diga el servidor.
  const hogares = { ...leer('hogares', {}) }
  hogares[codigo] = { codigo, registrado: false, modelo: hogares[codigo]?.modelo, fechaInstalacion: null, real: true, cargando: true } // cargando: hasta traer su estado real
  escribir('hogares', hogares)
  escribir('mantenimientos', leer('mantenimientos', []).filter((m) => m.codigo !== codigo))
  escribir('reportes', leer('reportes', []).filter((r) => r.codigo !== codigo))
  const contactos = { ...leer('contactos', {}) }
  delete contactos[codigo]
  escribir('contactos', contactos)
  escribir('cola', cola().filter((o) => o.codigo !== codigo))
  delete errores[codigo]
  sincronizar()
}

function aplicarServidor(codigo, d) {
  const h = d.hogar
  let hogar = { codigo, registrado: !!h.registrado, modelo: h.modelo, fechaInstalacion: h.fecha_instalacion ?? null, real: true }
  let mant = d.mantenimientos.map((m) => ({ id: m.id, codigo, tipo: m.tipo, fecha: m.fecha }))
  let rep = d.reportes.map((r) => ({ id: r.id, codigo, tipo: r.tipo, estado: r.estado, fecha: r.creado_en, conFoto: false }))
  // Lo que el usuario guardó y aún no se envió se vuelve a superponer: si no, una respuesta lenta del servidor
  // (pedida antes de guardar) lo borraría de la pantalla hasta la siguiente sincronización.
  for (const op of cola().filter((o) => o.codigo === codigo)) {
    if (op.accion === 'registrar') hogar = { ...hogar, registrado: true, fechaInstalacion: op.datos.fecha_instalacion }
    else if (op.accion === 'mantenimiento_agregar') mant.push({ id: op.datos.localId, codigo, tipo: op.datos.tipo, fecha: op.datos.fecha })
    else if (op.accion === 'mantenimiento_quitar') mant = mant.filter((m) => m.id !== op.datos.id)
    else if (op.accion === 'reporte_agregar') rep.push({ id: op.datos.localId, codigo, tipo: op.datos.tipo, estado: 'abierta', fecha: new Date().toISOString(), conFoto: !!op.datos.foto })
  }
  const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b)
  if (!igual(leer('hogares', {})[codigo], hogar)) escribir('hogares', { ...leer('hogares', {}), [codigo]: hogar })
  if (!igual(leer('mantenimientos', []).filter((m) => m.codigo === codigo), mant)) {
    escribir('mantenimientos', [...leer('mantenimientos', []).filter((m) => m.codigo !== codigo), ...mant])
  }
  if (!igual(leer('reportes', []).filter((r) => r.codigo === codigo), rep)) {
    escribir('reportes', [...leer('reportes', []).filter((r) => r.codigo !== codigo), ...rep])
  }
}

/** Envía lo pendiente (en orden) y luego trae el estado del servidor. Sin internet no hace nada y se reintenta después. */
export async function sincronizar() {
  const codigos = Object.keys(claves())
  if (enCurso || !codigos.length || (typeof navigator !== 'undefined' && navigator.onLine === false)) return
  enCurso = true
  const habiaCola = cola().length > 0 // la actualización automática de fondo no vuelve a dibujar la pantalla por sí sola
  if (habiaCola) notificar()
  let reintentar = false
  try {
    for (const codigo of codigos) {
      const secreto = claves()[codigo]
      try {
        for (const op of cola().filter((o) => o.codigo === codigo)) {
          const { localId, ...datos } = op.datos
          try {
            if (op.accion === 'foto_subir') {
              // Local: sube la foto con el enlace firmado que dio el servidor al crear el reporte.
              const url = leer('fotos', {})[localId]
              if (url) await subirFotoFirmada(datos.ruta, datos.token, await (await fetch(url)).blob())
              const { [localId]: _quitada, ...resto } = leer('fotos', {})
              escribir('fotos', resto)
            } else {
              const res = await llamarHogar(op.accion, codigo, secreto, datos)
              if (op.accion === 'mantenimiento_agregar' && res.id) escribir('idmap', { ...leer('idmap', {}), [localId]: res.id })
              if (op.accion === 'reporte_agregar' && res.subida) {
                // La subida va aparte y también se reintenta sin internet.
                escribir('cola', [...cola(), { id: nuevoId(), codigo, accion: 'foto_subir', datos: { localId, ruta: res.subida.ruta, token: res.subida.token } }])
              } else if (op.accion === 'reporte_agregar' && localId) {
                const { [localId]: _quitada, ...resto } = leer('fotos', {})
                escribir('fotos', resto)
              }
            }
          } catch (e) {
            if (e instanceof ErrorRemoto && op.accion === 'foto_subir' && e.estado >= 400 && e.estado < 500) errores[codigo] = 'No se pudo enviar una foto y se descartó.'
            else if (e instanceof ErrorRemoto && e.estado >= 400 && e.estado < 500 && e.estado !== 401 && e.estado !== 429) errores[codigo] = 'Un envío fue rechazado y se descartó.'
            else throw e // 401, sin internet o error del servidor: se maneja abajo
          }
          escribir('cola', cola().filter((o) => o.id !== op.id))
        }
        if (cola().some((o) => o.codigo === codigo)) {
          reintentar = true // el usuario hizo algo mientras se enviaba: se vuelve a pasar antes de traer datos
          continue
        }
        aplicarServidor(codigo, await llamarHogar('ver', codigo, secreto))
        delete errores[codigo]
        if (cola().some((o) => o.codigo === codigo)) reintentar = true // guardaron algo mientras se traían los datos
      } catch (e) {
        if (e instanceof ErrorRemoto && e.estado === 401) errores[codigo] = 'Este QR ya no da acceso. Pide una ficha nueva al equipo.'
        else if (e instanceof ErrorRemoto && e.estado === 429) errores[codigo] = 'Demasiados intentos. Prueba de nuevo en unos minutos.'
        else return // sin internet o fallo del servidor: se reintenta cuando vuelva la conexión
      }
    }
  } finally {
    enCurso = false
    if (habiaCola || reintentar) notificar()
    if (reintentar) setTimeout(sincronizar, 0)
  }
}

// ---- Equipo del proyecto ----
// Inicio de sesión con Supabase Auth; los datos se leen del servidor y viven solo en memoria
// (los celulares no se guardan en el dispositivo).
let sesionEquipo = null
let datosRemotos = null // { hogares, mantenimientos, reportes, contactos }
let estadoPanel = { cargando: false, error: null }
try {
  sesionEquipo = JSON.parse(sessionStorage.getItem('aquacheck:sesion-equipo'))
} catch {
  /* sin sessionStorage */
}
const usaRemoto = () => !!sesionEquipo && !!datosRemotos
const avisar = () => {
  version++
  oyentes.forEach((f) => f())
}
function guardarSesion(s) {
  sesionEquipo = s
  try {
    if (s) sessionStorage.setItem('aquacheck:sesion-equipo', JSON.stringify(s))
    else sessionStorage.removeItem('aquacheck:sesion-equipo')
  } catch {
    /* ignorado */
  }
}

export const hogaresPanel = () => (usaRemoto() ? datosRemotos.hogares : [])
export const mantenimientosPanel = () => (usaRemoto() ? datosRemotos.mantenimientos : [])
export const reportesPanel = () => (usaRemoto() ? datosRemotos.reportes : [])
export const obtenerContacto = (codigo) => (usaRemoto() ? datosRemotos.contactos[codigo] ?? null : leer('contactos', {})[codigo] ?? null)
/** Clave del QR de un hogar, visible solo para el equipo con sesión iniciada. */
export const claveQrPanel = (codigo) => (usaRemoto() ? datosRemotos.claves?.[codigo] ?? null : null)
export const fotoPanel = (id) => (usaRemoto() ? datosRemotos.fotos[id] ?? null : obtenerFoto(id))
export const estadoDelPanel = () => estadoPanel

async function tokenVigente() {
  if (!sesionEquipo) throw new ErrorRemoto(401, 'sin_sesion')
  if (Date.now() > sesionEquipo.vence - 60_000) {
    guardarSesion({ ...(await renovarSesionEquipo(sesionEquipo.renovacion)), correo: sesionEquipo.correo })
  }
  return sesionEquipo.token
}

let cargandoEquipo = false
let sinCambiosEquipo = 0 // consultas seguidas sin cambios (para espaciar la actualización automática)
const urlsFoto = {} // ruta -> { url, en }: los enlaces firmados duran 1 h; se renuevan a los 50 min
/**
 * Trae del servidor todo lo que el equipo puede ver (si la cuenta no es del equipo, las tablas llegan vacías).
 * silencioso = actualización automática en segundo plano: no muestra "Actualizando…" ni errores pasajeros y solo
 * vuelve a dibujar la pantalla si algo cambió.
 */
export async function cargarEquipo(silencioso = false) {
  if (!sesionEquipo || cargandoEquipo) return
  cargandoEquipo = true
  if (!silencioso) {
    sinCambiosEquipo = 0
    estadoPanel = { cargando: true, error: null }
    avisar()
  }
  try {
    const t = await tokenVigente()
    const [h, m, r, c, kq] = await Promise.all([
      consultarTabla('hogares', 'select=codigo,modelo,fecha_instalacion,registrado&order=codigo', t),
      consultarTabla('mantenimientos', 'select=id,codigo,tipo,fecha', t),
      consultarTabla('reportes', 'select=id,codigo,tipo,estado,creado_en,foto_path&order=creado_en.desc', t),
      consultarTabla('contactos', 'select=codigo,celular,consentimiento_version', t),
      consultarTabla('claves_qr', 'select=codigo,clave', t).catch(() => []), // claves de los QR (solo el equipo las ve)
    ])
    if (!h.length) throw new ErrorRemoto(403, 'sin_permiso')
    // Enlaces temporales a las fotos (si falla, el panel funciona igual, solo sin fotos). Solo se piden los que faltan.
    const faltan = r.filter((x) => x.foto_path && (!urlsFoto[x.foto_path] || Date.now() - urlsFoto[x.foto_path].en > 50 * 60_000)).map((x) => x.foto_path)
    if (faltan.length) {
      const nuevas = await firmarFotos(faltan, t).catch(() => ({}))
      for (const [ruta, url] of Object.entries(nuevas)) urlsFoto[ruta] = { url, en: Date.now() }
    }
    const nuevo = {
      claves: Object.fromEntries(kq.map((x) => [x.codigo, x.clave])),
      fotos: Object.fromEntries(r.filter((x) => urlsFoto[x.foto_path]).map((x) => [x.id, urlsFoto[x.foto_path].url])),
      hogares: h.map((x) => ({ codigo: x.codigo, registrado: x.registrado, modelo: x.modelo, fechaInstalacion: x.fecha_instalacion })),
      mantenimientos: m,
      reportes: r.map((x) => ({ id: x.id, codigo: x.codigo, tipo: x.tipo, estado: x.estado, fecha: x.creado_en, conFoto: !!x.foto_path })),
      contactos: Object.fromEntries(c.map((x) => [x.codigo, { celular: x.celular, consentimiento: { version: x.consentimiento_version } }])),
    }
    const cambio = JSON.stringify(nuevo) !== JSON.stringify(datosRemotos)
    const habiaEstado = estadoPanel.cargando || estadoPanel.error
    datosRemotos = nuevo
    estadoPanel = { cargando: false, error: null }
    if (!silencioso || cambio || habiaEstado) avisar()
    return cambio
  } catch (e) {
    if (e instanceof ErrorRemoto && (e.estado === 401 || e.estado === 403)) {
      guardarSesion(null)
      datosRemotos = null
      estadoPanel = { cargando: false, error: 'Esta cuenta no tiene permiso para ver el panel del equipo.' }
      avisar()
    } else if (!silencioso) {
      estadoPanel = { cargando: false, error: 'No se pudo cargar. Revisa tu internet e inténtalo de nuevo.' }
      avisar()
    }
  } finally {
    cargandoEquipo = false
  }
}

// ---- Crear hogares nuevos (solo equipo) ----
const sha256Hex = async (t) =>
  [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)))].map((b) => b.toString(16).padStart(2, '0')).join('')
/** Clave aleatoria de 192 bits (32 caracteres), generada en el navegador del equipo. */
const claveAleatoria = () =>
  btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(24))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
/** Siguiente código libre (AQ-021…), o null si se llegó a AQ-999. */
export function siguienteCodigo() {
  const n = Math.max(0, ...hogaresPanel().map((h) => Number(h.codigo.slice(3)))) + 1
  return n > 999 ? null : `AQ-${String(n).padStart(3, '0')}`
}
/** Crea un hogar con su clave y devuelve su código. Lanza un Error con un mensaje listo para mostrar. */
export async function crearHogar() {
  if (!sesionEquipo) throw new Error('Inicia sesión como equipo.')
  const t = await tokenVigente().catch(() => {
    throw new Error('Tu sesión venció. Entra de nuevo.')
  })
  for (let intento = 0; intento < 3; intento++) {
    const codigo = siguienteCodigo()
    if (!codigo) throw new Error('Se llegó al máximo de 999 hogares.')
    const clave = claveAleatoria()
    try {
      await insertarTabla('hogares', { codigo, secreto_hash: await sha256Hex(clave) }, t)
    } catch (e) {
      if (e instanceof ErrorRemoto && e.estado === 409) {
        await cargarEquipo(true) // otro miembro del equipo creó ese código a la vez: se prueba el siguiente
        continue
      }
      throw new Error('No se pudo crear el hogar. Revisa tu internet e inténtalo de nuevo.')
    }
    try {
      await insertarTabla('claves_qr', { codigo, clave }, t)
    } catch {
      throw new Error(`Se creó ${codigo}, pero no se pudo guardar su clave. Avisa a quien administra Supabase.`)
    }
    await cargarEquipo()
    return codigo
  }
  throw new Error('No se pudo crear el hogar. Inténtalo de nuevo.')
}

/**
 * Una familia nueva crea su propio hogar (sin QR previo). El servidor le da código y clave; esta función conecta
 * este celular con ese hogar y devuelve { codigo, secreto }. Lanza un Error con un mensaje listo para mostrar.
 */
export async function crearMiHogar({ fechaInstalacion, celular, consentimiento }) {
  const datos = { fecha_instalacion: fechaInstalacion }
  if (celular) Object.assign(datos, { celular, consentimiento: { version: consentimiento.version, texto: consentimiento.texto } })
  let res
  try {
    res = await llamarHogar('crear', '', '', datos)
  } catch (e) {
    if (e instanceof ErrorRemoto && e.estado === 429) throw new Error('Hay muchas altas en este momento. Inténtalo de nuevo en un rato.')
    if (e instanceof ErrorRemoto && e.estado === 409) throw new Error('El programa ya no tiene lugares disponibles. Escribe al equipo del proyecto.')
    if (e instanceof ErrorRemoto) throw new Error('No se pudo agregar tu casa. Inténtalo de nuevo.')
    throw new Error('No se pudo conectar. Revisa tu internet e inténtalo de nuevo.')
  }
  if (!res?.codigo || !res?.secreto) throw new Error('No se pudo agregar tu casa. Inténtalo de nuevo.')
  adoptarClave(res.codigo, res.secreto)
  return { codigo: res.codigo, secreto: res.secreto }
}

/** Devuelve null si todo salió bien, o el mensaje de error para mostrar. */
export async function entrarEquipoReal(correo, clave) {
  try {
    guardarSesion({ ...(await iniciarSesionEquipo(correo.trim(), clave)), correo: correo.trim() })
  } catch (e) {
    if (e instanceof ErrorRemoto && (e.estado === 400 || e.estado === 401)) return 'Correo o contraseña incorrectos.'
    if (e instanceof ErrorRemoto && e.estado === 429) return 'Demasiados intentos. Espera unos minutos.'
    return 'No se pudo conectar. Revisa tu internet.'
  }
  await cargarEquipo()
  return sesionEquipo ? null : estadoPanel.error
}

export const equipoAutorizado = () => !!sesionEquipo
export function salirEquipo() {
  if (sesionEquipo) cerrarSesionEquipo(sesionEquipo.token)
  guardarSesion(null)
  datosRemotos = null
  try {
    sessionStorage.removeItem('aquacheck:equipo') // resto de la antigua demostración con PIN
  } catch {
    /* ignorado */
  }
  avisar()
}

// Cliente de la Edge Function `hogar` de Supabase (única puerta de las familias).
// La dirección de la función es pública; el acceso lo da la clave secreta del QR de cada hogar, que viaja en el cuerpo
// del mensaje y nunca se guarda en el servidor en claro (allí solo hay su hash).
const BASE = `${import.meta.env.VITE_SUPABASE_URL || 'https://jockmfmpioeqsptxtwpz.supabase.co'}/functions/v1/hogar`

// ---- Equipo: Supabase Auth + API de datos (las tablas solo responden si el JWT trae app_metadata.rol = 'equipo') ----
const URL_BASE = import.meta.env.VITE_SUPABASE_URL || 'https://jockmfmpioeqsptxtwpz.supabase.co'
// Llave PÚBLICA (publishable): sin una sesión del equipo no da acceso a ninguna tabla. La llave secreta nunca va aquí.
const LLAVE_PUBLICA = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_ZZzimLKUxmX4XtYwujrliQ_2h0caJ4O'

async function pedir(ruta, { token, metodo = 'GET', cuerpo, extra } = {}) {
  const r = await fetch(`${URL_BASE}${ruta}`, {
    method: metodo,
    headers: { apikey: LLAVE_PUBLICA, Authorization: `Bearer ${token || LLAVE_PUBLICA}`, 'Content-Type': 'application/json', ...extra },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  })
  const datos = await r.json().catch(() => null)
  if (!r.ok) throw new ErrorRemoto(r.status, datos?.error_code || datos?.code || datos?.msg)
  return datos
}
const comoSesion = (s) => ({ token: s.access_token, renovacion: s.refresh_token, vence: Date.now() + (s.expires_in ?? 3600) * 1000 })

export const iniciarSesionEquipo = async (correo, clave) =>
  comoSesion(await pedir('/auth/v1/token?grant_type=password', { metodo: 'POST', cuerpo: { email: correo, password: clave } }))
export const renovarSesionEquipo = async (renovacion) =>
  comoSesion(await pedir('/auth/v1/token?grant_type=refresh_token', { metodo: 'POST', cuerpo: { refresh_token: renovacion } }))
export const cerrarSesionEquipo = (token) => pedir('/auth/v1/logout', { metodo: 'POST', token }).catch(() => {})
export const consultarTabla = (tabla, consulta, token) => pedir(`/rest/v1/${tabla}?${consulta}`, { token })
export const actualizarTabla = (tabla, filtro, cuerpo, token) => pedir(`/rest/v1/${tabla}?${filtro}`, { metodo: 'PATCH', token, cuerpo, extra: { Prefer: 'return=minimal' } })

/** Error de respuesta del servidor (distinto de "sin internet", que lanza TypeError desde fetch). */
export class ErrorRemoto extends Error {
  constructor(estado, codigo) {
    super(codigo || `http_${estado}`)
    this.estado = estado
  }
}

export async function llamarHogar(accion, codigo, secreto, datos = {}) {
  const r = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accion, codigo, secreto, ...datos }),
  })
  const cuerpo = await r.json().catch(() => ({}))
  if (!r.ok) throw new ErrorRemoto(r.status, cuerpo.error)
  return cuerpo
}

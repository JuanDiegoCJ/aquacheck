// Edge Function `hogar`: única puerta de entrada de las familias.
// Valida (código del filtro + clave secreta del QR) y solo opera sobre ESE hogar.
// Usa la llave secreta del proyecto, que Supabase entrega a las Edge Functions como variable de entorno
// (SUPABASE_SERVICE_ROLE_KEY); nunca llega al navegador. Las tablas están cerradas al público (ver 0001_esquema.sql).
//
// Cuerpo esperado (POST, JSON): { accion, codigo, secreto, ...datos }
//   accion: 'ver' | 'registrar' | 'mantenimiento_agregar' | 'mantenimiento_quitar' | 'reporte_agregar'
import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*', // ajustar al dominio final (p. ej. https://aquacheck-moche.vercel.app)
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
})

async function sha256Hex(texto: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
function igualesEnTiempoConstante(a: string, b: string) {
  if (a.length !== b.length) return false
  let d = 0
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return d === 0
}

const TIPOS_MANT = ['limpieza_filtro', 'cambio_cartucho', 'limpieza_tanque']
const TIPOS_FALLA = ['gotea', 'turbia', 'poca', 'otra']
const FECHA = /^\d{4}-\d{2}-\d{2}$/

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'metodo' }, 405)

  let b: Record<string, any>
  try {
    b = await req.json()
  } catch {
    return json({ error: 'json' }, 400)
  }
  const codigo = String(b.codigo ?? '').toUpperCase()
  const secreto = String(b.secreto ?? '')
  if (!/^AQ-\d{3}$/.test(codigo) || secreto.length < 16 || secreto.length > 128) return json({ error: 'acceso' }, 401)

  // Límite de intentos fallidos: 10 cada 10 minutos por filtro.
  const desde = new Date(Date.now() - 10 * 60_000).toISOString()
  const { count } = await db.from('intentos_acceso').select('id', { count: 'exact', head: true }).eq('codigo', codigo).gte('creado_en', desde)
  if ((count ?? 0) >= 10) return json({ error: 'demasiados_intentos' }, 429)

  const { data: hogar } = await db.from('hogares').select('codigo, modelo, fecha_instalacion, registrado, secreto_hash').eq('codigo', codigo).maybeSingle()
  const valido = hogar && igualesEnTiempoConstante(await sha256Hex(secreto), hogar.secreto_hash)
  if (!hogar || !valido) {
    await db.from('intentos_acceso').insert({ codigo })
    return json({ error: 'acceso' }, 401) // misma respuesta si el filtro no existe o la clave es incorrecta
  }
  const { secreto_hash: _oculto, ...hogarPublico } = hogar

  switch (b.accion) {
    case 'ver': {
      const [m, r] = await Promise.all([
        db.from('mantenimientos').select('id, tipo, fecha').eq('codigo', codigo).order('fecha', { ascending: false }),
        db.from('reportes').select('id, tipo, estado, creado_en').eq('codigo', codigo).order('creado_en', { ascending: false }),
      ])
      return json({ hogar: hogarPublico, mantenimientos: m.data ?? [], reportes: r.data ?? [] }) // nunca devuelve el celular
    }
    case 'registrar': {
      const c = b.consentimiento ?? {}
      if (!FECHA.test(String(b.fecha_instalacion)) || !/^9\d{8}$/.test(String(b.celular)) || !c.version || !c.texto) return json({ error: 'datos' }, 400)
      await db.from('hogares').update({ fecha_instalacion: b.fecha_instalacion, registrado: true }).eq('codigo', codigo)
      await db.from('contactos').upsert({ codigo, celular: b.celular, consentimiento_version: String(c.version), consentimiento_texto: String(c.texto) })
      return json({ ok: true })
    }
    case 'mantenimiento_agregar': {
      if (!TIPOS_MANT.includes(b.tipo) || !FECHA.test(String(b.fecha))) return json({ error: 'datos' }, 400)
      const { data } = await db.from('mantenimientos').insert({ codigo, tipo: b.tipo, fecha: b.fecha }).select('id').single()
      return json({ id: data?.id })
    }
    case 'mantenimiento_quitar': {
      await db.from('mantenimientos').delete().eq('id', String(b.id)).eq('codigo', codigo) // solo de este hogar
      return json({ ok: true })
    }
    case 'reporte_agregar': {
      if (!TIPOS_FALLA.includes(b.tipo)) return json({ error: 'datos' }, 400)
      const { data } = await db.from('reportes').insert({ codigo, tipo: b.tipo }).select('id').single()
      return json({ id: data?.id })
    }
    default:
      return json({ error: 'accion' }, 400)
  }
})

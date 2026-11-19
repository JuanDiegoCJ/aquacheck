// Edge Function `hogar`: única puerta de entrada de las familias.
// Valida (código del filtro + clave secreta del QR) y solo opera sobre ESE hogar.
// Usa la llave secreta del proyecto, que Supabase entrega a las Edge Functions como variable de entorno
// (SUPABASE_SERVICE_ROLE_KEY); nunca llega al navegador. Las tablas están cerradas al público (ver 0001_esquema.sql).
//
// Cuerpo esperado (POST, JSON): { accion, codigo, secreto, ...datos }
//   accion: 'ver' | 'registrar' | 'mantenimiento_agregar' | 'mantenimiento_quitar' | 'reporte_agregar'
//   Aparte: { accion: 'crear', fecha_instalacion, celular?, consentimiento? } crea un hogar nuevo y devuelve { codigo, secreto }.
import { createClient } from 'npm:@supabase/supabase-js@2'

// Solo estos orígenes pueden llamar a la función desde un navegador (defensa adicional: igual hace falta la clave del QR).
const ORIGENES = ['https://aquacheck-moche.vercel.app', 'http://localhost:4173', 'http://localhost:5173']
const corsPara = (req: Request) => {
  const origen = req.headers.get('Origin') ?? ''
  return {
    'Access-Control-Allow-Origin': ORIGENES.includes(origen) ? origen : ORIGENES[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
}

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
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_CUERPO = 16_384 // bytes; el cuerpo más grande legítimo es el registro (≈ 3 KB)
const MAX_MANTENIMIENTOS = 500 // por hogar (evita llenar la base con una clave válida)
const MAX_REPORTES = 200
const MAX_ALTAS_HORA = 30 // hogares nuevos creados por la propia familia (todos juntos)
const MAX_ALTAS_DIA = 150

// Fecha real (no solo con forma de fecha), entre 2020 y mañana (por la zona horaria).
function fechaValida(v: unknown) {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false
  const d = new Date(v + 'T00:00:00Z')
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v) return false
  return v >= '2020-01-01' && d.getTime() <= Date.now() + 36 * 3600_000
}

Deno.serve(async (req) => {
  const CORS = corsPara(req)
  const json = (cuerpo: unknown, status = 200) =>
    new Response(JSON.stringify(cuerpo), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'metodo' }, 405)

  // Se rechaza el cuerpo grande ANTES de procesarlo (sin importar quién lo envía).
  if (Number(req.headers.get('content-length') ?? 0) > MAX_CUERPO) return json({ error: 'tamano' }, 413)
  let b: Record<string, any>
  try {
    const texto = await req.text()
    if (texto.length > MAX_CUERPO) return json({ error: 'tamano' }, 413)
    b = JSON.parse(texto)
    if (b === null || typeof b !== 'object' || Array.isArray(b)) throw new Error('forma')
  } catch {
    return json({ error: 'json' }, 400)
  }
  // Una familia nueva se une sola: crea su hogar (código + clave) sin tener QR todavía. No pide clave porque aún no existe.
  // Para que nadie llene la base con hogares falsos hay un tope global por hora y por día.
  if (b.accion === 'crear') {
    if (!fechaValida(b.fecha_instalacion)) return json({ error: 'datos' }, 400)
    const conCelular = b.celular !== undefined && b.celular !== null && String(b.celular) !== ''
    let version = ''
    let texto = ''
    if (conCelular) {
      const c = b.consentimiento ?? {}
      version = String(c.version ?? '')
      texto = String(c.texto ?? '')
      if (!/^9\d{8}$/.test(String(b.celular)) || !version || version.length > 40 || !texto || texto.length > 6000) return json({ error: 'datos' }, 400)
    }
    const hace1h = new Date(Date.now() - 3600_000).toISOString()
    const hace1d = new Date(Date.now() - 24 * 3600_000).toISOString()
    const [h1, d1] = await Promise.all([
      db.from('hogares').select('codigo', { count: 'exact', head: true }).gte('creado_en', hace1h),
      db.from('hogares').select('codigo', { count: 'exact', head: true }).gte('creado_en', hace1d),
    ])
    if (h1.error || d1.error) return json({ error: 'servidor' }, 500)
    if ((h1.count ?? 0) >= MAX_ALTAS_HORA || (d1.count ?? 0) >= MAX_ALTAS_DIA) return json({ error: 'demasiados_intentos' }, 429)

    const claveNueva = (() => {
      const bytes = crypto.getRandomValues(new Uint8Array(24)) // 192 bits
      return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    })()
    const hash = await sha256Hex(claveNueva)
    const { data: ult, error: eUlt } = await db.from('hogares').select('codigo').order('codigo', { ascending: false }).limit(1)
    if (eUlt) return json({ error: 'servidor' }, 500)
    let n = ult && ult.length ? Number(String(ult[0].codigo).slice(3)) : 0
    for (let intento = 0; intento < 4; intento++) {
      n++
      if (n > 999) return json({ error: 'lleno' }, 409)
      const nuevo = `AQ-${String(n).padStart(3, '0')}`
      const { error } = await db.from('hogares').insert({ codigo: nuevo, secreto_hash: hash, fecha_instalacion: b.fecha_instalacion, registrado: true })
      if (error) {
        if (error.code === '23505') continue // otro hogar tomó ese código a la vez: se prueba el siguiente
        return json({ error: 'servidor' }, 500)
      }
      const k = await db.from('claves_qr').insert({ codigo: nuevo, clave: claveNueva }) // para que el equipo pueda reimprimir su ficha
      let c = { error: null as unknown }
      if (!k.error && conCelular) {
        c = await db.from('contactos').insert({ codigo: nuevo, celular: b.celular, consentimiento_version: version, consentimiento_texto: texto })
      }
      if (k.error || c.error) {
        await db.from('hogares').delete().eq('codigo', nuevo) // no queda un hogar a medias
        return json({ error: 'servidor' }, 500)
      }
      return json({ codigo: nuevo, secreto: claveNueva })
    }
    return json({ error: 'servidor' }, 500)
  }

  const codigo = String(b.codigo ?? '').toUpperCase()
  const secreto = String(b.secreto ?? '')
  if (!/^AQ-\d{3}$/.test(codigo) || secreto.length < 16 || secreto.length > 128) return json({ error: 'acceso' }, 401)

  const { data: hogar } = await db.from('hogares').select('codigo, modelo, fecha_instalacion, registrado, secreto_hash').eq('codigo', codigo).maybeSingle()
  const valido = !!hogar && igualesEnTiempoConstante(await sha256Hex(secreto), hogar.secreto_hash)
  if (!valido) {
    // Solo los intentos FALLIDOS cuentan (10 cada 10 minutos por filtro). Una clave correcta nunca queda bloqueada:
    // así nadie puede dejar sin acceso a una familia mandando claves falsas. Las claves tienen 192 bits: adivinarlas no es viable.
    const desde = new Date(Date.now() - 10 * 60_000).toISOString()
    await db.from('intentos_acceso').delete().lt('creado_en', desde) // la tabla no crece sin límite
    const { count } = await db.from('intentos_acceso').select('id', { count: 'exact', head: true }).eq('codigo', codigo)
    if ((count ?? 0) >= 10) return json({ error: 'demasiados_intentos' }, 429)
    await db.from('intentos_acceso').insert({ codigo })
    return json({ error: 'acceso' }, 401) // misma respuesta si el filtro no existe o la clave es incorrecta
  }
  const { secreto_hash: _oculto, ...hogarPublico } = hogar!
  const falla = () => json({ error: 'servidor' }, 500)

  switch (b.accion) {
    case 'ver': {
      const [m, r] = await Promise.all([
        db.from('mantenimientos').select('id, tipo, fecha').eq('codigo', codigo).order('fecha', { ascending: false }),
        db.from('reportes').select('id, tipo, estado, creado_en').eq('codigo', codigo).order('creado_en', { ascending: false }),
      ])
      if (m.error || r.error) return falla()
      return json({ hogar: hogarPublico, mantenimientos: m.data ?? [], reportes: r.data ?? [] }) // nunca devuelve el celular
    }
    case 'registrar': {
      // El celular es OPCIONAL. Si viene, debe ser válido y traer el consentimiento; si no viene, solo se guarda la fecha de instalación.
      // Registrar sin celular nunca borra ni cambia un celular ya guardado (para retirarlo, la familia escribe al contacto del aviso).
      if (!fechaValida(b.fecha_instalacion)) return json({ error: 'datos' }, 400)
      const conCelular = b.celular !== undefined && b.celular !== null && String(b.celular) !== ''
      let version = ''
      let texto = ''
      if (conCelular) {
        const c = b.consentimiento ?? {}
        version = String(c.version ?? '')
        texto = String(c.texto ?? '')
        if (!/^9\d{8}$/.test(String(b.celular)) || !version || version.length > 40 || !texto || texto.length > 6000) {
          return json({ error: 'datos' }, 400)
        }
      }
      const a = await db.from('hogares').update({ fecha_instalacion: b.fecha_instalacion, registrado: true }).eq('codigo', codigo)
      if (a.error) return falla()
      if (conCelular) {
        const k = await db.from('contactos').upsert({ codigo, celular: b.celular, consentimiento_version: version, consentimiento_texto: texto })
        if (k.error) return falla()
      }
      return json({ ok: true })
    }
    case 'mantenimiento_agregar': {
      if (!TIPOS_MANT.includes(b.tipo) || !fechaValida(b.fecha)) return json({ error: 'datos' }, 400)
      const { count } = await db.from('mantenimientos').select('id', { count: 'exact', head: true }).eq('codigo', codigo)
      if ((count ?? 0) >= MAX_MANTENIMIENTOS) return json({ error: 'limite' }, 400)
      const { data, error } = await db.from('mantenimientos').insert({ codigo, tipo: b.tipo, fecha: b.fecha }).select('id').single()
      if (error) return falla()
      return json({ id: data.id })
    }
    case 'mantenimiento_quitar': {
      if (!UUID.test(String(b.id))) return json({ error: 'datos' }, 400)
      const { error } = await db.from('mantenimientos').delete().eq('id', String(b.id)).eq('codigo', codigo) // solo de este hogar
      if (error) return falla()
      return json({ ok: true })
    }
    case 'reporte_agregar': {
      if (!TIPOS_FALLA.includes(b.tipo)) return json({ error: 'datos' }, 400)
      const { count } = await db.from('reportes').select('id', { count: 'exact', head: true }).eq('codigo', codigo)
      if ((count ?? 0) >= MAX_REPORTES) return json({ error: 'limite' }, 400)
      const id = crypto.randomUUID()
      const ruta = b.foto === true ? `${codigo}/${id}.jpg` : null
      const { error } = await db.from('reportes').insert({ id, codigo, tipo: b.tipo, foto_path: ruta })
      if (error) return falla()
      if (!ruta) return json({ id })
      // Enlace de subida firmado: permite subir SOLO ese archivo, una vez (la familia no tiene acceso directo a Storage).
      const { data: firma, error: e2 } = await db.storage.from('fotos-fallas').createSignedUploadUrl(ruta)
      if (e2 || !firma) {
        await db.from('reportes').update({ foto_path: null }).eq('id', id) // el reporte queda, sin foto
        return json({ id })
      }
      return json({ id, subida: { ruta: firma.path, token: firma.token } })
    }
    default:
      return json({ error: 'accion' }, 400)
  }
})

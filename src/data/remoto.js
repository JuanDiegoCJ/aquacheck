// Cliente de la Edge Function `hogar` de Supabase (única puerta de las familias).
// La dirección de la función es pública; el acceso lo da la clave secreta del QR de cada hogar, que viaja en el cuerpo
// del mensaje y nunca se guarda en el servidor en claro (allí solo hay su hash).
const BASE = `${import.meta.env.VITE_SUPABASE_URL || 'https://jockmfmpioeqsptxtwpz.supabase.co'}/functions/v1/hogar`

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

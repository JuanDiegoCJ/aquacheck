// Recordatorios en el calendario del propio celular (archivo .ics). No necesita servidor ni internet:
// el calendario del teléfono es quien avisa. Cada tarea se repite según sus días.
import { hoyISO, sumarDias } from '../domain/reglas.js'
import { CATALOGO, resumenPersonal } from './plan.js'

const fechaICS = (iso) => iso.replaceAll('-', '')
const escapar = (t) => t.replaceAll('\\', '\\\\').replaceAll(';', '\\;').replaceAll(',', '\\,').replaceAll('\n', '\\n')

function sellos(ahora = new Date()) {
  return ahora.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')
}

export function crearICS(perfil, hoy = hoyISO(), ahora = new Date()) {
  const { tareas } = resumenPersonal(perfil, hoy)
  const lineas = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AquaCheck//Mi plan de agua//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH']
  for (const t of tareas) {
    const inicio = t.vence < hoy ? hoy : t.vence
    const c = CATALOGO[t.id]
    lineas.push(
      'BEGIN:VEVENT',
      `UID:aquacheck-${t.id}-${fechaICS(perfil.creado)}@aquacheck-moche.vercel.app`,
      `DTSTAMP:${sellos(ahora)}`,
      `DTSTART;VALUE=DATE:${fechaICS(inicio)}`,
      `DTEND;VALUE=DATE:${fechaICS(sumarDias(inicio, 1))}`,
      `RRULE:FREQ=DAILY;INTERVAL=${t.cadaDias}`,
      `SUMMARY:${escapar(`💧 ${c.etiqueta}`)}`,
      `DESCRIPTION:${escapar(`${c.origen} Cuando termines, márcalo en AquaCheck.`)}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapar(c.etiqueta)}`,
      'TRIGGER:-PT15H', // el día anterior a las 9:00 a. m.
      'END:VALARM',
      'END:VEVENT',
    )
  }
  lineas.push('END:VCALENDAR')
  return lineas.join('\r\n') + '\r\n'
}

export function descargarICS(perfil) {
  const blob = new Blob([crearICS(perfil)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'aquacheck-recordatorios.ics'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const enlaceWhatsApp = (texto) => `https://wa.me/?text=${encodeURIComponent(texto)}`

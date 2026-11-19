// Informe en PDF generado en el propio navegador, sin librerías y sin el diálogo de impresión.
// Escribe el PDF a mano (texto Helvetica + figuras vectoriales), así se descarga como archivo en cualquier
// dispositivo, también sin internet. Incluye los 4 gráficos del dashboard y las tablas.
// Por privacidad NO incluye celulares ni fotos.
import { TAREAS, formatoFecha, formatoFechaCorta, textoDias } from '../domain/reglas.js'
import { TIPOS_FALLA } from '../domain/fallas.js'
import { etiquetaEstado } from '../team/resumen.js'

export const MIME_PDF = 'application/pdf'

const W = 595.28 // A4 en puntos
const H = 841.89
const M = 40 // margen
const CW = W - 2 * M // ancho útil

const COLOR = {
  texto: '#15293B',
  suave: '#4A6073',
  borde: '#D3E0EA',
  azul: '#0B5FA5',
  azulClaro: '#E4F0FA',
  blanco: '#FFFFFF',
  aldia: '#1B7F3B',
  pronto: '#D98E04',
  prontoOscuro: '#9A5B00', // para texto blanco encima
  vencido: '#B42318',
  sinregistrar: '#8AA0B3',
  resuelta: '#5F7587',
}
const colorEstado = (id) => COLOR[id] ?? COLOR.suave

// ---------------------------------------------------------------- utilidades
const n = (v) => (Math.round(v * 100) / 100).toString()
const rgb = (hex) => {
  const h = hex.replace('#', '')
  return [0, 2, 4].map((i) => n(parseInt(h.slice(i, i + 2), 16) / 255)).join(' ')
}

// Unicode -> WinAnsi (el PDF usa Helvetica estándar). Lo que no existe en esa codificación se cambia por "?".
const ESPECIALES = { 0x2014: 0x97, 0x2013: 0x96, 0x2022: 0x95, 0x2019: 0x92, 0x2018: 0x91, 0x201c: 0x93, 0x201d: 0x94, 0x2026: 0x85 }
function cadena(texto) {
  let s = ''
  for (const ch of String(texto ?? '')) {
    let c = ch.codePointAt(0)
    if (ESPECIALES[c]) c = ESPECIALES[c]
    else if (c > 255) c = 63
    if (ch === '(' || ch === ')' || ch === '\\') s += '\\' + ch
    else if (c < 32 || c > 126) s += '\\' + c.toString(8).padStart(3, '0')
    else s += ch
  }
  return `(${s})`
}

// Anchos de Helvetica (milésimas de em) para medir y centrar texto. Las letras con tilde miden igual que la base.
const ANCHOS = {
  ' ': 278, '!': 278, '"': 355, '#': 556, $: 556, '%': 889, '&': 667, "'": 191, '(': 333, ')': 333, '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278,
  ':': 278, ';': 278, '<': 584, '=': 584, '>': 584, '?': 556, '@': 1015, '[': 278, ']': 278, _: 556,
  A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 500, K: 667, L: 556, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222, j: 222, k: 500, l: 222, m: 833, n: 556, o: 556, p: 556, q: 556, r: 333, s: 500, t: 278, u: 556, v: 500, w: 722, x: 500, y: 500, z: 500,
}
const BASE = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u', ñ: 'n', Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U', Ñ: 'N' }
function anchoTexto(texto, size, negrita = false) {
  let t = 0
  for (const ch of String(texto)) {
    const k = BASE[ch] ?? ch
    t += /[0-9]/.test(k) ? 556 : (ANCHOS[k] ?? 556)
  }
  return (t / 1000) * size * (negrita ? 1.07 : 1)
}
function envolver(texto, ancho, size, negrita = false) {
  const lineas = []
  let l = ''
  for (const p of String(texto).split(' ')) {
    const t = l ? `${l} ${p}` : p
    if (l && anchoTexto(t, size, negrita) > ancho) {
      lineas.push(l)
      l = p
    } else l = t
  }
  if (l) lineas.push(l)
  return lineas
}

// ---------------------------------------------------------------- página
// Todas las coordenadas se dan desde la esquina SUPERIOR izquierda (como en pantalla).
class Pagina {
  constructor() {
    this.o = []
  }
  rect(x, y, w, h, fill) {
    this.o.push(`${rgb(fill)} rg ${n(x)} ${n(H - y - h)} ${n(w)} ${n(h)} re f`)
  }
  rrect(x, y, w, h, r, fill, borde) {
    const X = x
    const Y = H - y - h
    const k = r * 0.5523
    const ruta =
      `${n(X + r)} ${n(Y)} m ${n(X + w - r)} ${n(Y)} l ${n(X + w - r + k)} ${n(Y)} ${n(X + w)} ${n(Y + r - k)} ${n(X + w)} ${n(Y + r)} c ` +
      `${n(X + w)} ${n(Y + h - r)} l ${n(X + w)} ${n(Y + h - r + k)} ${n(X + w - r + k)} ${n(Y + h)} ${n(X + w - r)} ${n(Y + h)} c ` +
      `${n(X + r)} ${n(Y + h)} l ${n(X + r - k)} ${n(Y + h)} ${n(X)} ${n(Y + h - r + k)} ${n(X)} ${n(Y + h - r)} c ` +
      `${n(X)} ${n(Y + r)} l ${n(X)} ${n(Y + r - k)} ${n(X + r - k)} ${n(Y)} ${n(X + r)} ${n(Y)} c h`
    if (fill && borde) this.o.push(`${rgb(fill)} rg ${rgb(borde)} RG 0.8 w ${ruta} B`)
    else if (fill) this.o.push(`${rgb(fill)} rg ${ruta} f`)
    else this.o.push(`${rgb(borde)} RG 0.8 w ${ruta} S`)
  }
  linea(x1, y1, x2, y2, color = COLOR.borde, grosor = 0.8) {
    this.o.push(`${rgb(color)} RG ${n(grosor)} w ${n(x1)} ${n(H - y1)} m ${n(x2)} ${n(H - y2)} l S`)
  }
  circulo(cx, cy, r, fill) {
    const k = r * 0.5523
    const X = cx
    const Y = H - cy
    this.o.push(
      `${rgb(fill)} rg ${n(X + r)} ${n(Y)} m ${n(X + r)} ${n(Y + k)} ${n(X + k)} ${n(Y + r)} ${n(X)} ${n(Y + r)} c ` +
        `${n(X - k)} ${n(Y + r)} ${n(X - r)} ${n(Y + k)} ${n(X - r)} ${n(Y)} c ${n(X - r)} ${n(Y - k)} ${n(X - k)} ${n(Y - r)} ${n(X)} ${n(Y - r)} c ` +
        `${n(X + k)} ${n(Y - r)} ${n(X + r)} ${n(Y - k)} ${n(X + r)} ${n(Y)} c f`,
    )
  }
  /** Sector circular (en grados, 0° = arriba, sentido horario). */
  sector(cx, cy, r, a0, a1, fill) {
    const pts = [`${n(cx)} ${n(H - cy)} m`]
    const pasos = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 3))
    for (let i = 0; i <= pasos; i++) {
      const a = ((a0 + ((a1 - a0) * i) / pasos - 90) * Math.PI) / 180
      pts.push(`${n(cx + r * Math.cos(a))} ${n(H - (cy + r * Math.sin(a)))} l`)
    }
    this.o.push(`${rgb(fill)} rg ${pts.join(' ')} f`)
  }
  /** (x, y) = punto de la línea base. align: left | center | right. */
  texto(str, x, y, { size = 10, negrita = false, color = COLOR.texto, align = 'left' } = {}) {
    const ancho = anchoTexto(str, size, negrita)
    const X = align === 'center' ? x - ancho / 2 : align === 'right' ? x - ancho : x
    this.o.push(`BT ${rgb(color)} rg /${negrita ? 'F2' : 'F1'} ${n(size)} Tf ${n(X)} ${n(H - y)} Td ${cadena(str)} Tj ET`)
  }
  parrafo(str, x, y, ancho, { size = 10, interlineado = 1.35, ...opc } = {}) {
    const lineas = envolver(str, ancho, size, opc.negrita)
    lineas.forEach((l, i) => this.texto(l, x, y + i * size * interlineado, { size, ...opc }))
    return y + lineas.length * size * interlineado
  }
}

function ensamblar(paginas, titulo) {
  const objs = ['', '']
  const add = (s) => objs.push(s)
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>') // 3
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>') // 4
  add(`<< /Title ${cadena(titulo)} /Producer (AquaCheck) /Creator (AquaCheck) >>`) // 5
  const kids = []
  for (const pg of paginas) {
    const contenido = pg.o.join('\n')
    add(`<< /Length ${contenido.length} >>\nstream\n${contenido}\nendstream`)
    const idContenido = objs.length
    add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${idContenido} 0 R >>`)
    kids.push(objs.length)
  }
  objs[0] = '<< /Type /Catalog /Pages 2 0 R >>'
  objs[1] = `<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(' ')}] /Count ${kids.length} >>`

  let out = '%PDF-1.4\n%âãÏÓ\n'
  const offsets = []
  objs.forEach((o, i) => {
    offsets.push(out.length)
    out += `${i + 1} 0 obj\n${o}\nendobj\n`
  })
  const xref = out.length
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R /Info 5 0 R >>\nstartxref\n${xref}\n%%EOF`
  const bytes = new Uint8Array(out.length)
  for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 255
  return bytes
}

// ---------------------------------------------------------------- gráficos
const pct = (v, total) => (total ? Math.round((v / total) * 100) : 0)

function tarjeta(pg, x, y, w, h, titulo, subtitulo) {
  pg.rrect(x, y, w, h, 8, COLOR.blanco, COLOR.borde)
  pg.texto(titulo, x + 14, y + 22, { size: 11.5, negrita: true })
  if (subtitulo) pg.texto(subtitulo, x + 14, y + 35, { size: 8, color: COLOR.suave })
}

function graficoEstados(pg, x, y, w, h, r) {
  tarjeta(pg, x, y, w, h, 'Hogares por estado')
  const datos = ['aldia', 'pronto', 'vencido', 'sinregistrar'].map((id) => ({ id, etiqueta: etiquetaEstado(id), valor: r.porEstado[id] }))
  const total = datos.reduce((s, d) => s + d.valor, 0)
  const cx = x + w / 2
  const cy = y + 100
  let ang = 0
  for (const d of datos) {
    if (!d.valor) continue
    const a1 = ang + (d.valor / total) * 360
    pg.sector(cx, cy, 58, ang, a1, colorEstado(d.id))
    ang = a1
  }
  pg.circulo(cx, cy, 35, COLOR.blanco)
  pg.texto(String(total), cx, cy + 7, { size: 22, negrita: true, color: COLOR.azul, align: 'center' })
  pg.texto('hogares', cx, cy + 19, { size: 8, color: COLOR.suave, align: 'center' })
  datos.forEach((d, i) => {
    const ly = y + 182 + i * 17
    pg.rect(x + 22, ly - 8, 9, 9, colorEstado(d.id))
    pg.texto(d.etiqueta, x + 38, ly, { size: 9.5 })
    pg.texto(String(d.valor), x + w - 62, ly, { size: 9.5, negrita: true, align: 'right' })
    pg.texto(`${pct(d.valor, total)} %`, x + w - 18, ly, { size: 8.5, color: COLOR.suave, align: 'right' })
  })
}

function graficoTareas(pg, x, y, w, h, r) {
  tarjeta(pg, x, y, w, h, 'Cumplimiento por tarea', 'Hogares registrados según el estado de cada tarea')
  const ancho = w - 28
  r.porTarea.forEach((t, i) => {
    const ty = y + 62 + i * 58
    const total = t.aldia + t.pronto + t.vencido
    pg.texto(t.etiqueta, x + 14, ty, { size: 9.5, negrita: true })
    pg.texto(`${total} hogares`, x + w - 14, ty, { size: 8, color: COLOR.suave, align: 'right' })
    let bx = x + 14
    for (const [id, col] of [['aldia', COLOR.aldia], ['pronto', COLOR.prontoOscuro], ['vencido', COLOR.vencido]]) {
      const v = t[id]
      if (!v || !total) continue
      const bw = (v / total) * ancho
      pg.rect(bx, ty + 8, bw - 1, 24, col)
      if (bw > 14) pg.texto(String(v), bx + (bw - 1) / 2, ty + 24, { size: 10, negrita: true, color: COLOR.blanco, align: 'center' })
      bx += bw
    }
  })
  const ly = y + h - 22
  ;[['Al día', COLOR.aldia], ['Pronto', COLOR.prontoOscuro], ['Pendiente', COLOR.vencido]].forEach(([txt, col], i) => {
    pg.rect(x + 14 + i * 68, ly - 8, 9, 9, col)
    pg.texto(txt, x + 27 + i * 68, ly, { size: 8.5, color: COLOR.suave })
  })
}

function graficoSemanal(pg, x, y, w, h, r) {
  tarjeta(pg, x, y, w, h, 'Mantenimientos por semana', 'Últimas 8 semanas')
  const max = Math.max(1, ...r.semanas.map((s) => s.n))
  const base = y + h - 46
  const alto = 125
  const area = w - 28
  const slot = area / r.semanas.length
  pg.linea(x + 14, base, x + w - 14, base)
  r.semanas.forEach((s, i) => {
    const bh = (s.n / max) * alto
    const bw = slot * 0.62
    const bx = x + 14 + i * slot + (slot - bw) / 2
    if (s.n) pg.rrect(bx, base - bh, bw, bh, 2.5, COLOR.azul)
    pg.texto(String(s.n), bx + bw / 2, base - bh - 5, { size: 9, negrita: true, color: COLOR.azul, align: 'center' })
    pg.texto(formatoFechaCorta(s.ini), bx + bw / 2, base + 12, { size: 6.5, color: COLOR.suave, align: 'center' })
  })
}

function graficoFallas(pg, x, y, w, h, r) {
  tarjeta(pg, x, y, w, h, 'Fallas por tipo', 'Abiertas y resueltas')
  const hay = r.fallasPorTipo.some((t) => t.abiertas + t.resueltas > 0)
  if (!hay) {
    pg.texto('Aún no hay reportes de falla.', x + 14, y + 70, { size: 9.5, color: COLOR.suave })
    return
  }
  const max = Math.max(1, ...r.fallasPorTipo.map((t) => t.abiertas + t.resueltas))
  const ancho = w - 28
  r.fallasPorTipo.forEach((t, i) => {
    const ty = y + 62 + i * 41
    const total = t.abiertas + t.resueltas
    pg.texto(t.etiqueta, x + 14, ty, { size: 9.5, negrita: true })
    pg.texto(String(total), x + w - 14, ty, { size: 8.5, color: COLOR.suave, align: 'right' })
    const largo = Math.max((total / max) * ancho, total ? 24 : 0)
    let bx = x + 14
    for (const [v, col] of [[t.abiertas, COLOR.prontoOscuro], [t.resueltas, COLOR.resuelta]]) {
      if (!v) continue
      const bw = (v / total) * largo
      pg.rect(bx, ty + 7, bw - 1, 18, col)
      if (bw > 12) pg.texto(String(v), bx + (bw - 1) / 2, ty + 20, { size: 9, negrita: true, color: COLOR.blanco, align: 'center' })
      bx += bw
    }
  })
  const ly = y + h - 18
  ;[['Abiertas', COLOR.prontoOscuro], ['Resueltas', COLOR.resuelta]].forEach(([txt, col], i) => {
    pg.rect(x + 14 + i * 72, ly - 8, 9, 9, col)
    pg.texto(txt, x + 27 + i * 72, ly, { size: 8.5, color: COLOR.suave })
  })
}

// ---------------------------------------------------------------- tablas
function tabla(paginas, nueva, y0, titulo, cabecera, anchos, filas, opciones = {}) {
  const alto = 18
  let pg = paginas[paginas.length - 1]
  let y = y0
  const dibujarCabecera = () => {
    pg.texto(titulo, M, y + 4, { size: 13, negrita: true, color: COLOR.azul })
    y += 14
    pg.rect(M, y, CW, 20, COLOR.azul)
    let x = M
    cabecera.forEach((c, i) => {
      pg.texto(c, x + 6, y + 13.5, { size: 8.5, negrita: true, color: COLOR.blanco })
      x += anchos[i]
    })
    y += 20
  }
  if (y + 14 + 20 + alto * 2 > H - 56) {
    pg = nueva()
    y = M + 10
  }
  dibujarCabecera()
  filas.forEach((fila, k) => {
    if (y + alto > H - 56) {
      pg = nueva()
      y = M + 10
      dibujarCabecera()
    }
    if (k % 2 === 0) pg.rect(M, y, CW, alto, '#F3F8FC')
    let x = M
    fila.forEach((celda, i) => {
      let tx = x + 6
      if (opciones.estadoEnColumna === i && celda.estado) {
        pg.circulo(x + 10, y + 9, 3.4, colorEstado(celda.estado))
        tx = x + 18
      }
      const txt = typeof celda === 'object' ? celda.texto : celda
      pg.texto(txt, tx, y + 12.5, { size: 8.5 })
      x += anchos[i]
    })
    y += alto
  })
  return y + 16
}

// ---------------------------------------------------------------- informe
export function construirPDF(r) {
  const paginas = []
  const nueva = () => {
    const p = new Pagina()
    paginas.push(p)
    return p
  }
  let pg = nueva()

  // Encabezado
  pg.circulo(M + 8, 52, 8, COLOR.azul)
  pg.texto('AquaCheck', M + 22, 57, { size: 15, negrita: true, color: COLOR.azul })
  pg.texto('Informe del piloto · Moche, Trujillo', M, 86, { size: 21, negrita: true })
  pg.texto(`Generado el ${formatoFecha(r.hoy)} · Desafío UPAO 2026`, M, 104, { size: 10, color: COLOR.suave })

  // Indicadores
  const iw = (CW - 3 * 10) / 4
  const indicadores = [
    [`${r.registrados}/${r.total}`, ['hogares registrados']],
    [`${r.pctAlDia}%`, ['de los registrados', 'está al día']],
    [String(r.conTareaPendiente), ['hogares con tarea', 'próxima o pendiente']],
    [String(r.abiertas.length), ['fallas abiertas']],
  ]
  indicadores.forEach(([valor, lineas], i) => {
    const x = M + i * (iw + 10)
    pg.rrect(x, 120, iw, 62, 8, COLOR.blanco, COLOR.borde)
    pg.texto(valor, x + 12, 147, { size: 21, negrita: true, color: COLOR.azul })
    lineas.forEach((l, k) => pg.texto(l, x + 12, 162 + k * 10, { size: 8, color: COLOR.suave }))
  })

  // Gráficos 2 x 2
  const gw = (CW - 12) / 2
  const gh = 250
  const gy = 198
  graficoEstados(pg, M, gy, gw, gh, r)
  graficoTareas(pg, M + gw + 12, gy, gw, gh, r)
  graficoSemanal(pg, M, gy + gh + 12, gw, gh, r)
  graficoFallas(pg, M + gw + 12, gy + gh + 12, gw, gh, r)

  // Lectura rápida (solo hechos que salen de los datos)
  const ly = gy + 2 * gh + 12 + 26
  pg.texto('Lectura rápida', M, ly, { size: 11, negrita: true, color: COLOR.azul })
  const hechos = [
    `${r.registrados} de ${r.total} hogares están registrados; ${r.pctAlDia} % de ellos está al día.`,
    `${r.conTareaPendiente} hogares tienen una tarea próxima (hasta 7 días) o pendiente. Hay ${r.abiertas.length} fallas abiertas.`,
  ]
  let yy = ly + 14
  hechos.forEach((h) => {
    yy = pg.parrafo(`•  ${h}`, M, yy, CW, { size: 9, color: COLOR.texto })
  })

  // Tabla de hogares
  pg = nueva()
  let y = tabla(
    paginas,
    nueva,
    M + 12,
    'Hogares',
    ['Hogar', 'Estado', 'Próxima tarea', 'Fallas abiertas'],
    [70, 110, 255, 80],
    r.filas.map((f) => [
      f.h.codigo,
      { texto: etiquetaEstado(f.general), estado: f.general },
      f.h.registrado && f.siguiente ? `${TAREAS[f.siguiente.tipo].etiqueta}: ${textoDias(f.siguiente.dias).toLowerCase()}` : '—',
      f.fallas ? String(f.fallas) : '—',
    ]),
    { estadoEnColumna: 1 },
  )

  // Fallas reportadas
  pg = paginas[paginas.length - 1]
  if (r.reportes.length) {
    y = tabla(
      paginas,
      nueva,
      y + 6,
      'Fallas reportadas',
      ['Hogar', 'Problema', 'Fecha', 'Estado'],
      [70, 200, 155, 90],
      r.reportes.map((x) => [x.codigo, TIPOS_FALLA[x.tipo].etiqueta, formatoFecha(x.fecha.slice(0, 10)), x.estado === 'abierta' ? 'Abierta' : 'Resuelta']),
    )
    pg = paginas[paginas.length - 1]
  }

  // Notas
  if (y + 90 > H - 56) {
    pg = nueva()
    y = M + 10
  }
  pg.texto('Notas', M, y + 4, { size: 13, negrita: true, color: COLOR.azul })
  y += 20
  ;[
    'AquaCheck no mide la calidad del agua ni certifica que sea potable. Su función es organizar el mantenimiento del equipo de agua del hogar.',
    'Los datos corresponden al dispositivo desde el que se generó este informe (prototipo sin servidor). No se incluyen celulares ni fotos.',
    'Los intervalos de mantenimiento son valores de referencia, pendientes de confirmar con la ficha técnica del fabricante.',
  ].forEach((t) => {
    y = pg.parrafo(`•  ${t}`, M, y, CW, { size: 9, color: COLOR.suave }) + 3
  })

  // Pie de página con numeración
  paginas.forEach((p, i) => {
    p.linea(M, H - 40, W - M, H - 40)
    p.texto('AquaCheck · Informe del piloto', M, H - 26, { size: 8, color: COLOR.suave })
    p.texto(`Página ${i + 1} de ${paginas.length}`, W - M, H - 26, { size: 8, color: COLOR.suave, align: 'right' })
  })

  return ensamblar(paginas, 'Informe del piloto AquaCheck')
}

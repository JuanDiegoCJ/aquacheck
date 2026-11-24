// Genera las fichas definitivas (QR con la clave de cada hogar) como una página HTML lista para imprimir.
// Las claves NO están en el repo: se leen de un CSV privado (columnas codigo, clave).
//
// Uso:  npm run build && node tools/generar_fichas.mjs <claves.csv> <salida.html> [url_base]
// Importante: <salida.html> contiene las claves; guárdalo en _privado/ (ignorada por Git).
import fs from 'node:fs'
import path from 'node:path'
import QRCode from 'qrcode'
import { ORDEN_TAREAS, TAREAS } from '../src/domain/reglas.js'

const [csvRuta, salida, base = 'https://aquacheck-26.vercel.app/'] = process.argv.slice(2)
if (!csvRuta || !salida) {
  console.error('Uso: node tools/generar_fichas.mjs <claves.csv> <salida.html> [url_base]')
  process.exit(1)
}
const filas = fs.readFileSync(csvRuta, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean).slice(1)
  .map((l) => l.replace(/"/g, '').split(','))
  .filter(([c, k]) => /^AQ-\d{3}$/.test(c) && k && k.length >= 16)
if (!filas.length) throw new Error('El CSV no tiene filas válidas')

const dist = path.resolve('dist/assets')
const cssArchivo = fs.readdirSync(dist).find((f) => f.endsWith('.css'))
const css = fs.readFileSync(path.join(dist, cssArchivo), 'utf8')

const fichas = []
for (const [codigo, clave] of filas) {
  const url = `${base.replace(/\/?$/, '/')}#/f/${codigo}?k=${clave}`
  const qr = await QRCode.toDataURL(url, { width: 520, margin: 2, errorCorrectionLevel: 'M' })
  const filasTabla = ORDEN_TAREAS.map((t) => `<tr><td>${TAREAS[t].etiqueta}</td><td>${TAREAS[t].cadaDias} días</td><td></td><td></td><td></td><td></td></tr>`).join('')
  fichas.push(`<article class="ficha">
  <header class="ficha-cab"><div><p class="ficha-marca">💧 AquaCheck</p><h2>Filtro ${codigo}</h2>
  <p>Escanea el QR con tu celular para registrar el mantenimiento.</p></div>
  <img class="qr" src="${qr}" width="170" height="170" alt="Código QR del filtro ${codigo}"></header>
  <table class="ficha-tabla"><thead><tr><th>Tarea</th><th>Cada</th><th>Fecha</th><th>Fecha</th><th>Fecha</th><th>Fecha</th></tr></thead><tbody>${filasTabla}</tbody></table>
  <p class="ficha-pie">Si no tienes celular o internet, anota aquí la fecha cada vez que hagas la tarea. Si el filtro gotea, el agua sale turbia o sale poca agua, avisa al equipo del proyecto. AquaCheck no mide la calidad del agua.</p>
</article>`)
}
const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Fichas AquaCheck (CONFIDENCIAL: contiene claves)</title><style>${css}</style></head>
<body><main class="fichas">${fichas.join('\n')}</main></body></html>`
fs.writeFileSync(salida, html)
console.log(`${fichas.length} fichas escritas en ${salida}`)

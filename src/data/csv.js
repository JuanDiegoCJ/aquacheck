// Exportación a CSV para Economía e Industrial. Se abre directo en Excel (con BOM UTF-8).
// Por privacidad NO se exportan celulares ni fotos.
const celda = (v) => {
  const s = v === null || v === undefined ? '' : String(v)
  return /[",\n;]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s
}

export function aCSV(columnas, filas) {
  const cabecera = columnas.map((c) => celda(c.titulo)).join(',')
  const cuerpo = filas.map((f) => columnas.map((c) => celda(c.valor(f))).join(','))
  return [cabecera, ...cuerpo].join('\r\n')
}

export function descargarCSV(nombre, texto) {
  const blob = new Blob(['﻿' + texto], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Exportación a Excel (.xlsx) y Word (.docx), generados en el propio navegador (funciona sin internet).
// Ambos formatos son archivos ZIP con XML; se arman a mano y se comprimen con fflate (≈ 30 KB).
// Por privacidad NO incluyen celulares ni fotos.
import { zipSync, strToU8 } from 'fflate'
import { TAREAS, formatoFecha, formatoFechaCorta, textoDias } from '../domain/reglas.js'
import { TIPOS_FALLA } from '../domain/fallas.js'
import { etiquetaEstado } from '../team/resumen.js'

export const MIME_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
export const MIME_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

const XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
const esc = (s) =>
  String(s ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** Descarga un archivo binario. */
export function descargarBinario(nombre, bytes, mime) {
  const blob = new Blob([bytes], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0)

// ============================================================ Excel (.xlsx)
function colLetra(i) {
  let s = ''
  let n = i + 1
  while (n > 0) {
    const m = (n - 1) % 26
    s = String.fromCharCode(65 + m) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}

function hojaXml(filas, anchos) {
  const cols = anchos ? `<cols>${anchos.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>` : ''
  const rows = filas
    .map((fila, r) => {
      const celdas = fila
        .map((v, c) => {
          const ref = colLetra(c) + (r + 1)
          const s = r === 0 ? ' s="1"' : ''
          if (typeof v === 'number' && Number.isFinite(v)) return `<c r="${ref}"${s}><v>${v}</v></c>`
          if (v === null || v === undefined || v === '') return `<c r="${ref}"${s}/>`
          return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${esc(v)}</t></is></c>`
        })
        .join('')
      return `<row r="${r + 1}">${celdas}</row>`
    })
    .join('')
  return (
    `${XML}<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>` +
    `${cols}<sheetData>${rows}</sheetData></worksheet>`
  )
}

export function construirExcel(r) {
  const hojas = [
    {
      nombre: 'Resumen',
      anchos: [46, 18],
      filas: [
        ['Indicador', 'Valor'],
        ['Fecha del informe', r.hoy],
        ['Filtros registrados', r.registrados],
        ['Filtros en total', r.total],
        ['Registrados que están al día (%)', r.pctAlDia],
        ['Hogares con tarea próxima o pendiente', r.conTareaPendiente],
        ['Fallas abiertas', r.abiertas.length],
      ],
    },
    {
      nombre: 'Estados',
      anchos: [22, 12, 14],
      filas: [['Estado', 'Hogares', 'Porcentaje (%)'], ...['aldia', 'pronto', 'vencido', 'sinregistrar'].map((e) => [etiquetaEstado(e), r.porEstado[e], pct(r.porEstado[e], r.total)])],
    },
    {
      nombre: 'Por tarea',
      anchos: [26, 10, 10, 12],
      filas: [['Tarea', 'Al día', 'Pronto', 'Pendiente'], ...r.porTarea.map((t) => [t.etiqueta, t.aldia, t.pronto, t.vencido])],
    },
    {
      nombre: 'Semanal',
      anchos: [18, 18, 16],
      filas: [['Semana desde', 'Semana hasta', 'Mantenimientos'], ...r.semanas.map((s) => [s.ini, s.fin, s.n])],
    },
    {
      nombre: 'Hogares',
      anchos: [10, 12, 18, 14, 40, 14, 16, 16, 16, 14],
      filas: [
        ['Filtro', 'Registrado', 'Instalación', 'Estado', 'Próxima tarea', 'Días a próxima tarea', 'Días limpieza filtro', 'Días cambio cartucho', 'Días limpieza tanque', 'Fallas abiertas'],
        ...r.filas.map((f) => [
          f.h.codigo,
          f.h.registrado ? 'Sí' : 'No',
          f.h.fechaInstalacion ?? '',
          etiquetaEstado(f.general),
          f.h.registrado && f.siguiente ? TAREAS[f.siguiente.tipo].etiqueta : '',
          f.h.registrado && f.siguiente ? f.siguiente.dias : '',
          f.tareas[0]?.dias ?? '',
          f.tareas[1]?.dias ?? '',
          f.tareas[2]?.dias ?? '',
          f.fallas,
        ]),
      ],
    },
    {
      nombre: 'Mantenimientos',
      anchos: [10, 26, 14],
      filas: [['Filtro', 'Tarea', 'Fecha'], ...[...r.mantenimientos].sort((a, b) => a.fecha.localeCompare(b.fecha)).map((m) => [m.codigo, TAREAS[m.tipo].etiqueta, m.fecha])],
    },
    {
      nombre: 'Fallas',
      anchos: [10, 26, 14, 12, 10],
      filas: [['Filtro', 'Tipo', 'Fecha', 'Estado', 'Con foto'], ...r.reportes.map((x) => [x.codigo, TIPOS_FALLA[x.tipo].etiqueta, x.fecha.slice(0, 10), x.estado === 'abierta' ? 'Abierta' : 'Resuelta', x.conFoto ? 'Sí' : 'No'])],
    },
  ]

  const archivos = {
    '[Content_Types].xml': strToU8(
      `${XML}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
        `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
        `<Default Extension="xml" ContentType="application/xml"/>` +
        `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
        hojas.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('') +
        `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
    ),
    '_rels/.rels': strToU8(
      `${XML}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    ),
    'xl/workbook.xml': strToU8(
      `${XML}<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>` +
        hojas.map((h, i) => `<sheet name="${esc(h.nombre)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('') +
        `</sheets></workbook>`,
    ),
    'xl/_rels/workbook.xml.rels': strToU8(
      `${XML}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        hojas.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('') +
        `<Relationship Id="rId${hojas.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    ),
    'xl/styles.xml': strToU8(
      `${XML}<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
        `<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>` +
        `<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0B5FA5"/><bgColor indexed="64"/></patternFill></fill></fills>` +
        `<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>` +
        `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
        `<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs>` +
        `<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`,
    ),
  }
  hojas.forEach((h, i) => {
    archivos[`xl/worksheets/sheet${i + 1}.xml`] = strToU8(hojaXml(h.filas, h.anchos))
  })
  return zipSync(archivos)
}

// ============================================================ Word (.docx)
const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'

const parrafo = (texto, { estilo, negrita } = {}) =>
  `<w:p>${estilo ? `<w:pPr><w:pStyle w:val="${estilo}"/></w:pPr>` : ''}<w:r>${negrita ? '<w:rPr><w:b/></w:rPr>' : ''}<w:t xml:space="preserve">${esc(texto)}</w:t></w:r></w:p>`

const celda = (texto, ancho, { negrita, fondo, color } = {}) =>
  `<w:tc><w:tcPr><w:tcW w:w="${ancho}" w:type="dxa"/>${fondo ? `<w:shd w:val="clear" w:color="auto" w:fill="${fondo}"/>` : ''}</w:tcPr>` +
  `<w:p><w:pPr><w:spacing w:before="40" w:after="40"/></w:pPr><w:r><w:rPr>${negrita ? '<w:b/>' : ''}${color ? `<w:color w:val="${color}"/>` : ''}<w:sz w:val="20"/></w:rPr>` +
  `<w:t xml:space="preserve">${esc(texto)}</w:t></w:r></w:p></w:tc>`

function tabla(cabecera, filas, anchos) {
  const total = anchos.reduce((a, b) => a + b, 0)
  const fila = (celdas, extra = '') => `<w:tr>${extra}${celdas}</w:tr>`
  return (
    `<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="${total}" w:type="dxa"/><w:tblLayout w:type="fixed"/></w:tblPr>` +
    `<w:tblGrid>${anchos.map((w) => `<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>` +
    fila(cabecera.map((c, i) => celda(c, anchos[i], { negrita: true, fondo: '0B5FA5', color: 'FFFFFF' })).join(''), '<w:trPr><w:tblHeader/></w:trPr>') +
    filas.map((f) => fila(f.map((c, i) => celda(c, anchos[i])).join(''))).join('') +
    `</w:tbl>`
  )
}

export function construirWord(r) {
  const cuerpo = [
    parrafo('Informe del piloto AquaCheck', { estilo: 'Title' }),
    parrafo(`Generado el ${formatoFecha(r.hoy)} · Desafío UPAO 2026 · Moche, Trujillo`),

    parrafo('Resumen', { estilo: 'Heading1' }),
    tabla(
      ['Indicador', 'Valor'],
      [
        ['Filtros registrados', `${r.registrados} de ${r.total}`],
        ['Registrados que están al día', `${r.pctAlDia} %`],
        ['Hogares con tarea próxima o pendiente', String(r.conTareaPendiente)],
        ['Fallas abiertas', String(r.abiertas.length)],
      ],
      [6000, 3638],
    ),

    parrafo('Estado de los hogares', { estilo: 'Heading1' }),
    tabla(
      ['Estado', 'Hogares', 'Porcentaje'],
      ['aldia', 'pronto', 'vencido', 'sinregistrar'].map((e) => [etiquetaEstado(e), String(r.porEstado[e]), `${pct(r.porEstado[e], r.total)} %`]),
      [4000, 2819, 2819],
    ),

    parrafo('Cumplimiento por tarea', { estilo: 'Heading1' }),
    tabla(['Tarea', 'Al día', 'Pronto', 'Pendiente'], r.porTarea.map((t) => [t.etiqueta, String(t.aldia), String(t.pronto), String(t.vencido)]), [4238, 1800, 1800, 1800]),

    parrafo('Mantenimientos registrados por semana', { estilo: 'Heading1' }),
    tabla(['Semana', 'Mantenimientos'], r.semanas.map((s) => [`${formatoFechaCorta(s.ini)} al ${formatoFechaCorta(s.fin)}`, String(s.n)]), [6000, 3638]),

    parrafo('Hogares', { estilo: 'Heading1' }),
    tabla(
      ['Filtro', 'Estado', 'Próxima tarea', 'Fallas'],
      r.filas.map((f) => [f.h.codigo, etiquetaEstado(f.general), f.h.registrado && f.siguiente ? `${TAREAS[f.siguiente.tipo].etiqueta}: ${textoDias(f.siguiente.dias).toLowerCase()}` : '—', f.fallas ? String(f.fallas) : '—']),
      [1300, 1800, 5638, 900],
    ),

    parrafo('Fallas reportadas', { estilo: 'Heading1' }),
    r.reportes.length
      ? tabla(['Filtro', 'Problema', 'Fecha', 'Estado'], r.reportes.map((x) => [x.codigo, TIPOS_FALLA[x.tipo].etiqueta, formatoFecha(x.fecha.slice(0, 10)), x.estado === 'abierta' ? 'Abierta' : 'Resuelta']), [1300, 3600, 3000, 1738])
      : parrafo('Aún no hay reportes de falla.'),

    parrafo('Notas', { estilo: 'Heading1' }),
    parrafo('AquaCheck no mide la calidad del agua ni certifica que sea potable. Su función es organizar el mantenimiento del filtro.'),
    parrafo('Los datos corresponden al dispositivo desde el que se generó este informe (prototipo sin servidor). No se incluyen celulares ni fotos.'),
    parrafo('Los intervalos de mantenimiento son valores de referencia, pendientes de confirmar con la ficha técnica del fabricante.'),
  ].join('')

  const documento =
    `${XML}<w:document ${W}><w:body>${cuerpo}` +
    `<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>`

  const borde = (lado) => `<w:${lado} w:val="single" w:sz="4" w:space="0" w:color="9FB3C4"/>`
  const estilos =
    `${XML}<w:styles ${W}>` +
    `<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="22"/><w:lang w:val="es-PE"/></w:rPr></w:rPrDefault>` +
    `<w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>` +
    `<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>` +
    `<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:spacing w:after="60"/></w:pPr><w:rPr><w:b/><w:color w:val="0B5FA5"/><w:sz w:val="44"/></w:rPr></w:style>` +
    `<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="320" w:after="120"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:color w:val="0B5FA5"/><w:sz w:val="30"/></w:rPr></w:style>` +
    `<w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Normal Table"/><w:uiPriority w:val="99"/><w:semiHidden/><w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>` +
    `<w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/><w:basedOn w:val="TableNormal"/><w:tblPr><w:tblBorders>${['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(borde).join('')}</w:tblBorders></w:tblPr></w:style>` +
    `</w:styles>`

  return zipSync({
    '[Content_Types].xml': strToU8(
      `${XML}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
        `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
        `<Default Extension="xml" ContentType="application/xml"/>` +
        `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>` +
        `<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`,
    ),
    '_rels/.rels': strToU8(
      `${XML}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
    ),
    'word/_rels/document.xml.rels': strToU8(
      `${XML}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    ),
    'word/document.xml': strToU8(documento),
    'word/styles.xml': strToU8(estilos),
  })
}

export const nombreArchivo = (base, ext, hoy) => `${base}_${hoy}.${ext}`

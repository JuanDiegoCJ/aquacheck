import { Icono } from '../components/Iconos.jsx'
import { useRef, useState } from 'react'
import Pantalla from '../components/Pantalla.jsx'
import Guia, { BotonAyuda } from '../components/Guia.jsx'
import { Donut, BarrasPorTarea, BarrasSemanales, BarrasFallas } from '../components/Graficos.jsx'
import {
  useDatos,
  fotoPanel,
  entrarEquipoReal,
  estadoDelPanel,
  cargarEquipo,
  crearHogar,
  siguienteCodigo,
  obtenerContacto,
  marcarReporteResuelto,
  equipoAutorizado,
  salirEquipo,
} from '../data/repo.js'
import { TAREAS, ORDEN_TAREAS, textoDias, mensajeAviso, formatoFecha } from '../domain/reglas.js'
import { TIPOS_FALLA } from '../domain/fallas.js'
import { aCSV, descargarCSV } from '../data/csv.js'
import { construirExcel, construirWord, descargarBinario, nombreArchivo, MIME_XLSX, MIME_DOCX } from '../data/exportar.js'
import { construirPDF, MIME_PDF } from '../data/pdf.js'
import { calcularResumen, ESTADOS, etiquetaEstado } from './resumen.js'
import { rutaFiltro } from '../app/ruta.js'

function Acceso() {
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)
  return (
    <Pantalla titulo="Equipo del proyecto" volver="#/" sinPie>
      <form
        className="tarjeta formulario"
        onSubmit={async (e) => {
          e.preventDefault()
          setEnviando(true)
          setError(await entrarEquipoReal(correo, clave))
          setEnviando(false)
        }}
      >
        <p className="suave">Esta parte es solo para el equipo. Entra con tu cuenta.</p>
        <div className="campo">
          <label htmlFor="correo">Correo</label>
          <input id="correo" type="email" autoComplete="username" required value={correo} onChange={(e) => setCorreo(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="clave">Contraseña</label>
          <input id="clave" type="password" autoComplete="current-password" required value={clave} onChange={(e) => setClave(e.target.value)} aria-invalid={!!error} />
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </div>
        <button type="submit" className="btn btn-principal" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

    </Pantalla>
  )
}

const PASOS_EQUIPO = [
  { selector: '[data-guia="indicadores"]', titulo: 'Indicadores', texto: 'Cuántos filtros están registrados, qué porcentaje está al día, cuántos tienen tareas próximas o pendientes y cuántas fallas siguen abiertas.' },
  { selector: '[data-guia="actualizar"]', titulo: 'Actualizar', texto: 'El panel se actualiza solo cada 2 segundos. Este botón fuerza una actualización inmediata.' },
  { selector: '[data-guia="pestanas"]', titulo: 'Secciones', texto: 'Resumen (gráficos), Hogares (tabla con búsqueda y páginas), Fallas (reportes con foto) e Informes (Excel, Word, PDF y fichas).' },
  { selector: '[data-guia="graficos"]', titulo: 'Gráficos', texto: 'Toca un estado o un tramo de un gráfico para ver en Hogares solo esas familias.' },
  { titulo: 'En Hogares', texto: 'El botón Agregar hogar crea un código nuevo con su clave y abre su ficha con el QR. El botón Ver abre la vista de solo lectura de una familia (tareas, historial, fallas y contacto). “Ficha” muestra su QR definitivo para imprimir. “WhatsApp” abre el aviso ya escrito.' },
]

const enmascarar = (cel) => (cel ? `9•• ••• ${cel.slice(-3)}` : '—')

export default function Equipo() {
  useDatos()
  return equipoAutorizado() ? <Panel /> : <Acceso />
}

function Panel() {
  const r = calcularResumen()
  const estado = estadoDelPanel()
  // filtro = { estado, tarea|null }: lo fijan los gráficos y los botones de estado
  const [filtro, setFiltro] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const tablaRef = useRef(null)
  const [guia, setGuia] = useState(false)
  const [confirmandoNuevo, setConfirmandoNuevo] = useState(false)
  const [creando, setCreando] = useState(false)
  const [errorNuevo, setErrorNuevo] = useState(null)
  async function crear() {
    setCreando(true)
    setErrorNuevo(null)
    try {
      const codigo = await crearHogar()
      setConfirmandoNuevo(false)
      window.location.hash = '#/equipo/ficha/' + codigo // se abre su ficha con el QR, lista para imprimir o enviar
    } catch (err) {
      setErrorNuevo(err.message)
    }
    setCreando(false)
  }
  const [vista, setVista] = useState('resumen') // resumen | hogares | fallas | informes
  const [pagina, setPagina] = useState(0)
  const [paginaFallas, setPaginaFallas] = useState(0)
  const cambiarFiltro = (f) => {
    setFiltro(f)
    setPagina(0)
  }

  function aplicarFiltro(f) {
    cambiarFiltro(f)
    if (f) setVista('hogares')
  }

  const visibles = r.filas.filter((f) => {
    if (busqueda.trim() && !f.h.codigo.toLowerCase().includes(busqueda.trim().toLowerCase())) return false
    if (!filtro) return true
    if (filtro.tarea) {
      const i = ORDEN_TAREAS.indexOf(filtro.tarea)
      return f.h.registrado && f.tareas[i]?.estado === filtro.estado
    }
    return f.general === filtro.estado
  })
  const POR_PAGINA = 10
  const FALLAS_POR_PAGINA = 5
  const paginasFallas = Math.max(1, Math.ceil(r.reportes.length / FALLAS_POR_PAGINA))
  const pgF = Math.min(paginaFallas, paginasFallas - 1)
  const fallasVisibles = r.reportes.slice(pgF * FALLAS_POR_PAGINA, (pgF + 1) * FALLAS_POR_PAGINA)
  const paginas = Math.max(1, Math.ceil(visibles.length / POR_PAGINA))
  const pg = Math.min(pagina, paginas - 1)
  const pagVisibles = visibles.slice(pg * POR_PAGINA, (pg + 1) * POR_PAGINA)
  const descripcionFiltro = filtro ? `${etiquetaEstado(filtro.estado)}${filtro.tarea ? ` · ${TAREAS[filtro.tarea].etiqueta}` : ''}` : null

  // ---- Exportaciones (cada una en su propio botón: Chrome en celular bloquea varias descargas de un toque) ----
  const hoy = r.hoy
  // Un solo CSV general: una fila por hogar, mantenimiento o falla (se filtra por la columna «tipo» al abrirlo en Excel).
  function exportarCSV() {
    const filas = [
      ...r.filas.map((f) => ({
        tipo: 'hogar',
        codigo: f.h.codigo,
        detalle: `${f.h.registrado ? 'registrado' : 'sin registrar'} · fallas abiertas: ${f.fallas}`,
        fecha: f.h.fechaInstalacion ?? '',
        estado: f.general,
      })),
      ...r.mantenimientos.map((m) => ({ tipo: 'mantenimiento', codigo: m.codigo, detalle: TAREAS[m.tipo].etiqueta, fecha: m.fecha, estado: '' })),
      ...r.reportes.map((x) => ({
        tipo: 'falla',
        codigo: x.codigo,
        detalle: TIPOS_FALLA[x.tipo].etiqueta + (x.conFoto ? ' (con foto)' : ''),
        fecha: x.fecha.slice(0, 10),
        estado: x.estado,
      })),
    ].sort((a, b) => a.codigo.localeCompare(b.codigo) || a.tipo.localeCompare(b.tipo) || a.fecha.localeCompare(b.fecha))
    descargarCSV(
      nombreArchivo('aquacheck_datos', 'csv', hoy),
      aCSV(
        ['tipo', 'codigo', 'detalle', 'fecha', 'estado'].map((c) => ({ titulo: c, valor: (x) => x[c] })),
        filas,
      ),
    )
  }
  const exportarExcel = () => descargarBinario(nombreArchivo('aquacheck_informe', 'xlsx', hoy), construirExcel(r), MIME_XLSX)
  const exportarWord = () => descargarBinario(nombreArchivo('aquacheck_informe', 'docx', hoy), construirWord(r), MIME_DOCX)
  const exportarPDF = () => descargarBinario(nombreArchivo('aquacheck_informe', 'pdf', hoy), construirPDF(r), MIME_PDF)

  const datosDonut = ESTADOS.map((e) => ({ ...e, valor: r.porEstado[e.id] }))

  return (
    <Pantalla
      titulo="Panel del equipo"
      volver="#/"
      sinPie
      ancho
      acciones={
        <button type="button" className="btn-mini" data-guia="actualizar" onClick={() => cargarEquipo()} title="Se actualiza solo cada 2 segundos">
          {estado.cargando ? 'Actualizando…' : <><Icono nombre="actualizar" /> Actualizar</>}
        </button>
      }
    >
      {estado.error && (
        <p className="error" role="alert">
          {estado.error}
        </p>
      )}
      <section className="indicadores" data-guia="indicadores" aria-label="Indicadores del piloto">
        <div className="indicador">
          <strong>
            {r.registrados}/{r.total}
          </strong>
          <span>filtros registrados</span>
        </div>
        <div className="indicador">
          <strong>{r.pctAlDia}%</strong>
          <span>al día</span>
        </div>
        <div className="indicador">
          <strong>{r.conTareaPendiente}</strong>
          <span>con tarea próxima o pendiente</span>
        </div>
        <div className="indicador">
          <strong>{r.abiertas.length}</strong>
          <span>fallas abiertas</span>
        </div>
      </section>

      <nav className="pestanas" data-guia="pestanas" role="tablist" aria-label="Secciones del panel">
        {[['resumen', 'Resumen'], ['hogares', 'Hogares'], ['fallas', 'Fallas'], ['informes', 'Informes']].map(([id, texto]) => (
          <button key={id} type="button" role="tab" className="pestana" aria-selected={vista === id} onClick={() => setVista(id)}>
            {texto}
            {id === 'fallas' && r.abiertas.length > 0 ? <span className="insignia">{r.abiertas.length}</span> : null}
          </button>
        ))}
      </nav>


      {vista === 'resumen' && (

      <section className="graficos" data-guia="graficos" aria-label="Gráficos del piloto">
        <article className="tarjeta grafico">
          <h2>Hogares por estado</h2>
          <p className="suave">Toca un estado para filtrar la tabla.</p>
          <Donut datos={datosDonut} seleccionado={filtro && !filtro.tarea ? filtro.estado : null} onSeleccionar={(id) => aplicarFiltro(id ? { estado: id, tarea: null } : null)} />
        </article>

        <article className="tarjeta grafico">
          <h2>Cumplimiento por tarea</h2>
          <p className="suave">Toca un tramo para ver esos hogares.</p>
          <BarrasPorTarea filas={r.porTarea} seleccion={filtro?.tarea ? filtro : null} onSeleccionar={aplicarFiltro} />
        </article>

        <article className="tarjeta grafico grafico-ancho">
          <h2>Mantenimientos por semana</h2>
          <p className="suave">Últimas 8 semanas (bloques de 7 días). Bajo cada barra: el día en que empieza.</p>
          <BarrasSemanales semanas={r.semanas} />
        </article>

        <article className="tarjeta grafico">
          <h2>Fallas por tipo</h2>
          <p className="suave">Abiertas y resueltas.</p>
          <BarrasFallas tipos={r.fallasPorTipo} />
        </article>
      </section>
      )}

      <div className="equipo-una" ref={tablaRef}>
          {vista === 'hogares' && (
          <section className="tarjeta">
            <h2>Hogares ({visibles.length}{visibles.length !== r.total ? ` de ${r.total}` : ''})</h2>

            <div className="filtros-barra">
              <div className="filtros" role="group" aria-label="Filtrar por estado">
                <button type="button" className="filtro-chip" aria-pressed={!filtro} onClick={() => cambiarFiltro(null)}>
                  Todos
                </button>
                {ESTADOS.map((e) => (
                  <button key={e.id} type="button" className="filtro-chip" aria-pressed={!!filtro && !filtro.tarea && filtro.estado === e.id} onClick={() => cambiarFiltro({ estado: e.id, tarea: null })}>
                    <span className="punto" style={{ background: e.color }} aria-hidden="true" /> {e.etiqueta}
                  </button>
                ))}
              </div>
              <div className="buscar-grupo">
              <input type="search" className="buscador" placeholder="Buscar" aria-label="Buscar filtro por código" value={busqueda} onChange={(e) => {
                  setBusqueda(e.target.value)
                  setPagina(0)
                }} />
              {!confirmandoNuevo ? (
                  <button type="button" className="btn-mini btn-mini-principal" data-guia="agregar-hogar" disabled={!siguienteCodigo()} onClick={() => { setErrorNuevo(null); setConfirmandoNuevo(true) }}>
                    <Icono nombre="agregar" /> Agregar hogar
                  </button>
                ) : (
                  <div className="confirmar-nuevo" role="group" aria-label="Confirmar nuevo hogar">
                    <span>
                      ¿Crear <strong>{siguienteCodigo()}</strong>?
                    </span>
                    <button type="button" className="btn-mini btn-mini-principal" disabled={creando} onClick={crear}>
                      {creando ? 'Creando…' : 'Sí, crear'}
                    </button>
                    <button type="button" className="btn-mini" disabled={creando} onClick={() => setConfirmandoNuevo(false)}>
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
            {errorNuevo && (
              <p className="error" role="alert">
                {errorNuevo}
              </p>
            )}
            {descripcionFiltro && (
              <p className="filtro-activo" role="status">
                Mostrando: <strong>{descripcionFiltro}</strong>{' '}
                <button type="button" className="enlace-boton" onClick={() => cambiarFiltro(null)}>
                  Quitar filtro
                </button>
              </p>
            )}

            <div className="tabla-contenedor">
              <table className="tabla tabla-hogares">
                <thead>
                  <tr>
                    <th>Filtro</th>
                    <th>Estado</th>
                    <th>Próxima tarea</th>
                    <th>Celular</th>
                    <th>Fallas</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.length === 0 && (
                    <tr>
                      <td colSpan="6" className="suave">
                        Ningún hogar coincide con el filtro.
                      </td>
                    </tr>
                  )}
                  {pagVisibles.map((f) => {
                    const aviso = f.general === 'pronto' || f.general === 'vencido' ? mensajeAviso(f.h.codigo, f.tareas) : null
                    const contacto = obtenerContacto(f.h.codigo)
                    const cel = contacto?.celular
                    // Los celulares de los filtros de ejemplo son ficticios: no se abre un chat con ellos (podrían ser de otra persona).
                    const esEjemplo = contacto?.consentimiento?.version === 'datos-de-prueba' || /^900/.test(cel ?? '') // 900… = número ficticio de prueba
                    const enlaceWhatsApp = aviso ? `https://wa.me/${esEjemplo ? '' : '51' + cel}?text=${encodeURIComponent(aviso)}` : null
                    const color = ESTADOS.find((e) => e.id === f.general)?.color
                    return (
                      <tr key={f.h.codigo}>
                        <td>
                          <a href={'#/equipo/hogar/' + f.h.codigo}>{f.h.codigo}</a>
                        </td>
                        <td data-label="Estado">
                          <span className="punto" style={{ background: f.general === 'sinregistrar' ? '#fff' : color, border: f.general === 'sinregistrar' ? '2px solid #8aa0b3' : 'none' }} aria-hidden="true" /> {etiquetaEstado(f.general)}
                        </td>
                        <td data-label="Próxima tarea">{f.h.registrado && f.siguiente ? `${TAREAS[f.siguiente.tipo].etiqueta}: ${textoDias(f.siguiente.dias).toLowerCase()}` : '—'}</td>
                        <td data-label="Celular">{enmascarar(cel)}</td>
                        <td data-label="Fallas abiertas">{f.fallas || '—'}</td>
                        <td className="acciones">
                          {aviso && cel && (
                            <a className="btn-mini" href={enlaceWhatsApp} target="_blank" rel="noopener noreferrer" aria-label={`Avisar por WhatsApp al filtro ${f.h.codigo}`} title="Avisar por WhatsApp">
                              WhatsApp
                            </a>
                          )}
                          <a className="btn-mini" href={'#/equipo/hogar/' + f.h.codigo} aria-label={'Ver el filtro ' + f.h.codigo} title="Ver cómo va este hogar">
                            Ver
                          </a>
                          <a className="btn-mini" href={'#/equipo/ficha/' + f.h.codigo}>
                            Ficha
                          </a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="paginacion" role="navigation" aria-label="Páginas de hogares">
              <button type="button" className="btn-mini btn-flecha" disabled={pg === 0} onClick={() => setPagina(pg - 1)} aria-label="Página anterior">
                <Icono nombre="izquierda" tam={20} />
              </button>
              <span aria-live="polite">
                {pg + 1} de {paginas}
              </span>
              <button type="button" className="btn-mini btn-flecha" disabled={pg >= paginas - 1} onClick={() => setPagina(pg + 1)} aria-label="Página siguiente">
                <Icono nombre="derecha" tam={20} />
              </button>
            </div>
          </section>
          )}

          {vista === 'fallas' && (
          <section className="tarjeta fallas-panel">
            <h2>Fallas reportadas</h2>
            {r.reportes.length === 0 ? (
              <p className="suave">Aún no hay reportes.</p>
            ) : (
              <ul className="fallas">
                {fallasVisibles.map((x) => {
                  const foto = x.conFoto ? fotoPanel(x.id) : null
                  return (
                    <li key={x.id} className={x.estado === 'abierta' ? 'falla-abierta' : 'falla-resuelta'}>
                      <span className="tarea-icono" aria-hidden="true">
                        <Icono nombre={TIPOS_FALLA[x.tipo].icono} />
                      </span>
                      <div className="falla-texto">
                        <p className="tarea-nombre">
                          {x.codigo} · {TIPOS_FALLA[x.tipo].etiqueta}
                        </p>
                        <p className="suave">
                          {formatoFecha(x.fecha.slice(0, 10))} · {x.estado === 'abierta' ? 'Abierta' : 'Resuelta'}
                        </p>
                      </div>
                      {foto && <img className="foto-mini" src={foto} alt={`Foto del reporte de ${x.codigo}`} />}
                      {x.estado === 'abierta' && (
                        <button type="button" className="btn-mini" onClick={() => marcarReporteResuelto(x.id)}>
                          Marcar resuelta
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
            {paginasFallas > 1 && (
              <div className="paginacion" role="navigation" aria-label="Páginas de fallas">
                <button type="button" className="btn-mini btn-flecha" disabled={pgF === 0} onClick={() => setPaginaFallas(pgF - 1)} aria-label="Página anterior">
                  <Icono nombre="izquierda" tam={20} />
                </button>
                <span aria-live="polite">
                  {pgF + 1} de {paginasFallas}
                </span>
                <button type="button" className="btn-mini btn-flecha" disabled={pgF >= paginasFallas - 1} onClick={() => setPaginaFallas(pgF + 1)} aria-label="Página siguiente">
                  <Icono nombre="derecha" tam={20} />
                </button>
              </div>
            )}
          </section>
          )}

          {vista === 'informes' && (
          <section className="tarjeta informes">
            <h2>Informes y descargas</h2>
            <p className="suave">Se generan en este dispositivo y no incluyen celulares ni fotos.</p>
            <div className="descargas">
              <button type="button" className="descarga" onClick={exportarExcel}>
                <Icono nombre="excel" tam={30} />
                <strong>Excel</strong>
                <span>.xlsx · 7 hojas</span>
              </button>
              <button type="button" className="descarga" onClick={exportarWord}>
                <Icono nombre="word" tam={30} />
                <strong>Word</strong>
                <span>Informe .docx</span>
              </button>
              <button type="button" className="descarga" onClick={exportarPDF}>
                <Icono nombre="pdf" tam={30} />
                <strong>PDF</strong>
                <span>Con gráficos</span>
              </button>
              <button type="button" className="descarga" onClick={exportarCSV}>
                <Icono nombre="csv" tam={30} />
                <strong>CSV</strong>
                <span>Datos en una tabla</span>
              </button>
              <a className="descarga" href="#/equipo/fichas">
                <Icono nombre="imprimir" tam={30} />
                <strong>Imprimir</strong>
                <span>Fichas con QR</span>
              </a>
            </div>
          </section>
          )}
      </div>
      <BotonAyuda alAbrir={() => setGuia(true)} />
      {guia && <Guia alCerrar={() => setGuia(false)} pasos={PASOS_EQUIPO} />}
    </Pantalla>
  )
}

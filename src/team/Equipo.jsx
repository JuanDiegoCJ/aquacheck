import { useRef, useState } from 'react'
import Pantalla from '../components/Pantalla.jsx'
import { Donut, BarrasPorTarea, BarrasSemanales, BarrasFallas } from '../components/Graficos.jsx'
import {
  useDatos,
  fotoPanel,
  entrarEquipoReal,
  estadoDelPanel,
  cargarEquipo,
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

  function aplicarFiltro(f) {
    setFiltro(f)
    if (f) tablaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
  const descripcionFiltro = filtro ? `${etiquetaEstado(filtro.estado)}${filtro.tarea ? ` · ${TAREAS[filtro.tarea].etiqueta}` : ''}` : null

  // ---- Exportaciones (cada una en su propio botón: Chrome en celular bloquea varias descargas de un toque) ----
  const hoy = r.hoy
  function exportarHogares() {
    descargarCSV(
      nombreArchivo('aquacheck_hogares', 'csv', hoy),
      aCSV(
        [
          { titulo: 'codigo', valor: (f) => f.h.codigo },
          { titulo: 'registrado', valor: (f) => (f.h.registrado ? 'si' : 'no') },
          { titulo: 'fecha_instalacion', valor: (f) => f.h.fechaInstalacion },
          { titulo: 'estado', valor: (f) => f.general },
          ...['limpieza_filtro', 'cambio_cartucho', 'limpieza_tanque'].map((t, i) => ({ titulo: `dias_para_${t}`, valor: (f) => f.tareas[i]?.dias })),
          { titulo: 'fallas_abiertas', valor: (f) => f.fallas },
        ],
        r.filas,
      ),
    )
  }
  function exportarMantenimientos() {
    descargarCSV(
      nombreArchivo('aquacheck_mantenimientos', 'csv', hoy),
      aCSV(
        [
          { titulo: 'codigo', valor: (m) => m.codigo },
          { titulo: 'tarea', valor: (m) => TAREAS[m.tipo].etiqueta },
          { titulo: 'fecha', valor: (m) => m.fecha },
        ],
        [...r.mantenimientos].sort((a, b) => a.fecha.localeCompare(b.fecha)),
      ),
    )
  }
  function exportarFallas() {
    descargarCSV(
      nombreArchivo('aquacheck_fallas', 'csv', hoy),
      aCSV(
        [
          { titulo: 'codigo', valor: (x) => x.codigo },
          { titulo: 'tipo', valor: (x) => TIPOS_FALLA[x.tipo].etiqueta },
          { titulo: 'fecha', valor: (x) => x.fecha.slice(0, 10) },
          { titulo: 'estado', valor: (x) => x.estado },
          { titulo: 'con_foto', valor: (x) => (x.conFoto ? 'si' : 'no') },
        ],
        r.reportes,
      ),
    )
  }
  const exportarExcel = () => descargarBinario(nombreArchivo('aquacheck_informe', 'xlsx', hoy), construirExcel(r), MIME_XLSX)
  const exportarWord = () => descargarBinario(nombreArchivo('aquacheck_informe', 'docx', hoy), construirWord(r), MIME_DOCX)
  const exportarPDF = () => descargarBinario(nombreArchivo('aquacheck_informe', 'pdf', hoy), construirPDF(r), MIME_PDF)

  const datosDonut = ESTADOS.map((e) => ({ ...e, valor: r.porEstado[e.id] }))

  return (
    <Pantalla titulo="Panel del equipo" volver="#/" sinPie ancho>
      <p className="suave" role="status">
        Datos del piloto (Supabase). Se actualiza solo cada pocos segundos. {estado.cargando ? 'Actualizando…' : ''}{' '}
        <button type="button" className="enlace-boton" onClick={() => cargarEquipo()}>
          Actualizar
        </button>
      </p>
      {estado.error && (
        <p className="error" role="alert">
          {estado.error}
        </p>
      )}
      <section className="indicadores" aria-label="Indicadores del piloto">
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

      <section className="graficos" aria-label="Gráficos del piloto">
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

        <article className="tarjeta grafico">
          <h2>Mantenimientos por semana</h2>
          <p className="suave">Últimas 8 semanas.</p>
          <BarrasSemanales semanas={r.semanas} />
        </article>

        <article className="tarjeta grafico">
          <h2>Fallas por tipo</h2>
          <p className="suave">Abiertas y resueltas.</p>
          <BarrasFallas tipos={r.fallasPorTipo} />
        </article>
      </section>

      <div className="equipo-cols">
        <div className="equipo-main" ref={tablaRef}>
          <section className="tarjeta">
            <h2>Hogares ({visibles.length}{visibles.length !== r.total ? ` de ${r.total}` : ''})</h2>

            <div className="filtros-barra">
              <div className="filtros" role="group" aria-label="Filtrar por estado">
                <button type="button" className="filtro-chip" aria-pressed={!filtro} onClick={() => setFiltro(null)}>
                  Todos
                </button>
                {ESTADOS.map((e) => (
                  <button key={e.id} type="button" className="filtro-chip" aria-pressed={!!filtro && !filtro.tarea && filtro.estado === e.id} onClick={() => setFiltro({ estado: e.id, tarea: null })}>
                    <span className="punto" style={{ background: e.color }} aria-hidden="true" /> {e.etiqueta}
                  </button>
                ))}
              </div>
              <input type="search" className="buscador" placeholder="Buscar filtro (AQ-007)" aria-label="Buscar filtro por código" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>
            {descripcionFiltro && (
              <p className="filtro-activo" role="status">
                Mostrando: <strong>{descripcionFiltro}</strong>{' '}
                <button type="button" className="enlace-boton" onClick={() => setFiltro(null)}>
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
                  {visibles.map((f) => {
                    const aviso = f.general === 'pronto' || f.general === 'vencido' ? mensajeAviso(f.h.codigo, f.tareas) : null
                    const contacto = obtenerContacto(f.h.codigo)
                    const cel = contacto?.celular
                    // Los celulares de los filtros de ejemplo son ficticios: no se abre un chat con ellos (podrían ser de otra persona).
                    const esEjemplo = contacto?.consentimiento?.origen === 'datos de ejemplo'
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
                            👁 Ver
                          </a>
                          <a className="btn-mini" href={rutaFiltro(f.h.codigo, 'ficha')}>
                            Ficha
                          </a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="suave">
              El botón de WhatsApp abre el mensaje ya escrito para que el equipo lo envíe (semiautomático). En los filtros de ejemplo no se usa el número
              (es ficticio): WhatsApp te deja elegir a quién enviarlo, por ejemplo a tu propio chat. En el piloto real se puede automatizar con la API de
              WhatsApp.
            </p>
          </section>
        </div>

        <aside className="equipo-lado">
          <section className="tarjeta">
            <h2>Fallas reportadas</h2>
            {r.reportes.length === 0 ? (
              <p className="suave">Aún no hay reportes.</p>
            ) : (
              <ul className="fallas">
                {r.reportes.map((x) => {
                  const foto = x.conFoto ? fotoPanel(x.id) : null
                  return (
                    <li key={x.id} className={x.estado === 'abierta' ? 'falla-abierta' : 'falla-resuelta'}>
                      <span className="tarea-icono" aria-hidden="true">
                        {TIPOS_FALLA[x.tipo].icono}
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
          </section>

          <section className="tarjeta">
            <h2>Informes y descargas</h2>
            <p className="suave">Se generan en este dispositivo y no incluyen celulares ni fotos.</p>
            <button type="button" className="btn btn-principal" onClick={exportarExcel}>
              📊 Excel (.xlsx) · 7 hojas
            </button>
            <button type="button" className="btn btn-principal" onClick={exportarWord}>
              📝 Informe en Word (.docx)
            </button>
            <button type="button" className="btn btn-principal" onClick={exportarPDF}>
              📄 Informe en PDF (con gráficos)
            </button>
            <a className="enlace-discreto" href="#/equipo/informe">
              Ver el informe en pantalla
            </a>
            <p className="suave grupo-titulo">Archivos CSV (se abren en Excel)</p>
            <div className="par-botones tres">
              <button type="button" className="btn btn-secundario" onClick={exportarHogares}>
                Hogares
              </button>
              <button type="button" className="btn btn-secundario" onClick={exportarMantenimientos}>
                Mantenimientos
              </button>
              <button type="button" className="btn btn-secundario" onClick={exportarFallas}>
                Fallas
              </button>
            </div>
            <a className="btn btn-secundario" href="#/equipo/fichas">
              🖨️ Fichas de todos los filtros
            </a>
            <button type="button" className="btn btn-secundario" onClick={salirEquipo}>
              Salir del panel del equipo
            </button>
          </section>
        </aside>
      </div>
    </Pantalla>
  )
}

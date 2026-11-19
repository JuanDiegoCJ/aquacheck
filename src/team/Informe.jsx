import { Icono } from '../components/Iconos.jsx'
import Pantalla from '../components/Pantalla.jsx'
import { Donut, BarrasPorTarea, BarrasSemanales, BarrasFallas } from '../components/Graficos.jsx'
import { TAREAS, textoDias, formatoFecha } from '../domain/reglas.js'
import { TIPOS_FALLA } from '../domain/fallas.js'
import { calcularResumen, ESTADOS, etiquetaEstado } from './resumen.js'
import { useDatos } from '../data/repo.js'
import { construirPDF, MIME_PDF } from '../data/pdf.js'
import { descargarBinario, nombreArchivo } from '../data/exportar.js'

/** Informe imprimible: se guarda como PDF desde el diálogo de impresión del navegador (funciona sin internet). */
export default function Informe() {
  useDatos()
  const r = calcularResumen()
  const datosDonut = ESTADOS.map((e) => ({ ...e, valor: r.porEstado[e.id] }))

  return (
    <Pantalla titulo="Informe del piloto" volver="#/equipo" sinPie ancho>
      <div className="informe">
        <button
          type="button"
          className="btn btn-principal sin-imprimir"
          onClick={() => descargarBinario(nombreArchivo('aquacheck_informe', 'pdf', r.hoy), construirPDF(r), MIME_PDF)}
        >
          <Icono nombre="pdf" /> Descargar el informe en PDF
        </button>
        <button type="button" className="btn btn-secundario sin-imprimir" onClick={() => window.print()}>
          <Icono nombre="imprimir" /> Imprimir esta vista
        </button>

        <header className="informe-cab">
          <p className="ficha-marca">
            <Icono nombre="marca" /> AquaCheck
          </p>
          <h2>Informe del piloto · Moche, Trujillo</h2>
          <p>Generado el {formatoFecha(r.hoy)} · Desafío UPAO 2026</p>
        </header>

        <section className="indicadores">
          <div className="indicador">
            <strong>
              {r.registrados}/{r.total}
            </strong>
            <span>hogares registrados</span>
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

        <section className="graficos informe-graficos">
          <article className="tarjeta grafico">
            <h2>Hogares por estado</h2>
            <Donut datos={datosDonut} />
          </article>
          <article className="tarjeta grafico">
            <h2>Cumplimiento por tarea</h2>
            <BarrasPorTarea filas={r.porTarea} />
          </article>
          <article className="tarjeta grafico">
            <h2>Mantenimientos por semana</h2>
            <BarrasSemanales semanas={r.semanas} />
          </article>
          <article className="tarjeta grafico">
            <h2>Fallas por tipo</h2>
            <BarrasFallas tipos={r.fallasPorTipo} />
          </article>
        </section>

        <section className="tarjeta">
          <h2>Hogares</h2>
          <table className="tabla">
            <thead>
              <tr>
                <th>Hogar</th>
                <th>Estado</th>
                <th>Próxima tarea</th>
                <th>Fallas abiertas</th>
              </tr>
            </thead>
            <tbody>
              {r.filas.map((f) => (
                <tr key={f.h.codigo}>
                  <td>{f.h.codigo}</td>
                  <td>{etiquetaEstado(f.general)}</td>
                  <td>{f.h.registrado && f.siguiente ? `${TAREAS[f.siguiente.tipo].etiqueta}: ${textoDias(f.siguiente.dias).toLowerCase()}` : '—'}</td>
                  <td>{f.fallas || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {r.reportes.length > 0 && (
          <section className="tarjeta">
            <h2>Fallas reportadas</h2>
            <table className="tabla">
              <thead>
                <tr>
                  <th>Hogar</th>
                  <th>Problema</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {r.reportes.map((x) => (
                  <tr key={x.id}>
                    <td>{x.codigo}</td>
                    <td>{TIPOS_FALLA[x.tipo].etiqueta}</td>
                    <td>{formatoFecha(x.fecha.slice(0, 10))}</td>
                    <td>{x.estado === 'abierta' ? 'Abierta' : 'Resuelta'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <p className="suave informe-nota">
          AquaCheck no mide la calidad del agua ni certifica que sea potable. Los datos corresponden al dispositivo desde el que se generó este informe
          (prototipo sin servidor) y no incluyen celulares ni fotos. Los intervalos de mantenimiento son valores de referencia, pendientes de confirmar
          con el fabricante.
        </p>
      </div>
    </Pantalla>
  )
}

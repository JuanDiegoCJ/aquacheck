import { Icono } from '../components/Iconos.jsx'
import Pantalla from '../components/Pantalla.jsx'
import { useDatos, listarMantenimientos, listarReportes } from '../data/repo.js'
import { TAREAS, formatoFecha } from '../domain/reglas.js'
import { TIPOS_FALLA } from '../domain/fallas.js'
import { rutaFiltro } from '../app/ruta.js'

export default function Historial({ hogar }) {
  useDatos()
  const lista = listarMantenimientos(hogar.codigo)
  const reportes = listarReportes(hogar.codigo)

  return (
    <Pantalla titulo="Historial" volver={rutaFiltro(hogar.codigo)}>
      <p className="suave">Filtro {hogar.codigo} · instalado el {formatoFecha(hogar.fechaInstalacion)}</p>

      {lista.length === 0 ? (
        <div className="tarjeta vacio">
          <p>Todavía no hay mantenimientos registrados.</p>
          <a className="btn btn-principal" href={rutaFiltro(hogar.codigo, 'mantenimiento')}>
            Registrar el primero
          </a>
        </div>
      ) : (
        <ol className="historial">
          {lista.map((m) => (
            <li key={m.id}>
              <span className="tarea-icono" aria-hidden="true">
                <Icono nombre={TAREAS[m.tipo].icono} />
              </span>
              <div>
                <p className="tarea-nombre">{TAREAS[m.tipo].etiqueta}</p>
                <p className="suave">{formatoFecha(m.fecha)}</p>
              </div>
            </li>
          ))}
        </ol>
      )}

      {reportes.length > 0 && (
        <>
          <h2 className="subtitulo">Problemas reportados</h2>
          <ol className="historial">
            {reportes.map((r) => (
              <li key={r.id}>
                <span className="tarea-icono" aria-hidden="true">
                  <Icono nombre={TIPOS_FALLA[r.tipo].icono} />
                </span>
                <div>
                  <p className="tarea-nombre">{TIPOS_FALLA[r.tipo].etiqueta}</p>
                  <p className="suave">
                    {formatoFecha(r.fecha.slice(0, 10))} · {r.estado === 'abierta' ? 'En revisión' : 'Resuelto'}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
    </Pantalla>
  )
}

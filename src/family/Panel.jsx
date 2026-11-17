import Pantalla from '../components/Pantalla.jsx'
import Semaforo from '../components/Semaforo.jsx'
import { useDatos, listarMantenimientos } from '../data/repo.js'
import { TAREAS, resumenHogar, textoDias, formatoFecha, mensajeAviso } from '../domain/reglas.js'
import { rutaFiltro } from '../app/ruta.js'

export default function Panel({ hogar }) {
  useDatos()
  const { tareas, general } = resumenHogar(hogar, listarMantenimientos(hogar.codigo))
  const aviso = mensajeAviso(hogar.codigo, tareas)

  return (
    <Pantalla titulo={`Mi filtro ${hogar.codigo}`} volver="#/" doble>
      <div className="cols">
        <div className="col">
      <Semaforo estado={general} />

      <ul className="tareas">
        {tareas.map((t) => (
          <li key={t.tipo} className={`tarea tarea-${t.estado}`}>
            <span className="tarea-icono" aria-hidden="true">
              {TAREAS[t.tipo].icono}
            </span>
            <div className="tarea-texto">
              <p className="tarea-nombre">{TAREAS[t.tipo].etiqueta}</p>
              <p className="tarea-dias">{textoDias(t.dias)}</p>
              <p className="suave">
                {t.ultima ? `Última vez: ${formatoFecha(t.ultima)}` : `Desde la instalación: ${formatoFecha(hogar.fechaInstalacion)}`}
              </p>
            </div>
          </li>
        ))}
      </ul>

        </div>
        <div className="col">
      <a className="btn btn-principal btn-grande" href={rutaFiltro(hogar.codigo, 'mantenimiento')}>
        ✅ Registrar mantenimiento
      </a>
      <a className="btn btn-secundario" href={rutaFiltro(hogar.codigo, 'historial')}>
        📋 Ver historial
      </a>
      <div className="par-botones">
        <a className="btn btn-secundario" href={rutaFiltro(hogar.codigo, 'falla')}>
          ⚠️ Reportar un problema
        </a>
        <a className="btn btn-secundario" href={rutaFiltro(hogar.codigo, 'corte')}>
          🚰 Si hay corte de agua
        </a>
      </div>

      {aviso && (
        <section className="tarjeta">
          <h2>Así te avisaremos</h2>
          <p className="suave">Vista previa del recordatorio por WhatsApp (en el prototipo es una simulación).</p>
          <div className="whatsapp" aria-label="Vista previa del mensaje de WhatsApp">
            {aviso}
          </div>
        </section>
      )}

      <a className="enlace-discreto" href={rutaFiltro(hogar.codigo, 'ficha')}>
        🖨️ Ficha para imprimir
      </a>
      <a className="enlace-discreto" href={rutaFiltro(hogar.codigo, 'registro')}>
        Actualizar mis datos
      </a>
        </div>
      </div>
    </Pantalla>
  )
}

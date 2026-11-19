import { Icono } from '../components/Iconos.jsx'
import Pantalla from '../components/Pantalla.jsx'
import Semaforo from '../components/Semaforo.jsx'
import { useDatos, hogaresPanel, mantenimientosPanel, reportesPanel, obtenerContacto, fotoPanel } from '../data/repo.js'
import { TAREAS, resumenHogar, textoDias, formatoFecha } from '../domain/reglas.js'
import { TIPOS_FALLA } from '../domain/fallas.js'

/** Vista de SOLO LECTURA de un hogar para el equipo: lo mismo que ve la familia, más su historial, fallas y contacto. */
export default function VerHogar({ codigo }) {
  useDatos()
  const hogar = hogaresPanel().find((h) => h.codigo === codigo)
  if (!hogar) {
    return (
      <Pantalla titulo={`Hogar ${codigo}`} volver="#/equipo" sinPie>
        <div className="tarjeta">
          <p>No hay datos de este filtro todavía.</p>
        </div>
      </Pantalla>
    )
  }
  const mantenimientos = mantenimientosPanel().filter((m) => m.codigo === codigo).sort((a, b) => b.fecha.localeCompare(a.fecha))
  const reportes = reportesPanel().filter((r) => r.codigo === codigo)
  const contacto = obtenerContacto(codigo)
  const { tareas, general } = resumenHogar(hogar, mantenimientos)

  return (
    <Pantalla titulo={`Hogar ${codigo} · vista del equipo`} volver="#/equipo" sinPie ancho>
      <div className="cols">
        <div className="col">
          {hogar.registrado ? (
            <>
              <Semaforo estado={general} />
              <ul className="tareas">
                {tareas.map((t) => (
                  <li key={t.tipo} className={`tarea tarea-${t.estado}`}>
                    <span className="tarea-icono" aria-hidden="true">
                      <Icono nombre={TAREAS[t.tipo].icono} />
                    </span>
                    <div className="tarea-texto">
                      <p className="tarea-nombre">{TAREAS[t.tipo].etiqueta}</p>
                      <p className="tarea-dias">{textoDias(t.dias)}</p>
                      <p className="suave">{t.ultima ? `Última vez: ${formatoFecha(t.ultima)}` : `Desde la instalación: ${formatoFecha(hogar.fechaInstalacion)}`}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="tarjeta">
              <p>
                Esta familia <strong>aún no registró</strong> su filtro.
              </p>
            </div>
          )}
        </div>
        <div className="col">
          <section className="tarjeta">
            <h2>Datos</h2>
            <p className="suave">
              Instalado: {hogar.fechaInstalacion ? formatoFecha(hogar.fechaInstalacion) : '—'}
              <br />
              Celular: {contacto?.celular ?? '—'}
              <br />
              Consentimiento: {contacto?.consentimiento?.version ?? '—'}
            </p>
          </section>
          <section className="tarjeta">
            <h2>Historial de mantenimiento</h2>
            {mantenimientos.length === 0 ? (
              <p className="suave">Sin registros.</p>
            ) : (
              <ul className="historial">
                {mantenimientos.map((m) => (
                  <li key={m.id}>
                    <Icono nombre={TAREAS[m.tipo].icono} /> {TAREAS[m.tipo].etiqueta} · {formatoFecha(m.fecha)}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="tarjeta">
            <h2>Fallas reportadas</h2>
            {reportes.length === 0 ? (
              <p className="suave">Sin reportes.</p>
            ) : (
              <ul className="fallas">
                {reportes.map((x) => {
                  const foto = x.conFoto ? fotoPanel(x.id) : null
                  return (
                    <li key={x.id} className={x.estado === 'abierta' ? 'falla-abierta' : 'falla-resuelta'}>
                      <span className="tarea-icono" aria-hidden="true">
                        <Icono nombre={TIPOS_FALLA[x.tipo].icono} />
                      </span>
                      <div className="falla-texto">
                        <p className="tarea-nombre">{TIPOS_FALLA[x.tipo].etiqueta}</p>
                        <p className="suave">
                          {formatoFecha(x.fecha.slice(0, 10))} · {x.estado === 'abierta' ? 'Abierta' : 'Resuelta'}
                        </p>
                      </div>
                      {foto && <img className="foto-mini" src={foto} alt={`Foto del reporte de ${codigo}`} />}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </Pantalla>
  )
}

import { Icono } from '../components/Iconos.jsx'
import { useState } from 'react'
import Pantalla from '../components/Pantalla.jsx'
import { agregarMantenimiento, quitarMantenimiento } from '../data/repo.js'
import { ORDEN_TAREAS, TAREAS, hoyISO, formatoFecha } from '../domain/reglas.js'
import { rutaFiltro } from '../app/ruta.js'

export default function Mantenimiento({ hogar }) {
  const [tipo, setTipo] = useState(null) // tarea elegida, esperando confirmar
  const [fecha, setFecha] = useState(hoyISO())
  const [cambiarFecha, setCambiarFecha] = useState(false)
  const [guardado, setGuardado] = useState(null) // { id, tipo, fecha }
  const volver = rutaFiltro(hogar.codigo)

  function elegir(t) {
    setTipo(t)
    setFecha(hoyISO())
    setCambiarFecha(false)
  }

  function confirmar() {
    const id = agregarMantenimiento(hogar.codigo, tipo, fecha)
    setGuardado({ id, tipo, fecha })
    setTipo(null)
  }

  function deshacer() {
    quitarMantenimiento(guardado.id)
    setGuardado(null)
  }

  if (guardado) {
    return (
      <Pantalla titulo="¡Listo, quedó guardado!" volver={volver}>
        <div className="tarjeta exito" role="status">
          <p className="exito-icono" aria-hidden="true">
            <Icono nombre="ok" tam={40} />
          </p>
          <p>
            Registramos: <strong>{TAREAS[guardado.tipo].etiqueta}</strong>
            <br />
            Fecha: {formatoFecha(guardado.fecha)}
          </p>
        </div>
        <a className="btn btn-principal btn-grande" href={volver}>
          Ver mi hogar
        </a>
        <button type="button" className="btn btn-secundario" onClick={deshacer}>
          Me equivoqué, deshacer
        </button>
      </Pantalla>
    )
  }

  if (tipo) {
    return (
      <Pantalla titulo="¿Registrar esta tarea?" volver={volver}>
        <div className="tarjeta confirmar">
          <p className="confirmar-icono" aria-hidden="true">
            <Icono nombre={TAREAS[tipo].icono} />
          </p>
          <p>
            <strong>{TAREAS[tipo].boton}</strong>
          </p>
          <p>Fecha: {formatoFecha(fecha)}</p>
          {cambiarFecha ? (
            <div className="campo">
              <label htmlFor="fecha-m">¿Qué día lo hiciste?</label>
              <input id="fecha-m" type="date" max={hoyISO()} min={hogar.fechaInstalacion} value={fecha} onChange={(e) => setFecha(e.target.value || hoyISO())} />
            </div>
          ) : (
            <button type="button" className="enlace-boton" onClick={() => setCambiarFecha(true)}>
              Lo hice otro día
            </button>
          )}
        </div>
        <button type="button" className="btn btn-principal btn-grande" onClick={confirmar}>
          Sí, guardar
        </button>
        <button type="button" className="btn btn-secundario" onClick={() => setTipo(null)}>
          Cancelar
        </button>
      </Pantalla>
    )
  }

  return (
    <Pantalla titulo="¿Qué hiciste?" volver={volver}>
      <p className="suave">Toca el botón de lo que acabas de hacer.</p>
      {ORDEN_TAREAS.map((t) => (
        <button key={t} type="button" className="btn btn-accion btn-grande" onClick={() => elegir(t)}>
          <span aria-hidden="true"><Icono nombre={TAREAS[t].icono} /></span> {TAREAS[t].boton}
        </button>
      ))}
    </Pantalla>
  )
}

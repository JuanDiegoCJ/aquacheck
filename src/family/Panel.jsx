import Pantalla from '../components/Pantalla.jsx'
import Semaforo from '../components/Semaforo.jsx'
import Guia, { BotonAyuda } from '../components/Guia.jsx'
import { useState } from 'react'
import { useDatos, listarMantenimientos, estadoSync } from '../data/repo.js'
import { TAREAS, resumenHogar, textoDias, formatoFecha, mensajeAviso } from '../domain/reglas.js'
import { rutaFiltro } from '../app/ruta.js'

const PASOS_PANEL = [
  { selector: '[data-guia="semaforo"]', titulo: 'Cómo va tu filtro', texto: 'Verde: todo al día. Amarillo: pronto toca una tarea. Rojo: hay una tarea pendiente.' },
  { selector: '[data-guia="tareas"]', titulo: 'Tus tareas', texto: 'Aquí ves cada tarea, cuántos días faltan y la última vez que la hiciste.' },
  { selector: '[data-guia="registrar"]', titulo: 'Registrar mantenimiento', texto: 'Cada vez que limpies o cambies algo, toca este botón, elige la tarea y confirma con “Sí, guardar”.' },
  { selector: '[data-guia="historial"]', titulo: 'Ver historial', texto: 'Todo lo que registraste, con sus fechas. Si te equivocas, puedes deshacer.' },
  { selector: '[data-guia="problemas"]', titulo: 'Problemas y cortes de agua', texto: 'Si el filtro gotea, el agua sale turbia o sale poca, repórtalo con una foto opcional. Si se corta el agua, aquí hay una guía paso a paso.' },
  { selector: '[data-guia="datos"]', titulo: 'Tus datos', texto: 'Aquí puedes actualizar tu fecha de instalación y tu celular.' },
]

export default function Panel({ hogar }) {
  const [guia, setGuia] = useState(false)
  useDatos()
  const { tareas, general } = resumenHogar(hogar, listarMantenimientos(hogar.codigo))
  const aviso = mensajeAviso(hogar.codigo, tareas)
  const sync = estadoSync(hogar.codigo)

  return (
    <Pantalla titulo={`Mi filtro ${hogar.codigo}`} volver="#/" doble>
      <div className="cols">
        <div className="col">
      {sync.error && <p role="alert" className="tarjeta">{sync.error}</p>}
      {sync.real && !sync.error && sync.pendientes > 0 && (
        <p role="status" className="tarjeta">
          Guardado en tu celular. Se enviará cuando tengas internet ({sync.pendientes} pendiente{sync.pendientes > 1 ? 's' : ''}).
        </p>
      )}
      <div data-guia="semaforo">
        <Semaforo estado={general} />
      </div>

      <ul className="tareas" data-guia="tareas">
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
      <a className="btn btn-principal btn-grande" data-guia="registrar" href={rutaFiltro(hogar.codigo, 'mantenimiento')}>
        ✅ Registrar mantenimiento
      </a>
      <a className="btn btn-secundario" data-guia="historial" href={rutaFiltro(hogar.codigo, 'historial')}>
        📋 Ver historial
      </a>
      <div className="par-botones" data-guia="problemas">
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
      <a className="enlace-discreto" data-guia="datos" href={rutaFiltro(hogar.codigo, 'registro')}>
        Actualizar mis datos
      </a>
        </div>
      </div>
      <BotonAyuda alAbrir={() => setGuia(true)} />
      {guia && <Guia alCerrar={() => setGuia(false)} pasos={PASOS_PANEL} />}
    </Pantalla>
  )
}

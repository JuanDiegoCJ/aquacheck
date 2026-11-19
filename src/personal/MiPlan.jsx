import { useState } from 'react'
import { Icono } from '../components/Iconos.jsx'
import Pantalla from '../components/Pantalla.jsx'
import { TriangleAlert, Check, CalendarPlus } from 'lucide-react'
import { descargarICS, enlaceWhatsApp } from './calendario.js'
import { PASOS_CORTE } from '../domain/fallas.js'
import { hoyISO, textoDias, formatoFecha } from '../domain/reglas.js'
import { usePerfil, actualizarPerfil, borrarPerfil } from './almacen.js'
import { CATALOGO, resumenPersonal, litrosTotales, diasDeReserva, diasDeCorte, reservaRestante, consumoDiario, pasosPersonales, textoParaCompartir } from './plan.js'

const TEXTO = {
  aldia: { etiqueta: 'Al día', titulo: 'Todo al día', detalle: 'Tus tareas de mantenimiento van bien.' },
  pronto: { etiqueta: 'Pronto', titulo: 'Pronto toca una tarea', detalle: 'Revisa qué se acerca.' },
  vencido: { etiqueta: 'Pendiente', titulo: 'Hay una tarea pendiente', detalle: 'Hazla y márcala cuando termines.' },
}

const FUENTES_CORTE = ['Aviso de la empresa de agua', 'Lo vi en redes o me lo contaron', 'No sé de dónde viene']

function Semaforo({ estado }) {
  const t = TEXTO[estado]
  const I = estado === 'aldia' ? Check : TriangleAlert
  return (
    <div className={`semaforo semaforo-${estado}`} role="status">
      <div className="semaforo-luz" aria-hidden="true">
        <I size={34} strokeWidth={2.6} />
      </div>
      <div>
        <p className="semaforo-etiqueta">{t.etiqueta}</p>
        <p className="semaforo-titulo">{t.titulo}</p>
        <p className="semaforo-detalle">{t.detalle}</p>
      </div>
    </div>
  )
}

export default function MiPlan() {
  const perfil = usePerfil()
  const [fuente, setFuente] = useState(FUENTES_CORTE[0])
  const [pidiendoCorte, setPidiendoCorte] = useState(false)
  const [confirmaBorrar, setConfirmaBorrar] = useState(false)

  if (!perfil) {
    return (
      <Pantalla titulo="Mi plan de agua" volver="#/">
        <div className="tarjeta">
          <p>Todavía no creaste tu plan. Toma menos de un minuto.</p>
          <a className="btn btn-principal btn-grande" href="#/crear">
            Crear mi plan de agua
          </a>
        </div>
      </Pantalla>
    )
  }

  const hoy = hoyISO()
  const { tareas, general } = resumenPersonal(perfil, hoy)
  const total = litrosTotales(perfil)
  const reserva = diasDeReserva(perfil)
  const enCorte = Boolean(perfil.corte)
  const grupos = pasosPersonales(PASOS_CORTE, perfil)
  const idsVisibles = new Set(grupos.flatMap((g) => g.pasos.map((p) => p.id)))
  const hechos = (perfil.pasos ?? []).filter((id) => idsVisibles.has(id))

  const marcarHecho = (id) =>
    actualizarPerfil((p) => {
      p.tareas[id].ultima = hoyISO()
      p.tareas[id].sinRegistro = false
      return p
    })
  const alternarPaso = (id) =>
    actualizarPerfil((p) => {
      p.pasos = p.pasos.includes(id) ? p.pasos.filter((x) => x !== id) : [...p.pasos, id]
      return p
    })
  const cambiarIntervalo = (id, valor) => {
    const dias = Math.round(Number(valor))
    if (!Number.isFinite(dias) || dias < 1 || dias > 3650) return
    actualizarPerfil((p) => {
      p.tareas[id].cadaDias = dias
      return p
    })
  }
  const restablecerIntervalo = (id) =>
    actualizarPerfil((p) => {
      p.tareas[id].cadaDias = CATALOGO[id].cadaDias
      return p
    })
  const iniciarCorte = () => {
    actualizarPerfil((p) => {
      p.corte = { desde: hoyISO(), fuente }
      return p
    })
    setPidiendoCorte(false)
  }
  const terminarCorte = () =>
    actualizarPerfil((p) => {
      p.corte = null
      return p
    })

  return (
    <Pantalla titulo="Mi plan de agua" volver="#/" doble>
      <div className="cols">
        <div className="col">
          {tareas.length > 0 && <Semaforo estado={general} />}

          <section className="tarjeta" aria-labelledby="t-reserva">
            <h2 id="t-reserva">{enCorte ? 'Tu reserva durante el corte' : 'Tu reserva de agua'}</h2>
            {total > 0 ? (
              <>
                <p className="semaforo-titulo">
                  {enCorte ? `Te quedan unos ${reservaRestante(perfil, hoy)} días` : `Alcanza para unos ${reserva} días`}
                </p>
                <p className="suave">
                  {total} litros guardados para {perfil.personas} {perfil.personas === 1 ? 'persona' : 'personas'} ({consumoDiario(perfil)} litros al día en total, solo para beber y cocinar).
                  Es una estimación: depende de que el agua guardada esté limpia y bien tapada.
                </p>
              </>
            ) : (
              <p className="suave">
                Aún no registraste agua guardada. Guarda agua limpia en recipientes tapados y anota los litros en «Cambiar mis datos».
              </p>
            )}
          </section>

          <section className="tarjeta" aria-labelledby="t-corte">
            <h2 id="t-corte">¿Hay un corte de agua?</h2>
            {enCorte ? (
              <>
                <p>
                  Corte marcado el {formatoFecha(perfil.corte.desde)} (día {diasDeCorte(perfil, hoy) + 1}). Fuente: {perfil.corte.fuente}.
                </p>
                <p className="suave">Confirma siempre la información en el canal oficial de tu empresa de agua.</p>
                <button type="button" className="btn btn-principal" onClick={terminarCorte}>
                  Ya volvió el agua
                </button>
              </>
            ) : pidiendoCorte ? (
              <>
                <label htmlFor="fuente">¿De dónde viene el aviso?</label>
                <select id="fuente" value={fuente} onChange={(e) => setFuente(e.target.value)}>
                  {FUENTES_CORTE.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
                <div className="par-botones">
                  <button type="button" className="btn btn-principal" onClick={iniciarCorte}>
                    Marcar corte
                  </button>
                  <button type="button" className="btn btn-secundario" onClick={() => setPidiendoCorte(false)}>
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="suave">Márcalo para ver cuántos días te alcanza el agua y qué hacer ahora.</p>
                <button type="button" className="btn btn-secundario" onClick={() => setPidiendoCorte(true)}>
                  <Icono nombre="corte" /> Me avisaron de un corte
                </button>
              </>
            )}
          </section>

          {tareas.length > 0 && (
            <ul className="tareas" aria-label="Tareas de mantenimiento">
              {tareas.map((t) => {
                const c = CATALOGO[t.id]
                return (
                  <li key={t.id} className={`tarea tarea-${t.estado}`}>
                    <span className="tarea-icono" aria-hidden="true">
                      <Icono nombre={c.icono} />
                    </span>
                    <div className="tarea-texto">
                      <p className="tarea-nombre">{c.etiqueta}</p>
                      <p className="tarea-dias">{textoDias(t.dias)}</p>
                      <p className="suave">{t.sinRegistro ? 'Última vez: sin registro' : `Última vez: ${formatoFecha(t.ultima)}`}</p>
                      <button type="button" className="btn btn-secundario" onClick={() => marcarHecho(t.id)}>
                        {c.boton} hoy
                      </button>
                      <details className="aviso-detalle">
                        <summary>Cambiar cada cuántos días</summary>
                        <label htmlFor={`dias-${t.id}`}>Repetir cada (días)</label>
                        <input id={`dias-${t.id}`} type="number" inputMode="numeric" min="1" max="3650" value={t.cadaDias} onChange={(e) => cambiarIntervalo(t.id, e.target.value)} />
                        <p className="suave">{c.origen}</p>
                        {t.cadaDias !== c.cadaDias && (
                          <button type="button" className="btn btn-secundario" onClick={() => restablecerIntervalo(t.id)}>
                            Volver al plazo de referencia ({c.cadaDias} días)
                          </button>
                        )}
                      </details>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="col">
          <p className="progreso" role="status">
            {hechos.length} de {idsVisibles.size} pasos de tu preparación
          </p>
          {grupos.map((g, i) => (
            <section key={g.grupo} className="tarjeta" aria-label={g.grupo} style={enCorte && i === 1 ? { outline: '2px solid var(--azul)' } : undefined}>
              <h2>{g.grupo}</h2>
              {g.pasos.map((p) => (
                <label key={p.id} className="casilla paso">
                  <input type="checkbox" checked={hechos.includes(p.id)} onChange={() => alternarPaso(p.id)} />
                  <span>{p.texto}</span>
                </label>
              ))}
            </section>
          ))}

          <p className="aviso">
            AquaCheck no mide ni certifica la calidad del agua. Para beber agua guardada, sigue las indicaciones de salud y de tu empresa de agua.
          </p>

          <section className="tarjeta" aria-labelledby="t-recordar">
            <h2 id="t-recordar">Recordatorios y compartir</h2>
            <p className="suave">
              El calendario de tu celular te avisa, incluso sin internet. Compartir por WhatsApp solo envía el texto que ves aquí, sin tus datos.
            </p>
            {tareas.length > 0 && (
              <button type="button" className="btn btn-secundario" onClick={() => descargarICS(perfil)}>
                <CalendarPlus size={18} aria-hidden="true" /> Añadir recordatorios a mi calendario
              </button>
            )}
            <a className="btn btn-secundario" href={enlaceWhatsApp(textoParaCompartir(perfil, hoy))} target="_blank" rel="noopener noreferrer">
              <Icono nombre="whatsapp" /> Compartir mi plan por WhatsApp
            </a>
          </section>

          <a className="enlace-discreto" href="#/crear">
            Cambiar mis datos
          </a>
          {confirmaBorrar ? (
            <div className="tarjeta" role="alert">
              <p>¿Borrar tu plan de este celular? No se puede deshacer.</p>
              <div className="par-botones">
                <button type="button" className="btn btn-principal" onClick={() => { borrarPerfil(); window.location.hash = '/' }}>
                  Sí, borrar
                </button>
                <button type="button" className="btn btn-secundario" onClick={() => setConfirmaBorrar(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="enlace-discreto" onClick={() => setConfirmaBorrar(true)}>
              Borrar mis datos de este celular
            </button>
          )}
        </div>
      </div>
    </Pantalla>
  )
}

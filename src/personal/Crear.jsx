import { useState } from 'react'
import Pantalla from '../components/Pantalla.jsx'
import { irA } from '../app/ruta.js'
import { usePerfil, guardarPerfil, construirPerfil } from './almacen.js'
import { CATALOGO, TAREAS_DEL_FILTRO, OPCIONES_ULTIMA_VEZ, numero } from './plan.js'

// «Crear mi plan»: sin cuenta, sin código y sin QR. Lo que se escribe aquí no sale del celular.
export default function Crear() {
  const previo = usePerfil()
  const [personas, setPersonas] = useState(previo ? String(previo.personas) : '4')
  const [tanque, setTanque] = useState(previo?.litros?.tanque ? String(previo.litros.tanque) : '')
  const [cisterna, setCisterna] = useState(previo?.litros?.cisterna ? String(previo.litros.cisterna) : '')
  const [bidones, setBidones] = useState(previo?.litros?.bidones ? String(previo.litros.bidones) : '')
  const [tieneFiltro, setTieneFiltro] = useState(previo?.tieneFiltro ?? false)
  const [conEquipo, setConEquipo] = useState(() => new Set(previo ? TAREAS_DEL_FILTRO.filter((id) => previo.tareas[id]) : ['cartuchos']))
  const [ultimaVez, setUltimaVez] = useState({})
  const [intento, setIntento] = useState(false)

  const nPersonas = Math.round(numero(personas))
  const valido = nPersonas >= 1 && nPersonas <= 30
  const guardaAgua = numero(tanque) > 0 || numero(cisterna) > 0
  const tareasElegidas = [...(guardaAgua ? ['tanque'] : []), ...(tieneFiltro ? TAREAS_DEL_FILTRO.filter((id) => conEquipo.has(id)) : [])]

  function alternar(id) {
    const s = new Set(conEquipo)
    if (s.has(id)) s.delete(id)
    else s.add(id)
    setConEquipo(s)
  }

  function enviar(e) {
    e.preventDefault()
    setIntento(true)
    if (!valido) return
    guardarPerfil(
      construirPerfil(
        { personas: nPersonas, tanque: numero(tanque), cisterna: numero(cisterna), bidones: numero(bidones), tieneFiltro, tareasElegidas, ultimaVez },
        previo,
      ),
    )
    irA('/mi-plan')
  }

  const pregunta = (id) => (
    <div className="campo" key={id}>
      <label htmlFor={`ult-${id}`}>{CATALOGO[id].etiqueta}: ¿cuándo fue la última vez?</label>
      <select id={`ult-${id}`} value={ultimaVez[id] ?? (previo?.tareas?.[id] ? 'igual' : 'nose')} onChange={(e) => setUltimaVez({ ...ultimaVez, [id]: e.target.value })}>
        {previo?.tareas?.[id] && <option value="igual">Dejar como está</option>}
        {OPCIONES_ULTIMA_VEZ.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.etiqueta}
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <Pantalla titulo={previo ? 'Cambiar mis datos' : 'Crear mi plan de agua'} volver={previo ? '#/mi-plan' : '#/'}>
      <p className="suave">
        Sin cuenta, sin contraseña y sin QR. Lo que escribas se guarda solo en este celular: no pedimos nombre, dirección ni teléfono.
      </p>

      <form className="tarjeta formulario" onSubmit={enviar} noValidate>
        <div className="campo">
          <label htmlFor="personas">¿Cuántas personas toman agua en tu casa?</label>
          <input id="personas" type="number" inputMode="numeric" min="1" max="30" value={personas} onChange={(e) => setPersonas(e.target.value)} aria-invalid={intento && !valido} />
          {intento && !valido && (
            <p className="error" role="alert">
              Escribe un número entre 1 y 30.
            </p>
          )}
        </div>

        <fieldset className="campo grupo">
          <legend className="etiqueta">¿Dónde guardas agua? (opcional, en litros)</legend>
          <label htmlFor="tanque">Tanque elevado</label>
          <input id="tanque" type="number" inputMode="numeric" min="0" placeholder="Ej.: 1100" value={tanque} onChange={(e) => setTanque(e.target.value)} />
          <label htmlFor="cisterna">Cisterna</label>
          <input id="cisterna" type="number" inputMode="numeric" min="0" placeholder="Ej.: 2000" value={cisterna} onChange={(e) => setCisterna(e.target.value)} />
          <label htmlFor="bidones">Bidones o baldes de 20 litros (cantidad)</label>
          <input id="bidones" type="number" inputMode="numeric" min="0" placeholder="Ej.: 3" value={bidones} onChange={(e) => setBidones(e.target.value)} />
          <p className="suave">Si no guardas agua, déjalo vacío: el plan te dirá cómo prepararte.</p>
        </fieldset>

        <label className="casilla">
          <input type="checkbox" checked={tieneFiltro} onChange={(e) => setTieneFiltro(e.target.checked)} />
          <span>Tengo un filtro o purificador de agua</span>
        </label>

        {tieneFiltro && (
          <fieldset className="campo grupo">
            <legend className="etiqueta">¿Qué partes de tu filtro quieres recordar?</legend>
            {TAREAS_DEL_FILTRO.map((id) => (
              <label className="casilla" key={id}>
                <input type="checkbox" checked={conEquipo.has(id)} onChange={() => alternar(id)} />
                <span>{CATALOGO[id].etiqueta}</span>
              </label>
            ))}
            <p className="suave">Los plazos son una referencia. Después puedes cambiarlos según el manual de tu equipo.</p>
          </fieldset>
        )}

        {tareasElegidas.length > 0 && (
          <fieldset className="campo grupo">
            <legend className="etiqueta">Para calcular tus recordatorios</legend>
            {tareasElegidas.map(pregunta)}
          </fieldset>
        )}

        <button type="submit" className="btn btn-principal btn-grande">
          {previo ? 'Guardar cambios' : 'Ver mi plan'}
        </button>
      </form>
    </Pantalla>
  )
}

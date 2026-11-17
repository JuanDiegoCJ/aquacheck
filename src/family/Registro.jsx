import { useState } from 'react'
import Pantalla from '../components/Pantalla.jsx'
import { guardarRegistro } from '../data/repo.js'
import { hoyISO } from '../domain/reglas.js'
import { irA, rutaFiltro } from '../app/ruta.js'
import { MODELO_FILTRO } from '../data/datos_demo.js'
import { VERSION_CONSENTIMIENTO, TEXTO_CASILLA } from '../domain/consentimiento.js'
import Aviso from '../components/Aviso.jsx'

export default function Registro({ hogar }) {
  const yaRegistrado = hogar.registrado
  const [fecha, setFecha] = useState(hogar.fechaInstalacion ?? hoyISO())
  const [celular, setCelular] = useState('')
  const [acepta, setAcepta] = useState(false)
  const [intento, setIntento] = useState(false)

  const celularLimpio = celular.replace(/\s|-/g, '')
  const celularValido = /^9\d{8}$/.test(celularLimpio)
  const fechaValida = fecha && fecha <= hoyISO()
  const valido = celularValido && fechaValida && acepta

  function enviar(e) {
    e.preventDefault()
    setIntento(true)
    if (!valido) return
    guardarRegistro({
      codigo: hogar.codigo,
      modelo: MODELO_FILTRO,
      fechaInstalacion: fecha,
      celular: celularLimpio,
      consentimiento: { fecha: new Date().toISOString(), version: VERSION_CONSENTIMIENTO, texto: TEXTO_CASILLA },
    })
    irA(rutaFiltro(hogar.codigo).slice(1))
  }

  return (
    <Pantalla titulo={yaRegistrado ? 'Actualizar mis datos' : 'Registrar mi filtro'} volver={yaRegistrado ? rutaFiltro(hogar.codigo) : '#/'}>
      <p className="suave">
        Solo pedimos lo necesario. No pedimos DNI, nombre ni dirección: tu hogar se identifica con el código del filtro.
      </p>

      <form className="tarjeta formulario" onSubmit={enviar} noValidate>
        <div className="campo">
          <span className="etiqueta">Código del filtro</span>
          <p className="valor-fijo">{hogar.codigo}</p>
        </div>

        <div className="campo">
          <span className="etiqueta">Modelo</span>
          <p className="valor-fijo">{MODELO_FILTRO}</p>
        </div>

        <div className="campo">
          <label htmlFor="fecha">¿Cuándo se instaló el filtro?</label>
          <input id="fecha" type="date" max={hoyISO()} value={fecha} onChange={(e) => setFecha(e.target.value)} aria-invalid={intento && !fechaValida} />
          {intento && !fechaValida && (
            <p className="error" role="alert">
              Elige una fecha que no sea futura.
            </p>
          )}
        </div>

        <div className="campo">
          <label htmlFor="celular">Tu celular (para los avisos)</label>
          <input
            id="celular"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="9XX XXX XXX"
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            aria-invalid={intento && !celularValido}
          />
          {intento && !celularValido && (
            <p className="error" role="alert">
              Escribe 9 números, empezando con 9.
            </p>
          )}
        </div>

        <div className="campo consentimiento">
          <label className="casilla">
            <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} />
            <span>{TEXTO_CASILLA}</span>
          </label>
          {intento && !acepta && (
            <p className="error" role="alert">
              Para continuar necesitamos que aceptes.
            </p>
          )}
          <details className="aviso-detalle">
            <summary>Leer el aviso completo sobre tus datos</summary>
            <Aviso />
          </details>
        </div>

        <button type="submit" className="btn btn-principal btn-grande">
          Guardar y ver mi filtro
        </button>
      </form>
    </Pantalla>
  )
}

import { useState } from 'react'
import Pantalla from '../components/Pantalla.jsx'
import Aviso from '../components/Aviso.jsx'
import { Icono } from '../components/Iconos.jsx'
import { FichaHoja } from './Ficha.jsx'
import { urlConClave } from '../components/Qr.jsx'
import { crearMiHogar } from '../data/repo.js'
import { hoyISO } from '../domain/reglas.js'
import { rutaFiltro } from '../app/ruta.js'
import { VERSION_CONSENTIMIENTO, TEXTO_CASILLA } from '../domain/consentimiento.js'

async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    const t = document.createElement('textarea')
    t.value = texto
    t.setAttribute('readonly', '')
    t.style.position = 'fixed'
    t.style.opacity = '0'
    document.body.appendChild(t)
    t.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(t)
    return ok
  }
}

/** Una familia nueva se une sola: llena el formulario y recibe su código y su QR al instante. */
export default function Agregar() {
  const [fecha, setFecha] = useState(hoyISO())
  const [celular, setCelular] = useState('')
  const [acepta, setAcepta] = useState(false)
  const [intento, setIntento] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [listo, setListo] = useState(null) // { codigo, url, celular }
  const [copiado, setCopiado] = useState(null)

  const celularLimpio = celular.replace(/\s|-/g, '')
  const conCelular = celularLimpio !== ''
  const celularValido = !conCelular || /^9\d{8}$/.test(celularLimpio)
  const fechaValida = fecha && fecha <= hoyISO()
  const valido = celularValido && fechaValida && (!conCelular || acepta)

  async function enviar(e) {
    e.preventDefault()
    setIntento(true)
    setError('')
    if (!valido || enviando) return
    setEnviando(true)
    try {
      const { codigo, secreto } = await crearMiHogar({
        fechaInstalacion: fecha,
        celular: conCelular ? celularLimpio : null,
        consentimiento: { version: VERSION_CONSENTIMIENTO, texto: TEXTO_CASILLA },
      })
      setListo({ codigo, url: urlConClave(codigo, secreto), celular: conCelular ? celularLimpio : '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (listo) {
    const mensaje = `Hola, este es tu enlace de AquaCheck para tu hogar ${listo.codigo}. Guárdalo: con él abres tu filtro desde cualquier celular: ${listo.url}`
    // Si dio su celular, el chat se abre directo con su número; si no, WhatsApp deja elegir el chat (por ejemplo, el suyo propio).
    const destino = listo.celular && !/^900/.test(listo.celular) ? '51' + listo.celular : ''
    return (
      <Pantalla titulo="¡Tu casa ya está en AquaCheck!" volver="#/" sinPie>
        <div className="tarjeta" role="status">
          <p>
            Tu código es <strong>{listo.codigo}</strong>. Guarda este enlace o imprime la ficha: con el QR puedes volver a abrir tu filtro desde cualquier celular.
          </p>
          <a className="btn btn-principal btn-grande" href={rutaFiltro(listo.codigo)}>
            Ir a mi filtro
          </a>
        </div>

        <div className="acciones-ficha sin-imprimir">
          <button type="button" className="btn btn-secundario btn-chico" onClick={() => window.print()}>
            <Icono nombre="imprimir" /> Imprimir
          </button>
          <button
            type="button"
            className="btn btn-secundario btn-chico"
            onClick={async () => {
              setCopiado(await copiarTexto(listo.url))
              setTimeout(() => setCopiado(null), 3000)
            }}
          >
            <Icono nombre={copiado ? 'ok' : 'copiar'} /> {copiado ? 'Enlace copiado' : 'Copiar enlace'}
          </button>
          <a className="btn btn-secundario btn-chico" href={`https://wa.me/${destino}?text=${encodeURIComponent(mensaje)}`} target="_blank" rel="noopener noreferrer">
            <Icono nombre="whatsapp" /> {destino ? 'Enviármelo por WhatsApp' : 'Enviar por WhatsApp'}
          </a>
        </div>
        {copiado === false && (
          <p className="error sin-imprimir" role="alert">
            No se pudo copiar. Usa el botón de WhatsApp o imprime la ficha.
          </p>
        )}
        <p className="suave sin-imprimir">Quien tenga este enlace puede abrir y registrar tu filtro: compártelo solo con tu familia.</p>
        <FichaHoja codigo={listo.codigo} url={listo.url} />
      </Pantalla>
    )
  }

  return (
    <Pantalla titulo="Agregar mi casa" volver="#/">
      <p className="suave">
        Únete al programa del equipo: te damos tu código y tu QR al instante, sin que nadie tenga que ir a tu casa. Solo pedimos lo necesario: no pedimos
        DNI, nombre ni dirección.
      </p>

      <form className="tarjeta formulario" onSubmit={enviar} noValidate>
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
          <label htmlFor="celular">Tu celular (opcional, solo si quieres recibir avisos y tu enlace por WhatsApp)</label>
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

        {conCelular ? (
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
        ) : (
          <p className="suave">Puedes unirte sin escribir tu celular: solo no recibirás avisos del equipo.</p>
        )}

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-principal btn-grande" disabled={enviando}>
          {enviando ? 'Creando tu casa…' : 'Agregar mi casa'}
        </button>
      </form>
    </Pantalla>
  )
}

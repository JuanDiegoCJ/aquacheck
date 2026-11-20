import { Icono } from '../components/Iconos.jsx'
import { useCallback, useState } from 'react'
import Pantalla from '../components/Pantalla.jsx'
import Escaner from '../components/Escaner.jsx'
import Guia, { BotonAyuda } from '../components/Guia.jsx'
import { useDatos, miFiltro, esReal } from '../data/repo.js'
import { extraerCodigo } from '../domain/reglas.js'
import { irA, rutaFiltro } from '../app/ruta.js'

const PASOS_PROGRAMA = [
  { selector: '[data-guia="escanear"]', titulo: 'Escanear el QR', texto: 'Toca aquí y apunta la cámara al QR de tu hogar. Se abre tu hogar al instante. También puedes usar la cámara normal del celular.' },
  { selector: '[data-guia="agregar"]', titulo: 'Agregar mi casa', texto: 'Si no tienes QR, toca aquí: llenas un formulario corto y recibes tu código y tu QR al instante, sin que nadie vaya a tu casa.' },
  { selector: '[data-guia="codigo"]', titulo: 'Si no puedes escanear', texto: 'Escribe tu código (por ejemplo AQ-007) si ya abriste tu QR antes en este celular.' },
]

/** Programa con QR: las familias que participan con el equipo (o quieren unirse) entran a su hogar desde aquí. */
export default function Programa() {
  useDatos()
  const [escaneando, setEscaneando] = useState(false)
  const [guia, setGuia] = useState(false)
  const [texto, setTexto] = useState('')
  const [error, setError] = useState('')
  const guardado = miFiltro() && esReal(miFiltro()) ? miFiltro() : null

  // Si el QR (o lo pegado) trae la clave del hogar (?k=…), se conserva para que el hogar se conecte a Supabase.
  const abrir = useCallback((codigo, bruto) => {
    const k = String(bruto ?? '').match(/[?&]k=([A-Za-z0-9_-]{16,128})/)?.[1]
    irA(rutaFiltro(codigo).slice(1) + (k ? `?k=${k}` : ''))
  }, [])

  function enviar(e) {
    e.preventDefault()
    const codigo = extraerCodigo(texto)
    if (!codigo) {
      setError('El código tiene la forma AQ-007 (letras AQ y tres números).')
      return
    }
    setError('')
    abrir(codigo, texto)
  }

  return (
    <Pantalla titulo="Programa con QR" volver="#/">
      <p className="suave">Para las familias que participan en el programa del equipo, o que quieren unirse a él.</p>

      {guardado && (
        <a className="btn btn-principal btn-grande" href={rutaFiltro(guardado)}>
          Ir a mi hogar <strong>{guardado}</strong>
        </a>
      )}

      <button type="button" data-guia="escanear" className={`btn btn-grande ${guardado ? 'btn-secundario' : 'btn-principal'}`} onClick={() => setEscaneando(true)}>
        <Icono nombre="camara" /> Escanear el QR de mi hogar
      </button>

      <a className="btn btn-secundario btn-grande" href="#/agregar" data-guia="agregar">
        Agregar mi casa (no tengo QR)
      </a>

      <form className="tarjeta" onSubmit={enviar} data-guia="codigo">
        <label htmlFor="codigo">¿No puedes escanear? Escribe tu código (si ya abriste tu QR antes)</label>
        <div className="fila">
          <input
            id="codigo"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="AQ-007"
            autoCapitalize="characters"
            autoComplete="off"
            inputMode="text"
            aria-describedby={error ? 'error-codigo' : undefined}
          />
          <button type="submit" className="btn btn-principal">
            Entrar
          </button>
        </div>
        {error && (
          <p id="error-codigo" className="error" role="alert">
            {error}
          </p>
        )}
      </form>

      <BotonAyuda alAbrir={() => setGuia(true)} />
      {guia && <Guia alCerrar={() => setGuia(false)} pasos={PASOS_PROGRAMA} />}
      {escaneando && (
        <Escaner
          alCerrar={() => setEscaneando(false)}
          alLeer={(codigo, bruto) => {
            setEscaneando(false)
            abrir(codigo, bruto)
          }}
        />
      )}
    </Pantalla>
  )
}

import { useCallback, useState } from 'react'
import Pantalla from '../components/Pantalla.jsx'
import Escaner from '../components/Escaner.jsx'
import { Punto } from '../components/Semaforo.jsx'
import { useDatos, miFiltro, esReal } from '../data/repo.js'
import { extraerCodigo, resumenHogar } from '../domain/reglas.js'
import { irA, rutaFiltro } from '../app/ruta.js'

export default function Inicio() {
  useDatos()
  const [escaneando, setEscaneando] = useState(false)
  const [texto, setTexto] = useState('')
  const [error, setError] = useState('')
  const guardado = miFiltro() && esReal(miFiltro()) ? miFiltro() : null

  // Si el QR (o lo pegado) trae la clave del hogar (?k=…), se conserva para que el filtro se conecte a Supabase.
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
    <Pantalla doble>
      <div className="cols">
        <div className="col">
      <section className="portada">
        <img src="./icon.svg" alt="" width="72" height="72" />
        <h1>AquaCheck</h1>
        <p>Te avisamos cuándo limpiar tu filtro y guardamos el historial. Sin contraseñas.</p>
      </section>

      {guardado && (
        <a className="btn btn-principal btn-grande" href={rutaFiltro(guardado)}>
          Ir a mi filtro <strong>{guardado}</strong>
        </a>
      )}

      <button type="button" className={`btn btn-grande ${guardado ? 'btn-secundario' : 'btn-principal'}`} onClick={() => setEscaneando(true)}>
        📷 Escanear el QR de mi filtro
      </button>

      <form className="tarjeta" onSubmit={enviar}>
        <label htmlFor="codigo">¿No puedes escanear? Escribe el código del filtro</label>
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

        </div>
      </div>

      <a className="enlace-discreto" href="#/equipo">
        Soy del equipo del proyecto
      </a>

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

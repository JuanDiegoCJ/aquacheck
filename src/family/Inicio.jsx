import { Icono } from '../components/Iconos.jsx'
import { useCallback, useState } from 'react'
import Pantalla from '../components/Pantalla.jsx'
import Escaner from '../components/Escaner.jsx'
import Guia, { BotonAyuda } from '../components/Guia.jsx'
import { Punto } from '../components/Semaforo.jsx'
import { useDatos, miFiltro, esReal } from '../data/repo.js'
import { extraerCodigo, resumenHogar } from '../domain/reglas.js'
import { irA, rutaFiltro } from '../app/ruta.js'

const PASOS_INICIO = [
  { selector: '[data-guia="escanear"]', titulo: 'Escanear el QR', texto: 'Toca aquí y apunta la cámara al QR pegado en tu filtro. Se abre tu filtro al instante. También puedes usar la cámara normal del celular.' },
  { selector: '[data-guia="codigo"]', titulo: 'Si no puedes escanear', texto: 'Escribe tu código (por ejemplo AQ-007) si ya abriste tu QR antes en este celular, o pega el enlace de tu ficha.' },
  { selector: '[data-guia="nav-acerca"]', titulo: '¿Qué hace AquaCheck?', texto: 'Explica qué hace la app, cómo se usan tus datos y cómo se protege tu privacidad.' },
  { selector: '[data-guia="soy-equipo"]', titulo: 'Equipo del proyecto', texto: 'Solo para el equipo: entra con su correo y contraseña para ver cómo va cada hogar.' },
  { selector: '[data-guia="nav-inicio"]', titulo: 'Inicio', texto: 'Desde cualquier pantalla, este botón te trae de vuelta aquí.' },
]

export default function Inicio() {
  useDatos()
  const [escaneando, setEscaneando] = useState(false)
  const [guia, setGuia] = useState(false)
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
    <Pantalla>
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

      <button type="button" data-guia="escanear" className={`btn btn-grande ${guardado ? 'btn-secundario' : 'btn-principal'}`} onClick={() => setEscaneando(true)}>
        <Icono nombre="camara" /> Escanear el QR de mi filtro
      </button>

      <form className="tarjeta" onSubmit={enviar} data-guia="codigo">
        <label htmlFor="codigo">¿No puedes escanear? Escribe tu código (si ya abriste tu QR antes) o pega el enlace de tu ficha</label>
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



      <a className="enlace-discreto" href="#/equipo" data-guia="soy-equipo">
        Soy del equipo del proyecto
      </a>

      <BotonAyuda alAbrir={() => setGuia(true)} />
      {guia && <Guia alCerrar={() => setGuia(false)} pasos={PASOS_INICIO} />}
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

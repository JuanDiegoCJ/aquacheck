import { Icono } from '../components/Iconos.jsx'
import { useCallback, useState } from 'react'
import Pantalla from '../components/Pantalla.jsx'
import Escaner from '../components/Escaner.jsx'
import Guia, { BotonAyuda } from '../components/Guia.jsx'
import { Punto } from '../components/Semaforo.jsx'
import { useDatos, miFiltro, esReal } from '../data/repo.js'
import { extraerCodigo, resumenHogar } from '../domain/reglas.js'
import { irA, rutaFiltro } from '../app/ruta.js'
import { usePerfil } from '../personal/almacen.js'

const PASOS_INICIO = [
  { selector: '[data-guia="escanear"]', titulo: 'Escanear el QR', texto: 'Toca aquí y apunta la cámara al QR de tu hogar. Se abre tu hogar al instante. También puedes usar la cámara normal del celular.' },
  { selector: '[data-guia="agregar"]', titulo: 'Agregar mi casa', texto: 'Si no tienes QR, toca aquí: llenas un formulario corto y recibes tu código y tu QR al instante, sin que nadie vaya a tu casa.' },
  { selector: '[data-guia="codigo"]', titulo: 'Si no puedes escanear', texto: 'Escribe tu código (por ejemplo AQ-007) si ya abriste tu QR antes en este celular, o pega el enlace de tu ficha.' },
  { selector: '[data-guia="nav-acerca"]', titulo: '¿Qué hace AquaCheck?', texto: 'Al final de la página: explica qué hace la app, cómo se usan tus datos y cómo se protege tu privacidad.' },
  { selector: '[data-guia="nav-equipo"]', titulo: 'Administrador', texto: 'Solo para quien administra el proyecto: entra con su correo y contraseña para ver cómo va cada hogar.' },
  { selector: '[data-guia="nav-inicio"]', titulo: 'Volver al inicio', texto: 'Desde cualquier pantalla, toca el logo de AquaCheck para volver aquí.' },
]

export default function Inicio() {
  useDatos()
  const [escaneando, setEscaneando] = useState(false)
  const [guia, setGuia] = useState(false)
  const [texto, setTexto] = useState('')
  const [error, setError] = useState('')
  const guardado = miFiltro() && esReal(miFiltro()) ? miFiltro() : null
  const plan = usePerfil()

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
        <p>¿Y si se corta el agua? Prepárate y cuida el agua de tu casa: antes, durante y después. Sin cuenta ni contraseña.</p>
      </section>

      <a className="btn btn-principal btn-grande" href={plan ? '#/mi-plan' : '#/crear'}>
        {plan ? 'Ir a mi plan de agua' : 'Crear mi plan de agua'}
      </a>
      <p className="suave" style={{ textAlign: 'center' }}>
        {plan ? 'Tu plan está guardado en este celular.' : 'Toma menos de un minuto y no necesitas QR ni filtro.'}
      </p>

      <h2 className="titulo" style={{ fontSize: '1.05rem' }}>
        ¿Tienes un QR de AquaCheck?
      </h2>

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

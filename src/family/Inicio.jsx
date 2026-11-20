import { Icono } from '../components/Iconos.jsx'
import { useState } from 'react'
import Pantalla from '../components/Pantalla.jsx'
import Guia, { BotonAyuda } from '../components/Guia.jsx'
import { useDatos, miFiltro, esReal } from '../data/repo.js'
import { rutaFiltro } from '../app/ruta.js'
import { usePerfil } from '../personal/almacen.js'

const PASOS_INICIO = [
  { selector: '[data-guia="crear"]', titulo: 'Tu plan de agua', texto: 'Es lo principal: respondes unas preguntas y la app calcula cuántos días te alcanza tu agua y te recuerda el mantenimiento.' },
  { selector: '[data-guia="programa"]', titulo: 'Programa con QR', texto: 'Solo si tu familia participa en el programa del equipo: escanea tu QR o únete desde aquí.' },
  { selector: '[data-guia="nav-acerca"]', titulo: '¿Qué hace AquaCheck?', texto: 'Al final de la página: explica qué hace la app, cómo se usan tus datos y cómo se protege tu privacidad.' },
  { selector: '[data-guia="nav-equipo"]', titulo: 'Administrador', texto: 'Solo para quien administra el proyecto: entra con su correo y contraseña para ver cómo va cada hogar.' },
  { selector: '[data-guia="nav-inicio"]', titulo: 'Volver al inicio', texto: 'Desde cualquier pantalla, toca el logo de AquaCheck para volver aquí.' },
]

const PUNTOS = [
  'Calcula cuántos días te alcanza el agua que guardas.',
  'Te recuerda limpiar el tanque y dar mantenimiento, y lo pone en tu calendario.',
  'Te lleva a los contactos oficiales: SEDALIB, INDECI y SENAMHI.',
]

export default function Inicio() {
  useDatos()
  const [guia, setGuia] = useState(false)
  const guardado = miFiltro() && esReal(miFiltro()) ? miFiltro() : null
  const plan = usePerfil()

  return (
    <Pantalla>
      <section className="portada">
        <img src="./icon.svg" alt="" width="72" height="72" />
        <h1>AquaCheck</h1>
        <p>¿Y si se corta el agua? Prepárate y cuida el agua de tu casa: antes, durante y después. Sin cuenta ni contraseña.</p>
      </section>

      <section className="tarjeta" aria-label="Qué hace AquaCheck">
        <ul className="acerca-lista">
          {PUNTOS.map((t) => (
            <li key={t}>
              <span className="acerca-ico si">
                <Icono nombre="ok" tam={16} />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </section>

      <a className="btn btn-principal btn-grande" href={plan ? '#/mi-plan' : '#/crear'} data-guia="crear">
        {plan ? 'Ir a mi plan de agua' : 'Crear mi plan de agua'}
      </a>
      <p className="suave" style={{ textAlign: 'center' }}>
        {plan ? 'Tu plan está guardado en este celular.' : 'Toma menos de un minuto y no necesitas QR ni filtro.'}
      </p>

      {guardado && (
        <a className="btn btn-secundario btn-grande" href={rutaFiltro(guardado)}>
          Ir a mi hogar <strong>{guardado}</strong>
        </a>
      )}

      <section className="tarjeta tarjeta-programa" aria-labelledby="t-programa">
        <h2 id="t-programa">¿Participas en el programa con QR?</h2>
        <p className="suave">Para las familias del programa del equipo, o que quieren unirse.</p>
        <a className="btn btn-secundario" href="#/programa" data-guia="programa">
          Entrar al programa
        </a>
      </section>

      <BotonAyuda alAbrir={() => setGuia(true)} />
      {guia && <Guia alCerrar={() => setGuia(false)} pasos={PASOS_INICIO} />}
    </Pantalla>
  )
}

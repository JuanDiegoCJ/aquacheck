import { useState } from 'react'
import Pantalla from '../components/Pantalla.jsx'
import { Icono } from '../components/Iconos.jsx'
import { FichaHoja } from '../family/Ficha.jsx'
import { urlConClave } from '../components/Qr.jsx'
import { useDatos, claveQrPanel } from '../data/repo.js'

async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    // Respaldo para navegadores sin permiso de portapapeles
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

/** Ficha imprimible de UN hogar para el equipo, con su QR definitivo, y formas de hacerle llegar el enlace. */
export default function FichaEquipo({ codigo }) {
  useDatos()
  const [copiado, setCopiado] = useState(null) // true | false | null
  const clave = claveQrPanel(codigo)
  const url = clave ? urlConClave(codigo, clave) : null
  const mensaje = url ? `Hola, este es tu enlace de AquaCheck para el filtro ${codigo}. Ábrelo desde tu celular para registrarte: ${url}` : ''
  return (
    <Pantalla titulo={'Ficha ' + codigo} volver="#/equipo" sinPie>
      {url ? (
        <>
          <p className="suave sin-imprimir">Este es el QR definitivo de este hogar. Imprímelo y pégalo junto al filtro, o envía el enlace a la familia.</p>
          <div className="acciones-ficha sin-imprimir">
            <button type="button" className="btn btn-principal btn-chico" onClick={() => window.print()}>
              <Icono nombre="imprimir" /> Imprimir
            </button>
            <button
              type="button"
              className="btn btn-secundario btn-chico"
              onClick={async () => {
                setCopiado(await copiarTexto(url))
                setTimeout(() => setCopiado(null), 3000)
              }}
            >
              <Icono nombre={copiado ? 'ok' : 'copiar'} /> {copiado ? 'Enlace copiado' : 'Copiar enlace'}
            </button>
            <a className="btn btn-secundario btn-chico" href={'https://wa.me/?text=' + encodeURIComponent(mensaje)} target="_blank" rel="noopener noreferrer">
              <Icono nombre="whatsapp" /> Enviar por WhatsApp
            </a>
          </div>
          {copiado === false && (
            <p className="error sin-imprimir" role="alert">
              No se pudo copiar. Usa el botón de WhatsApp o imprime la ficha.
            </p>
          )}
          <p className="suave sin-imprimir">Quien tenga este enlace puede abrir y registrar este filtro: envíalo solo a la familia que corresponde.</p>
          <FichaHoja codigo={codigo} url={url} />
        </>
      ) : (
        <div className="tarjeta">
          <p>Todavía no se cargó la clave de este hogar. Espera unos segundos o pulsa “Actualizar” en el panel.</p>
        </div>
      )}
    </Pantalla>
  )
}

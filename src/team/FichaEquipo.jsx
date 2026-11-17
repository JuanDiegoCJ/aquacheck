import { Icono } from '../components/Iconos.jsx'
import Pantalla from '../components/Pantalla.jsx'
import { FichaHoja } from '../family/Ficha.jsx'
import { urlConClave } from '../components/Qr.jsx'
import { useDatos, claveQrPanel } from '../data/repo.js'

/** Ficha imprimible de UN hogar para el equipo, con su QR definitivo. */
export default function FichaEquipo({ codigo }) {
  useDatos()
  const clave = claveQrPanel(codigo)
  return (
    <Pantalla titulo={'Ficha ' + codigo} volver="#/equipo" sinPie>
      {clave ? (
        <>
          <p className="suave sin-imprimir">Este es el QR definitivo de este hogar. Imprímela y pégala junto al filtro.</p>
          <FichaHoja codigo={codigo} url={urlConClave(codigo, clave)} />
          <button type="button" className="btn btn-principal btn-grande sin-imprimir" onClick={() => window.print()}>
            <Icono nombre="imprimir" /> Imprimir
          </button>
        </>
      ) : (
        <div className="tarjeta">
          <p>Todavía no se cargó la clave de este hogar. Espera unos segundos o pulsa “Actualizar” en el panel.</p>
        </div>
      )}
    </Pantalla>
  )
}

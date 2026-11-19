import { Icono } from '../components/Iconos.jsx'
import Pantalla from '../components/Pantalla.jsx'
import { FichaHoja } from '../family/Ficha.jsx'
import { hogaresPanel, claveQrPanel } from '../data/repo.js'
import { urlConClave } from '../components/Qr.jsx'

/** Todas las fichas del piloto, listas para imprimir (una por hoja). */
export default function Fichas() {
  const hogares = hogaresPanel()
  return (
    <Pantalla titulo={`Fichas de los ${hogares.length} hogares`} volver="#/equipo" sinPie ancho>
      <p className="suave sin-imprimir">Cada ficha lleva el QR definitivo de su hogar (con su clave). Trata las hojas impresas como material del proyecto: no las publiques.</p>
      <button type="button" className="btn btn-principal sin-imprimir" onClick={() => window.print()}>
        <Icono nombre="imprimir" /> Imprimir todas
      </button>
      <div className="fichas">
        {hogares.map((h) => (
          <FichaHoja key={h.codigo} codigo={h.codigo} url={claveQrPanel(h.codigo) ? urlConClave(h.codigo, claveQrPanel(h.codigo)) : undefined} />
        ))}
      </div>
    </Pantalla>
  )
}

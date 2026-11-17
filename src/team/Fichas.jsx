import Pantalla from '../components/Pantalla.jsx'
import { FichaHoja } from '../family/Ficha.jsx'
import { listarHogares } from '../data/repo.js'

/** Todas las fichas del piloto, listas para imprimir (una por hoja). */
export default function Fichas() {
  const hogares = listarHogares()
  return (
    <Pantalla titulo="Fichas de los 20 filtros" volver="#/equipo" sinPie ancho>
      <p className="suave sin-imprimir">
        Antes de imprimir, abre esta página desde la dirección FINAL de la app: el QR guarda la dirección que ves en el navegador.
      </p>
      <button type="button" className="btn btn-principal sin-imprimir" onClick={() => window.print()}>
        🖨️ Imprimir todas
      </button>
      <div className="fichas">
        {hogares.map((h) => (
          <FichaHoja key={h.codigo} codigo={h.codigo} />
        ))}
      </div>
    </Pantalla>
  )
}

import Pantalla from '../components/Pantalla.jsx'
import { FichaHoja } from '../family/Ficha.jsx'
import { listarHogares } from '../data/repo.js'

/** Todas las fichas del piloto, listas para imprimir (una por hoja). */
export default function Fichas() {
  const hogares = listarHogares()
  return (
    <Pantalla titulo="Fichas de los 20 filtros" volver="#/equipo" sinPie ancho>
      <p className="suave sin-imprimir">
        Vista de ejemplo: estos QR NO llevan la clave de cada hogar. Las fichas definitivas se generan aparte con tools/generar_fichas.mjs (ver supabase/README.md) y no se publican.
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

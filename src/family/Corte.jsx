import Pantalla from '../components/Pantalla.jsx'
import { useDatos, pasosCorteHechos, alternarPasoCorte, reiniciarPasosCorte } from '../data/repo.js'
import { PASOS_CORTE, TOTAL_PASOS_CORTE } from '../domain/fallas.js'
import { rutaFiltro } from '../app/ruta.js'

export default function Corte({ hogar }) {
  useDatos()
  const hechos = pasosCorteHechos(hogar.codigo)

  return (
    <Pantalla titulo="Si hay corte de agua" volver={rutaFiltro(hogar.codigo)}>
      <p className="suave">
        Los cortes pueden ocurrir por lluvias intensas, huaicos u otras causas. Estos pasos te ayudan a guardar agua y a cuidar tu
        filtro. Marca lo que ya hiciste.
      </p>

      <p className="progreso" role="status">
        {hechos.length} de {TOTAL_PASOS_CORTE} pasos
      </p>

      {PASOS_CORTE.map((g) => (
        <section key={g.grupo} className="tarjeta">
          <h2>{g.grupo}</h2>
          {g.pasos.map((p) => (
            <label key={p.id} className="casilla paso">
              <input type="checkbox" checked={hechos.includes(p.id)} onChange={() => alternarPasoCorte(hogar.codigo, p.id)} />
              <span>{p.texto}</span>
            </label>
          ))}
        </section>
      ))}

      <p className="aviso">
        Contenido de ejemplo del prototipo. El equipo debe validarlo con SEDALIB y con el sector salud antes de usarlo con las
        familias.
      </p>

      {hechos.length > 0 && (
        <button type="button" className="btn btn-secundario" onClick={() => reiniciarPasosCorte(hogar.codigo)}>
          Empezar de nuevo
        </button>
      )}
    </Pantalla>
  )
}

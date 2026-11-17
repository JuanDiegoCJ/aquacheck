import Pantalla from '../components/Pantalla.jsx'
import Qr from '../components/Qr.jsx'
import { ORDEN_TAREAS, TAREAS } from '../domain/reglas.js'
import { rutaFiltro } from '../app/ruta.js'

/** Ficha impresa para pegar junto al filtro: QR + marcas a mano. Es la alternativa sin celular ni internet. */
export function FichaHoja({ codigo }) {
  return (
    <article className="ficha">
      <header className="ficha-cab">
        <div>
          <p className="ficha-marca">💧 AquaCheck</p>
          <h2>Filtro {codigo}</h2>
          <p>Escanea el QR con tu celular para registrar el mantenimiento.</p>
        </div>
        <Qr codigo={codigo} tamano={130} />
      </header>

      <table className="ficha-tabla">
        <thead>
          <tr>
            <th>Tarea</th>
            <th>Cada</th>
            <th>Fecha</th>
            <th>Fecha</th>
            <th>Fecha</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {ORDEN_TAREAS.map((t) => (
            <tr key={t}>
              <td>{TAREAS[t].etiqueta}</td>
              <td>{TAREAS[t].cadaDias} días</td>
              <td />
              <td />
              <td />
              <td />
            </tr>
          ))}
        </tbody>
      </table>

      <p className="ficha-pie">
        Si no tienes celular o internet, anota aquí la fecha cada vez que hagas la tarea. Si el filtro gotea, el agua sale
        turbia o sale poca agua, avisa al equipo del proyecto. AquaCheck no mide la calidad del agua.
      </p>
    </article>
  )
}

export default function Ficha({ hogar }) {
  return (
    <Pantalla titulo="Ficha para imprimir" volver={rutaFiltro(hogar.codigo)} sinPie>
      <p className="suave sin-imprimir">Imprímela y pégala junto al filtro. Sirve también si no hay celular o internet.</p>
      <FichaHoja codigo={hogar.codigo} />
      <button type="button" className="btn btn-principal btn-grande sin-imprimir" onClick={() => window.print()}>
        🖨️ Imprimir
      </button>
    </Pantalla>
  )
}

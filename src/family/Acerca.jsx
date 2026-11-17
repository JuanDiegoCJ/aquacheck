import Pantalla from '../components/Pantalla.jsx'
import Aviso from '../components/Aviso.jsx'

// En computadora: izquierda = qué hace / qué no hace / sobre el prototipo; derecha = tus datos (el bloque más largo).
export default function Acerca() {
  return (
    <Pantalla titulo="¿Qué hace AquaCheck?" volver="#/" sinPie doble>
      <div className="cols">
        <div className="col">
          <section className="tarjeta">
            <h2>Lo que sí hace</h2>
            <ul className="vinetas">
              <li>Registra tu filtro con el código del QR.</li>
              <li>Te recuerda cuándo limpiar o cambiar los cartuchos.</li>
              <li>Guarda el historial de mantenimiento.</li>
              <li>Funciona aunque no tengas internet.</li>
            </ul>
          </section>

          <section className="tarjeta limites">
            <h2>Lo que no hace</h2>
            <ul className="vinetas">
              <li>No mide la calidad del agua.</li>
              <li>No certifica que el agua sea potable.</li>
              <li>No reemplaza los análisis de un laboratorio.</li>
            </ul>
            <p className="suave">La calidad del agua la evalúa un laboratorio competente durante el piloto.</p>
          </section>

          <section className="tarjeta">
            <h2>Sobre este piloto</h2>
            <p className="suave">
              Es el prototipo del Desafío UPAO 2026. Tus registros se guardan en tu celular y se envían al equipo del proyecto cuando
              hay internet. Los avisos de WhatsApp los envía el equipo a mano desde su panel.
            </p>
          </section>
        </div>

        <div className="col">
          <section className="tarjeta">
            <h2>Tus datos</h2>
            <Aviso />
            <p className="suave">Tu celular se guarda separado del historial de mantenimiento.</p>
          </section>
        </div>
      </div>
    </Pantalla>
  )
}

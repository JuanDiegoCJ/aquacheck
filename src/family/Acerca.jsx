import Pantalla from '../components/Pantalla.jsx'
import Aviso from '../components/Aviso.jsx'
import { Icono } from '../components/Iconos.jsx'

const SI = [
  'Te guía antes, durante y después de un corte de agua.',
  'Calcula cuántos días te alcanza el agua que guardas (estimación).',
  'Te recuerda limpiar el tanque y dar mantenimiento al filtro, con plazos que puedes cambiar, y los pone en tu calendario.',
  'Te lleva a las fuentes oficiales para confirmar avisos.',
  'Funciona aunque no tengas internet.',
]

const NO = [
  'No mide ni certifica la calidad del agua.',
  'No publica avisos de cortes: no podemos verificarlos.',
  'No reemplaza el manual de tu equipo ni las indicaciones de salud o de tu empresa de agua.',
]

function Lista({ items, icono, clase }) {
  return (
    <ul className="acerca-lista">
      {items.map((t) => (
        <li key={t}>
          <span className={`acerca-ico ${clase}`}>
            <Icono nombre={icono} tam={16} />
          </span>
          {t}
        </li>
      ))}
    </ul>
  )
}

// Qué hace y qué no hace AquaCheck, privacidad y términos de uso, en lenguaje simple.
export default function Acerca() {
  return (
    <Pantalla titulo="¿Qué hace AquaCheck?" volver="atras" sinPie doble>
      <section className="tarjeta acerca-intro">
        <Icono nombre="marca" tam={34} />
        <p>
          Tu plan de agua para antes, durante y después de un corte. Gratuita y sin cuenta, hecha por el equipo estudiantil <strong>SINERGIA</strong> (Desafío
          UPAO 2026) para las familias de Trujillo frente al Fenómeno El Niño.
        </p>
      </section>

      <div className="cols">
        <div className="col">
          <section className="tarjeta">
            <h2>Lo que sí hace</h2>
            <Lista items={SI} icono="ok" clase="si" />
          </section>

          <section className="tarjeta">
            <h2>Lo que no hace</h2>
            <Lista items={NO} icono="no" clase="no" />
          </section>
        </div>

        <div className="col">
          <section className="tarjeta">
            <h2>Tu privacidad</h2>
            <div className="acerca-priv">
              <h3>Con tu plan (sin QR)</h3>
              <p>Todo se queda en tu celular. No pedimos nombre, dirección ni teléfono, no enviamos tus datos a ningún servidor y no usamos rastreadores. Puedes borrarlo desde «Mi plan».</p>
            </div>
            <div className="acerca-priv">
              <h3>Con el programa del equipo (QR)</h3>
              <p>Guardamos el código de tu hogar, la fecha de instalación y tu historial. El celular es opcional: solo si quieres recibir avisos, y se guarda aparte.</p>
            </div>
            <details className="aviso-detalle">
              <summary>Ver el aviso completo</summary>
              <Aviso />
              <p className="suave">Este aviso está pendiente de revisión legal antes de trabajar con familias reales.</p>
            </details>
          </section>

          <section className="tarjeta">
            <h2>Términos de uso</h2>
            <ul className="acerca-lista">
              <li>
                <span className="acerca-ico si">
                  <Icono nombre="ok" tam={16} />
                </span>
                Es gratuita y no exige cuenta.
              </li>
              <li>
                <span className="acerca-ico si">
                  <Icono nombre="ok" tam={16} />
                </span>
                La información es orientativa: ante dudas, consulta a tu empresa de agua o a salud.
              </li>
              <li>
                <span className="acerca-ico no">
                  <Icono nombre="no" tam={16} />
                </span>
                No la uses para ocultar ni retrasar un problema de salud o de seguridad.
              </li>
            </ul>
            <p className="suave">
              Contacto: <a href="mailto:aquacheck26@gmail.com">aquacheck26@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </Pantalla>
  )
}

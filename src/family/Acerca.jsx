import Pantalla from '../components/Pantalla.jsx'
import Aviso from '../components/Aviso.jsx'

// Qué hace y qué no hace AquaCheck, privacidad y términos de uso, en lenguaje simple.
export default function Acerca() {
  return (
    <Pantalla titulo="¿Qué hace AquaCheck?" volver="#/" sinPie doble>
      <div className="cols">
        <div className="col">
          <section className="tarjeta">
            <h2>Lo que sí hace</h2>
            <ul className="vinetas">
              <li>Te ayuda a prepararte antes, durante y después de un corte de agua.</li>
              <li>Calcula cuántos días te alcanza el agua que guardas (estimación).</li>
              <li>Te recuerda la limpieza del tanque y el mantenimiento del filtro, con plazos que puedes cambiar.</li>
              <li>Pone esos recordatorios en el calendario de tu celular.</li>
              <li>Te lleva a las fuentes oficiales para confirmar avisos.</li>
              <li>Funciona aunque no tengas internet.</li>
            </ul>
          </section>

          <section className="tarjeta">
            <h2>Lo que no hace</h2>
            <ul className="vinetas">
              <li>No mide ni certifica la calidad del agua.</li>
              <li>No publica avisos de cortes: no podemos verificarlos. Te mostramos dónde confirmarlos.</li>
              <li>No reemplaza el manual de tu equipo ni las indicaciones de salud o de tu empresa de agua.</li>
              <li>No tiene certificaciones (por ejemplo, ISO). Es un proyecto estudiantil.</li>
            </ul>
          </section>

          <section className="tarjeta">
            <h2>Sobre AquaCheck</h2>
            <p className="suave">
              Aplicación web gratuita y de uso libre del equipo estudiantil SINERGIA (Desafío UPAO 2026), pensada para familias de Moche frente al
              Fenómeno El Niño y útil en cualquier hogar. Los plazos de mantenimiento son referenciales.
            </p>
          </section>
        </div>

        <div className="col">
          <section className="tarjeta">
            <h2>Privacidad</h2>
            <p>
              <strong>Si creas tu plan sin QR:</strong> todo se guarda solo en tu celular. No pedimos nombre, dirección ni teléfono, no enviamos
              tus datos a ningún servidor y no usamos rastreadores. Puedes borrarlo cuando quieras desde «Mi plan».
            </p>
            <p>
              <strong>Si tu hogar participa con el equipo (QR):</strong> se guardan el código del hogar, la fecha de instalación y el historial. El
              celular es opcional: solo se guarda si lo escribes para recibir avisos, y va aparte del historial. Aviso completo:
            </p>
            <Aviso />
            <p className="suave">El aviso de consentimiento está pendiente de revisión legal antes de trabajar con familias reales.</p>
          </section>

          <section className="tarjeta">
            <h2>Términos de uso</h2>
            <ul className="vinetas">
              <li>El uso es gratuito y no exige cuenta.</li>
              <li>La información es orientativa. Tú decides cómo cuidar tu agua; ante dudas, consulta a tu empresa de agua o a salud.</li>
              <li>No debes usar AquaCheck para ocultar ni retrasar un problema de salud o de seguridad.</li>
              <li>Podemos mejorar o cambiar la aplicación. Si cambia algo importante sobre tus datos, lo avisaremos aquí.</li>
              <li>Contacto: aquacheck26@gmail.com</li>
            </ul>
          </section>
        </div>
      </div>
    </Pantalla>
  )
}

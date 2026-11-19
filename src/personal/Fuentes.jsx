import Pantalla from '../components/Pantalla.jsx'

// AquaCheck NO publica avisos de cortes ni los lee de otras páginas: lleva a la persona a la fuente oficial.
// Direcciones verificadas el 19/11/2026. Si alguna deja de funcionar, buscar la institución en https://www.gob.pe/
const externo = { target: '_blank', rel: 'noopener noreferrer' }

const SEDALIB = [
  { nombre: 'Central telefónica', para: '044 482335', url: 'tel:044482335' },
  { nombre: 'WhatsApp', para: '961 479 006', url: 'https://wa.me/51961479006' },
  { nombre: 'Avisos en su sitio web', para: 'sedalib.com.pe', url: 'https://sedalib.com.pe/' },
  { nombre: 'Oficinas y sedes', para: 'Incluye la oficina de Moche', url: 'https://www.gob.pe/institucion/sedalib/contacto-y-numeros-de-emergencias' },
]

const CLIMA = [
  { nombre: 'SENAMHI', para: 'Pronósticos y alertas del clima y del Fenómeno El Niño', url: 'https://www.gob.pe/senamhi' },
  { nombre: 'INDECI y COEN', para: 'Emergencias, lluvias, huaicos e inundaciones', url: 'https://www.gob.pe/indeci' },
]

const DERECHOS = [
  { nombre: 'SUNASS', para: 'Tus derechos como usuario del agua y cómo reclamar', url: 'https://www.gob.pe/sunass' },
  { nombre: 'Municipalidad Provincial de Trujillo', para: 'Avisos y trámites de la provincia', url: 'https://www.gob.pe/munitrujillo' },
  { nombre: 'Municipalidad Distrital de Moche', para: 'Avisos y apoyo en el distrito de Moche', url: 'https://www.gob.pe/munimoche' },
]

function Lista({ items }) {
  return (
    <ul className="fuente-lista">
      {items.map((f) => (
        <li key={f.nombre}>
          <a className="fuente-fila" href={f.url} {...(f.url.startsWith('http') ? externo : {})}>
            <span>
              <strong>{f.nombre}</strong>
              <span className="suave">{f.para}</span>
            </span>
            <span aria-hidden="true">›</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

export default function Fuentes() {
  return (
    <Pantalla titulo="Fuentes oficiales y contacto" volver="atras">
      <p className="suave">AquaCheck no es un canal oficial ni publica avisos de cortes. Para evitar información falsa, te lleva a las fuentes oficiales: confirma siempre allí.</p>

      <section className="tarjeta" aria-labelledby="f-sedalib">
        <h2 id="f-sedalib">Si se corta el agua: SEDALIB</h2>
        <p className="suave">Empresa de agua de Trujillo y La Libertad, según su sitio web.</p>
        <a className="btn btn-principal" href="tel:044480555">
          Reportar un corte o avería · 044 480555
        </a>
        <Lista items={SEDALIB} />
        <details className="aviso-detalle">
          <summary>Tus derechos ante un corte</summary>
          <p>
            Según las preguntas frecuentes de SEDALIB: los cortes programados deben avisarse con al menos 48 horas, indicando horario, motivo y hora de
            restablecimiento. Si el corte pasa de 18 horas, la empresa debe abastecer con camiones cisterna o puntos provisionales.
          </p>
          <p>Si tu empresa de agua es otra, búscala en el sitio de SUNASS.</p>
        </details>
      </section>

      <section className="tarjeta" aria-labelledby="f-clima">
        <h2 id="f-clima">Clima y emergencias</h2>
        <Lista items={CLIMA} />
      </section>

      <section className="tarjeta" aria-labelledby="f-derechos">
        <h2 id="f-derechos">Tus derechos y tu municipalidad</h2>
        <Lista items={DERECHOS} />
        <p className="suave">Si vives en otro distrito de Trujillo, busca tu municipalidad distrital en gob.pe.</p>
      </section>

      <p className="aviso">AquaCheck no mide ni certifica la calidad del agua. Ante una duda de salud, consulta a un establecimiento de salud.</p>
    </Pantalla>
  )
}

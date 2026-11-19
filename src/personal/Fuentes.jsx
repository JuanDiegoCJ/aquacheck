import Pantalla from '../components/Pantalla.jsx'

// AquaCheck NO publica avisos de cortes ni los lee de otras páginas: lleva a la persona a la fuente oficial.
// Direcciones verificadas el 19/11/2026. Si alguna deja de funcionar, buscar la institución en https://www.gob.pe/
const FUENTES = [
  {
    nombre: 'SENAMHI',
    para: 'Pronósticos y alertas del clima y del Fenómeno El Niño.',
    url: 'https://www.gob.pe/senamhi',
  },
  {
    nombre: 'INDECI y COEN',
    para: 'Emergencias, alertas y qué hacer ante lluvias, huaicos e inundaciones.',
    url: 'https://www.gob.pe/indeci',
  },
  {
    nombre: 'SUNASS',
    para: 'Tus derechos como usuario del agua, reclamos y recomendaciones (por ejemplo, limpieza de tanques).',
    url: 'https://www.gob.pe/sunass',
  },
  {
    nombre: 'Municipalidad Distrital de Moche',
    para: 'Avisos y apoyo en el distrito de Moche.',
    url: 'https://www.gob.pe/munimoche',
  },
]

const externo = { target: '_blank', rel: 'noopener noreferrer' }

export default function Fuentes() {
  return (
    <Pantalla titulo="Fuentes oficiales y contacto" volver="#/mi-plan">
      <p className="suave">
        AquaCheck no es un canal oficial y no publica avisos de cortes de agua. Para evitar información falsa, te lleva a las fuentes oficiales.
        Confirma siempre allí.
      </p>

      <section className="tarjeta" aria-labelledby="f-sedalib">
        <h2 id="f-sedalib">Comunicarte con SEDALIB (Trujillo y La Libertad)</h2>
        <p className="suave">Si tu servicio de agua es de SEDALIB, estos son sus canales según su sitio web:</p>
        <a className="btn btn-principal" href="tel:044480555">
          Reportar un corte o avería: 044 480555
        </a>
        <a className="btn btn-secundario" href="tel:044482335">
          Central telefónica: 044 482335
        </a>
        <a className="btn btn-secundario" href="https://wa.me/51961479006" {...externo}>
          WhatsApp: 961 479 006
        </a>
        <a className="btn btn-secundario" href="https://sedalib.com.pe/" {...externo}>
          Ver avisos en sedalib.com.pe
        </a>
        <a className="btn btn-secundario" href="https://www.gob.pe/institucion/sedalib/contacto-y-numeros-de-emergencias" {...externo}>
          Sedes y contactos (incluye la oficina de Moche)
        </a>
        <p className="suave">
          Según las preguntas frecuentes de SEDALIB: los cortes programados deben avisarse con al menos 48 horas, indicando horario, motivo y hora de
          restablecimiento. Si el corte pasa de 18 horas, la empresa debe abastecer con camiones cisterna o puntos provisionales.
        </p>
        <p className="suave">Si tu empresa de agua es otra, búscala en el sitio de SUNASS.</p>
      </section>

      {FUENTES.map((f) => (
        <section key={f.nombre} className="tarjeta">
          <h2>{f.nombre}</h2>
          <p className="suave">{f.para}</p>
          <a className="btn btn-secundario" href={f.url} {...externo}>
            Abrir sitio oficial
          </a>
        </section>
      ))}

      <p className="aviso">AquaCheck no mide ni certifica la calidad del agua. Ante una duda de salud, consulta a un establecimiento de salud.</p>
    </Pantalla>
  )
}

import { AVISO_COMPLETO } from '../domain/consentimiento.js'

// Resalta lo que el equipo todavía debe completar: [texto entre corchetes].
function conPendientes(texto) {
  return texto.split(/(\[[^\]]+\])/).map((parte, i) =>
    parte.startsWith('[') ? (
      <mark key={i} className="pendiente">
        {parte}
      </mark>
    ) : (
      parte
    ),
  )
}

export default function Aviso() {
  return (
    <dl className="aviso-lista">
      {AVISO_COMPLETO.map((s) => (
        <div key={s.titulo}>
          <dt>{s.titulo}</dt>
          <dd>{conPendientes(s.texto)}</dd>
        </div>
      ))}
    </dl>
  )
}

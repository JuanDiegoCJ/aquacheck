import { TriangleAlert, Check } from 'lucide-react'
import { TEXTO_ESTADO } from '../domain/reglas.js'

const ICONO = { aldia: Check, pronto: TriangleAlert, vencido: TriangleAlert }

/** Semáforo grande. No depende solo del color: lleva texto e ícono distintos. */
export default function Semaforo({ estado }) {
  const t = TEXTO_ESTADO[estado]
  return (
    <div className={`semaforo semaforo-${estado}`} role="status">
      <div className="semaforo-luz" aria-hidden="true">
        {(() => {
          const I = ICONO[estado] ?? Check
          return <I size={34} strokeWidth={2.6} />
        })()}
      </div>
      <div>
        <p className="semaforo-etiqueta">{t.etiqueta}</p>
        <p className="semaforo-titulo">{t.titulo}</p>
        <p className="semaforo-detalle">{t.detalle}</p>
      </div>
    </div>
  )
}

export function Punto({ estado }) {
  return <span className={`punto punto-${estado}`} title={TEXTO_ESTADO[estado].etiqueta} aria-label={TEXTO_ESTADO[estado].etiqueta} />
}

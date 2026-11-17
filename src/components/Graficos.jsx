import { useEffect, useState } from 'react'
import { Icono } from './Iconos.jsx'
// Gráficos hechos a mano (SVG y CSS): no necesitan librerías, pesan casi nada y funcionan sin internet.
// Son interactivos cuando reciben `onSeleccionar`: un clic filtra la tabla de hogares.
import { ESTADOS } from '../team/resumen.js'
import { formatoFechaCorta } from '../domain/reglas.js'

const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0)

/** Dona: hogares por estado. */
export function Donut({ datos, seleccionado, onSeleccionar }) {
  const total = datos.reduce((s, d) => s + d.valor, 0)
  const R = 15.915494309189533 // circunferencia = 100, para trabajar en porcentajes
  let acum = 0
  const resumen = datos.map((d) => `${d.etiqueta}: ${d.valor}`).join(', ')
  return (
    <div className="donut">
      <svg viewBox="0 0 42 42" role="img" aria-label={`Hogares por estado. ${resumen}. Total ${total}.`}>
        <circle cx="21" cy="21" r={R} fill="none" stroke="var(--borde)" strokeWidth="6" />
        {datos.map((d) => {
          if (!d.valor) return null
          const p = (d.valor / total) * 100
          const seg = (
            <circle
              key={d.id}
              className={`donut-seg ${seleccionado && seleccionado !== d.id ? 'apagado' : ''}`}
              cx="21"
              cy="21"
              r={R}
              fill="none"
              stroke={d.color}
              strokeWidth={seleccionado === d.id ? 8 : 6}
              strokeDasharray={`${p} ${100 - p}`}
              strokeDashoffset={25 - acum}
              onClick={onSeleccionar ? () => onSeleccionar(seleccionado === d.id ? null : d.id) : undefined}
            >
              <title>{`${d.etiqueta}: ${d.valor} (${pct(d.valor, total)} %)`}</title>
            </circle>
          )
          acum += p
          return seg
        })}
        <text x="21" y="21.5" textAnchor="middle" className="donut-n">
          {total}
        </text>
        <text x="21" y="26" textAnchor="middle" className="donut-t">
          hogares
        </text>
      </svg>
      <ul className="leyenda">
        {datos.map((d) => {
          const contenido = (
            <>
              <span className="punto" style={{ background: d.color }} aria-hidden="true" />
              <span className="leyenda-texto">{d.etiqueta}</span>
              <strong>{d.valor}</strong>
              <small>{pct(d.valor, total)} %</small>
            </>
          )
          return (
            <li key={d.id}>
              {onSeleccionar ? (
                <button type="button" aria-pressed={seleccionado === d.id} onClick={() => onSeleccionar(seleccionado === d.id ? null : d.id)}>
                  {contenido}
                </button>
              ) : (
                <div className="leyenda-fija">{contenido}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Barras apiladas por tarea (al día / pronto / pendiente). Clic en un tramo = filtrar. */
export function BarrasPorTarea({ filas, seleccion, onSeleccionar }) {
  return (
    <div className="barras-tarea">
      {filas.map((f) => {
        const total = f.aldia + f.pronto + f.vencido
        return (
          <div key={f.tipo} className="barra-fila">
            <div className="barra-etiqueta">
              <span>{f.etiqueta}</span>
              <small>{total} hogares</small>
            </div>
            <div className="barra-apilada" role="group" aria-label={`${f.etiqueta}: ${f.aldia} al día, ${f.pronto} pronto, ${f.vencido} pendientes`}>
              {ESTADOS.filter((e) => e.id !== 'sinregistrar').map((e) => {
                const n = f[e.id]
                if (!n) return null
                const activo = seleccion?.tarea === f.tipo && seleccion?.estado === e.id
                const props = {
                  className: `seg seg-${e.id} ${activo ? 'activo' : ''}`,
                  style: { flexGrow: n },
                  title: `${f.etiqueta} · ${e.etiqueta}: ${n} de ${total} (${pct(n, total)} %)`,
                }
                return onSeleccionar ? (
                  <button key={e.id} type="button" aria-pressed={activo} onClick={() => onSeleccionar(activo ? null : { tarea: f.tipo, estado: e.id })} {...props}>
                    {n}
                  </button>
                ) : (
                  <span key={e.id} {...props}>
                    {n}
                  </span>
                )
              })}
            </div>
          </div>
        )
      })}
      <ul className="leyenda-mini">
        {ESTADOS.filter((e) => e.id !== 'sinregistrar').map((e) => (
          <li key={e.id}>
            <span className="punto" style={{ background: e.color }} aria-hidden="true" /> {e.etiqueta}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Barras verticales: mantenimientos registrados por semana. */
/** true en pantallas anchas (≥ 1100 px): ahí el gráfico semanal ocupa toda la fila y se dibuja más grande. */
function useAnchoGrande() {
  const consulta = '(min-width: 1100px)'
  const [grande, setGrande] = useState(() => typeof window !== 'undefined' && window.matchMedia(consulta).matches)
  useEffect(() => {
    const m = window.matchMedia(consulta)
    const f = () => setGrande(m.matches)
    m.addEventListener('change', f)
    return () => m.removeEventListener('change', f)
  }, [])
  return grande
}

export function BarrasSemanales({ semanas }) {
  const grande = useAnchoGrande()
  const max = Math.max(1, ...semanas.map((s) => s.n))
  const W = grande ? 960 : 320
  const H = grande ? 250 : 170
  const base = grande ? 208 : 138
  const alto = grande ? 150 : 100
  const ancho = W / semanas.length
  const total = semanas.reduce((s, x) => s + x.n, 0)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`barras-semanales ${grande ? 'barras-semanales-grande' : ''}`} role="img" aria-label={`Mantenimientos registrados por semana, últimas ${semanas.length} semanas. Total ${total}.`}>
      {[0.5, 1].map((f) => (
        <line key={f} x1="0" x2={W} y1={base - alto * f} y2={base - alto * f} stroke="var(--borde)" strokeDasharray="4 4" />
      ))}
      <line x1="0" x2={W} y1={base} y2={base} stroke="var(--borde)" />
      {semanas.map((s, i) => {
        const h = (s.n / max) * alto
        const x = i * ancho + ancho * 0.2
        const w = ancho * 0.6
        return (
          <g key={s.ini} className="sem">
            <rect x={x} y={base - h} width={w} height={Math.max(h, s.n ? 2 : 0)} rx={grande ? 6 : 3} fill="var(--azul)">
              <title>{`Semana del ${formatoFechaCorta(s.ini)} al ${formatoFechaCorta(s.fin)}: ${s.n} mantenimientos`}</title>
            </rect>
            <text x={x + w / 2} y={base - h - 6} textAnchor="middle" className="sem-n">
              {s.n}
            </text>
            <text x={x + w / 2} y={base + (grande ? 20 : 14)} textAnchor="middle" className="sem-f">
              {formatoFechaCorta(s.ini)}
            </text>
          </g>
        )
      })}
      <text x="0" y={H - 4} className="sem-f">
        Semana que empieza el…
      </text>
    </svg>
  )
}

export function BarrasFallas({ tipos }) {
  const hay = tipos.some((t) => t.abiertas + t.resueltas > 0)
  if (!hay) return <p className="suave">Aún no hay reportes de falla.</p>
  return (
    <div className="barras-fallas">
      {tipos.map((t) => {
        const total = t.abiertas + t.resueltas
        return (
          <div key={t.id} className={`barra-falla ${total ? '' : 'barra-falla-vacia'}`} title={`${t.etiqueta}: ${t.abiertas} abiertas, ${t.resueltas} resueltas`}>
            <div className="barra-falla-fondo" aria-hidden="true">
              {t.abiertas > 0 && <span className="seg-pronto" style={{ flexGrow: t.abiertas }} />}
              {t.resueltas > 0 && <span className="seg-resuelta" style={{ flexGrow: t.resueltas }} />}
            </div>
            <div className="barra-falla-texto">
              <span className="barra-falla-nombre">
                <Icono nombre={t.icono} tam={18} /> {t.etiqueta}
              </span>
              <strong>{total}</strong>
            </div>
          </div>
        )
      })}
      <ul className="leyenda-mini">
        <li>
          <span className="punto" style={{ background: '#9a5b00' }} aria-hidden="true" /> Abiertas
        </li>
        <li>
          <span className="punto" style={{ background: '#5f7587' }} aria-hidden="true" /> Resueltas
        </li>
      </ul>
    </div>
  )
}

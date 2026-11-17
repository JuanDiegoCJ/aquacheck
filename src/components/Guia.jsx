import { useEffect, useLayoutEffect, useState } from 'react'

/** Botón flotante "?" que abre la guía de la pantalla. */
export function BotonAyuda({ alAbrir }) {
  return (
    <button type="button" className="ayuda-flotante" onClick={alAbrir} aria-label="Ayuda: guía de esta pantalla" title="Ayuda">
      ?
    </button>
  )
}

/**
 * Guía paso a paso: oscurece la pantalla y resalta cada botón con una explicación.
 * pasos = [{ selector, titulo, texto }]  (sin selector: tarjeta centrada, sin resaltar nada)
 */
export default function Guia({ pasos, alCerrar }) {
  const [i, setI] = useState(0)
  const [caja, setCaja] = useState(null)
  const paso = pasos[i]
  const ultimo = i === pasos.length - 1

  useLayoutEffect(() => {
    const el = paso.selector ? document.querySelector(paso.selector) : null
    if (!el) {
      setCaja(null)
      return undefined
    }
    el.scrollIntoView({ block: 'center', behavior: 'auto' })
    const medir = () => {
      const r = el.getBoundingClientRect()
      setCaja({ top: r.top, left: r.left, width: r.width, height: r.height })
    }
    medir()
    window.addEventListener('resize', medir)
    window.addEventListener('scroll', medir, true)
    return () => {
      window.removeEventListener('resize', medir)
      window.removeEventListener('scroll', medir, true)
    }
  }, [i, paso.selector])

  useEffect(() => {
    const tecla = (e) => {
      if (e.key === 'Escape') alCerrar()
      if (e.key === 'ArrowRight') setI((n) => Math.min(n + 1, pasos.length - 1))
      if (e.key === 'ArrowLeft') setI((n) => Math.max(n - 1, 0))
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [alCerrar, pasos.length])

  // La tarjeta va arriba si lo resaltado está en la mitad de abajo, y abajo si está arriba.
  const arriba = caja ? caja.top + caja.height / 2 > window.innerHeight / 2 : false
  const estiloCaja = !caja ? { top: '50%', transform: 'translate(-50%, -50%)' } : arriba ? { top: 12 } : { bottom: 12 }

  return (
    <div className="guia" role="dialog" aria-modal="true" aria-label="Guía de la pantalla">
      {caja ? (
        <div className="guia-foco" style={{ top: caja.top - 6, left: caja.left - 6, width: caja.width + 12, height: caja.height + 12 }} />
      ) : (
        <div className="guia-fondo" />
      )}
      <div className="guia-caja" style={estiloCaja}>
        <p className="guia-paso">
          Paso {i + 1} de {pasos.length}
        </p>
        <h2>{paso.titulo}</h2>
        <p>{paso.texto}</p>
        <div className="guia-botones">
          <button type="button" className="btn-mini" onClick={alCerrar}>
            Cerrar
          </button>
          <span className="guia-espacio" />
          {i > 0 && (
            <button type="button" className="btn-mini" onClick={() => setI(i - 1)}>
              ← Anterior
            </button>
          )}
          <button type="button" className="btn-mini btn-mini-principal" onClick={() => (ultimo ? alCerrar() : setI(i + 1))}>
            {ultimo ? 'Listo' : 'Siguiente →'}
          </button>
        </div>
      </div>
    </div>
  )
}

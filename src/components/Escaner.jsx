import { useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import { extraerCodigo } from '../domain/reglas.js'

/** Lee el QR del filtro con la cámara. Si no hay cámara o permiso, se ofrece escribir el código. */
export default function Escaner({ alLeer, alCerrar }) {
  const video = useRef(null)
  const [error, setError] = useState('')
  const alLeerRef = useRef(alLeer)
  alLeerRef.current = alLeer

  useEffect(() => {
    let scanner
    let activo = true
    ;(async () => {
      try {
        if (!(await QrScanner.hasCamera())) throw new Error('sin camara')
        scanner = new QrScanner(
          video.current,
          (resultado) => {
            const codigo = extraerCodigo(resultado.data)
            if (codigo && activo) {
              activo = false
              scanner.stop()
              alLeerRef.current(codigo, resultado.data)
            }
          },
          {
            returnDetailedScanResult: true,
            highlightCodeOutline: true,
            preferredCamera: 'environment',
            // Se analiza TODO el cuadro (no solo el centro) y con más resolución: los QR con clave son más densos y a veces
            // se escanean de lejos o desde una pantalla.
            calculateScanRegion: (v) => {
              const ancho = Math.min(v.videoWidth, 960)
              return { x: 0, y: 0, width: v.videoWidth, height: v.videoHeight, downScaledWidth: ancho, downScaledHeight: Math.round((ancho * v.videoHeight) / v.videoWidth) }
            },
          },
        )
        await scanner.start()
      } catch {
        if (activo) setError('No pudimos usar la cámara. Puedes escribir el código que está impreso junto al QR.')
      }
    })()
    return () => {
      activo = false
      scanner?.destroy()
    }
  }, [])

  return (
    <div className="escaner" role="dialog" aria-modal="true" aria-label="Escanear código QR">
      <div className="escaner-caja">
        {error ? <p className="aviso">{error}</p> : <video ref={video} muted playsInline />}
        {!error && <p className="escaner-ayuda">Apunta al QR pegado en tu filtro</p>}
        <button type="button" className="btn btn-secundario" onClick={alCerrar}>
          Cerrar
        </button>
      </div>
    </div>
  )
}

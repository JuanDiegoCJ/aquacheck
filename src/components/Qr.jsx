import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

/** Dirección que lleva el QR de un filtro: abre la app directo en ese filtro. */
export function urlDeFiltro(codigo) {
  const base = window.location.href.split('#')[0]
  return `${base}#/f/${codigo}`
}

export default function Qr({ codigo, tamano = 200 }) {
  const [imagen, setImagen] = useState('')
  useEffect(() => {
    let vigente = true
    QRCode.toDataURL(urlDeFiltro(codigo), { width: tamano * 2, margin: 2, errorCorrectionLevel: 'M' }).then((u) => vigente && setImagen(u))
    return () => {
      vigente = false
    }
  }, [codigo, tamano])
  if (!imagen) return <div style={{ width: tamano, height: tamano }} aria-hidden="true" />
  return <img className="qr" src={imagen} width={tamano} height={tamano} alt={`Código QR del filtro ${codigo}`} />
}

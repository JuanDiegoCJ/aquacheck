import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { claveDe } from '../data/repo.js'

/** Dirección que lleva el QR de un filtro: abre la app directo en ese filtro. */
function urlDeFiltro(codigo) {
  const base = window.location.origin + window.location.pathname // sin parámetros sueltos como ?v=2
  const clave = claveDe(codigo) // en un filtro conectado, el QR lleva su clave para que otro celular también se conecte
  return `${base}#/f/${codigo}${clave ? `?k=${clave}` : ""}`
}

/** Dirección del QR DEFINITIVO de un hogar (con su clave). */
export const urlConClave = (codigo, clave) => `${window.location.origin}${window.location.pathname}#/f/${codigo}?k=${clave}`

export default function Qr({ codigo, tamano = 200, url }) {
  const [imagen, setImagen] = useState('')
  useEffect(() => {
    let vigente = true
    QRCode.toDataURL(url ?? urlDeFiltro(codigo), { width: tamano * 2, margin: 2, errorCorrectionLevel: 'M' }).then((u) => vigente && setImagen(u))
    return () => {
      vigente = false
    }
  }, [codigo, tamano, url])
  if (!imagen) return <div style={{ width: tamano, height: tamano }} aria-hidden="true" />
  return <img className="qr" src={imagen} width={tamano} height={tamano} alt={`Código QR del hogar ${codigo}`} />
}

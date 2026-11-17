import { useState } from 'react'

// Reduce la foto (máx. 640 px, JPEG) para que ocupe poco en el celular y funcione sin internet.
function reducir(archivo) {
  return new Promise((resolver, rechazar) => {
    const img = new Image()
    const url = URL.createObjectURL(archivo)
    img.onload = () => {
      const escala = Math.min(1, 640 / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * escala)
      canvas.height = Math.round(img.height * escala)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolver(canvas.toDataURL('image/jpeg', 0.6))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      rechazar(new Error('imagen'))
    }
    img.src = url
  })
}

export default function FotoInput({ foto, alCambiar }) {
  const [error, setError] = useState('')

  async function elegir(e) {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    try {
      setError('')
      alCambiar(await reducir(archivo))
    } catch {
      setError('No pudimos leer esa foto. Puedes continuar sin foto.')
    }
  }

  return (
    <div className="campo">
      <span className="etiqueta">Foto (opcional)</span>
      {foto ? (
        <>
          <img className="foto-previa" src={foto} alt="Foto del problema" />
          <button type="button" className="enlace-boton" onClick={() => alCambiar(null)}>
            Quitar foto
          </button>
        </>
      ) : (
        <label className="btn btn-secundario foto-boton">
          📷 Tomar o elegir una foto
          <input type="file" accept="image/*" capture="environment" onChange={elegir} hidden />
        </label>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

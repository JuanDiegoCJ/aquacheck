import { useState } from 'react'
import Pantalla from '../components/Pantalla.jsx'
import FotoInput from '../components/FotoInput.jsx'
import { agregarReporte } from '../data/repo.js'
import { ORDEN_FALLAS, TIPOS_FALLA } from '../domain/fallas.js'
import { rutaFiltro } from '../app/ruta.js'

export default function Falla({ hogar }) {
  const [tipo, setTipo] = useState(null)
  const [foto, setFoto] = useState(null)
  const [enviado, setEnviado] = useState(false)
  const volver = rutaFiltro(hogar.codigo)

  if (enviado) {
    return (
      <Pantalla titulo="Reporte enviado" volver={volver}>
        <div className="tarjeta exito" role="status">
          <p className="exito-icono" aria-hidden="true">
            ✓
          </p>
          <p>Guardamos tu reporte. El equipo del proyecto lo revisará y te contactará si hace falta.</p>
        </div>
        <a className="btn btn-principal btn-grande" href={volver}>
          Ver mi filtro
        </a>
      </Pantalla>
    )
  }

  return (
    <Pantalla titulo="Reportar un problema" volver={volver}>
      <p className="suave">Cuéntanos qué observas. Es tu observación: AquaCheck no mide la calidad del agua.</p>

      <div className="opciones" role="radiogroup" aria-label="Tipo de problema">
        {ORDEN_FALLAS.map((id) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={tipo === id}
            className={`btn btn-grande opcion ${tipo === id ? 'opcion-activa' : ''}`}
            onClick={() => setTipo(id)}
          >
            <span aria-hidden="true">{TIPOS_FALLA[id].icono}</span> {TIPOS_FALLA[id].etiqueta}
          </button>
        ))}
      </div>

      <FotoInput foto={foto} alCambiar={setFoto} />

      <button
        type="button"
        className="btn btn-principal btn-grande"
        disabled={!tipo}
        onClick={() => {
          agregarReporte({ codigo: hogar.codigo, tipo, foto })
          setEnviado(true)
        }}
      >
        Enviar reporte
      </button>
    </Pantalla>
  )
}

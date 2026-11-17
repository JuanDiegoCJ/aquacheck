import { useEffect } from 'react'
import { useRuta, resolverRuta } from './ruta.js'
import { useDatos, obtenerHogar, recordarFiltro, equipoAutorizado } from '../data/repo.js'
import Falla from '../family/Falla.jsx'
import Corte from '../family/Corte.jsx'
import Ficha from '../family/Ficha.jsx'
import Equipo from '../team/Equipo.jsx'
import Fichas from '../team/Fichas.jsx'
import Informe from '../team/Informe.jsx'
import Inicio from '../family/Inicio.jsx'
import Registro from '../family/Registro.jsx'
import Panel from '../family/Panel.jsx'
import Mantenimiento from '../family/Mantenimiento.jsx'
import Historial from '../family/Historial.jsx'
import Acerca from '../family/Acerca.jsx'
import Pantalla from '../components/Pantalla.jsx'

function NoEncontrado({ codigo }) {
  return (
    <Pantalla titulo="No encontramos ese código" volver="#/">
      <div className="tarjeta">
        <p>
          El código <strong>{codigo}</strong> no está en la lista de este piloto. Revisa que esté bien escrito o escanea
          de nuevo el QR pegado en tu filtro.
        </p>
        <a className="btn btn-principal" href="#/">
          Volver al inicio
        </a>
      </div>
    </Pantalla>
  )
}

export default function App() {
  const ruta = useRuta()
  useDatos()
  const { pantalla, codigo } = resolverRuta(ruta)
  const hogar = codigo ? obtenerHogar(codigo) : null

  // Recuerda el filtro de esta familia para abrirlo rápido la próxima vez (sin contraseñas).
  useEffect(() => {
    if (hogar?.registrado) recordarFiltro(hogar.codigo)
  }, [hogar])

  if (pantalla === 'inicio') return <Inicio />
  if (pantalla === 'acerca') return <Acerca />
  if (pantalla === 'equipo') return <Equipo />
  if (pantalla === 'fichas') return equipoAutorizado() ? <Fichas /> : <Equipo />
  if (pantalla === 'informe') return equipoAutorizado() ? <Informe /> : <Equipo />
  if (!hogar) return <NoEncontrado codigo={codigo} />

  // Un filtro sin registrar siempre pasa primero por el registro.
  if (!hogar.registrado || pantalla === 'registro') return <Registro hogar={hogar} />

  if (pantalla === 'mantenimiento') return <Mantenimiento hogar={hogar} />
  if (pantalla === 'historial') return <Historial hogar={hogar} />
  if (pantalla === 'falla') return <Falla hogar={hogar} />
  if (pantalla === 'corte') return <Corte hogar={hogar} />
  if (pantalla === 'ficha') return <Ficha hogar={hogar} />
  return <Panel hogar={hogar} />
}

import { useEffect } from 'react'
import { useRuta, resolverRuta, claveDeRuta, rutaFiltro } from './ruta.js'
import { useDatos, obtenerHogar, recordarFiltro, equipoAutorizado, adoptarClave } from '../data/repo.js'
import Falla from '../family/Falla.jsx'
import Corte from '../family/Corte.jsx'
import Ficha from '../family/Ficha.jsx'
import Equipo from '../team/Equipo.jsx'
import Fichas from '../team/Fichas.jsx'
import Informe from '../team/Informe.jsx'
import VerHogar from '../team/VerHogar.jsx'
import FichaEquipo from '../team/FichaEquipo.jsx'
import Inicio from '../family/Inicio.jsx'
import Registro from '../family/Registro.jsx'
import Agregar from '../family/Agregar.jsx'
import Panel from '../family/Panel.jsx'
import Mantenimiento from '../family/Mantenimiento.jsx'
import Historial from '../family/Historial.jsx'
import Acerca from '../family/Acerca.jsx'
import Pantalla from '../components/Pantalla.jsx'
import Crear from '../personal/Crear.jsx'
import MiPlan from '../personal/MiPlan.jsx'
import Fuentes from '../personal/Fuentes.jsx'

function NoEncontrado({ codigo }) {
  return (
    <Pantalla titulo="Escanea el QR de tu hogar" volver="#/">
      <div className="tarjeta">
        <p>
          El hogar <strong>{codigo}</strong> aún no está abierto en este celular. Escanea con la cámara el QR de tu hogar. Si no puedes, pide a tu contacto del proyecto el enlace de tu hogar y pégalo en el inicio.
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
  const clave = codigo ? claveDeRuta(ruta) : null
  const hogar = codigo && !clave ? obtenerHogar(codigo) : null

  // QR con clave: activa el modo real de ese filtro y quita la clave de la dirección (no queda en el historial).
  useEffect(() => {
    if (!clave) return
    adoptarClave(codigo, clave)
    window.location.replace(`${window.location.pathname}${window.location.search}${rutaFiltro(codigo)}`)
  }, [clave, codigo])

  // Recuerda el filtro de esta familia para abrirlo rápido la próxima vez (sin contraseñas).
  useEffect(() => {
    if (hogar?.registrado) recordarFiltro(hogar.codigo)
  }, [hogar])

  // Al cambiar de pantalla se vuelve arriba (si no, se queda en el scroll de la pantalla anterior).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pantalla, codigo])

  if (clave) return null
  if (pantalla === 'inicio') return <Inicio />
  if (pantalla === 'acerca') return <Acerca />
  if (pantalla === 'fuentes') return <Fuentes />
  if (pantalla === 'crear') return <Crear />
  if (pantalla === 'agregar') return <Agregar />
  if (pantalla === 'miplan') return <MiPlan />
  if (pantalla === 'equipo') return <Equipo />
  if (pantalla === 'fichas') return equipoAutorizado() ? <Fichas /> : <Equipo />
  if (pantalla === 'fichaequipo') return equipoAutorizado() ? <FichaEquipo codigo={codigo} /> : <Equipo />
  if (pantalla === 'hogarequipo') return equipoAutorizado() ? <VerHogar codigo={codigo} /> : <Equipo />
  if (pantalla === 'informe') return equipoAutorizado() ? <Informe /> : <Equipo />
  if (!hogar) return <NoEncontrado codigo={codigo} />
  if (hogar.cargando) {
    return (
      <Pantalla titulo={'Hogar ' + hogar.codigo} volver="#/">
        <div className="tarjeta" role="status">
          <p>Conectando con tu hogar… Si no avanza, revisa tu internet.</p>
        </div>
      </Pantalla>
    )
  }

  // Un filtro sin registrar siempre pasa primero por el registro.
  if (!hogar.registrado || pantalla === 'registro') return <Registro hogar={hogar} />

  if (pantalla === 'mantenimiento') return <Mantenimiento hogar={hogar} />
  if (pantalla === 'historial') return <Historial hogar={hogar} />
  if (pantalla === 'falla') return <Falla hogar={hogar} />
  if (pantalla === 'corte') return <Corte hogar={hogar} />
  if (pantalla === 'ficha') return <Ficha hogar={hogar} />
  return <Panel hogar={hogar} />
}

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Icono } from './Iconos.jsx'
// Marco común de todas las pantallas: barra superior (con navegación en pantallas anchas),
// contenido centrado y pie con los límites de la app.
//   - por defecto: una columna estrecha (formularios, historial…)
//   - doble: hasta dos columnas en pantallas anchas (inicio, panel del filtro)
//   - ancho: panel del equipo / fichas
// «atras»: vuelve a la pantalla de la que se vino (o al inicio si se abrió directo).
const volverAtras = (e) => {
  e.preventDefault()
  if (window.history.length > 1) window.history.back()
  else window.location.hash = '#/'
}

export default function Pantalla({ titulo, volver, children, sinPie = false, ancho = false, doble = false, acciones = null }) {
  const [menu, setMenu] = useState(false)
  const clase = ancho ? 'app-ancho' : doble ? 'app-doble' : ''
  return (
    <div className={`app ${clase}`}>
      <header className="barra">
        <div className="barra-in">
          {volver && (
            <a className="volver" href={volver === 'atras' ? '#/' : volver} aria-label="Volver" onClick={volver === 'atras' ? volverAtras : undefined}>
              <Icono nombre="izquierda" tam={18} /> Volver
            </a>
          )}
          <a className={`marca ${volver ? 'marca-escritorio' : ''}`} href="#/" data-guia="nav-inicio">
            <img src="./icon.svg" alt="" width="28" height="28" /> AquaCheck
          </a>
          <button type="button" className="menu-movil" aria-expanded={menu} aria-controls="nav-principal" aria-label={menu ? 'Cerrar el menú' : 'Abrir el menú'} onClick={() => setMenu(!menu)}>
            {menu ? <X size={26} aria-hidden="true" /> : <Menu size={26} aria-hidden="true" />}
          </button>
          <nav id="nav-principal" className={`nav ${menu ? 'abierto' : ''}`} aria-label="Principal" onClick={() => setMenu(false)}>
            <a href="#/mi-plan" data-guia="nav-miplan">Mi plan</a>
            <a href="#/fuentes">Fuentes oficiales</a>
            <a href="#/acerca" data-guia="nav-acerca">¿Qué hace?</a>
            <a href="#/equipo" data-guia="nav-equipo">Administrador</a>
          </nav>
        </div>
      </header>
      <main className="contenido">
        {titulo &&
          (acciones ? (
            <div className="titulo-fila">
              <h1 className="titulo">{titulo}</h1>
              {acciones}
            </div>
          ) : (
            <h1 className="titulo">{titulo}</h1>
          ))}
        {children}
      </main>
      <footer className="pie">
        <div className="pie-grid">
          <div className="pie-marca">
            <a className="pie-logo" href="#/">
              <img src="./icon.svg" alt="" width="26" height="26" /> AquaCheck
            </a>
            <p>Tu plan de agua para antes, durante y después de un corte. Gratuita y sin cuenta.</p>
          </div>
          <nav className="pie-col" aria-label="Más información">
            <p className="pie-titulo">Explora</p>
            <a href="#/mi-plan">Mi plan</a>
            <a href="#/fuentes">Fuentes oficiales</a>
            <a href="#/acerca">¿Qué hace?</a>
          </nav>
          <div className="pie-col">
            <p className="pie-titulo">Contacto</p>
            <a href="mailto:aquacheck26@gmail.com">aquacheck26@gmail.com</a>
          </div>
        </div>
        <p className="pie-aviso">AquaCheck no mide ni certifica la calidad del agua.</p>
        <p className="pie-copy">© 2026 AquaCheck · Equipo estudiantil SINERGIA · Desafío UPAO</p>
      </footer>
    </div>
  )
}

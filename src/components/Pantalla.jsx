import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Icono } from './Iconos.jsx'
// Marco común de todas las pantallas: barra superior (con navegación en pantallas anchas),
// contenido centrado y pie con los límites de la app.
//   - por defecto: una columna estrecha (formularios, historial…)
//   - doble: hasta dos columnas en pantallas anchas (inicio, panel del filtro)
//   - ancho: panel del equipo / fichas
export default function Pantalla({ titulo, volver, children, sinPie = false, ancho = false, doble = false, acciones = null }) {
  const [menu, setMenu] = useState(false)
  const clase = ancho ? 'app-ancho' : doble ? 'app-doble' : ''
  return (
    <div className={`app ${clase}`}>
      <header className="barra">
        <div className="barra-in">
          {volver && (
            <a className="volver" href={volver} aria-label="Volver">
              <Icono nombre="izquierda" tam={18} /> Volver
            </a>
          )}
          <a className={`marca ${volver ? 'marca-escritorio' : ''}`} href="#/">
            <img src="./icon.svg" alt="" width="28" height="28" /> AquaCheck
          </a>
          <button type="button" className="menu-movil" aria-expanded={menu} aria-controls="nav-principal" aria-label={menu ? 'Cerrar el menú' : 'Abrir el menú'} onClick={() => setMenu(!menu)}>
            {menu ? <X size={26} aria-hidden="true" /> : <Menu size={26} aria-hidden="true" />}
          </button>
          <nav id="nav-principal" className={`nav ${menu ? 'abierto' : ''}`} aria-label="Principal" onClick={() => setMenu(false)}>
            <a href="#/" data-guia="nav-inicio">Inicio</a>
            <a href="#/mi-plan">Mi plan</a>
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
        <p className="pie-aviso">AquaCheck te ayuda a cuidar el agua de tu hogar. No mide ni certifica su calidad.</p>
        <p className="pie-copy">© 2026 AquaCheck · Equipo estudiantil del Desafío UPAO</p>
      </footer>
    </div>
  )
}

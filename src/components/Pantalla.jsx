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
          <nav id="nav-principal" className="nav" aria-label="Principal">
            <a href="#/mi-plan" data-guia="nav-miplan">Mi plan</a>
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
        <nav className="pie-links" aria-label="Más información">
          <a href="#/fuentes">Fuentes oficiales</a>
          <a href="#/acerca" data-guia="nav-acerca">¿Qué hace?</a>
        </nav>
        <p className="pie-aviso">AquaCheck te ayuda a cuidar el agua de tu hogar. No mide ni certifica su calidad.</p>
        <p className="pie-copy">© 2026 AquaCheck · Equipo estudiantil del Desafío UPAO</p>
      </footer>
    </div>
  )
}

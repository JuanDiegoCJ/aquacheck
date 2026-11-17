import { Icono } from './Iconos.jsx'
// Marco común de todas las pantallas: barra superior (con navegación en pantallas anchas),
// contenido centrado y pie con los límites de la app.
//   - por defecto: una columna estrecha (formularios, historial…)
//   - doble: hasta dos columnas en pantallas anchas (inicio, panel del filtro)
//   - ancho: panel del equipo / fichas
export default function Pantalla({ titulo, volver, children, sinPie = false, ancho = false, doble = false, acciones = null }) {
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
          <nav className="nav" aria-label="Principal">
            <a href="#/" data-guia="nav-inicio">Inicio</a>
            <a href="#/acerca" data-guia="nav-acerca">¿Qué hace?</a>
            <a href="#/equipo" data-guia="nav-equipo">Equipo del proyecto</a>
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
        <p className="pie-aviso">
          AquaCheck te ayuda a recordar el mantenimiento de tu filtro. <strong>No mide la calidad del agua ni certifica que sea potable.</strong>
        </p>
        <p className="pie-copy">© 2026 AquaCheck · Equipo estudiantil del Desafío UPAO</p>
      </footer>
    </div>
  )
}

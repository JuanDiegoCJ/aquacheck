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
              <span aria-hidden="true">←</span> Volver
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
        <div className="pie-in">
          <div className="pie-marca">
            <a className="pie-logo" href="#/">
              <img src="./icon.svg" alt="" width="24" height="24" /> AquaCheck
            </a>
            <p>Seguimiento del mantenimiento de filtros de agua · Moche</p>
          </div>
          <p className="pie-aviso">
            AquaCheck te ayuda a recordar el mantenimiento de tu filtro. <strong>No mide la calidad del agua ni certifica que sea potable.</strong>
          </p>
          <nav className="pie-enlaces" aria-label="Pie de página">
            <a href="#/acerca">¿Qué hace AquaCheck?</a>
            <a href="#/equipo">Equipo del proyecto</a>
          </nav>
        </div>
        <p className="pie-copy">© 2026 AquaCheck · Equipo estudiantil del Desafío UPAO</p>
      </footer>
    </div>
  )
}

// Marco común de todas las pantallas: barra superior (con navegación en pantallas anchas),
// contenido centrado y pie con los límites de la app.
//   - por defecto: una columna estrecha (formularios, historial…)
//   - doble: hasta dos columnas en pantallas anchas (inicio, panel del filtro)
//   - ancho: panel del equipo / fichas
export default function Pantalla({ titulo, volver, children, sinPie = false, ancho = false, doble = false }) {
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
            <a href="#/">Inicio</a>
            <a href="#/acerca">¿Qué hace?</a>
            <a href="#/equipo">Equipo del proyecto</a>
          </nav>
        </div>
      </header>
      <main className="contenido">
        {titulo && <h1 className="titulo">{titulo}</h1>}
        {children}
      </main>
      {!sinPie && (
        <footer className="pie">
          <p>AquaCheck te ayuda a recordar el mantenimiento de tu filtro. No mide la calidad del agua ni certifica que sea potable.</p>
          <a href="#/acerca">¿Qué hace y qué no hace AquaCheck?</a>
        </footer>
      )}
    </div>
  )
}

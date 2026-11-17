// Reportes de falla y guía del "modo corte de agua".
// Lo que reporta la familia es una OBSERVACIÓN suya, no una medición: la app no mide la calidad del agua.

export const TIPOS_FALLA = {
  gotea: { id: 'gotea', etiqueta: 'El filtro gotea', icono: '💧' },
  turbia: { id: 'turbia', etiqueta: 'El agua sale turbia', icono: '🌫️' },
  poca: { id: 'poca', etiqueta: 'Sale poca agua', icono: '🚰' },
  otra: { id: 'otra', etiqueta: 'Otro problema', icono: '❓' },
}
export const ORDEN_FALLAS = ['gotea', 'turbia', 'poca', 'otra']

// CONTENIDO DE EJEMPLO. Debe validarse con SEDALIB / DIRESA / MINSA antes de usarse con familias reales.
export const PASOS_CORTE = [
  {
    grupo: 'Antes del corte',
    pasos: [
      { id: 'lavar', texto: 'Lava con agua y jabón los recipientes que usarás para guardar agua y enjuágalos bien.' },
      { id: 'llenar', texto: 'Llénalos y tápalos bien.' },
      { id: 'lugar', texto: 'Guárdalos en un lugar fresco, lejos del sol y de productos de limpieza.' },
      { id: 'fecha', texto: 'Anota en cada recipiente el día en que lo llenaste.' },
    ],
  },
  {
    grupo: 'Durante el corte',
    pasos: [
      { id: 'sacar', texto: 'Saca el agua con un cucharón limpio o una llave, sin meter las manos.' },
      { id: 'salud', texto: 'Para beber, sigue las indicaciones de salud sobre cómo hacer segura el agua guardada.' },
      { id: 'filtro', texto: 'No desarmes el filtro. Espera a que vuelva el servicio para usarlo.' },
    ],
  },
  {
    grupo: 'Cuando vuelva el agua',
    pasos: [
      { id: 'manual', texto: 'Antes de volver a usar el filtro, revisa las indicaciones del fabricante.' },
      { id: 'registro', texto: 'Si limpiaste el filtro o el tanque, regístralo en AquaCheck.' },
      { id: 'reporte', texto: 'Si algo sale raro (agua turbia, poca agua, goteo), repórtalo en la app.' },
    ],
  },
]
export const TOTAL_PASOS_CORTE = PASOS_CORTE.reduce((n, g) => n + g.pasos.length, 0)

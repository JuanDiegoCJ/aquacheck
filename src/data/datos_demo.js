// Datos de EJEMPLO para la demostración: 20 filtros ficticios.
// Las fechas se calculan respecto a hoy para que siempre haya hogares al día, por vencer y pendientes.
// Los celulares son ficticios (900 000 0NN). No hay personas reales en estos datos.
import { aISO, sumarDias, hoyISO } from '../domain/reglas.js'

export const MODELO_FILTRO = 'Filtro doméstico de 3 etapas (Módulo B)'

// [días desde la instalación, última limpieza filtro, último cambio cartucho, última limpieza tanque]
// null = aún no se registró esa tarea. `null` en toda la fila = filtro sin registrar.
const PERFILES = [
  [200, 10, 40, 30],
  [200, 26, 60, 30],
  [150, 45, 20, 10],
  [240, 5, 175, 20],
  [240, 8, 190, 15],
  [90, 3, null, 85],
  [60, 20, null, null],
  [100, 31, null, 40],
  [30, null, null, null],
  [20, 2, null, null],
  [180, 15, 100, 50],
  [180, 28, 100, 95],
  [75, 10, null, 10],
  [45, 40, null, null],
  [120, 7, 118, 60],
  [14, null, null, null],
  [200, 12, 170, 80],
  null,
  null,
  null,
]
const TIPOS = ['limpieza_filtro', 'cambio_cartucho', 'limpieza_tanque']

export const codigoDe = (n) => `AQ-${String(n).padStart(3, '0')}`

export function crearDatosDemo() {
  const hoy = hoyISO()
  const hogares = {}
  const contactos = {}
  const mantenimientos = []

  PERFILES.forEach((perfil, i) => {
    const codigo = codigoDe(i + 1)
    if (!perfil) {
      hogares[codigo] = { codigo, registrado: false, modelo: MODELO_FILTRO, fechaInstalacion: null }
      return
    }
    const [instalado, ...ultimos] = perfil
    const fechaInstalacion = sumarDias(hoy, -instalado)
    hogares[codigo] = { codigo, registrado: true, modelo: MODELO_FILTRO, fechaInstalacion }
    contactos[codigo] = {
      celular: `900${String(i + 1).padStart(6, '0')}`,
      consentimiento: { fecha: `${fechaInstalacion}T10:00:00`, version: 'demo', origen: 'datos de ejemplo' },
    }
    ultimos.forEach((hace, k) => {
      if (hace === null) return
      mantenimientos.push({
        id: `demo-${codigo}-${TIPOS[k]}`,
        codigo,
        tipo: TIPOS[k],
        fecha: sumarDias(hoy, -hace),
      })
    })
  })
  const hace = (d) => `${sumarDias(hoy, -d)}T09:30:00.000Z`
  const reportes = [
    { id: 'demo-r1', codigo: 'AQ-003', tipo: 'gotea', fecha: hace(2), estado: 'abierta', conFoto: false },
    { id: 'demo-r2', codigo: 'AQ-012', tipo: 'poca', fecha: hace(1), estado: 'abierta', conFoto: false },
    { id: 'demo-r3', codigo: 'AQ-005', tipo: 'turbia', fecha: hace(9), estado: 'resuelta', conFoto: false },
  ]
  return { hogares, contactos, mantenimientos, reportes, creado: aISO(new Date()) }
}

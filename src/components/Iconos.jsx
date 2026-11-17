import {
  ArrowLeft, ArrowRight, Brush, Camera, Check, CircleCheck, CircleHelp, ClipboardList, CloudFog, Container, Droplet, DropletOff,
  Copy, Eye, FileDown, FileSpreadsheet, FileText, MessageCircle, Plus, Printer, RefreshCw, ShowerHead, TriangleAlert,
} from 'lucide-react'

// Nombre -> icono SVG (lucide-react). Los datos del dominio usan estos nombres en lugar de emojis.
const ICONOS = {
  limpieza_filtro: Brush,
  cambio_cartucho: RefreshCw,
  limpieza_tanque: Container,
  gotea: Droplet,
  turbia: CloudFog,
  poca: ShowerHead,
  otra: CircleHelp,
  camara: Camera,
  imprimir: Printer,
  ver: Eye,
  excel: FileSpreadsheet,
  word: FileText,
  pdf: FileDown,
  registrar: CircleCheck,
  historial: ClipboardList,
  alerta: TriangleAlert,
  corte: DropletOff,
  marca: Droplet,
  ok: Check,
  izquierda: ArrowLeft,
  derecha: ArrowRight,
  actualizar: RefreshCw,
  agregar: Plus,
  copiar: Copy,
  whatsapp: MessageCircle,
}

/** Icono SVG decorativo (el texto del botón ya dice lo que hace). */
export function Icono({ nombre, tam = 20, className = '' }) {
  const Componente = ICONOS[nombre]
  if (!Componente) return null
  return <Componente className={`icono ${className}`} size={tam} strokeWidth={2} aria-hidden="true" focusable="false" />
}

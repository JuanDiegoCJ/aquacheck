import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import { iniciar } from '../data/repo.js'
import './estilos.css'

iniciar()
registerSW({ immediate: true }) // guarda la app para usarla sin internet

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

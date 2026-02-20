import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import App from './App'
import './index.css'

// Prevent multiple createRoot during HMR
let root: Root | null = (window as any).__reactRoot

if (!root) {
  root = createRoot(document.getElementById('root')!)
    ; (window as any).__reactRoot = root
}

root.render(
  <StrictMode>
    <App />
  </StrictMode>
)
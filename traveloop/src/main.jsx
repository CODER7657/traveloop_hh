import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '14px',
          background: '#1a1a2e',
          color: '#f8f7f4',
          borderRadius: '12px',
          padding: '12px 16px',
        },
        success: { iconTheme: { primary: '#2d6a4f', secondary: '#f8f7f4' } },
        error: { iconTheme: { primary: '#c0392b', secondary: '#f8f7f4' } },
      }}
    />
  </StrictMode>,
)

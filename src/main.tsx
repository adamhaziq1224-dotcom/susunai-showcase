import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safe interceptor to suppress benign Vite HMR WebSocket connection errors inside container previews
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = event.reason ? String(event.reason) : '';
    const messageStr = event.reason?.message ? String(event.reason.message) : '';
    if (reasonStr.includes('WebSocket') || messageStr.includes('WebSocket')) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message ? String(event.message) : '';
    if (msg.includes('WebSocket') || msg.includes('websocket')) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);


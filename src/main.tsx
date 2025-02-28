
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'

// Error boundary for production
if (import.meta.env.PROD) {
  window.addEventListener('error', (event) => {
    console.error('Unhandled error:', event.error);
    // You could send this to an error tracking service here
  });
}

const container = document.getElementById('root');

if (!container) {
  throw new Error(
    'Root element with id "root" was not found in the document. Ensure the HTML has a div with id="root".'
  );
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

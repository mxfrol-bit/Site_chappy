import './basePath'; // GitHub Pages base-path shim — must run before anything renders
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/tokens.css';
import './styles/global.css';
import './styles/components.css';
import App from './App';

// '/' locally & on Vercel; '/<repo>' on GitHub Pages (from Vite base / BASE_URL).
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

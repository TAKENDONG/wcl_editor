import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app/App.tsx';
import { LocaleProvider } from './i18n/LocaleContext.tsx';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('Element #root introuvable');

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <LocaleProvider>
        <App />
      </LocaleProvider>
    </BrowserRouter>
  </StrictMode>,
);

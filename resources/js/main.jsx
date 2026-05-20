import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import App from './App.jsx';

createRoot(document.getElementById('app')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

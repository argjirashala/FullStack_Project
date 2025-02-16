import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import firebaseService from './config/firebaseService.js';

if (window.Cypress) {
  console.log("Cypress detected – exposing firebaseService");
  window.firebaseService = firebaseService;
} else {
  console.log("Not running under Cypress", window.Cypress);
}


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#12121C',
            color: '#F1F0F5',
            border: '1px solid rgba(255,255,255,0.08)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#2DD4BF', secondary: '#12121C' } },
          error: { iconTheme: { primary: '#F87171', secondary: '#12121C' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);

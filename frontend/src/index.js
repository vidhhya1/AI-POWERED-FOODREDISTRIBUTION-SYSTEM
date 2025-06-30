// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Your global CSS can still be here
import App from './App';

import { ThemeProvider } from '@mui/material/styles'; // Import ThemeProvider
import theme from './theme'; // Import your custom theme

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}> {/* Wrap your App with ThemeProvider */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
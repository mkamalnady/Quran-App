// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './App.css';
import { AuthProvider } from './context/AuthContext.jsx'; // استيراد المزود

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* تغليف التطبيق */}
      <App />
    </AuthProvider>
  </React.StrictMode>,
);

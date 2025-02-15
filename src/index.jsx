
import React from 'react';
import { createRoot } from 'react-dom/client';
import AuthWrapper from './AuthWrapper';
import './App.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <AuthWrapper />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
}

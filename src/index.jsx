
import React from 'react';
import { createRoot } from 'react-dom/client';
import AuthWrapper from './AuthWrapper';
import './App.css';

try {
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Failed to find root element');
  }
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <AuthWrapper />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Error initializing app:', error);
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Error loading application. Please check console for details.</div>';
}

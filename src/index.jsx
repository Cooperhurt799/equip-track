
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
  console.error('Failed to initialize application:', error);
  // Optionally display a user-friendly error message
  document.body.innerHTML = '<div style="color: #721c24; background-color: #f8d7da; padding: 20px; margin: 20px; border-radius: 4px;">Sorry, there was an error loading the application. Please try refreshing the page.</div>';
}

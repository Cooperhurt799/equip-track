
import React from 'react';
import { createRoot } from 'react-dom/client';
import AuthWrapper from './AuthWrapper';
import './App.css';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <AuthWrapper />
  </React.StrictMode>
);

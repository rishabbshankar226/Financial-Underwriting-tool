import React from 'react';
import { createRoot } from 'react-dom/client';
import AccessGate from './AccessGate';
import './styles.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><AccessGate /></React.StrictMode>);

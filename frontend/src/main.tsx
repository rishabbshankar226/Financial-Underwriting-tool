import React from 'react';
import { createRoot } from 'react-dom/client';
import AccessGate from './AccessGate';
import { ThemeRoot } from './ThemeRoot';
import './styles.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><ThemeRoot><AccessGate /></ThemeRoot></React.StrictMode>);

import React from 'react';
import { createRoot } from 'react-dom/client';
import { SidePanel } from '@/features/resources/components/SidePanel';
import './style.css';

const root = document.createElement('div');
document.body.appendChild(root);
createRoot(root).render(
  <React.StrictMode>
    <SidePanel />
  </React.StrictMode>
);

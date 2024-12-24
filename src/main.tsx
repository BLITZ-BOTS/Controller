import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from '@/Components/ui/toast';
import { Toaster } from '@/Components/ui/toaster';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ToastProvider>
      <Toaster />
      <App />
    </ToastProvider>
  </React.StrictMode>
);

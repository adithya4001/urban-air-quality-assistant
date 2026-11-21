import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/react';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find root element');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
      ? <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}><App /></ClerkProvider>
      : <main role="alert" style={{ padding: '2rem' }}>Account service is unavailable. Please try again later.</main>}
  </React.StrictMode>
);

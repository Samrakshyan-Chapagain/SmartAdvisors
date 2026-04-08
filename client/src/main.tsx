import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import './index.css';

const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim();

/* StrictMode off in dev: it double-invokes effects and re-renders, which makes this GSAP-heavy UI feel much laggier than production. */
createRoot(document.getElementById('root')!).render(
  clientId ? (
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  ) : (
    <App />
  )
);

import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import './index.css';

const raw = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const clientId = raw?.trim() || undefined;
const googleOAuthEnabled = Boolean(clientId);

/* StrictMode off in dev: it double-invokes effects and re-renders, which makes GSAP-heavy UI feel much laggier than production. */
createRoot(document.getElementById('root')!).render(
  clientId ? (
    <GoogleOAuthProvider clientId={clientId}>
      <App googleOAuthEnabled={googleOAuthEnabled} />
    </GoogleOAuthProvider>
  ) : (
    <App googleOAuthEnabled={false} />
  )
);

import { ArrowLeft, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';

export interface GoogleUser {
  name: string;
  email: string;
  picture: string;
}

interface LoginPageProps {
  googleOAuthEnabled: boolean;
  onGuestContinue: () => void;
  onLogin: (user: GoogleUser) => void;
  onBack: () => void;
}

function GoogleSignInButton({ onLogin }: { onLogin: (user: GoogleUser) => void }) {
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await res.json();
        onLogin({
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture,
        });
      } catch {
        alert('Failed to get user info. Please try again.');
      }
    },
    onError: () => {
      alert('Google sign-in failed. Please try again.');
    },
  });

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => googleLogin()}
      className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl border border-white/10 bg-white/[0.08] hover:bg-white/[0.12] text-white font-semibold text-sm transition-colors"
    >
      <GoogleIcon />
      Continue with Google
    </motion.button>
  );
}

function GitHubIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
      <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage({ googleOAuthEnabled, onGuestContinue, onLogin, onBack }: LoginPageProps) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors font-semibold text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
              <Compass className="w-6 h-6 text-[#FF8040]" />
            </div>
            <span className="text-xl font-bold text-white">SmartAdvisors</span>
          </div>

          <p className="text-center text-white/50 text-sm mb-8">
            Sign in to plan your degree semester by semester
          </p>

          {/* Google Sign-In (real) */}
          <div className="space-y-3 mb-6">
            {googleOAuthEnabled ? (
              <GoogleSignInButton onLogin={onLogin} />
            ) : (
              <div>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled
                  className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] text-white/30 font-semibold text-sm cursor-not-allowed"
                >
                  <GoogleIcon />
                  Continue with Google
                </motion.button>
                <p className="text-xs text-yellow-300/80 mt-2">
                  Google sign-in is unavailable. Set VITE_GOOGLE_CLIENT_ID in your .env and restart Vite.
                </p>
              </div>
            )}

            {/* GitHub and Microsoft — coming soon placeholders */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled
              className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] text-white/30 font-semibold text-sm cursor-not-allowed"
            >
              <GitHubIcon />
              Continue with GitHub <span className="ml-auto text-xs text-white/20">coming soon</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled
              className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] text-white/30 font-semibold text-sm cursor-not-allowed"
            >
              <MicrosoftIcon />
              Continue with Microsoft <span className="ml-auto text-xs text-white/20">coming soon</span>
            </motion.button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs font-semibold uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Guest option */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onGuestContinue}
            className="w-full py-3.5 rounded-xl border border-[#0046FF]/30 bg-[#0046FF]/10 hover:bg-[#0046FF]/20 text-[#0046FF] font-semibold text-sm transition-colors text-center"
          >
            Continue as Guest
          </motion.button>

          <p className="text-center text-white/30 text-xs mt-4">
            Guest users get professor recommendations. Sign in for full degree planning.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

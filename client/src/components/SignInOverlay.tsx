import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Compass, Star, ArrowRight } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import gsap from 'gsap';

export interface GoogleUser {
  name: string;
  email: string;
  picture: string;
}

interface SignInOverlayProps {
  isVisible: boolean;
  googleOAuthEnabled: boolean;
  onLogin: (user: GoogleUser) => void;
  onGuestContinue: () => void;
  onClose: () => void;
}

/* ── Stagger helper — typed for framer-motion ── */
const stagger = (i: number) => ({
  initial: { opacity: 0, y: 12 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { delay: 0.15 + i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

/* ── SVG Icons ── */
function GoogleIcon() {
  return (
    <svg className="signin-sso-icon" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="signin-sso-icon" viewBox="0 0 24 24" fill="white">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg className="signin-sso-icon" viewBox="0 0 24 24">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
      <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

/* ── Google login button — must be its own component since it uses a hook ── */
function GoogleSignInButton({ onLogin }: { onLogin: (user: GoogleUser) => void }) {
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const info = await res.json();
        onLogin({ name: info.name, email: info.email, picture: info.picture });
      } catch {
        alert('Failed to get user info. Please try again.');
      }
    },
    onError: () => {
      alert('Google sign-in failed. Please try again.');
    },
  });

  return (
    <button onClick={() => googleLogin()} className="signin-sso-btn">
      <GoogleIcon />
      <span>Continue with Google</span>
    </button>
  );
}

/* ══════════════════════════════════════════
   MAIN OVERLAY — SPLIT SCREEN
   ══════════════════════════════════════════ */
export default function SignInOverlay({
  isVisible,
  googleOAuthEnabled,
  onLogin,
  onGuestContinue,
  onClose,
}: SignInOverlayProps) {

  /* ── GSAP refs ── */
  const leftRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const badge1Ref = useRef<HTMLSpanElement>(null);
  const badge2Ref = useRef<HTMLSpanElement>(null);
  const badge3Ref = useRef<HTMLSpanElement>(null);

  /* ── GSAP animations — run when overlay becomes visible ── */
  useEffect(() => {
    if (!isVisible) return;

    const ctx = gsap.context(() => {
      const lines = [line1Ref.current, line2Ref.current, line3Ref.current].filter(Boolean);
      // Headline lines stagger in
      gsap.fromTo(lines, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.15,
      });

      // Subtext fade
      if (subtextRef.current) {
        gsap.fromTo(subtextRef.current, { opacity: 0, y: 12 }, {
          opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.55,
        });
      }

      // Card entrance
      if (cardRef.current) {
        gsap.fromTo(cardRef.current, { y: 60, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.6,
          onComplete: () => {
            // Continuous float after entrance
            if (cardRef.current) {
              gsap.to(cardRef.current, { y: -10, duration: 2.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
            }
          },
        });
      }

      // Badge fly-ins + independent floats
      const badges = [
        { ref: badge1Ref.current, from: { x: 40, opacity: 0 }, float: { y: -8, duration: 2 } },
        { ref: badge2Ref.current, from: { x: -40, opacity: 0 }, float: { y: -6, duration: 3, delay: 0.5 } },
        { ref: badge3Ref.current, from: { y: 30, opacity: 0 }, float: { y: -10, duration: 2.2, delay: 1 } },
      ];

      badges.forEach((b, i) => {
        if (!b.ref) return;
        gsap.fromTo(b.ref, { ...b.from }, {
          x: 0, y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.8 + i * 0.1,
          onComplete: () => {
            if (b.ref) {
              gsap.to(b.ref, { y: b.float.y, duration: b.float.duration, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: b.float.delay ?? 0 });
            }
          },
        });
      });
    }, leftRef);

    return () => {
      ctx.revert(); // kills all GSAP tweens scoped to leftRef
    };
  }, [isVisible]);

  /* ── Push history entry so browser back works ── */
  useEffect(() => {
    if (isVisible) {
      window.history.pushState({ signIn: true }, '');
      const onPop = () => onClose();
      window.addEventListener('popstate', onPop);
      return () => window.removeEventListener('popstate', onPop);
    }
  }, [isVisible, onClose]);

  /* ── ESC key ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isVisible) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="signin-overlay"
          className="si-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Sweep panel */}
          <motion.div
            className="si-sweep"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          />

          {/* Back button */}
          <motion.button
            onClick={onClose}
            className="si-back"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>

          {/* ═══ SPLIT ═══ */}
          <div className="si-split">
            {/* ── LEFT COLUMN ── */}
            <div className="si-left" ref={leftRef}>
              <div className="si-left-glow" aria-hidden="true" />
              <div className="si-left-glow-coral" aria-hidden="true" />

              {/* Logo */}
              <div className="si-left-logo">
                <div className="si-left-logo-icon">
                  <Compass className="w-5 h-5 text-[var(--accent-coral)]" />
                  <span className="si-left-logo-dot" />
                </div>
                <span className="si-left-logo-text">Smart Advisors</span>
              </div>

              {/* Hero headline — each line animates via GSAP */}
              <div className="si-left-hero">
                <h1 className="si-left-headline">
                  <span ref={line1Ref} className="si-headline-line">Smarter planning.</span>
                  <span ref={line2Ref} className="si-headline-line"><span className="gradient-text">Better</span> semesters.</span>
                  <span ref={line3Ref} className="si-headline-line">Starting now.</span>
                </h1>

                {/* Subtext */}
                <p ref={subtextRef} className="si-left-subtext">
                  Join students who stopped guessing and started planning.
                </p>
              </div>

              {/* ── Floating course match card ── */}
              <div className="si-card-scene">
                <div ref={cardRef} className="si-match-card">
                  {/* Top row */}
                  <div className="si-mc-top">
                    <span className="si-mc-score">98%</span>
                    <div className="si-mc-course-info">
                      <span className="si-mc-course">CSE 4308</span>
                      <span className="si-mc-subtitle">Artificial Intelligence</span>
                    </div>
                  </div>

                  {/* Professor row */}
                  <div className="si-mc-prof">
                    <Star className="w-3.5 h-3.5" style={{ color: 'var(--accent-orange)' }} />
                    <span>Prof. Nguyen — 4.8 / 5.0</span>
                  </div>

                  {/* Tag row */}
                  <div className="si-mc-tags">
                    <span className="si-mc-tag">3 Credits</span>
                    <span className="si-mc-tag">91% Would Take Again</span>
                  </div>

                  {/* Bottom row */}
                  <div className="si-mc-bottom">
                    <span className="si-mc-match-label">Best match for your style</span>
                    <span className="si-mc-arrow"><ArrowRight className="w-3.5 h-3.5" /></span>
                  </div>
                </div>

                {/* Orbiting badges */}
                <span ref={badge1Ref} className="si-badge si-badge-1">✦ 98% Match</span>
                <span ref={badge2Ref} className="si-badge si-badge-2">⭐ Prof. Rated 4.9</span>
                <span ref={badge3Ref} className="si-badge si-badge-3">🔒 100% Private</span>
              </div>

              {/* Bottom caption */}
              <p className="si-left-caption">Built for UTA Students</p>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="si-right">
              <motion.div
                className="si-card"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* 1. Logo icon */}
                <motion.div className="signin-logo-row" {...stagger(0)}>
                  <div className="si-card-logo-box">
                    <Compass className="w-5 h-5 text-[var(--accent-coral)]" />
                  </div>
                </motion.div>

                {/* 2. Headline */}
                <motion.h2 className="si-card-headline" {...stagger(1)}>
                  Welcome back.
                </motion.h2>

                {/* 3. SSO buttons */}
                <div className="si-sso-stack">
                  <motion.div {...stagger(2)}>
                    {googleOAuthEnabled ? (
                      <GoogleSignInButton onLogin={onLogin} />
                    ) : (
                      <div>
                        <button disabled className="signin-sso-btn signin-sso-disabled">
                          <GoogleIcon />
                          <span>Continue with Google</span>
                        </button>
                        <p className="signin-oauth-hint">
                          Google sign-in is unavailable. Set VITE_GOOGLE_CLIENT_ID in your .env and restart Vite.
                        </p>
                      </div>
                    )}
                  </motion.div>

                  <motion.div {...stagger(3)}>
                    <button disabled className="signin-sso-btn signin-sso-disabled">
                      <GitHubIcon />
                      <span>Continue with GitHub</span>
                      <span className="signin-sso-badge">coming soon</span>
                    </button>
                  </motion.div>

                  <motion.div {...stagger(4)}>
                    <button disabled className="signin-sso-btn signin-sso-disabled">
                      <MicrosoftIcon />
                      <span>Continue with Microsoft</span>
                      <span className="signin-sso-badge">coming soon</span>
                    </button>
                  </motion.div>
                </div>

                {/* 4. OR divider */}
                <motion.div className="si-divider" {...stagger(5)}>
                  <span className="signin-divider-line" />
                  <span className="signin-divider-text">or</span>
                  <span className="signin-divider-line" />
                </motion.div>

                {/* 5. Continue as Guest */}
                <motion.div {...stagger(6)}>
                  <button onClick={onGuestContinue} className="si-guest-btn">
                    Continue as Guest
                  </button>
                </motion.div>

                {/* 10. Caption */}
                <motion.p className="si-caption" {...stagger(9)}>
                  Guest users get course and professor recommendations for next semester. Sign in for full degree planning.
                </motion.p>

              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

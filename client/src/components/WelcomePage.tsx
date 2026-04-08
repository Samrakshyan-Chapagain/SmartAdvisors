import React, { useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, Star, LogIn, Upload, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface WelcomePageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

/* ── scroll-reveal hook ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.15 }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);
  return ref;
}

export default function WelcomePage({ onGetStarted, onSignIn }: WelcomePageProps) {
  const wrapperRef = useReveal();

  return (
    <div ref={wrapperRef} className="relative overflow-hidden">

      {/* ═══ BACKGROUND ATMOSPHERE ═══ */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="hero-glow-left" />
        <div className="hero-glow-right" />
        <div className="grid-bg" />
        <div className="grain-overlay" />
      </div>

      {/* ════════════════════════════════╗
       ║   HERO — ASYMMETRIC 60 / 40    ║
       ╚════════════════════════════════*/}
      <section className="relative z-10 w-full max-w-[var(--content-max)] mx-auto px-6 lg:px-8 pt-2 pb-20 md:pb-[var(--section-pad)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-14 items-center min-h-[72vh]">

          {/* ── LEFT COLUMN ── */}
          <div className="text-left">

            {/* Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <span className="trust-badge mb-6 inline-flex">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                For UTA Students
              </span>
            </motion.div>

            {/* Headline — 68px desktop / 40px mobile */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-heading text-[40px] md:text-[68px] font-extrabold tracking-tight mb-5 leading-[1.06] text-[var(--text-primary)]"
            >
              Plan Your{' '}
              <span className="gradient-text">Perfect</span>
              <br />
              Semester
            </motion.h1>

            {/* Sub-headline — 18px, --text-body */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="text-[15px] md:text-lg text-[var(--text-body)] mb-10 max-w-lg leading-relaxed"
            >
              Upload your unofficial transcript. We&rsquo;ll figure out what you can take next
              and find the best professors for each course.
            </motion.p>

            {/* ── Step indicators with animated connectors ── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0 mb-10"
            >
              <Step num="1" label="Upload Unofficial Transcript" icon={<Upload className="w-4 h-4" />} />
              <div className="step-connector hidden sm:block" />
              <Step num="2" label="Set Preferences" icon={<Star className="w-4 h-4" />} />
              <div className="step-connector hidden sm:block" />
              <Step num="3" label="Get Matched" icon={<CheckCircle2 className="w-4 h-4" />} />
            </motion.div>

            {/* ── CTA buttons ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-start gap-4 mb-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onGetStarted}
                className="btn-gradient group inline-flex items-center gap-3 text-lg !px-10 !py-4 !rounded-xl shadow-xl"
              >
                Continue as Guest
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onSignIn}
                className="btn-ghost group inline-flex items-center gap-3 text-lg !px-10 !py-4 !rounded-xl"
              >
                <LogIn className="w-5 h-5" />
                Sign In
              </motion.button>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN: Animated hero visual ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="hidden lg:block"
          >
            <HeroVisual />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════╗
       ║  THREE FEATURE CARDS SECTION        ║
       ╚═══════════════════════════════════*/}
      <section className="sa-cards-section relative z-10">
        <div className="sa-cards-grid">

          {/* ─── CARD 1 — Try it instantly ─── */}
          <div className="sa-card sa-card-side reveal">
            <div className="sa-card-icon sa-card-icon--orange">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <h3 className="sa-card-title">Try it instantly</h3>
            <p className="sa-card-subtitle">No account needed</p>
            <ul className="sa-card-list">
              <li className="sa-card-list-item">
                <span className="sa-check sa-check--orange">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff6b35"><circle cx="12" cy="12" r="12"/><path d="M9 12.5l2 2 4-4" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                Upload unofficial transcript &amp; detect completed courses
              </li>
              <li className="sa-card-list-item">
                <span className="sa-check sa-check--orange">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff6b35"><circle cx="12" cy="12" r="12"/><path d="M9 12.5l2 2 4-4" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                See eligible classes based on prerequisites
              </li>
              <li className="sa-card-list-item">
                <span className="sa-check sa-check--orange">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff6b35"><circle cx="12" cy="12" r="12"/><path d="M9 12.5l2 2 4-4" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                Get professor recommendations matched to your style
              </li>
            </ul>
          </div>

          {/* ─── CARD 2 — Plan your whole degree (CENTER) ─── */}
          <div className="sa-card sa-card-center reveal reveal-delay-1">
            <span className="sa-badge-popular">Most Popular</span>
            <div className="sa-card-icon sa-card-icon--blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5b7cfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h3 className="sa-card-title">Plan your whole degree</h3>
            <p className="sa-card-subtitle">Sign in required</p>
            <ul className="sa-card-list">
              <li className="sa-card-list-item">
                <span className="sa-check sa-check--blue">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#5b7cfa"><circle cx="12" cy="12" r="12"/><path d="M9 12.5l2 2 4-4" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                Everything in guest mode, plus...
              </li>
              <li className="sa-card-list-item">
                <span className="sa-check sa-check--blue">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#5b7cfa"><circle cx="12" cy="12" r="12"/><path d="M9 12.5l2 2 4-4" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                Pick your courses &amp; set credit hours per semester
              </li>
              <li className="sa-card-list-item">
                <span className="sa-check sa-check--blue">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#5b7cfa"><circle cx="12" cy="12" r="12"/><path d="M9 12.5l2 2 4-4" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                Auto-generate a full semester-by-semester degree plan
              </li>
            </ul>
          </div>

          {/* ─── CARD 3 — Your data stays yours ─── */}
          <div className="sa-card sa-card-side reveal reveal-delay-2">
            <div className="sa-card-icon sa-card-icon--green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <h3 className="sa-card-title">Your data stays yours</h3>
            <p className="sa-card-subtitle">Zero storage policy</p>
            <ul className="sa-card-list">
              <li className="sa-card-list-item">
                <span className="sa-check sa-check--green">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#22c55e"><circle cx="12" cy="12" r="12"/><path d="M9 12.5l2 2 4-4" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                Unofficial transcript uploaded securely — never stored on servers
              </li>
              <li className="sa-card-list-item">
                <span className="sa-check sa-check--green">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#22c55e"><circle cx="12" cy="12" r="12"/><path d="M9 12.5l2 2 4-4" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                Instant results with no long waiting or processing
              </li>
              <li className="sa-card-list-item">
                <span className="sa-check sa-check--green">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#22c55e"><circle cx="12" cy="12" r="12"/><path d="M9 12.5l2 2 4-4" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                Professor scores from thousands of real student reviews
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER STRIP ═══ */}
      <footer className="sa-footer relative z-10">
        <div className="sa-footer-inner">
          <div className="sa-footer-left">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-primary)]">
              <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
            </svg>
            <span className="sa-footer-brand">Smart Advisors</span>
          </div>
          <div className="sa-footer-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)]">
              <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
            </svg>
            <span>Built for UTA Students</span>
          </div>
          <div className="sa-footer-right">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="sa-footer-link">GitHub</a>
            <a href="/privacy" className="sa-footer-link">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ════════════════════════════════════════════
   HERO VISUAL — Glassmorphism card + orbiting badges
   ════════════════════════════════════════════ */
function HeroVisual() {
  return (
    <div className="relative w-full h-[440px] flex items-center justify-center">

      {/* Glow behind card */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[100px] opacity-20 pointer-events-none bg-[var(--accent-purple)]"
        aria-hidden="true"
      />

      {/* Floating course-match card */}
      <div className="glass-card p-6 w-[310px] hero-float relative z-10">
        {/* Header with match ring */}
        <div className="flex items-center gap-3 mb-4">
          <div className="match-ring">
            <span className="text-[var(--accent-green)] text-sm font-bold">98%</span>
          </div>
          <div>
            <h4 className="font-heading text-sm font-bold text-[var(--text-primary)]">CSE 3310</h4>
            <p className="text-[var(--text-muted)] text-xs">Fund. of Software Engineering</p>
          </div>
        </div>

        {/* Professor rating */}
        <div className="flex items-center gap-2 mb-3 text-xs text-[var(--text-body)]">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span>Prof. Smith &mdash; <strong className="text-[var(--text-primary)]">4.9 / 5.0</strong></span>
        </div>

        {/* Info pills */}
        <div className="flex gap-2">
          <span className="px-2.5 py-1 rounded-full bg-[var(--accent-purple)]/10 border border-[var(--accent-purple)]/20 text-[var(--accent-purple)] text-xs font-medium">
            MWF 10:00 AM
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/20 text-[var(--accent-green)] text-xs font-medium">
            3 Credits
          </span>
        </div>

        {/* Action bar */}
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex justify-between items-center">
          <span className="text-xs text-[var(--text-muted)]">Best match for your style</span>
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-coral)] flex items-center justify-center">
            <ArrowRight className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>

      {/* ── Orbiting badges ── */}
      <div className="orbit-badge badge-drift-1 top-[6%] right-[8%] shadow-lg">
        <span className="flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3 text-[var(--accent-green)]" />
          98% Match
        </span>
      </div>

      <div className="orbit-badge badge-drift-2 bottom-[12%] left-[2%] shadow-lg">
        <span className="flex items-center gap-1.5">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          Prof. Rated 4.9
        </span>
      </div>

      <div className="orbit-badge badge-drift-3 top-[28%] left-[-2%] shadow-lg">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-[var(--accent-coral)]" />
          3 Spots Left
        </span>
      </div>
    </div>
  );
}

/* ── Step pill ── */
function Step({ num, label, icon }: { num: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-orange)] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-md shadow-[var(--accent-purple)]/25">
        {num}
      </div>
      <span className="text-[var(--text-muted)] text-sm font-medium flex items-center gap-1.5">
        {icon} {label}
      </span>
    </div>
  );
}

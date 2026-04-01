import React, { useState, useEffect } from 'react';
import { Compass, Github, LogIn, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onLogoClick: () => void;
  user?: { name: string; picture?: string } | null;
  onSignOut?: () => void;
  onSignIn?: () => void;
}

export default function Layout({ children, onLogoClick, user, onSignOut, onSignIn }: LayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-sans text-white relative overflow-x-hidden selection:bg-[var(--accent-coral)] selection:text-white">

      {/* --- AMBIENT BACKGROUND LAYERS --- */}
      <div className="fixed top-[-10%] left-[-10%] w-[700px] h-[700px] bg-[var(--accent-blue)] rounded-full blur-[120px] opacity-[0.08] -z-10 pointer-events-none" />
      <div className="fixed top-[20%] right-[-5%] w-[600px] h-[600px] bg-[var(--accent-purple)] rounded-full blur-[100px] opacity-[0.06] -z-10 pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-[var(--accent-coral)] rounded-full blur-[120px] opacity-[0.05] -z-10 pointer-events-none" />

      {/* NAVBAR — frosted glass with slide-down animation */}
      <nav
        className={`navbar-glass fixed top-0 left-0 right-0 z-50 transition-shadow duration-300
          ${isScrolled ? 'shadow-lg shadow-black/20' : ''}`}
      >
        <div className="max-w-[var(--content-max)] mx-auto px-6 lg:px-8 flex items-center justify-between h-16">

          {/* LEFT: LOGO */}
          <button
            onClick={onLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none group"
          >
            <div className="relative bg-white/5 p-2.5 rounded-xl border border-white/10 shadow-lg group-hover:bg-white/10 transition-all duration-300">
              <Compass className="w-6 h-6 text-white relative z-10" strokeWidth={2.5} />
              <div className="absolute top-2 right-2 w-2 h-2 bg-[var(--accent-coral)] rounded-full z-20 animate-pulse" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Smart Advisors
            </h1>
          </button>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-3">
            {user && (
              <>
                <div className="flex items-center gap-2">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="w-7 h-7 rounded-full border border-white/20" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[var(--accent-blue)]/30 border border-white/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{user.name[0]}</span>
                    </div>
                  )}
                  <span className="text-sm font-semibold text-white/70 hidden sm:block">{user.name.split(' ')[0]}</span>
                </div>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all text-white/50 text-xs font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                )}
              </>
            )}

            {/* Sign In button — only when no user and handler provided */}
            {!user && onSignIn && (
              <button
                onClick={onSignIn}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[var(--accent-purple)]/50 transition-all text-white/70 hover:text-white text-sm font-semibold"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:block">Sign In</span>
              </button>
            )}

            <a
              href="https://github.com/krm3798/SmartAdvisors"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[var(--accent-blue)]/50 transition-all group text-white"
            >
              <span className="text-sm font-bold hidden sm:block group-hover:text-[var(--accent-blue)] transition-colors">GitHub</span>
              <Github className="w-5 h-5 group-hover:text-[var(--accent-blue)] transition-colors" />
            </a>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="pt-24 px-4 pb-12 relative z-10">
        {children}
      </main>
    </div>
  );
}
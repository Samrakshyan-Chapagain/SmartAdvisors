import React from 'react';
import { Compass, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onLogoClick: () => void;
  user?: { name: string; picture?: string } | null;
  onSignOut?: () => void;
  /** When true, content is clamped to viewport height with no scroll (for Upload page) */
  fullViewport?: boolean;
}

export default function Layout({ children, onLogoClick, user, onSignOut, fullViewport }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--bg)] font-body text-[var(--text)] relative overflow-x-hidden selection:bg-[#ff6b35] selection:text-white">
      {/* NAVBAR — 58px, design system header */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-[58px] flex items-center border-b border-[var(--border)]"
        style={{ background: 'rgba(7,8,15,0.97)' }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between w-full">
          
          {/* LEFT: LOGO */}
          <button
            onClick={onLogoClick}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity focus:outline-none group"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--s1)] border border-[var(--border)] group-hover:bg-[var(--border2)] transition-all">
              <Compass className="w-5 h-5 text-[var(--text)] relative z-10" strokeWidth={2.4} />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[var(--orange)] rounded-full z-20 animate-pulse" />
            </div>
            <h1 className="text-[18px] font-bold leading-none text-[var(--text)] tracking-tight">Smart Advisors</h1>
          </button>

          {/* RIGHT: User + Sign Out */}
          <div className="flex items-center gap-3">
            {user && (
              <>
                <div className="flex items-center gap-2">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="w-7 h-7 rounded-full border border-[var(--border)]" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[var(--blue)]/30 border border-[var(--border)] flex items-center justify-center">
                      <span className="text-xs font-bold text-[var(--text)]">{user.name[0]}</span>
                    </div>
                  )}
                  <span className="text-sm font-semibold text-[var(--sub)] hidden sm:block">{user.name.split(' ')[0]}</span>
                </div>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--s1)] hover:bg-red-500/10 hover:border-red-500/30 hover:text-[var(--red)] transition-all text-[var(--sub)] text-xs font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                )}
              </>
            )}
          </div>

        </div>
      </nav>

      {/* Page Content — 58px header offset */}
      <main className={`pt-[58px] ${fullViewport ? 'h-[calc(100vh-58px)] overflow-hidden' : 'min-h-[calc(100vh-58px)]'}`}>
        {children}
      </main>
    </div>
  );
}
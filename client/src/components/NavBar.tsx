import React from 'react';
import { NavBarProps } from '../types/PlanDegreePage';

/**
 * NavBar Component
 * 
 * Fixed navigation header for the Plan Degree Page with back button,
 * SmartAdvisor logo with pulse animation, student avatar, and sign out button.
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 11.2
 */
export const NavBar: React.FC<NavBarProps> = ({ studentName, onBack, onSignOut }) => {
  // Get initials from student name for avatar
  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <nav 
        className="fixed top-0 left-0 right-0 h-14 z-50 border-b"
        style={{ 
          background: 'rgba(7, 8, 15, 0.97)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderColor: 'var(--border)'
        }}
      >
        <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Left: Back Button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-200"
            aria-label="Go back"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="transition-transform duration-200 hover:-translate-x-0.5"
            >
              <path 
                d="M12.5 15L7.5 10L12.5 5" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>

          {/* Center: SmartAdvisor Logo with Pulse Animation */}
          <div className="flex items-center gap-2">
            <div className="relative">
              {/* Orange dot with breathing pulse animation */}
              <div 
                className="w-2 h-2 rounded-full sa-logo-pulse"
                style={{ backgroundColor: 'var(--orange)' }}
              />
            </div>
            <span 
              className="text-lg font-bold text-white"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              SmartAdvisor
            </span>
          </div>

          {/* Right: Student Avatar and Sign Out */}
          <div className="flex items-center gap-3">
            {/* Student Avatar */}
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
              style={{ 
                background: 'linear-gradient(135deg, var(--blue), var(--orange))'
              }}
              aria-label={`${studentName}'s avatar`}
            >
              {getInitials(studentName)}
            </div>

            {/* Sign Out Button */}
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-200"
                aria-label="Sign out"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Pulse Animation Keyframes */}
      <style>{`
        @keyframes sa-logo-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.7);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(255, 107, 53, 0);
          }
        }
        .sa-logo-pulse {
          animation: sa-logo-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </>
  );
};

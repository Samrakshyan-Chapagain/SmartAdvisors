import {
  Compass,
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';

interface DashboardSidebarProps {
  userName: string;
  userPicture?: string;
  department: string;
  onSignOut: () => void;
  onNavClick?: (id: string) => void;
  onLogoClick?: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, active: true },
  { id: 'plan', label: 'Degree Plan', icon: GraduationCap, soon: false },
  { id: 'courses', label: 'My Courses', icon: BookOpen, soon: true },
  { id: 'professors', label: 'Professors', icon: Users, soon: true },
  { id: 'settings', label: 'Settings', icon: Settings, soon: true },
];

export default function DashboardSidebar({
  userName,
  userPicture,
  department,
  onSignOut,
  onNavClick,
  onLogoClick,
}: DashboardSidebarProps) {
  const firstName = userName.split(' ')[0];
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* ─── Desktop / Tablet sidebar ─── */}
      <aside className="ds-sidebar" aria-label="Main navigation">
        {/* Gradient overlay */}
        <div className="ds-sidebar-overlay" aria-hidden="true" />

        <div className="ds-sidebar-inner">
          {/* Logo */}
          <div className="ds-sidebar-top">
            <button
              type="button"
              className="ds-logo-row"
              onClick={onLogoClick}
              aria-label="Go to home"
            >
              <div className="ds-logo-icon">
                <Compass className="w-5 h-5 text-white" strokeWidth={2.5} />
                <span className="ds-logo-dot" />
              </div>
              <span className="ds-sidebar-text ds-logo-label">Smart Advisors</span>
            </button>

            {/* Nav */}
            <nav className="ds-nav">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    aria-label={item.label}
                    aria-current={item.active ? 'page' : undefined}
                    className={`ds-nav-link ${item.active ? 'ds-nav-active' : ''}`}
                    onClick={() => onNavClick?.(item.id)}
                  >
                    <Icon className="ds-nav-icon" />
                    <span className="ds-sidebar-text">{item.label}</span>
                    {item.soon && (
                      <span className="ds-sidebar-text ds-soon-badge">Soon</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User row */}
          <div className="ds-user-row">
            {userPicture ? (
              <img
                src={userPicture}
                alt={userName}
                className="ds-user-avatar"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="ds-user-avatar ds-user-avatar-fallback">
                {initials}
              </div>
            )}
            <div className="ds-sidebar-text ds-user-info">
              <span className="ds-user-name">{firstName}</span>
              <span className="ds-user-role">{department || 'Computer Science'}</span>
            </div>
            <button
              onClick={onSignOut}
              title="Sign out"
              aria-label="Sign out"
              className="ds-sidebar-text ds-signout-btn"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Mobile bottom tab bar ─── */}
      <nav className="ds-mobile-tabs" aria-label="Mobile navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              aria-label={item.label}
              aria-current={item.active ? 'page' : undefined}
              className={`ds-mobile-tab ${item.active ? 'ds-mobile-tab-active' : ''}`}
              onClick={() => onNavClick?.(item.id)}
            >
              <Icon className="w-5 h-5" />
              <span className="ds-mobile-tab-label">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

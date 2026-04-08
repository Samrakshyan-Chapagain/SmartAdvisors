import DashboardSidebar from './DashboardSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName: string;
  userPicture?: string;
  department: string;
  onSignOut: () => void;
  onNavClick?: (id: string) => void;
  onLogoClick?: () => void;
}

export default function DashboardLayout({
  children,
  userName,
  userPicture,
  department,
  onSignOut,
  onNavClick,
  onLogoClick,
}: DashboardLayoutProps) {
  return (
    <div className="ds-shell">
      {/* Atmospheric background glows */}
      <div className="ds-glow ds-glow-1" aria-hidden="true" />
      <div className="ds-glow ds-glow-2" aria-hidden="true" />

      <DashboardSidebar
        userName={userName}
        userPicture={userPicture}
        department={department}
        onSignOut={onSignOut}
        onNavClick={onNavClick}
        onLogoClick={onLogoClick}
      />

      {/* Main content area */}
      <main className="ds-main">
        <div className="ds-main-inner">
          {children}
        </div>
      </main>
    </div>
  );
}

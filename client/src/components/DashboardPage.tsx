import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  Calendar,
  BookOpen,
  Clock,
  GraduationCap,
} from 'lucide-react';

interface DashboardPageProps {
  userName: string;
  department: string;
  college: string;
  onViewPlan: () => void;
  onEditPlan: () => void;
  onNewTranscript: () => void;
}

const STATS = [
  {
    id: 'semesters',
    label: 'SEMESTERS LEFT',
    value: '4',
    icon: Calendar,
    color: '#5b7cfa',
    glowColor: 'rgba(91,124,250,0.15)',
  },
  {
    id: 'courses',
    label: 'COURSES PLANNED',
    value: '31',
    icon: BookOpen,
    color: '#ff6b35',
    glowColor: 'rgba(255,107,53,0.15)',
  },
  {
    id: 'credits',
    label: 'CREDIT HRS LEFT',
    value: '89',
    icon: Clock,
    color: '#8892b8',
    glowColor: 'rgba(136,146,184,0.15)',
  },
  {
    id: 'complete',
    label: 'DEGREE COMPLETE',
    value: '85%',
    icon: GraduationCap,
    color: '#22c55e',
    glowColor: 'rgba(34,197,94,0.15)',
  },
] as const;

const PROFESSORS = [
  { name: 'Dr. Sarah Chen', course: 'CSE 4310 · Machine Learning', rating: 4.9, reviews: 124, accent: '#5b7cfa', initials: 'SC' },
  { name: 'Prof. James Miller', course: 'CSE 4322 · AI Systems', rating: 4.8, reviews: 98, accent: '#ff6b35', initials: 'JM' },
  { name: 'Dr. Aisha Patel', course: 'CSE 4360 · Robotics', rating: 4.9, reviews: 112, accent: '#22c55e', initials: 'AP' },
  { name: 'Prof. David Kim', course: 'CSE 4382 · Data Visualization', rating: 4.7, reviews: 87, accent: '#8892b8', initials: 'DK' },
];

export default function DashboardPage({
  userName,
  department,
  college,
  onViewPlan,
  onEditPlan,
  onNewTranscript,
}: DashboardPageProps) {
  const firstName = userName.split(' ')[0];
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const profsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /* ── Count-up helper ── */
    function countUp(el: HTMLElement, target: number, duration: number, delay: number) {
      setTimeout(() => {
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start = Math.min(start + step, target);
          el.textContent = Math.floor(start) + (el.dataset.suffix || '');
          if (start >= target) clearInterval(timer);
        }, 16);
      }, delay);
    }

    /* ── GSAP page-load sequence ── */
    const sidebar = document.querySelector('.ds-sidebar');
    if (sidebar) {
      gsap.fromTo(sidebar,
        { x: -40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0 });
    }

    const header = headerRef.current;
    if (header) {
      // Header text
      gsap.fromTo(header.querySelector('.ds-header-left')!,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 });
      // Degree Plan button
      gsap.fromTo(header.querySelector('.ds-header-cta')!,
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)', delay: 0.2 });
    }

    // Stat cards
    const statCards = cardsRef.current?.querySelectorAll('.ds-stat-card');
    if (statCards?.length) {
      gsap.fromTo(statCards,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.08, delay: 0.3 });
    }

    // Count-up stat values
    const valueEls = cardsRef.current?.querySelectorAll('.ds-stat-value');
    if (valueEls) {
      const targets = [
        { val: 4, suffix: '', delay: 300 },
        { val: 31, suffix: '', delay: 380 },
        { val: 89, suffix: '', delay: 460 },
        { val: 85, suffix: '%', delay: 540 },
      ];
      valueEls.forEach((el, i) => {
        const t = targets[i];
        if (!t) return;
        const htmlEl = el as HTMLElement;
        htmlEl.dataset.suffix = t.suffix;
        htmlEl.textContent = '0' + t.suffix;
        countUp(htmlEl, t.val, 800, t.delay);
      });
    }

    // Two-column row cards
    const leftCard = rowRef.current?.querySelector('.ds-row-card-left');
    const rightCard = rowRef.current?.querySelector('.ds-row-card-right');
    if (leftCard) {
      gsap.fromTo(leftCard,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.6 });
    }
    if (rightCard) {
      gsap.fromTo(rightCard,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.7 });
    }

    // Progress bar fill + shimmer
    const barFill = rowRef.current?.querySelector('.ds-degree-bar-fill');
    if (barFill) {
      gsap.to(barFill, { width: '85%', duration: 1.2, ease: 'power2.out', delay: 0.9 });
      gsap.fromTo(barFill,
        { backgroundPosition: '0% center' },
        { backgroundPosition: '100% center', duration: 1.5, ease: 'power1.out', delay: 0.9 });
    }

    // Semester rows
    const semRows = rowRef.current?.querySelectorAll('.ds-semester-row');
    if (semRows?.length) {
      gsap.fromTo(semRows,
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, ease: 'power3.out', delay: 1.0 });
    }

    // Professor section — IntersectionObserver + GSAP
    const profsEl = profsRef.current;
    if (profsEl) {
      const profCards = profsEl.querySelectorAll('.ds-prof-card');
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            gsap.fromTo(profCards,
              { y: 20, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' });
            obs.disconnect();
          }
        },
        { threshold: 0.1 },
      );
      obs.observe(profsEl);
      return () => obs.disconnect();
    }
  }, []);

  return (
    <>
      {/* ── Header ── */}
      <div ref={headerRef} className="ds-header">
        <div className="ds-header-left">
          <h1 className="ds-header-title">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="ds-header-subtitle">
            {department} · {college}
          </p>
        </div>
        <button className="ds-header-cta" onClick={onViewPlan}>
          View My Degree Plan →
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div ref={cardsRef} className="ds-stats-grid">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className={`ds-stat-card ds-stat-stagger-${i}`}
              data-glow={stat.glowColor}
            >
              <div
                className="ds-stat-accent"
                aria-hidden="true"
              >
                <span
                  className="ds-stat-accent-bar"
                  data-color={stat.color}
                />
              </div>
              <div className="ds-stat-label-row">
                <span className="ds-stat-label">{stat.label}</span>
                <Icon className="ds-stat-icon" color={stat.color} size={18} />
              </div>
              <span className="ds-stat-value">{stat.value}</span>

              {stat.id === 'complete' && (
                <div className="ds-progress-track">
                  <div className="ds-progress-fill" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Two-Column Row: Degree Progress + Up Next ── */}
      <div ref={rowRef} className="ds-two-col">
        {/* LEFT: Degree Progress */}
        <div className="ds-row-card-left ds-degree-card">
          <div className="ds-degree-header">
            <span className="ds-degree-title">Degree Progress</span>
            <span className="ds-degree-pct">85%</span>
          </div>

          <div className="ds-degree-bar-track">
            <div className="ds-degree-bar-fill" />
          </div>

          <div className="ds-semester-list">
            {/* Row 1 – Completed */}
            <div className="ds-semester-row ds-sem-stagger-0">
              <div className="ds-semester-left">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#22c55e" />
                  <path d="M6 10.5l2.5 2.5L14 7.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="ds-semester-name">Fall 2024</span>
              </div>
              <span className="ds-semester-status" data-color="#22c55e">Completed</span>
            </div>

            {/* Row 2 – Completed */}
            <div className="ds-semester-row ds-sem-stagger-1">
              <div className="ds-semester-left">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#22c55e" />
                  <path d="M6 10.5l2.5 2.5L14 7.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="ds-semester-name">Spring 2025</span>
              </div>
              <span className="ds-semester-status" data-color="#22c55e">Completed</span>
            </div>

            {/* Row 3 – Completed */}
            <div className="ds-semester-row ds-sem-stagger-2">
              <div className="ds-semester-left">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#22c55e" />
                  <path d="M6 10.5l2.5 2.5L14 7.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="ds-semester-name">Fall 2025</span>
              </div>
              <span className="ds-semester-status" data-color="#22c55e">Completed</span>
            </div>

            {/* Row 4 – In Progress */}
            <div className="ds-semester-row ds-sem-stagger-3">
              <div className="ds-semester-left">
                <svg className="ds-spinner-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="#5b7cfa" strokeWidth="2" strokeDasharray="4 3" fill="none" />
                </svg>
                <span className="ds-semester-name">Spring 2026</span>
              </div>
              <span className="ds-semester-status" data-color="#5b7cfa">In Progress</span>
            </div>

            {/* Row 5 – Upcoming */}
            <div className="ds-semester-row ds-sem-stagger-4">
              <div className="ds-semester-left">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="9" stroke="#8892b8" strokeWidth="1.5" fill="none" />
                  <path d="M8 10h4m-2-2l2 2-2 2" stroke="#8892b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="ds-semester-name">Fall 2026</span>
              </div>
              <span className="ds-semester-status" data-color="#8892b8">Upcoming</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Up Next */}
        <div className="ds-row-card-right ds-upnext-card">
          <span className="ds-upnext-label">UP NEXT — FALL 2026</span>

          <div className="ds-upnext-list">
            <div className="ds-upnext-row">
              <div className="ds-upnext-icon" data-bg="#5b7cfa">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5b7cfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <div className="ds-upnext-info">
                <span className="ds-upnext-code">CSE 4310</span>
                <span className="ds-upnext-name">Machine Learning</span>
              </div>
              <span className="ds-upnext-cr">3 cr</span>
            </div>

            <div className="ds-upnext-row">
              <div className="ds-upnext-icon" data-bg="#8b5cf6">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
                </svg>
              </div>
              <div className="ds-upnext-info">
                <span className="ds-upnext-code">CSE 4322</span>
                <span className="ds-upnext-name">Artificial Intelligence</span>
              </div>
              <span className="ds-upnext-cr">3 cr</span>
            </div>

            <div className="ds-upnext-row">
              <div className="ds-upnext-icon" data-bg="#ff6b35">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="2" /><path d="M12 12h.01" /><path d="M17 12h.01" /><path d="M7 12h.01" />
                </svg>
              </div>
              <div className="ds-upnext-info">
                <span className="ds-upnext-code">CSE 4360</span>
                <span className="ds-upnext-name">Robotics</span>
              </div>
              <span className="ds-upnext-cr">3 cr</span>
            </div>

            <div className="ds-upnext-row">
              <div className="ds-upnext-icon" data-bg="#ef4444">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />
                </svg>
              </div>
              <div className="ds-upnext-info">
                <span className="ds-upnext-code">CSE 4382</span>
                <span className="ds-upnext-name">Data Visualization</span>
              </div>
              <span className="ds-upnext-cr">3 cr</span>
            </div>

            <div className="ds-upnext-row">
              <div className="ds-upnext-icon" data-bg="#3b82f6">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
                </svg>
              </div>
              <div className="ds-upnext-info">
                <span className="ds-upnext-code">CSE 4316</span>
                <span className="ds-upnext-name">Capstone Project</span>
              </div>
              <span className="ds-upnext-cr">3 cr</span>
            </div>
          </div>

          <div className="ds-upnext-actions">
            <button className="ds-upnext-btn" onClick={onEditPlan}>✏ Edit Plan Settings</button>
            <button className="ds-upnext-btn" onClick={onNewTranscript}>📄 New Transcript</button>
          </div>
        </div>
      </div>

      {/* ── Recommended Professors ── */}
      <div ref={profsRef} className="ds-profs-section">
        <div className="ds-profs-glow" aria-hidden="true" />
        <div className="ds-profs-header">
          <h2 className="ds-profs-title">Recommended Professors</h2>
          <p className="ds-profs-subtitle">Based on your major and course plan</p>
        </div>

        <div className="ds-profs-grid">
          {PROFESSORS.map((prof, i) => (
            <div
              key={prof.name}
              className={`ds-prof-card ds-prof-stagger-${i} ds-prof-accent-${i}`}
            >
              <div className="ds-prof-accent-bar" />
              <div className="ds-prof-top">
                <div className="ds-prof-avatar">
                  <span className="ds-prof-initials">{prof.initials}</span>
                </div>
                <div className="ds-prof-info">
                  <span className="ds-prof-name">{prof.name}</span>
                  <span className="ds-prof-course">{prof.course}</span>
                </div>
              </div>
              <div className="ds-prof-rating">
                <span className="ds-prof-rating-num">{prof.rating}</span>
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= Math.floor(prof.rating) ? '#ff6b35' : 'none'} stroke="#ff6b35" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
                <span className="ds-prof-reviews">({prof.reviews} reviews)</span>
              </div>
              <a className="ds-prof-link" title="Coming soon">View Profile →</a>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer Strip ── */}
      <footer className="ds-footer">
        <div className="ds-footer-logo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ds-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
          <span>Smart Advisors</span>
        </div>
        <div className="ds-footer-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ds-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
          <span>Built for UTA Students</span>
        </div>
        <div className="ds-footer-links">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="#" title="Coming soon">Privacy Policy</a>
        </div>
      </footer>
    </>
  );
}

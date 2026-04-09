import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  Calendar,
  BookOpen,
  Clock,
  GraduationCap,
} from 'lucide-react';

interface PlannedCourse {
  code: string;
  name: string;
  creditHours: number;
  requirement: string;
}

interface PlanSemester {
  label: string;
  courses: PlannedCourse[];
  totalHours: number;
}

interface DegreePlan {
  plan: PlanSemester[];
  totalRemainingHours: number;
  stats?: {
    totalCourses: number;
    totalHours: number;
    completedCourses: number;
    completedHours: number;
  };
}

interface DashboardPageProps {
  plan: DegreePlan;
  completedCourses: string[];
  userName: string;
  department: string;
  college: string;
  onViewPlan: () => void;
  onEditPlan: () => void;
  onNewTranscript: () => void;
}

const PROFESSORS = [
  { name: 'Dr. Sarah Chen', course: 'CSE 4310 · Machine Learning', rating: 4.9, reviews: 124, accent: '#5b7cfa', initials: 'SC' },
  { name: 'Prof. James Miller', course: 'CSE 4322 · AI Systems', rating: 4.8, reviews: 98, accent: '#ff6b35', initials: 'JM' },
  { name: 'Dr. Aisha Patel', course: 'CSE 4360 · Robotics', rating: 4.9, reviews: 112, accent: '#22c55e', initials: 'AP' },
  { name: 'Prof. David Kim', course: 'CSE 4382 · Data Visualization', rating: 4.7, reviews: 87, accent: '#8892b8', initials: 'DK' },
];

/** Step backwards through Fall/Spring (skipping Summer) */
function prevSemLabel(label: string): string {
  const [season, yr] = label.split(' ');
  const year = parseInt(yr, 10);
  if (season === 'Spring') return `Fall ${year - 1}`;
  if (season === 'Summer') return `Spring ${year}`;
  return `Spring ${year}`; // Fall → Spring same year
}

/** Generate `count` past semester labels ending just before `firstPlanned` */
function buildCompletedLabels(firstPlanned: string, count: number): string[] {
  if (!firstPlanned || count <= 0) return [];
  const labels: string[] = [];
  let cur = firstPlanned;
  for (let i = 0; i < count; i++) {
    cur = prevSemLabel(cur);
    labels.unshift(cur);
  }
  return labels;
}

export default function DashboardPage({
  plan,
  completedCourses,
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

  // Derived stats from real degree plan data (with safe fallbacks)
  const planSemesters = Array.isArray(plan?.plan) ? plan.plan : [];
  const semestersLeft = planSemesters.length;

  // Completed-semester estimation from transcript data
  const totalPlanHours = planSemesters.reduce((a, s) => a + (s.totalHours ?? 0), 0);
  const avgHoursPerSem = planSemesters.length > 0 ? totalPlanHours / planSemesters.length : 15;
  const completedHoursForSems = plan?.stats?.completedHours ?? 0;
  // Fallback: estimate via course count if completedHours not available
  const avgCoursesPerSem = planSemesters.length > 0
    ? planSemesters.reduce((a, s) => a + (s.courses?.length ?? 0), 0) / planSemesters.length
    : 5;
  const numCompletedSems = completedHoursForSems > 0 && avgHoursPerSem > 0
    ? Math.max(1, Math.round(completedHoursForSems / avgHoursPerSem))
    : completedCourses.length > 0 && avgCoursesPerSem > 0
      ? Math.max(1, Math.round(completedCourses.length / avgCoursesPerSem))
      : 0;
  const completedSemLabels = buildCompletedLabels(planSemesters[0]?.label ?? '', numCompletedSems);
  const coursesPlanned = planSemesters.reduce((acc, sem) => acc + (sem.courses?.length ?? 0), 0);
  const creditsLeft = plan?.totalRemainingHours ?? 0;
  const completionPct = plan?.stats && plan.stats.totalHours > 0
    ? Math.min(100, Math.round((plan.stats.completedHours / plan.stats.totalHours) * 100))
    : 0;
  const upNextSemester = planSemesters[0];
  const upNextLabel = upNextSemester?.label ?? 'UPCOMING';
  const upNextCourses = upNextSemester?.courses?.slice(0, 5) ?? [];

  const STATS = [
    { id: 'semesters', label: 'SEMESTERS LEFT', value: String(semestersLeft), numValue: semestersLeft, suffix: '', icon: Calendar, color: '#5b7cfa', glowColor: 'rgba(91,124,250,0.15)' },
    { id: 'courses', label: 'COURSES PLANNED', value: String(coursesPlanned), numValue: coursesPlanned, suffix: '', icon: BookOpen, color: '#ff6b35', glowColor: 'rgba(255,107,53,0.15)' },
    { id: 'credits', label: 'CREDIT HRS LEFT', value: String(creditsLeft), numValue: creditsLeft, suffix: '', icon: Clock, color: '#8892b8', glowColor: 'rgba(136,146,184,0.15)' },
    { id: 'complete', label: 'DEGREE COMPLETE', value: `${completionPct}%`, numValue: completionPct, suffix: '%', icon: GraduationCap, color: '#22c55e', glowColor: 'rgba(34,197,94,0.15)' },
  ];

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
        { val: semestersLeft, suffix: '', delay: 300 },
        { val: coursesPlanned, suffix: '', delay: 380 },
        { val: creditsLeft, suffix: '', delay: 460 },
        { val: completionPct, suffix: '%', delay: 540 },
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
      gsap.to(barFill, { width: `${completionPct}%`, duration: 1.2, ease: 'power2.out', delay: 0.9 });
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
            <span className="ds-degree-pct">{completionPct}%</span>
          </div>

          <div className="ds-degree-bar-track">
            <div className="ds-degree-bar-fill" />
          </div>

          <div className="ds-semester-list">
            {/* Completed semesters derived from transcript */}
            {completedSemLabels.slice(-4).map((label, i) => (
              <div key={`completed-${label}`} className={`ds-semester-row ds-sem-stagger-${i}`}>
                <div className="ds-semester-left">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="9" stroke="#22c55e" strokeWidth="1.5" fill="rgba(34,197,94,0.1)" />
                    <path d="M6.5 10.5l2.5 2.5 4.5-5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="ds-semester-name">{label}</span>
                </div>
                <span className="ds-semester-status" data-color="#22c55e">Completed</span>
              </div>
            ))}
            {/* Planned semesters (in progress + upcoming) */}
            {planSemesters.slice(0, Math.max(1, 6 - Math.min(4, completedSemLabels.length))).map((sem, i) => (
              <div key={sem.label} className={`ds-semester-row ds-sem-stagger-${completedSemLabels.slice(-4).length + i}`}>
                <div className="ds-semester-left">
                  {i === 0 ? (
                    <svg className="ds-spinner-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="8" stroke="#5b7cfa" strokeWidth="2" strokeDasharray="4 3" fill="none" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" stroke="#8892b8" strokeWidth="1.5" fill="none" />
                      <path d="M8 10h4m-2-2l2 2-2 2" stroke="#8892b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  <span className="ds-semester-name">{sem.label}</span>
                </div>
                <span className="ds-semester-status" data-color={i === 0 ? '#5b7cfa' : '#8892b8'}>
                  {i === 0 ? 'In Progress' : 'Upcoming'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Up Next */}
        <div className="ds-row-card-right ds-upnext-card">
          <span className="ds-upnext-label">UP NEXT — {upNextLabel.toUpperCase()}</span>

          <div className="ds-upnext-list">
            {upNextCourses.map((course, i) => {
              const colors = ['#5b7cfa', '#8b5cf6', '#ff6b35', '#ef4444', '#3b82f6'];
              const color = colors[i % colors.length];
              return (
                <div key={course.code} className="ds-upnext-row">
                  <div className="ds-upnext-icon" data-bg={color}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                  </div>
                  <div className="ds-upnext-info">
                    <span className="ds-upnext-code">{course.code}</span>
                    <span className="ds-upnext-name">{course.name}</span>
                  </div>
                  <span className="ds-upnext-cr">{course.creditHours} cr</span>
                </div>
              );
            })}
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

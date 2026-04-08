import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { ArrowLeft, Download, X } from 'lucide-react';
export interface ProgressStats {
  totalRequiredCourses: number;
  totalRequiredHours: number;
  completedRequiredCourses: number;
  completedRequiredHours: number;
  totalElectiveSlots: number;
  totalElectiveHours: number;
  completedElectives: number;
  completedElectiveHours: number;
  remainingElectiveSlots: number;
}

interface ApiProfessor {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  difficulty: string;
  matchScore: number;
  matchPercent?: number;
  wouldTakeAgain?: string | null;
  schedule: string;
  tags: string[];
}

interface ClassData {
  courseCode: string;
  courseName: string;
  creditHours?: number;
  corequisites?: string;
  professors: ApiProfessor[];
}

export interface YourRecommendationsProps {
  userData: {
    recommendations: ClassData[];
    electiveRecommendations?: ClassData[];
    stats?: ProgressStats;
  };
  onBack: () => void;
  onExport: () => void;
}

type Tab = 'required' | 'electives';
type SortBy = 'match' | 'rating' | 'difficulty';
type AvatarTone = 'blue' | 'green' | 'orange' | 'purple' | 'gold' | 'teal' | 'red';
type TagKind = 'positive' | 'warning' | 'highlight' | 'neutral';

const AVATAR_ORDER: AvatarTone[] = ['blue', 'green', 'orange', 'purple', 'gold', 'teal', 'red'];
const AVATAR_GRAD: Record<AvatarTone, string> = {
  blue: 'linear-gradient(135deg, var(--blue), var(--blue2))',
  green: 'linear-gradient(135deg, #34d399, #059669)',
  orange: 'linear-gradient(135deg, var(--orange), var(--orange2))',
  purple: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
  gold: 'linear-gradient(135deg, #fbbf24, #d97706)',
  teal: 'linear-gradient(135deg, #2dd4bf, #0d9488)',
  red: 'linear-gradient(135deg, var(--red), #dc2626)',
};

const R = 22;
const DONUT_C = 2 * Math.PI * R;

const DONUT_LG = { dim: 72, r: 25, sw: 5, c: 2 * Math.PI * 25 } as const;

function hashName(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

function avatarTone(name: string): AvatarTone {
  return AVATAR_ORDER[hashName(name) % AVATAR_ORDER.length]!;
}

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function normalizeDifficulty(d: string): 'Easy' | 'Moderate' | 'Hard' {
  const x = (d || '').toLowerCase();
  if (x.includes('easy')) return 'Easy';
  if (x.includes('hard')) return 'Hard';
  return 'Moderate';
}

function difficultyOrder(d: 'Easy' | 'Moderate' | 'Hard'): number {
  return d === 'Easy' ? 0 : d === 'Moderate' ? 1 : 2;
}

function parseRetakePercent(wta: string | null | undefined): number | null {
  if (wta == null || wta === '') return null;
  const n = parseFloat(String(wta).replace('%', '').trim());
  return Number.isFinite(n) ? n : null;
}

/** Client-side fallback if API predates matchPercent (same algorithm as server). */
function ensureMatchPercents(courses: ClassData[]): void {
  const all = courses.flatMap((c) => c.professors);
  if (all.length === 0) return;
  if (all.every((p) => typeof p.matchPercent === 'number')) return;
  const scores = all.map((p) => p.matchScore);
  const lo = Math.min(...scores);
  const hi = Math.max(...scores);
  const span = hi - lo;
  for (const c of courses) {
    for (const p of c.professors) {
      if (typeof p.matchPercent !== 'number') {
        const s = p.matchScore;
        p.matchPercent = span > 1e-9 ? Math.round((100 * (s - lo)) / span) : 100;
      }
    }
  }
}

function classifyTag(text: string): TagKind {
  const t = text.toLowerCase();
  if (
    t.includes('tough') ||
    t.includes('heavy') ||
    t.includes('strict') ||
    t.includes('pop quiz') ||
    t.includes('beware') ||
    t.includes("skip class") ||
    t.includes('test heavy') ||
    t.includes('tests are tough') ||
    t.includes('so many papers')
  ) {
    return 'warning';
  }
  if (
    t.includes('amazing') ||
    t.includes('clear grading') ||
    t.includes('extra credit') ||
    t.includes('good feedback') ||
    t.includes('respected') ||
    t.includes('graded by few') ||
    t.includes('tests? not many')
  ) {
    return 'highlight';
  }
  if (
    t.includes('caring') ||
    t.includes('accessible') ||
    t.includes('group project') ||
    t.includes('lecture heavy') ||
    t.includes('inspirational') ||
    t.includes('would take again')
  ) {
    return 'positive';
  }
  return 'neutral';
}

function splitCode(code: string): { dept: string; num: string } {
  const i = code.trim().lastIndexOf(' ');
  if (i === -1) return { dept: code, num: '' };
  return { dept: code.slice(0, i).trim(), num: code.slice(i + 1).trim() };
}

function matchColor(pct: number): string {
  if (pct >= 80) return 'var(--green)';
  if (pct >= 50) return 'var(--orange)';
  return 'var(--red)';
}

function DonutRing({ pct, animKey, size = 'sm' }: { pct: number; animKey: string; size?: 'sm' | 'lg' }) {
  const stroke = matchColor(pct);
  if (size === 'lg') {
    const { dim, r, sw, c } = DONUT_LG;
    const offset = c * (1 - pct / 100);
    const cx = dim / 2;
    return (
      <div className="flex shrink-0 flex-col items-center gap-1">
        <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} className="shrink-0">
          <circle cx={cx} cy={cx} r={r} fill="rgba(36,40,64,0.9)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <g transform={`rotate(-90 ${cx} ${cx})`}>
            <circle
              key={animKey}
              cx={cx}
              cy={cx}
              r={r}
              fill="none"
              stroke={stroke}
              strokeWidth={sw}
              strokeLinecap="round"
              strokeDasharray={c}
              className="rec-donut-arc"
              style={{ ['--rec-d-from' as string]: c, ['--rec-d-to' as string]: offset }}
            />
          </g>
          <text
            x={cx}
            y={cx}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--text)"
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: 17, fontWeight: 700 }}
          >
            {pct}%
          </text>
        </svg>
      </div>
    );
  }
  const offset = DONUT_C * (1 - pct / 100);
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0">
      <circle cx="28" cy="28" r={R} fill="rgba(36,40,64,0.9)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <g transform="rotate(-90 28 28)">
        <circle
          key={animKey}
          cx="28"
          cy="28"
          r={R}
          fill="none"
          stroke={stroke}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={DONUT_C}
          className="rec-donut-arc"
          style={{ ['--rec-d-from' as string]: DONUT_C, ['--rec-d-to' as string]: offset }}
        />
      </g>
      <text
        x="28"
        y="28"
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--text)"
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: 11, fontWeight: 700 }}
      >
        {pct}%
      </text>
    </svg>
  );
}

function ProfessorDetailOverlay({
  prof,
  courseCode,
  courseName,
  sortedIndex,
  totalInCourse,
  detailAnimKey,
  onClose,
}: {
  prof: ApiProfessor;
  courseCode: string;
  courseName: string;
  sortedIndex: number;
  totalInCourse: number;
  detailAnimKey: number;
  onClose: () => void;
}) {
  const pct = prof.matchPercent ?? 0;
  const diff = normalizeDifficulty(prof.difficulty);
  const retake = parseRetakePercent(prof.wouldTakeAgain);
  const onlyOption = totalInCourse === 1;
  const topMatch = sortedIndex === 0 && totalInCourse > 1;
  const tags = (prof.tags || []).map((t) => String(t).trim()).filter(Boolean);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="rec-overlay-title">
      <button
        type="button"
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
        aria-label="Close details"
        onClick={onClose}
      />
      <div
        className="relative z-[1] flex max-h-[min(92vh,920px)] w-full max-w-xl flex-col rounded-t-[20px] border border-[var(--border2)] bg-[var(--s1)] shadow-[0_24px_80px_-16px_rgba(0,0,0,0.75)] ring-1 ring-white/[0.06] sm:max-h-[88vh] sm:rounded-2xl"
        style={{ animation: 'recOverlayIn 0.28s cubic-bezier(0.33, 1, 0.68, 1) both' }}
        onClick={(e) => e.stopPropagation()}
      >
        {(topMatch || onlyOption) && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[20px] opacity-90 sm:rounded-t-2xl"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.95), rgba(255,250,220,0.95), rgba(251,191,36,0.95), transparent)',
            }}
          />
        )}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--border)] px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
          <div className="min-w-0 pr-2">
            <p className="font-body text-xs font-bold uppercase tracking-[0.08em] text-[#a8b6e0]">{courseCode}</p>
            <h2 id="rec-overlay-title" className="mt-1.5 font-heading text-2xl font-extrabold leading-[1.15] tracking-tight text-[var(--text)] sm:text-[26px]">
              {prof.name}
            </h2>
            <p className="mt-2 line-clamp-2 text-sm leading-snug text-[#c5cee8]">{courseName}</p>
            {(topMatch || onlyOption) && (
              <span className="mt-3 inline-flex items-center rounded-full bg-gradient-to-r from-amber-600 via-amber-200 to-amber-600 px-3 py-1 font-body text-[11px] font-bold uppercase tracking-wide text-amber-950">
                {onlyOption ? '★ Only option' : '★ Top match'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border2)] bg-[var(--bg)] text-[var(--text)] transition-colors hover:border-[var(--blue)]/40 hover:bg-[var(--border)]/30"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2.2} />
          </button>
        </div>

        <div className="scrollbar-themed min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg)]/90 p-4 sm:p-5">
            <h3 className="mb-3 font-heading text-xs font-semibold tracking-tight text-[var(--text)]">Preference match</h3>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-5">
              <div className="flex justify-center sm:justify-start">
                <DonutRing pct={pct} animKey={`overlay-${detailAnimKey}-${prof.id}`} size="lg" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
                  <div
                    className="rec-pref-bar h-full rounded-full"
                    style={
                      {
                        ['--rec-pref-pct' as string]: `${pct}%`,
                        ['--rec-pref-fill' as string]: matchColor(pct),
                        animation: `recPrefW 0.7s cubic-bezier(0.33, 1, 0.68, 1) both`,
                        animationDelay: '0.06s',
                      } as CSSProperties
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-2.5 text-xs font-bold uppercase tracking-[0.12em] text-[#a8b6e0]">Rate My Professors</h3>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--s1)]/80 p-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-sm font-bold tabular-nums text-amber-100">
                  ★ {prof.rating > 0 ? prof.rating.toFixed(1) : '—'}
                  <span className="ml-0.5 text-xs font-semibold text-amber-200/80">/5</span>
                </span>
                {prof.reviewCount > 0 && (
                  <span className="text-xs font-medium text-[#b8c6ea]">{prof.reviewCount.toLocaleString()} reviews</span>
                )}
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                    diff === 'Easy'
                      ? 'bg-emerald-500/15 text-emerald-200'
                      : diff === 'Hard'
                        ? 'bg-rose-500/15 text-rose-200'
                        : 'bg-orange-500/15 text-orange-100'
                  }`}
                >
                  {diff}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                    retake == null
                      ? 'border border-[var(--border2)] text-[#c5cee8]'
                      : retake >= 80
                        ? 'bg-emerald-500/15 text-emerald-200'
                        : retake >= 50
                          ? 'bg-orange-500/15 text-orange-100'
                          : 'bg-rose-500/15 text-rose-200'
                  }`}
                >
                  {retake != null ? `${Math.round(retake)}% retake` : '—'}
                </span>
              </div>
            </div>
          </section>

          {tags.length > 0 && (
            <section>
              <h3 className="mb-2.5 text-xs font-bold uppercase tracking-[0.12em] text-[#a8b6e0]">Review tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 14).map((t, ti) => {
                  const k = classifyTag(t);
                  return (
                    <span
                      key={`${ti}-${t}`}
                      className={`rec-tag rec-tag--${k} rounded-xl px-3 py-2 font-body text-xs font-semibold leading-snug`}
                    >
                      {t}
                    </span>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfessorSummaryCard({
  prof,
  index,
  totalInCourse,
  sortedIndex,
  onOpen,
}: {
  prof: ApiProfessor;
  index: number;
  totalInCourse: number;
  sortedIndex: number;
  onOpen: () => void;
}) {
  const pct = prof.matchPercent ?? 0;
  const delay = index * 0.06;
  const onlyOption = totalInCourse === 1;
  const topMatch = sortedIndex === 0 && totalInCourse > 1;

  return (
    <article
      className={`group relative w-full min-w-0 self-start rounded-2xl border border-[var(--border)] bg-[var(--s1)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)] ${
        topMatch || onlyOption ? 'bg-gradient-to-b from-[rgba(251,191,36,0.08)] to-[var(--s1)]' : ''
      }`}
      style={{
        animation: `recFadeUp 0.45s cubic-bezier(0.33, 1, 0.68, 1) both`,
        animationDelay: `${delay}s`,
      }}
    >
      {(topMatch || onlyOption) && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-px opacity-90"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.9), rgba(255,250,220,0.9), rgba(251,191,36,0.9), transparent)',
          }}
        />
      )}
      {(topMatch || onlyOption) && (
        <span className="pointer-events-none absolute right-3 top-3 z-[1] rounded-full bg-gradient-to-r from-amber-600 via-amber-200 to-amber-600 px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide text-amber-950">
          {onlyOption ? '★ Only option' : '★ Top match'}
        </span>
      )}

      <button
        type="button"
        onClick={onOpen}
        className="relative z-[2] flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-[var(--border)]/20"
      >
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg font-heading text-[15px] font-black text-white shadow-inner"
          style={{ background: AVATAR_GRAD[avatarTone(prof.name)] }}
        >
          {initials(prof.name)}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="font-heading text-base font-bold leading-tight text-[var(--text)]">{prof.name}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span
              className="rounded-md px-2 py-0.5 font-body text-[11px] font-bold"
              style={{ background: 'rgba(91,124,250,0.12)', color: matchColor(pct) }}
            >
              {pct}% match
            </span>
            <span className="rounded-md border border-[var(--border)] bg-[rgba(251,191,36,0.1)] px-2 py-0.5 font-body text-[11px] font-semibold text-amber-200">
              ★ {prof.rating > 0 ? prof.rating.toFixed(1) : '—'} RMP
            </span>
          </div>
          <p className="mt-2 font-body text-[10px] font-medium text-[var(--blue)]">View full profile →</p>
        </div>
      </button>
    </article>
  );
}

export default function YourRecommendations({ userData, onBack, onExport }: YourRecommendationsProps) {
  const requiredRaw = useMemo(
    () => (userData.recommendations || []).filter((c) => c.professors?.length > 0),
    [userData.recommendations]
  );
  const electivesRaw = useMemo(
    () => (userData.electiveRecommendations || []).filter((c) => c.professors?.length > 0),
    [userData.electiveRecommendations]
  );

  const required = useMemo(() => {
    const copy = requiredRaw.map((c) => ({
      ...c,
      professors: c.professors.map((p) => ({ ...p })),
    }));
    ensureMatchPercents(copy);
    return copy;
  }, [requiredRaw]);

  const electives = useMemo(() => {
    const copy = electivesRaw.map((c) => ({
      ...c,
      professors: c.professors.map((p) => ({ ...p })),
    }));
    ensureMatchPercents(copy);
    return copy;
  }, [electivesRaw]);

  const [activeTab, setActiveTab] = useState<Tab>('required');
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortBy>('match');
  const [overlayProf, setOverlayProf] = useState<ApiProfessor | null>(null);
  const [overlaySortedIndex, setOverlaySortedIndex] = useState(0);
  const [detailAnimKey, setDetailAnimKey] = useState(0);

  const closeOverlay = useCallback(() => setOverlayProf(null), []);
  const openOverlay = useCallback((prof: ApiProfessor, sortedIdx: number) => {
    setOverlayProf(prof);
    setOverlaySortedIndex(sortedIdx);
    setDetailAnimKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (required.length === 0 && electives.length > 0) setActiveTab('electives');
  }, [required.length, electives.length]);

  const tabCourses = activeTab === 'required' ? required : electives;

  useEffect(() => {
    const first = tabCourses[0]?.courseCode ?? '';
    if (!selectedCode || !tabCourses.some((c) => c.courseCode === selectedCode)) {
      if (first) setSelectedCode(first);
    }
  }, [activeTab, tabCourses, selectedCode]);

  const selected = useMemo(
    () => tabCourses.find((c) => c.courseCode === selectedCode) ?? tabCourses[0],
    [tabCourses, selectedCode]
  );

  const sortedProfs = useMemo(() => {
    if (!selected) return [];
    const list = [...selected.professors];
    if (sortBy === 'match') list.sort((a, b) => b.matchScore - a.matchScore);
    else if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    else list.sort((a, b) => difficultyOrder(normalizeDifficulty(a.difficulty)) - difficultyOrder(normalizeDifficulty(b.difficulty)));
    return list;
  }, [selected, sortBy]);

  const setTab = useCallback((t: Tab) => {
    setActiveTab(t);
    setOverlayProf(null);
    const list = t === 'required' ? required : electives;
    const first = list[0]?.courseCode;
    if (first) setSelectedCode(first);
  }, [required, electives]);

  const selectCourse = useCallback((code: string) => {
    setSelectedCode(code);
    setOverlayProf(null);
  }, []);

  useEffect(() => {
    setOverlayProf(null);
  }, [sortBy]);

  useEffect(() => {
    setOverlayProf(null);
  }, [selected?.courseCode]);

  const stats = userData.stats;
  const accent = activeTab === 'required' ? 'var(--blue)' : 'var(--orange)';
  const accentGlow = activeTab === 'required' ? 'rgba(91,124,250,0.25)' : 'rgba(255,107,53,0.22)';

  const totalProfessors =
    required.reduce((s, c) => s + c.professors.length, 0) + electives.reduce((s, c) => s + c.professors.length, 0);
  const totalCourses = required.length + electives.length;

  const statPills = useMemo(() => {
    if (!stats) return [];
    const cr = `${stats.completedRequiredCourses}/${stats.totalRequiredCourses} required`;
    const el = `${stats.completedElectives}/${stats.totalElectiveSlots} electives`;
    const doneHrs = stats.completedRequiredHours + stats.completedElectiveHours;
    const needHrs = stats.totalRequiredHours + stats.totalElectiveHours;
    const hrs = `${doneHrs}/${needHrs} credit hrs`;
    return [
      { dot: 'bg-[var(--blue)]', label: cr },
      { dot: 'bg-[var(--orange)]', label: el },
      { dot: 'bg-[var(--green)]', label: hrs },
    ];
  }, [stats]);

  if (!selected) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center gap-3 px-6 font-body text-[var(--sub)]">
        <p>No courses with professor data matched your transcript.</p>
        <button type="button" onClick={onBack} className="text-sm font-semibold text-[var(--blue)] hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const { dept, num } = splitCode(selected.courseCode);

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[var(--bg)] font-body text-[var(--text)]">
      <style>{`
        @keyframes recFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes recSlideLeft {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes recDonut {
          from { stroke-dashoffset: var(--rec-d-from); }
          to { stroke-dashoffset: var(--rec-d-to); }
        }
        @keyframes recPrefW {
          from { width: 0%; }
          to { width: var(--rec-pref-pct); }
        }
        @keyframes recOverlayIn {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .rec-donut-arc {
          stroke-dashoffset: var(--rec-d-from);
          animation: recDonut 0.8s cubic-bezier(0.33, 1, 0.68, 1) forwards;
        }
        .rec-pref-bar {
          width: 0;
          background: var(--rec-pref-fill);
        }
        .rec-tag--positive { background: rgba(52,211,153,0.18); color: #b6f5d9; border: 1px solid rgba(52,211,153,0.4); }
        .rec-tag--warning { background: rgba(248,113,113,0.16); color: #fecaca; border: 1px solid rgba(248,113,113,0.38); }
        .rec-tag--highlight { background: rgba(91,124,250,0.2); color: #c7d7ff; border: 1px solid rgba(91,124,250,0.42); }
        .rec-tag--neutral { background: rgba(168,182,224,0.12); color: #d2daf0; border: 1px solid rgba(255,255,255,0.12); }
      `}</style>

      <div className="sa-page-bg" aria-hidden />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div
          className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-6 py-2.5"
          style={{ animation: 'recSlideLeft 0.5s cubic-bezier(0.33, 1, 0.68, 1) both' }}
        >
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold text-[var(--sub)] transition-colors hover:text-[var(--text)]"
          >
            <ArrowLeft className="h-4 w-4" /> Back to preferences
          </button>
          <div className="hidden flex-wrap items-center justify-center gap-2 md:flex">
            {statPills.map((p) => (
              <span
                key={p.label}
                className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--s1)] px-3 py-1 text-[11px] font-medium text-[var(--sub)]"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
                {p.label}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-xs font-semibold text-[var(--text)] transition-colors hover:border-[var(--border2)]"
          >
            <Download className="h-3.5 w-3.5" />
            Export PDF
          </button>
        </div>

        <div
          className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(200px,38vh)_1fr] md:grid-cols-[380px_1fr] md:grid-rows-1"
        >
          <aside className="flex min-h-0 min-w-0 flex-col overflow-hidden border-[var(--border)] md:border-r md:border-b-0 border-b">
            <div className="shrink-0 border-b border-[var(--border)] px-5 py-5">
              <p className="font-heading text-2xl font-bold leading-tight text-[var(--text)]">Your</p>
              <p className="font-heading text-2xl font-extrabold italic leading-tight text-[var(--orange)]">Recommendations</p>
              <p className="mt-2 text-[13px] text-[var(--sub)]">
                {totalProfessors.toLocaleString()} professors · {totalCourses} courses · ranked by your preferences
              </p>

              <div className="mt-4 flex rounded-full border border-[var(--border)] bg-[var(--s1)] p-1">
                <button
                  type="button"
                  onClick={() => setTab('required')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-xs font-semibold transition-all ${
                    activeTab === 'required' ? 'bg-[var(--border2)] text-[var(--text)] ring-1 ring-[var(--blue)]/40' : 'text-[var(--sub)] hover:text-[var(--text)]'
                  }`}
                >
                  Required
                  <span className="rounded-md bg-[var(--blue)]/20 px-1.5 py-0.5 text-[10px] font-bold text-[var(--blue)]">{required.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTab('electives')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-xs font-semibold transition-all ${
                    activeTab === 'electives' ? 'bg-[var(--border2)] text-[var(--text)] ring-1 ring-[var(--orange)]/40' : 'text-[var(--sub)] hover:text-[var(--text)]'
                  }`}
                >
                  Electives
                  <span className="rounded-md bg-[var(--orange)]/20 px-1.5 py-0.5 text-[10px] font-bold text-[var(--orange)]">{electives.length}</span>
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 scrollbar-themed">
              {tabCourses.map((c) => {
                const active = c.courseCode === selected.courseCode;
                const bar = activeTab === 'required' ? 'var(--blue)' : 'var(--orange)';
                const maxPct = Math.max(...c.professors.map((p) => p.matchPercent ?? 0), 0);
                const hasTop = c.professors.length > 1;
                return (
                  <button
                    key={c.courseCode}
                    type="button"
                    onClick={() => selectCourse(c.courseCode)}
                    className={`mb-2 w-full rounded-xl border text-left transition-all duration-200 ${
                      active ? 'border-[var(--border2)] bg-[var(--s1)]' : 'border-[var(--border)] bg-[var(--bg)] hover:border-[var(--border2)]'
                    }`}
                    style={
                      active
                        ? { boxShadow: `0 0 20px -6px ${accentGlow}, inset 3px 0 0 0 ${bar}` }
                        : undefined
                    }
                  >
                    <div className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-heading text-[15px] font-bold text-[var(--text)]">{c.courseCode}</span>
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{
                            backgroundColor: activeTab === 'required' ? 'rgba(91,124,250,0.15)' : 'rgba(255,107,53,0.15)',
                            color: bar,
                          }}
                        >
                          {c.professors.length} {c.professors.length === 1 ? 'opt' : 'opts'}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[var(--sub)]">{c.courseName}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-[var(--sub2)]">
                        <span>{c.creditHours ?? 3} cr</span>
                        <span className="text-[var(--border2)]">·</span>
                        <div className="h-[3px] w-10 overflow-hidden rounded-full bg-[var(--sub2)]">
                          <div className="h-full rounded-full transition-all" style={{ width: `${maxPct}%`, backgroundColor: bar }} />
                        </div>
                        <span className="text-[var(--sub)]">{maxPct}% match</span>
                        {hasTop && (
                          <>
                            <span className="text-[var(--border2)]">·</span>
                            <span className="text-amber-400">★ top</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <main
            className="flex min-h-0 min-w-0 flex-col bg-[var(--bg)]/60"
            style={{ animation: 'recFadeUp 0.5s cubic-bezier(0.33, 1, 0.68, 1) 0.06s both' }}
          >
            <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg)]/90 px-5 py-4 backdrop-blur-md md:px-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-heading text-[clamp(26px,3.5vw,34px)] font-extrabold leading-none tracking-tight">
                    <span style={{ color: accent }}>{dept}</span>
                    <span className="text-[var(--text)]"> {num}</span>
                  </h2>
                  <p className="mt-2 text-sm text-[var(--sub)]">{selected.courseName}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className="rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                      style={{ borderColor: `${accent}55`, color: accent, background: activeTab === 'required' ? 'rgba(91,124,250,0.08)' : 'rgba(255,107,53,0.08)' }}
                    >
                      {selected.creditHours ?? 3} credit hours
                    </span>
                    <span
                      className="rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                      style={{ borderColor: `${accent}55`, color: accent, background: activeTab === 'required' ? 'rgba(91,124,250,0.1)' : 'rgba(255,107,53,0.1)' }}
                    >
                      {activeTab === 'required' ? 'Required' : 'Elective'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-heading text-[36px] font-extrabold leading-none" style={{ color: accent }}>
                    {selected.professors.length}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--sub2)]">professors</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sub2)]">Sort by</span>
                  {(['match', 'rating', 'difficulty'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSortBy(s)}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                        sortBy === s ? 'text-white' : 'border border-[var(--border)] bg-[var(--s1)] text-[var(--sub)] hover:text-[var(--text)]'
                      }`}
                      style={sortBy === s ? { backgroundColor: accent, border: `1px solid ${accent}` } : undefined}
                    >
                      {s === 'match' ? 'Match %' : s === 'rating' ? 'Rating' : 'Difficulty'}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-[var(--sub)]">{sortedProfs.length} professors shown</span>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 pb-10 scrollbar-themed md:px-6">
              <div
                className="grid auto-rows-max items-start gap-4"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))' }}
              >
                {sortedProfs.map((prof, i) => (
                  <ProfessorSummaryCard
                    key={`${selected.courseCode}__${prof.id}__${prof.name}`}
                    prof={prof}
                    index={i}
                    totalInCourse={selected.professors.length}
                    sortedIndex={i}
                    onOpen={() => openOverlay(prof, i)}
                  />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {overlayProf && selected && (
        <ProfessorDetailOverlay
          prof={overlayProf}
          courseCode={selected.courseCode}
          courseName={selected.courseName}
          sortedIndex={overlaySortedIndex}
          totalInCourse={selected.professors.length}
          detailAnimKey={detailAnimKey}
          onClose={closeOverlay}
        />
      )}
    </div>
  );
}

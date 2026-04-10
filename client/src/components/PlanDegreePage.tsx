import React, { useCallback, useMemo, useState } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import type {
  Course,
  DegreePlan,
  ElectiveCourse,
  PlanDegreePageProps,
  Season,
} from '../types/PlanDegreePage';

const HR_OPTIONS = [12, 13, 14, 15, 16, 17, 18] as const;
const SEASONS: Season[] = ['Fall', 'Spring', 'Summer'];

function isValidCourse(c: unknown): c is Course {
  if (!c || typeof c !== 'object') return false;
  const o = c as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    o.id.trim() !== '' &&
    typeof o.code === 'string' &&
    o.code.trim() !== '' &&
    typeof o.name === 'string' &&
    o.name.trim() !== '' &&
    typeof o.creditHours === 'number' &&
    Number.isFinite(o.creditHours) &&
    o.creditHours > 0
  );
}

function isValidElective(c: unknown): c is ElectiveCourse {
  if (!isValidCourse(c)) return false;
  const o = c as ElectiveCourse;
  return Array.isArray(o.missingPrereqs) && o.missingPrereqs.every((x) => typeof x === 'string');
}

function isSelectableElective(c: ElectiveCourse): boolean {
  if (c.taken) return false;
  if (typeof c.isEligible === 'boolean') return c.isEligible;
  return c.missingPrereqs.length === 0;
}

function initialYearDefault(): string {
  return String(new Date().getFullYear() + 1);
}

function yearOptions(): string[] {
  const y = new Date().getFullYear();
  return [y, y + 1, y + 2, y + 3, y + 4].map(String);
}

/** Donut 64×64 — stroke animates; color by load band */
function CreditDonut({
  totalHrs,
  maxHrs,
}: {
  totalHrs: number;
  maxHrs: number;
}) {
  const dim = 64;
  const cx = dim / 2;
  const r = 22;
  const sw = 5;
  const c = 2 * Math.PI * r;
  const ratio = maxHrs > 0 ? Math.min(1, totalHrs / maxHrs) : 0;
  const offset = c * (1 - ratio);
  const over = totalHrs > maxHrs;
  const stroke =
    over ? 'var(--orange)' : ratio >= 0.8 ? 'var(--purple)' : 'var(--blue)';

  return (
    <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} className="shrink-0">
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke="var(--b1)"
        strokeWidth={sw}
      />
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cx})`}
        style={{
          transition: 'stroke-dashoffset 0.4s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.25s ease',
        }}
      />
      <text
        x={cx}
        y={cx}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--text)"
    style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: 11,
          fontWeight: 800,
        }}
      >
        {totalHrs}/{maxHrs}
      </text>
    </svg>
  );
}

export default function PlanDegreePage({
  student,
  requiredCourses: requiredRaw,
  electiveCourses: electiveRaw,
  electiveGroups = [],
  loading = false,
  onComplete,
  onBack,
}: PlanDegreePageProps) {
  const [season, setSeason] = useState<Season>('Fall');
  const [year, setYear] = useState<string>(initialYearDefault());
  const [includeSummer, setIncludeSummer] = useState(false);
  const [maxHrs, setMaxHrs] = useState(15);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'req' | 'elec'>('req');
  const [shakeTick, setShakeTick] = useState(0);
  const [shakeTarget, setShakeTarget] = useState<string | null>(null);

  const requiredCourses = useMemo(() => {
    if (!Array.isArray(requiredRaw)) return [];
    return requiredRaw.filter(isValidCourse);
  }, [requiredRaw]);

  const electiveCourses = useMemo(() => {
    if (!Array.isArray(electiveRaw)) return [];
    return electiveRaw.filter(isValidElective);
  }, [electiveRaw]);

  const courseById = useMemo(() => {
    const m = new Map<string, Course | ElectiveCourse>();
    for (const c of requiredCourses) m.set(c.id, c);
    for (const c of electiveCourses) m.set(c.id, c);
    return m;
  }, [requiredCourses, electiveCourses]);

  const requiredIds = useMemo(() => new Set(requiredCourses.map((c) => c.id)), [requiredCourses]);

  const totalHrs = useMemo(() => {
    let t = 0;
    for (const id of selected) {
      const c = courseById.get(id);
      if (c) t += c.creditHours;
    }
    return t;
  }, [selected, courseById]);

  const isOverLimit = totalHrs > maxHrs;

  const eligibleWished = useMemo(() => {
    const out: ElectiveCourse[] = [];
    for (const id of wishlist) {
      const c = electiveCourses.find((e) => e.id === id);
      if (c && c.missingPrereqs.length === 0) out.push(c);
    }
    return out;
  }, [wishlist, electiveCourses]);

  const ineligibleWished = useMemo(() => {
    const out: ElectiveCourse[] = [];
    for (const id of wishlist) {
      const c = electiveCourses.find((e) => e.id === id);
      if (c && c.missingPrereqs.length > 0) out.push(c);
    }
    return out;
  }, [wishlist, electiveCourses]);

  const sortedElectives = useMemo(() => {
    const topIds = new Set(eligibleWished.map((c) => c.id));
    const top = eligibleWished.slice();
    const rest = electiveCourses.filter((c) => !topIds.has(c.id));
    return [...top, ...rest];
  }, [eligibleWished, electiveCourses]);

  const showSkeleton = loading || (!student && requiredCourses.length === 0 && electiveCourses.length === 0);

  const tryToggleCourse = useCallback(
    (course: Course | ElectiveCourse) => {
      if ('missingPrereqs' in course && !isSelectableElective(course)) {
        setShakeTarget(course.id);
        setShakeTick((x) => x + 1);
        return;
      }
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(course.id)) {
          next.delete(course.id);
          return next;
        }
        const add = course.creditHours;
        let sum = 0;
        for (const id of next) {
          const c = courseById.get(id);
          if (c) sum += c.creditHours;
        }
        if (sum + add > maxHrs) {
          setShakeTarget(course.id);
          setShakeTick((x) => x + 1);
          return prev;
        }
        next.add(course.id);
        return next;
      });
    },
    [maxHrs, courseById]
  );

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }, []);

  const submitPlan = useCallback(() => {
    if (selected.size === 0) return;
    const chosenElectiveIds = new Set(wishlist);
    for (const id of selected) {
      if (!requiredIds.has(id)) {
        chosenElectiveIds.add(id);
      }
    }
    const plan: DegreePlan = {
      selectedCourseIds: Array.from(selected),
      chosenElectiveIds: Array.from(chosenElectiveIds),
      season,
      year,
      maxHoursPerSemester: maxHrs,
      includeSummer,
    };
    onComplete(plan);
  }, [selected, wishlist, requiredIds, season, year, maxHrs, includeSummer, onComplete]);

  const loadStatusText = useMemo(() => {
    if (selected.size === 0) return { text: 'Nothing selected', cls: 'text-[var(--t3)]' };
    if (isOverLimit) return { text: 'Over limit!', cls: 'text-[var(--orange)] font-semibold' };
    if (totalHrs >= maxHrs) return { text: 'Semester full ✓', cls: 'text-[var(--green)] font-semibold' };
    return {
      text: `${maxHrs - totalHrs} hrs remaining`,
      cls: 'text-[var(--green)] font-medium',
    };
  }, [selected.size, isOverLimit, totalHrs, maxHrs]);

  const selectedList = useMemo(() => {
    const list: { course: Course | ElectiveCourse; isReq: boolean }[] = [];
    for (const id of selected) {
      const c = courseById.get(id);
      if (c) list.push({ course: c, isReq: requiredIds.has(id) });
    }
    return list;
  }, [selected, courseById, requiredIds]);

  return (
    <div
      className="plan-degree-page min-h-[calc(100vh-58px)] text-[var(--text)]"
      style={
        {
          ['--t2' as string]: '#7a90b8',
          ['--t3' as string]: '#3d506e',
          ['--t4' as string]: '#1e2e48',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        } as React.CSSProperties
      }
    >
      <div className="sa-pd-bg pointer-events-none absolute inset-0 z-0" aria-hidden />

      <div className="relative z-10 flex min-h-[calc(100vh-58px)] flex-col">
        {/* Match other wizard steps: back row below shared Layout nav */}
        <div className="flex-shrink-0 px-4 py-2.5 md:px-6">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold text-[var(--sub)] transition-colors hover:text-[var(--text)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Review
          </button>
        </div>

        <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-2 md:px-6">
        {/* Top header */}
        <section className="pd-stagger-1 mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--blue)]">
              <span className="h-px w-6 bg-[var(--blue)]" />
              DEGREE PLANNER
            </p>
            {showSkeleton ? (
              <div className="space-y-3">
                <div className="h-4 w-48 animate-pulse rounded bg-[var(--s3)]" />
                <div className="h-10 w-full max-w-md animate-pulse rounded-lg bg-[var(--s3)]" />
              </div>
            ) : (
              <h1
                className="text-3xl font-extrabold tracking-tight md:text-4xl"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800 }}
              >
                Build your{' '}
                <span
                  className="bg-clip-text text-transparent"
              style={{ 
                    backgroundImage: 'linear-gradient(90deg, var(--purple), var(--orange))',
                    WebkitBackgroundClip: 'text',
              }}
            >
                  next semester.
                </span>
            </h1>
            )}
          </div>
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto lg:min-w-[520px]">
            {showSkeleton || !student ? (
              <>
                <div className="h-[88px] animate-pulse rounded-2xl bg-[var(--s1)] ring-1 ring-[var(--b0)]" />
                <div className="h-[88px] animate-pulse rounded-2xl bg-[var(--s1)] ring-1 ring-[var(--b0)]" />
                <div className="h-[88px] animate-pulse rounded-2xl bg-[var(--s1)] ring-1 ring-[var(--b0)]" />
                </>
              ) : (
              <>
                <StatMini
                  label="Courses Done"
                  value={`${student.completedCourses.length} / ${student.totalCoursesRequired}`}
                  accent="var(--blue)"
                />
                <StatMini
                  label="Credit Hours"
                  value={`${student.completedCreditHours} / ${student.totalCreditHours}`}
                  accent="var(--green)"
                />
                <StatMini
                  label="Semesters Left"
                  value={`~${student.estimatedSemestersLeft}`}
                  accent="var(--orange)"
                />
              </>
            )}
          </div>
        </section>

        {/* Settings row */}
        <section
          className="pd-stagger-2 mb-6 rounded-2xl border border-[var(--b1)] bg-[var(--s1)] p-3 md:p-4"
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
        >
          {showSkeleton ? (
            <div className="h-12 w-full animate-pulse rounded-xl bg-[var(--s2)]" />
          ) : (
            <div className="flex flex-col flex-wrap gap-4 md:flex-row md:items-center md:gap-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-sm font-semibold text-[var(--t2)]">📅 Start</span>
                {SEASONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeason(s)}
                    className="rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-[180ms]"
                    style={{
                      background: season === s ? 'var(--orange)' : 'var(--s2)',
                      color: season === s ? '#0a0f18' : 'var(--t2)',
                      boxShadow:
                        season === s ? '0 0 0 1px rgba(240,120,64,0.35)' : '0 0 0 1px var(--b0)',
                    }}
                  >
                    {s}
                  </button>
                ))}
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="ml-1 rounded-lg border border-[var(--b1)] bg-[var(--s2)] px-2 py-1.5 text-xs font-semibold text-[var(--text)] outline-none focus:border-[var(--blue-border)]"
                >
                  {yearOptions().map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <span className="hidden h-8 w-px bg-[var(--b1)] md:mx-4 md:block" />
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  role="switch"
                  aria-checked={includeSummer}
                  aria-label={includeSummer ? 'Include summer terms' : 'Skip summer terms'}
                  onClick={() => setIncludeSummer((v) => !v)}
                  className="relative h-7 w-[2.75rem] shrink-0 overflow-hidden rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--blue)]"
                  style={{
                    background: includeSummer ? 'var(--blue-dim)' : 'var(--s3)',
                    boxShadow: 'inset 0 0 0 1px var(--b1)',
                  }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 h-[1.375rem] w-[1.375rem] -translate-y-1/2 rounded-full bg-white shadow-md ring-1 ring-black/5 transition-[left] duration-200 ease-out"
                    style={{
                      left: includeSummer ? 'calc(100% - 1.375rem - 3px)' : '3px',
                    }}
                  />
                </button>
                <div className="min-w-0 text-xs leading-snug">
                  <span className="block font-semibold text-[var(--text)]">
                    {includeSummer ? 'Include summers' : 'Skipping summers'}
                  </span>
                  <p className="mt-0.5 text-[var(--t3)]">
                    {includeSummer ? 'Summer terms count in your plan' : 'Fall and spring only'}
                  </p>
                </div>
              </div>
              <span className="hidden h-8 w-px bg-[var(--b1)] md:mx-4 md:block" />
              <div className="flex flex-1 flex-wrap items-center gap-2 md:justify-end">
                <span className="text-sm font-semibold text-[var(--t2)]">⏱ Hrs</span>
                <div className="flex flex-wrap gap-1.5">
                  {HR_OPTIONS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setMaxHrs(h)}
                      className="min-w-[2rem] rounded-lg px-2 py-1 text-xs font-bold transition-all duration-[180ms]"
                      style={{
                        background: maxHrs === h ? 'var(--blue)' : 'var(--s2)',
                        color: maxHrs === h ? '#fff' : 'var(--t2)',
                        boxShadow:
                          maxHrs === h ? '0 0 0 1px rgba(79,142,245,0.4)' : '0 0 0 1px var(--b0)',
                      }}
                    >
                      {h}
                    </button>
                  ))}
                </div>
                <span
                  className="ml-auto rounded-full px-3 py-1 text-xs font-bold md:ml-2"
                  style={{
                    background: 'var(--orange-dim)',
                    color: 'var(--orange)',
                    border: '1px solid var(--orange-border)',
                  }}
                >
                  📍 {season} {year}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Live preview */}
        <section className="pd-stagger-3 mb-8 rounded-2xl border border-[var(--b1)] bg-[var(--s1)] p-4 md:p-5">
          {showSkeleton ? (
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="min-h-[120px] flex-1 animate-pulse rounded-xl bg-[var(--s2)]" />
              <div className="h-[120px] w-full animate-pulse rounded-xl bg-[var(--blue-dim)] md:w-[220px]" />
            </div>
          ) : (
            <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
              <div className="min-h-[100px] flex-1">
                <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--t2)]">
                  📋 Your semester so far
                </h2>
                {selectedList.length === 0 ? (
                  <p className="text-sm italic text-[var(--t3)]">No courses selected yet</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedList.map(({ course, isReq }) => (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => tryToggleCourse(course)}
                        className="pd-chip rounded-lg px-2.5 py-1 text-xs font-bold"
                        style={{
                          background: isReq ? 'var(--blue-dim)' : 'var(--orange-dim)',
                          color: 'var(--text)',
                          border: `1px solid ${isReq ? 'var(--blue-border)' : 'var(--orange-border)'}`,
                          animation: 'pdChipIn 0.2s ease-out both',
                        }}
                      >
                        {course.code}{' '}
                        <span className="font-normal opacity-80">({course.creditHours})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div
                className="flex w-full flex-col items-center justify-center rounded-xl px-4 py-4 md:w-[220px]"
                style={{ background: 'rgba(79, 142, 245, 0.08)', border: '1px solid var(--blue-border)' }}
              >
                <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--blue)]">
                  📊 Credit load
                </h2>
                <CreditDonut totalHrs={totalHrs} maxHrs={maxHrs} />
                <p className={`mt-2 text-center text-xs ${loadStatusText.cls}`}>{loadStatusText.text}</p>
              </div>
            </div>
          )}
        </section>

        {/* Lower grid */}
        <section className="pd-stagger-4 grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
          {/* Wishlist + pinned eligibility footer */}
          <div
            className="flex max-h-[720px] min-h-[380px] flex-col overflow-hidden rounded-2xl border border-[var(--purple-border)] bg-[var(--s1)]"
            style={{ boxShadow: 'inset 0 1px 0 rgba(155,126,248,0.06)' }}
          >
            <div
              className="flex-shrink-0 border-b border-[var(--purple-border)] px-4 py-3"
              style={{ background: 'rgba(155, 126, 248, 0.08)' }}
            >
              <h2
                className="text-base font-bold text-[var(--text)]"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                ✨ Elective Wishlist
              </h2>
              <p className="mt-0.5 text-xs text-[var(--t2)]">
                Pick what interests you — we&apos;ll check your eligibility
              </p>
              {electiveGroups.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {electiveGroups.map((g) => {
                    const selectedHrs = Array.from(wishlist).reduce((sum, id) => {
                      const c = electiveCourses.find((ec) => ec.id === id && (ec as any).group === g.group);
                      return sum + (c ? c.creditHours : 0);
                    }, 0);
                    const totalFilled = g.hoursCompleted + selectedHrs;
                    const isSatisfied = totalFilled >= g.hoursRequired;
                    return (
                      <div key={g.group}>
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                          <span style={{ color: isSatisfied ? '#22c55e' : 'var(--sub)' }}>{g.group}</span>
                          <span style={{ color: isSatisfied ? '#22c55e' : 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                            {totalFilled}/{g.hoursRequired} hrs
                          </span>
                        </div>
                        <div className="mt-0.5 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--b0)' }}>
                          {g.hoursCompleted > 0 && (
                            <div className="h-full float-left rounded-full" style={{ width: `${Math.round((g.hoursCompleted / g.hoursRequired) * 100)}%`, background: '#22c55e' }} />
                          )}
                          {selectedHrs > 0 && (
                            <div className="h-full float-left rounded-full" style={{ width: `${Math.round((selectedHrs / g.hoursRequired) * 100)}%`, background: '#FF8040' }} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
                    </div>
            {showSkeleton ? (
              <div className="min-h-0 flex-1 space-y-2 overflow-hidden p-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-xl bg-[var(--s2)]" />
                ))}
              </div>
            ) : electiveCourses.length === 0 ? (
              <p className="p-4 text-sm text-[var(--t2)]">No electives loaded for this plan.</p>
            ) : (
              <>
                <div className="scrollbar-themed min-h-0 flex-1 overflow-y-auto p-3">
                  <div className="space-y-1">
                    {(() => {
                      // Group electives by their group for organized display
                      const groupOrder = electiveGroups.map((g) => g.group);
                      const grouped: Record<string, typeof electiveCourses> = {};
                      for (const c of electiveCourses) {
                        const g = (c as any).group || 'other';
                        (grouped[g] ??= []).push(c);
                      }
                      const sortedGroups = [
                        ...groupOrder.filter((g) => grouped[g]?.length),
                        ...Object.keys(grouped).filter((g) => !groupOrder.includes(g)),
                      ];

                      // Fallback: if no groups, render flat
                      if (sortedGroups.length <= 1 && !electiveGroups.length) {
                        return electiveCourses.map((c) => {
                          const on = wishlist.has(c.id);
                          return (
                            <button key={c.id} type="button" onClick={() => toggleWishlist(c.id)}
                              className="flex w-full items-start gap-2 rounded-xl border px-3 py-2.5 text-left transition-[background,border-color,box-shadow] duration-150"
                              style={{ background: on ? 'var(--purple-dim)' : 'var(--s2)', borderColor: on ? 'var(--purple-border)' : 'var(--b0)', boxShadow: on ? '0 0 0 1px rgba(155, 126, 248, 0.12)' : 'none' }}>
                              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border"
                                style={{ borderColor: 'var(--purple-border)', background: on ? 'var(--purple)' : 'transparent' }}>
                                {on && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate font-bold text-[var(--text)]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{c.code}</span>
                                <span className="block truncate text-xs text-[var(--t2)]">{c.name}</span>
                              </span>
                            </button>
                          );
                        });
                      }

                      return sortedGroups.map((groupName) => {
                        const groupCourses = grouped[groupName] || [];
                        const groupInfo = electiveGroups.find((g) => g.group === groupName);
                        const hrsReq = groupInfo?.hoursRequired ?? 0;
                        const hrsComp = groupInfo?.hoursCompleted ?? 0;
                        const selectedHrs = Array.from(wishlist).reduce((sum, id) => {
                          const c = electiveCourses.find((ec) => ec.id === id && (ec as any).group === groupName);
                          return sum + (c ? c.creditHours : 0);
                        }, 0);
                        const totalFilled = hrsComp + selectedHrs;
                        const isSatisfied = totalFilled >= hrsReq;
                        const label = groupName.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

                        return (
                          <div key={groupName} className="mb-3">
                            <div className="sticky top-0 z-10 mb-1.5 rounded-lg border border-[var(--purple-border)]/40 bg-[var(--bg)]/95 px-3 py-2 backdrop-blur-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--purple)]">{label}</span>
                                <span className={`text-[10px] font-semibold ${isSatisfied ? 'text-green-400' : 'text-[var(--t2)]'}`}>
                                  {totalFilled}/{hrsReq} hrs
                                </span>
                              </div>
                              <div className="mt-1 h-1 overflow-hidden rounded-full bg-[var(--b0)]">
                                {hrsComp > 0 && (
                                  <div className="float-left h-full rounded-full bg-green-500" style={{ width: `${Math.min(100, (hrsComp / hrsReq) * 100)}%` }} />
                                )}
                                {selectedHrs > 0 && (
                                  <div className="float-left h-full rounded-full bg-[var(--purple)]" style={{ width: `${Math.min(100 - (hrsComp / hrsReq) * 100, (selectedHrs / hrsReq) * 100)}%` }} />
                                )}
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              {groupCourses.map((c) => {
                                const on = wishlist.has(c.id);
                                return (
                                  <button key={c.id} type="button" onClick={() => toggleWishlist(c.id)}
                                    className="flex w-full items-start gap-2 rounded-xl border px-3 py-2.5 text-left transition-[background,border-color,box-shadow] duration-150"
                                    style={{ background: on ? 'var(--purple-dim)' : 'var(--s2)', borderColor: on ? 'var(--purple-border)' : 'var(--b0)', boxShadow: on ? '0 0 0 1px rgba(155, 126, 248, 0.12)' : 'none' }}>
                                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border"
                                      style={{ borderColor: 'var(--purple-border)', background: on ? 'var(--purple)' : 'transparent' }}>
                                      {on && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                      <span className="block truncate font-bold text-[var(--text)]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{c.code}</span>
                                      <span className="block truncate text-xs text-[var(--t2)]">{c.name}</span>
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      });
                    })()}
                    </div>
                  </div>

                {/* Always visible: eligibility updates as you toggle wishlist */}
                <div
                  className="flex-shrink-0 border-t border-[var(--purple-border)]/60 bg-[var(--bg)]/90 px-3 py-3 backdrop-blur-sm"
                  style={{ animation: 'pdFadeUp 0.35s ease-out both' }}
                >
                  {wishlist.size === 0 ? (
                    <p className="text-center text-xs leading-relaxed text-[var(--t2)]">
                      Tap electives above to add them to your wishlist — eligibility for each one
                      will show here.
                    </p>
                  ) : (
                    <>
                      <div className="mb-2.5 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--t2)]">
                          Eligibility
                        </span>
                        <span className="inline-flex items-center gap-0.5 rounded-md border border-[rgba(38,212,154,0.35)] bg-[rgba(38,212,154,0.1)] px-2 py-0.5 text-[11px] font-bold tabular-nums text-[var(--green)]">
                          {eligibleWished.length}
                          <Check className="h-3 w-3" strokeWidth={2.8} />
                        </span>
                        <span className="inline-flex items-center gap-0.5 rounded-md border border-[rgba(240,96,96,0.35)] bg-[rgba(240,96,96,0.08)] px-2 py-0.5 text-[11px] font-bold tabular-nums text-[var(--red)]">
                          {ineligibleWished.length}
                          <X className="h-3 w-3" strokeWidth={2.8} />
                        </span>
                      </div>
                      <ul className="max-h-[200px] space-y-2 overflow-y-auto pr-0.5 scrollbar-themed">
                        {[...eligibleWished, ...ineligibleWished].map((c) => {
                          const ok = isSelectableElective(c);
                          return (
                            <li key={c.id}>
                              <div
                                className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5"
                                style={{
                                  border: `1px solid ${
                                    ok ? 'rgba(38, 212, 154, 0.42)' : 'rgba(240, 96, 96, 0.4)'
                                  }`,
                                  background: 'var(--s2)',
                                }}
                              >
                                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                  <span
                                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded"
                                    style={{
                                      background: ok ? 'var(--green)' : 'var(--red)',
                                    }}
                                  >
                                    {ok ? (
                                      <Check className="h-3 w-3 text-[var(--bg)]" strokeWidth={3} />
                                    ) : (
                                      <X className="h-3 w-3 text-white" strokeWidth={3} />
                                    )}
                                  </span>
                                  <span
                                    className="truncate font-bold text-[var(--text)]"
                                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                                  >
                                    {c.code}
                                  </span>
                                </div>
                                <span
                                  className="shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold"
                                  style={{
                                    borderColor: ok ? 'var(--green)' : 'var(--red)',
                                    color: ok ? 'var(--green)' : 'var(--red)',
                                    background: ok ? 'rgba(38,212,154,0.08)' : 'rgba(240,96,96,0.08)',
                                  }}
                                >
                                  {ok ? 'Eligible' : 'Ineligible'}
                                </span>
                              </div>
                              {!ok && (
                                <p className="mt-1 pl-9 text-[11px] leading-snug text-[var(--t2)]">
                                  Missing: {c.missingPrereqs.join(', ')}
                                </p>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Course picker */}
          <div className="flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-[var(--b1)] bg-[var(--s1)]">
            <div className="border-b border-[var(--b1)] px-4 py-3">
              <h2
                className="text-lg font-bold text-[var(--text)]"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800 }}
              >
                Pick courses for {season} {year}
              </h2>
              <p className="text-xs text-[var(--t2)]">Eligible courses from your degree plan</p>
            </div>
            {showSkeleton ? (
              <div className="flex-1 space-y-2 p-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl bg-[var(--s2)]" />
                ))}
              </div>
            ) : (
              <>
                <div className="flex gap-0 px-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('req')}
                    className="flex items-center gap-2 rounded-t-xl px-4 py-2 text-sm font-bold transition-colors"
                    style={{
                      background: activeTab === 'req' ? 'var(--s2)' : 'transparent',
                      color: activeTab === 'req' ? 'var(--text)' : 'var(--t2)',
                      boxShadow:
                        activeTab === 'req' ? 'inset 0 1px 0 rgba(255,255,255,0.06)' : 'none',
                    }}
                  >
                    Required
                    <span
                      className="rounded-md px-1.5 py-0.5 text-[10px]"
                      style={{
                        background: 'var(--blue-dim)',
                        color: 'var(--blue)',
                      }}
                    >
                      {requiredCourses.length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('elec')}
                    className="flex items-center gap-2 rounded-t-xl px-4 py-2 text-sm font-bold transition-colors"
                    style={{
                      background: activeTab === 'elec' ? 'var(--s2)' : 'transparent',
                      color: activeTab === 'elec' ? 'var(--text)' : 'var(--t2)',
                    }}
                  >
                    Electives
                    <span
                      className="rounded-md px-1.5 py-0.5 text-[10px]"
                      style={{
                        background: 'var(--orange-dim)',
                        color: 'var(--orange)',
                      }}
                    >
                      {electiveCourses.length}
                    </span>
                  </button>
                    </div>
                <div
                  className="scrollbar-themed flex-1 overflow-y-auto border-t border-[var(--b0)] bg-[var(--s2)]/50 p-3"
                  style={{ minHeight: 280 }}
                >
                  {activeTab === 'req' ? (
                    requiredCourses.length === 0 ? (
                      <p className="py-8 text-center text-sm text-[var(--t2)]">
                        No required courses available for this semester.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {requiredCourses.map((c) => (
                          <CourseRow
                            key={`${c.id}-${shakeTarget === c.id ? shakeTick : 0}`}
                            course={c}
                            variant="req"
                            selected={selected.has(c.id)}
                            dim={
                              !selected.has(c.id) && totalHrs + c.creditHours > maxHrs
                            }
                            shake={shakeTarget === c.id ? shakeTick : 0}
                            onToggle={() => tryToggleCourse(c)}
                          />
                        ))}
                      </ul>
                    )
                  ) : sortedElectives.length === 0 ? (
                    <p className="py-8 text-center text-sm text-[var(--t2)]">
                      No elective courses available for this semester.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {(() => {
                        // Group electives by their group
                        const groupOrder = electiveGroups.map((g) => g.group);
                        const grouped: Record<string, typeof sortedElectives> = {};
                        for (const c of sortedElectives) {
                          const g = (c as any).group || 'other';
                          (grouped[g] ??= []).push(c);
                        }
                        const sortedGroups = [
                          ...groupOrder.filter((g) => grouped[g]?.length),
                          ...Object.keys(grouped).filter((g) => !groupOrder.includes(g)),
                        ];

                        // Flat fallback if no groups
                        if (sortedGroups.length <= 1 && !electiveGroups.length) {
                          return (
                            <ul className="space-y-2">
                              {sortedElectives.map((c) => {
                                const wish = wishlist.has(c.id);
                                const eligible = isSelectableElective(c);
                                return (
                                  <CourseRow key={`${c.id}-${shakeTarget === c.id ? shakeTick : 0}`} course={c} variant="elec"
                                    selected={selected.has(c.id)} dim={!eligible || (!selected.has(c.id) && totalHrs + c.creditHours > maxHrs)}
                                    shake={shakeTarget === c.id ? shakeTick : 0} onToggle={() => tryToggleCourse(c)}
                                    badge={wish && eligible ? (
                                      <span className="rounded-md bg-[var(--purple-dim)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--purple)]">★ Wishlist</span>
                                    ) : !eligible ? (
                                      <span className="rounded-md bg-[rgba(240,96,96,0.08)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--red)]">Missing prereqs</span>
                                    ) : null} />
                                );
                              })}
                            </ul>
                          );
                        }

                        return sortedGroups.map((groupName) => {
                          const groupCourses = grouped[groupName] || [];
                          const groupInfo = electiveGroups.find((g) => g.group === groupName);
                          const hrsReq = groupInfo?.hoursRequired ?? 0;
                          const hrsComp = groupInfo?.hoursCompleted ?? 0;
                          const selectedHrs = Array.from(wishlist).reduce((sum, id) => {
                            const c = electiveCourses.find((ec) => ec.id === id && (ec as any).group === groupName);
                            return sum + (c ? c.creditHours : 0);
                          }, 0);
                          const totalFilled = hrsComp + selectedHrs;
                          const isSatisfied = totalFilled >= hrsReq;
                          const label = groupName.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

                          return (
                            <div key={groupName}>
                              <div className="mb-2 flex items-center gap-2 border-b border-[var(--b0)] pb-1.5">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--purple)]">{label}</span>
                                <span className={`ml-auto text-[10px] font-semibold ${isSatisfied ? 'text-green-400' : 'text-[var(--t2)]'}`}>
                                  {totalFilled}/{hrsReq} hrs
                                </span>
                              </div>
                              <ul className="space-y-2">
                                {groupCourses.map((c) => {
                                  const wish = wishlist.has(c.id);
                                  const eligible = isSelectableElective(c);
                                  return (
                                    <CourseRow key={`${c.id}-${shakeTarget === c.id ? shakeTick : 0}`} course={c} variant="elec"
                                      selected={selected.has(c.id)} dim={!eligible || (!selected.has(c.id) && totalHrs + c.creditHours > maxHrs)}
                                      shake={shakeTarget === c.id ? shakeTick : 0} onToggle={() => tryToggleCourse(c)}
                                      badge={wish && eligible ? (
                                        <span className="rounded-md bg-[var(--purple-dim)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--purple)]">★ Wishlist</span>
                                      ) : !eligible ? (
                                        <span className="rounded-md bg-[rgba(240,96,96,0.08)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--red)]">Missing prereqs</span>
                                      ) : null} />
                                  );
                                })}
                              </ul>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                  </div>
                </>
              )}
            </div>
        </section>

        {/* CTA */}
        <section
          className="pd-stagger-5 fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--b1)] bg-[var(--bg)]/92 px-4 py-4 backdrop-blur-md md:static md:mt-10 md:rounded-2xl md:border md:bg-[var(--s1)] md:px-6"
        >
          <div className="mx-auto flex max-w-7xl flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--t2)]">
              {selected.size === 0 ? (
                'Pick at least one course to continue'
              ) : (
                <>
                  <span className="font-semibold text-[var(--text)]">{selected.size}</span> course
                  {selected.size !== 1 ? 's' : ''} ·{' '}
                  <span className="font-semibold text-[var(--text)]">{totalHrs}</span> hrs selected
                </>
              )}
            </p>
            <button
              type="button"
              disabled={selected.size === 0}
              onClick={submitPlan}
              className="pd-cta-btn rounded-xl px-8 py-3 text-base font-bold text-white shadow-lg transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 700,
                background: 'linear-gradient(90deg, var(--blue), var(--purple), var(--orange))',
                backgroundSize: '200% 100%',
              }}
            >
              Plan My Degree →
            </button>
        </div>
        </section>
      </main>
      </div>

      <style>{`
        .sa-pd-bg {
          background:
            radial-gradient(ellipse 90% 60% at 8% 0%, rgba(79, 142, 245, 0.14), transparent 55%),
            radial-gradient(ellipse 70% 55% at 92% 100%, rgba(240, 120, 64, 0.12), transparent 50%),
            radial-gradient(ellipse 55% 50% at 48% 45%, rgba(155, 126, 248, 0.1), transparent 52%),
            var(--bg);
        }
        @keyframes pdFadeUp {
          from { opacity: 0; transform: translate3d(0, 12px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes pdChipIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pdShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .pd-stagger-1 { animation: pdFadeUp 0.5s ease-out both; animation-delay: 0s; }
        .pd-stagger-2 { animation: pdFadeUp 0.5s ease-out both; animation-delay: 0.05s; }
        .pd-stagger-3 { animation: pdFadeUp 0.5s ease-out both; animation-delay: 0.1s; }
        .pd-stagger-4 { animation: pdFadeUp 0.5s ease-out both; animation-delay: 0.15s; }
        .pd-stagger-5 { animation: pdFadeUp 0.5s ease-out both; animation-delay: 0.2s; }
        @media (prefers-reduced-motion: reduce) {
          .pd-stagger-1, .pd-stagger-2, .pd-stagger-3, .pd-stagger-4, .pd-stagger-5,
          .pd-chip { animation: none !important; transition: none !important; }
        }
        .pd-cta-btn:not(:disabled):hover {
          background-position: 100% 0 !important;
          transition: background-position 0.3s ease, transform 0.2s ease;
        }
      `}</style>
    </div>
  );
}

function StatMini({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      className="rounded-2xl p-4 ring-1 ring-[var(--b0)]"
      style={{ background: 'var(--s1)' }}
    >
      <p className="text-xs font-medium text-[var(--t2)]">{label}</p>
      <p className="mt-1 text-xl font-extrabold tabular-nums" style={{ color: accent }}>
        {value}
      </p>
    </div>
  );
}

function CourseRow({
  course,
  variant,
  selected,
  dim,
  shake,
  onToggle,
  badge,
}: {
  course: Course | ElectiveCourse;
  variant: 'req' | 'elec';
  selected: boolean;
  dim: boolean;
  shake: number;
  onToggle: () => void;
  badge?: React.ReactNode;
}) {
  const ring = variant === 'req' ? 'var(--blue)' : 'var(--orange)';
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        disabled={dim}
        className="pd-course-row flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-[transform,opacity,border-color,background] duration-[180ms] md:hover:translate-x-[2px]"
        style={{
          opacity: dim ? 0.38 : 1,
          pointerEvents: dim ? 'none' : 'auto',
          borderColor: selected ? (variant === 'req' ? 'var(--blue-border)' : 'var(--orange-border)') : 'var(--b0)',
          background: selected
            ? variant === 'req'
              ? 'var(--blue-dim)'
              : 'var(--orange-dim)'
            : 'var(--s1)',
          animation: shake ? 'pdShake 0.3s ease' : undefined,
        }}
      >
        <span
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
          style={{
            borderColor: ring,
            background: selected ? ring : 'transparent',
          }}
        >
          {selected && <span className="h-2 w-2 rounded-full bg-white" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-[var(--text)]">{course.code}</span>
            <span
              className="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
              style={{
                background: 'var(--s3)',
                color: 'var(--t2)',
              }}
            >
              {course.creditHours}h
            </span>
            {badge}
          </span>
          <span className="mt-0.5 block text-sm text-[var(--t2)]">{course.name}</span>
        </span>
      </button>
    </li>
  );
}

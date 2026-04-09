import { useCallback, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type { Preferences } from './PreferenceForm';

/** Stable ids passed to onComplete */
export type PriorityId = 'extraCredit' | 'clearGrading' | 'helpfulFeedback' | 'approachable';
export type LearnId = 'greatLectures' | 'groupProjects';
export type AvoidId = 'examHeavy' | 'heavyHomework' | 'strictAttendance' | 'popQuizzes';

export interface ProfessorPreferencesOnboardingProps {
  onComplete: (priorities: PriorityId[], learnSelections: LearnId[], avoidSelections: AvoidId[]) => void;
  onBack: () => void;
}

/** Inline accents not on :root; blues align with `var(--blue)` (#5b7cfa). */
const DS = {
  surface2: '#111a2e',
  blue: '#5b7cfa',
  purple: '#9b7ef8',
  orange: '#ff6b35',
} as const;

const PRIORITY_CARDS: { id: PriorityId; emoji: string; title: string; desc: string }[] = [
  { id: 'extraCredit', emoji: '📈', title: 'Extra Credit', desc: 'Wants to give you ways to improve your grade' },
  { id: 'clearGrading', emoji: '📋', title: 'Clear Grading', desc: "You always know exactly how you're being marked" },
  { id: 'helpfulFeedback', emoji: '💬', title: 'Helpful Feedback', desc: 'Leaves detailed, useful comments on your work' },
  { id: 'approachable', emoji: '🤝', title: 'Approachable', desc: 'Easy to reach, genuinely supports students' },
];

const LEARN_CARDS: { id: LearnId; emoji: string; title: string; desc: string }[] = [
  { id: 'greatLectures', emoji: '🎙️', title: 'Great Lectures', desc: 'Clear, engaging in-class delivery you can follow.' },
  { id: 'groupProjects', emoji: '👥', title: 'Group Projects', desc: 'Collaborative assignments with your classmates.' },
];

const AVOID_CARDS: { id: AvoidId; emoji: string; title: string; desc: string }[] = [
  { id: 'examHeavy', emoji: '📝', title: 'Exam-Heavy Grading', desc: 'Nearly all your grade coming from tests alone.' },
  { id: 'heavyHomework', emoji: '📚', title: 'Heavy Homework', desc: 'Frequent assignments piling up every week.' },
  { id: 'strictAttendance', emoji: '🕐', title: 'Strict Attendance', desc: 'Missing one class tanks your grade.' },
  { id: 'popQuizzes', emoji: '⚡', title: 'Pop Quizzes', desc: 'Unannounced, impossible to prepare for.' },
];

const priorityLabel = (id: PriorityId) => PRIORITY_CARDS.find((c) => c.id === id)?.title ?? id;
const learnLabel = (id: LearnId) => LEARN_CARDS.find((c) => c.id === id)?.title ?? id;
const avoidLabel = (id: AvoidId) => AVOID_CARDS.find((c) => c.id === id)?.title ?? id;

/** Maps onboarding ids to the existing `Preferences` shape used by `/api/recommendations`. */
export function onboardingSelectionsToPreferences(
  priorities: PriorityId[],
  learn: LearnId[],
  avoid: AvoidId[]
): Preferences {
  const pr = new Set(priorities);
  const lr = new Set(learn);
  const ar = new Set(avoid);
  return {
    extraCredit: pr.has('extraCredit'),
    clearGrading: pr.has('clearGrading'),
    goodFeedback: pr.has('helpfulFeedback'),
    caring: pr.has('approachable'),
    lectureHeavy: lr.has('greatLectures'),
    groupProjects: lr.has('groupProjects'),
    avoidTestHeavy: ar.has('examHeavy'),
    avoidHomeworkHeavy: ar.has('heavyHomework'),
    avoidStrictAttendance: ar.has('strictAttendance'),
    avoidPopQuizzes: ar.has('popQuizzes'),
  };
}

type Accent = 'blue' | 'purple' | 'orange';

function accentStyles(accent: Accent, selected: boolean) {
  if (!selected) {
    return {
      cardBg: 'var(--s1)',
      border: 'var(--border2)',
      iconBg: 'var(--border2)',
      checkBorder: 'var(--border2)',
      checkFill: 'transparent',
    };
  }
  if (accent === 'blue') {
    return {
      cardBg: 'rgba(91,124,250,0.1)',
      border: 'rgba(91,124,250,0.45)',
      iconBg: 'rgba(91,124,250,0.22)',
      checkBorder: 'var(--blue)',
      checkFill: 'var(--blue)',
    };
  }
  if (accent === 'purple') {
    return {
      cardBg: 'rgba(155,126,248,0.1)',
      border: 'rgba(155,126,248,0.45)',
      iconBg: 'rgba(155,126,248,0.22)',
      checkBorder: DS.purple,
      checkFill: DS.purple,
    };
  }
  return {
    cardBg: 'rgba(255,107,53,0.1)',
    border: 'rgba(255,107,53,0.45)',
    iconBg: 'rgba(255,107,53,0.22)',
    checkBorder: DS.orange,
    checkFill: DS.orange,
  };
}

interface OptionCardProps {
  emoji: string;
  title: string;
  desc: string;
  selected: boolean;
  accent: Accent;
  disabled?: boolean;
  shake?: boolean;
  onClick: () => void;
}

function OptionCard({ emoji, title, desc, selected, accent, disabled, shake, onClick }: OptionCardProps) {
  const s = accentStyles(accent, selected);
  return (
    <button
      type="button"
      data-selected={selected ? 'true' : 'false'}
      disabled={disabled}
      onClick={onClick}
      className={`
        pref-onboard-card group relative w-full text-left rounded-xl border p-4 flex items-center gap-3
        transition-[transform,background-color,border-color,box-shadow,filter] duration-200 ease-out
        hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
        ${selected ? 'hover:brightness-[1.04]' : ''}
        ${shake ? 'pref-onboard-shake' : ''}
      `}
      style={{
        backgroundColor: s.cardBg,
        borderColor: s.border,
        borderWidth: 1,
        boxShadow: selected
          ? `0 0 0 1px ${s.border}, 0 16px 40px -28px ${accent === 'blue' ? 'rgba(91,124,250,0.35)' : accent === 'purple' ? 'rgba(155,126,248,0.35)' : 'rgba(255,107,53,0.35)'}`
          : undefined,
      }}
    >
      {/* radial glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          opacity: selected ? 0.55 : undefined,
          background:
            accent === 'blue'
              ? 'radial-gradient(ellipse 80% 70% at 50% 0%, rgba(91,124,250,0.25), transparent 65%)'
              : accent === 'purple'
                ? 'radial-gradient(ellipse 80% 70% at 50% 0%, rgba(155,126,248,0.25), transparent 65%)'
                : 'radial-gradient(ellipse 80% 70% at 50% 0%, rgba(255,107,53,0.22), transparent 65%)',
        }}
      />
      <div
        className="relative z-10 flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-lg text-lg transition-colors duration-200"
        style={{ backgroundColor: s.iconBg }}
      >
        <span className="leading-none">{emoji}</span>
      </div>
      <div className="relative z-10 min-w-0 flex-1 pr-2">
        <div className="font-heading text-[14px] font-bold leading-tight text-[var(--text)]">{title}</div>
        <div className="mt-0.5 text-[12px] leading-snug text-[var(--sub)]">{desc}</div>
      </div>
      <div
        className="relative z-10 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-all duration-200"
        style={{
          borderColor: s.checkBorder,
          backgroundColor: s.checkFill,
        }}
      >
        {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </div>
    </button>
  );
}

export default function ProfessorPreferencesOnboarding({ onComplete, onBack }: ProfessorPreferencesOnboardingProps) {
  const [priorities, setPriorities] = useState<Set<PriorityId>>(() => new Set());
  const [learnSelections, setLearnSelections] = useState<Set<LearnId>>(() => new Set());
  const [avoidSelections, setAvoidSelections] = useState<Set<AvoidId>>(() => new Set());
  const [shakeKey, setShakeKey] = useState<string | null>(null);

  const triggerShake = useCallback((key: string) => {
    setShakeKey(key);
    window.setTimeout(() => setShakeKey(null), 500);
  }, []);

  const togglePriority = useCallback(
    (id: PriorityId) => {
      setPriorities((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
          return next;
        }
        if (next.size >= 3) {
          triggerShake(id);
          return prev;
        }
        next.add(id);
        return next;
      });
    },
    [triggerShake]
  );

  const toggleLearn = useCallback((id: LearnId) => {
    setLearnSelections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAvoid = useCallback((id: AvoidId) => {
    setAvoidSelections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const canSubmit = priorities.size >= 1;

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    onComplete([...priorities], [...learnSelections], [...avoidSelections]);
  }, [avoidSelections, canSubmit, learnSelections, onComplete, priorities]);

  const chips = useMemo(() => {
    const out: { key: string; label: string; kind: 'priority' | 'learn' | 'avoid' }[] = [];
    priorities.forEach((id) => out.push({ key: `p-${id}`, label: priorityLabel(id), kind: 'priority' }));
    learnSelections.forEach((id) => out.push({ key: `l-${id}`, label: learnLabel(id), kind: 'learn' }));
    avoidSelections.forEach((id) => out.push({ key: `a-${id}`, label: avoidLabel(id), kind: 'avoid' }));
    return out;
  }, [avoidSelections, learnSelections, priorities]);

  const pipFilled = priorities.size;

  return (
    <div className="h-full min-h-0 flex flex-col font-body bg-[var(--bg)] text-[var(--text)] antialiased relative overflow-hidden">
      <style>{`
        @keyframes pref-onboard-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .pref-onboard-shake {
          animation: pref-onboard-shake 0.45s ease-in-out;
        }
        .pref-onboard-card[data-selected="false"]:hover:not(:disabled) {
          background-color: var(--border) !important;
        }
        @keyframes pref-chip-in {
          from { transform: scale(0.85); opacity: 0.6; }
          to { transform: scale(1); opacity: 1; }
        }
        .pref-chip-in {
          animation: pref-chip-in 0.2s ease-out both;
        }
        .pref-hero-gradient-fits {
          background: linear-gradient(135deg, #5b7cfa 0%, #9b7ef8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .pref-hero-gradient-you {
          background: linear-gradient(135deg, #ff6b35 0%, #ffb04a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .pref-cta-gradient {
          background: linear-gradient(135deg, #5b7cfa 0%, #9b7ef8 55%, #4166f5 100%);
        }
        button.pref-cta-enabled:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.1);
        }
      `}</style>

      <div className="sa-page-bg" aria-hidden />

      <div className="relative z-10 flex flex-col flex-1 min-h-0 overflow-y-auto scrollbar-themed">
        <div className="flex-shrink-0 px-6 py-2.5">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-[var(--sub)] hover:text-[var(--text)] transition-colors text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Transcript
          </button>
        </div>

        <main className="mx-auto w-full max-w-[960px] px-6 pb-32 pt-2 md:px-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-[1.5px] bg-[var(--blue)]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--blue)]">Step 3 of 3</span>
          </div>

          <h1 className="font-heading text-[clamp(36px,7vw,58px)] font-extrabold leading-[1.05] tracking-[-0.02em]">
            <span className="text-[var(--text)]">What kind of professor </span>
            <span className="pref-hero-gradient-fits">fits</span>
            <span className="pref-hero-gradient-you"> you?</span>
          </h1>
          <p className="mt-4 max-w-[640px] text-[15px] font-normal text-[var(--sub)] leading-[1.7] md:text-[16px]">
            Pick up to 3 priorities — we&apos;ll rank professors around what actually matters to you.
          </p>

          <hr className="mt-10 mb-12 border-t border-[var(--border)]" />

          {/* Section 1 */}
          <section className="mb-14">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                style={{ backgroundColor: 'rgba(91,124,250,0.15)', border: `1px solid rgba(91,124,250,0.25)` }}
              >
                ⚡
              </div>
              <h2 className="font-heading text-xl font-bold text-[var(--text)] md:text-[22px]">What matters most to you?</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-2 w-2 rounded-full transition-colors duration-200"
                    style={{
                      backgroundColor: i < pipFilled ? DS.blue : DS.surface2,
                      boxShadow: i < pipFilled ? `0 0 8px ${DS.blue}66` : undefined,
                    }}
                  />
                ))}
              </div>
              <span className="font-heading text-sm font-bold tabular-nums" style={{ color: DS.blue }}>
                {priorities.size} / 3
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PRIORITY_CARDS.map((c) => (
              <OptionCard
                key={c.id}
                emoji={c.emoji}
                title={c.title}
                desc={c.desc}
                selected={priorities.has(c.id)}
                accent="blue"
                shake={shakeKey === c.id}
                onClick={() => togglePriority(c.id)}
              />
            ))}
          </div>
          </section>

          <hr className="my-12 border-t border-[var(--border)]" />

          {/* Section 2 */}
          <section className="mb-14">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                style={{ backgroundColor: 'rgba(155,126,248,0.12)', border: `1px solid rgba(155,126,248,0.22)` }}
              >
                🧩
              </div>
              <h2 className="font-heading text-xl font-bold text-[var(--text)] md:text-[22px]">How do you like to learn?</h2>
            </div>
            <span
              className="rounded-full border border-[var(--border)] bg-[var(--s1)] px-3 py-1 text-xs font-semibold text-[var(--sub)]"
            >
              Optional
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {LEARN_CARDS.map((c) => (
              <OptionCard
                key={c.id}
                emoji={c.emoji}
                title={c.title}
                desc={c.desc}
                selected={learnSelections.has(c.id)}
                accent="purple"
                onClick={() => toggleLearn(c.id)}
              />
            ))}
          </div>
          </section>

          <hr className="my-12 border-t border-[var(--border)]" />

          {/* Section 3 */}
          <section className="mb-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                style={{ backgroundColor: 'rgba(255,107,53,0.12)', border: `1px solid rgba(255,107,53,0.25)` }}
              >
                🚫
              </div>
              <h2 className="font-heading text-xl font-bold text-[var(--text)] md:text-[22px]">Anything you&apos;d rather avoid?</h2>
            </div>
            <span
              className="rounded-full border border-[var(--border)] bg-[var(--s1)] px-3 py-1 text-xs font-semibold text-[var(--sub)]"
            >
              Optional
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {AVOID_CARDS.map((c) => (
              <OptionCard
                key={c.id}
                emoji={c.emoji}
                title={c.title}
                desc={c.desc}
                selected={avoidSelections.has(c.id)}
                accent="orange"
                onClick={() => toggleAvoid(c.id)}
              />
            ))}
          </div>
          </section>
        </main>
      </div>

      {/* Sticky footer */}
      <footer
        className="fixed bottom-0 left-0 right-0 z-40 flex flex-col gap-4 border-t border-[var(--border)] px-6 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between"
        style={{
          backgroundColor: 'rgba(7, 8, 15, 0.92)',
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        }}
      >
        <div className="min-w-0 flex-1">
          {priorities.size === 0 ? (
            <p className="text-sm font-medium text-[var(--sub)]">Pick at least one priority to continue.</p>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <span className="flex-shrink-0 text-sm font-medium text-[var(--sub)]">Your preferences:</span>
              <div className="flex min-w-0 flex-wrap gap-2">
                {chips.map((c, i) => (
                  <span
                    key={c.key}
                    className="pref-chip-in inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold"
                    style={{
                      animationDelay: `${i * 35}ms`,
                      ...(c.kind === 'priority'
                        ? {
                            backgroundColor: 'rgba(91,124,250,0.12)',
                            borderColor: 'rgba(91,124,250,0.35)',
                            color: DS.blue,
                          }
                        : c.kind === 'learn'
                          ? {
                              backgroundColor: 'rgba(155,126,248,0.12)',
                              borderColor: 'rgba(155,126,248,0.35)',
                              color: DS.purple,
                            }
                          : {
                              backgroundColor: 'rgba(255,107,53,0.12)',
                              borderColor: 'rgba(255,107,53,0.35)',
                              color: DS.orange,
                            }),
                    }}
                  >
                    {c.kind === 'avoid' && <span className="opacity-90">✕</span>}
                    {c.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className={`
            pref-cta-gradient pref-cta-enabled flex shrink-0 items-center justify-center gap-2 rounded-xl px-8 py-3.5
            font-heading text-[14px] font-bold text-white shadow-lg transition-all duration-200
            ${canSubmit ? 'cursor-pointer' : 'cursor-not-allowed opacity-[0.35] grayscale'}
          `}
          style={{
            boxShadow: canSubmit ? '0 8px 32px rgba(91,124,250,0.35)' : undefined,
          }}
        >
          Find My Best Professors
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </footer>
    </div>
  );
}

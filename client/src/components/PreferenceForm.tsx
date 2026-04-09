import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  TrendingUp,
  ClipboardCheck,
  MessageCircle,
  Heart,
  Mic2,
  Users,
  FileQuestion,
  NotebookPen,
  CalendarClock,
  Zap,
  Check,
} from 'lucide-react';
import ProcessingOverlay from './ProcessingOverlay';

export interface Preferences {
  extraCredit: boolean;
  clearGrading: boolean;
  goodFeedback: boolean;
  caring: boolean;
  lectureHeavy: boolean;
  groupProjects: boolean;
  avoidTestHeavy: boolean;
  avoidHomeworkHeavy: boolean;
  avoidStrictAttendance: boolean;
  avoidPopQuizzes: boolean;
}

interface PreferenceFormProps {
  onGenerateSchedule: (prefs: Preferences) => void;
  isLoading: boolean;
  onBack: () => void;
  buttonLabel?: string;
}

const MAX_PRIORITY_PICKS = 3;
type LucideIcon = React.ElementType<any>;

const PRIORITY_ITEMS: { key: keyof Pick<Preferences, 'extraCredit' | 'clearGrading' | 'goodFeedback' | 'caring'>; label: string; desc: string; icon: LucideIcon }[] = [
  { key: 'extraCredit',   label: 'Extra Credit',      desc: 'Gives ways to boost your grade',         icon: TrendingUp },
  { key: 'clearGrading',  label: 'Clear Grading',     desc: 'You always know how you\'re marked',     icon: ClipboardCheck },
  { key: 'goodFeedback',  label: 'Helpful Feedback',  desc: 'Detailed comments on your work',         icon: MessageCircle },
  { key: 'caring',        label: 'Approachable',      desc: 'Easy to reach, genuinely supportive',    icon: Heart },
];

const STYLE_ITEMS: { key: keyof Pick<Preferences, 'lectureHeavy' | 'groupProjects'>; label: string; desc: string; icon: LucideIcon }[] = [
  { key: 'lectureHeavy',   label: 'Great lectures',    desc: 'Clear and engaging in-class delivery',  icon: Mic2 },
  { key: 'groupProjects',  label: 'Group projects',    desc: 'Assignments done with teammates',       icon: Users },
];

const AVOID_ITEMS: { key: keyof Pick<Preferences, 'avoidTestHeavy' | 'avoidHomeworkHeavy' | 'avoidStrictAttendance' | 'avoidPopQuizzes'>; label: string; desc: string; icon: LucideIcon }[] = [
  { key: 'avoidTestHeavy',          label: 'Exam-heavy grading',   desc: 'Nearly all grade from tests',           icon: FileQuestion },
  { key: 'avoidHomeworkHeavy',      label: 'Heavy homework',       desc: 'Frequent assignments every week',       icon: NotebookPen },
  { key: 'avoidStrictAttendance',   label: 'Strict attendance',    desc: 'Missing class hurts your grade',        icon: CalendarClock },
  { key: 'avoidPopQuizzes',         label: 'Pop quizzes',          desc: 'Unannounced, impossible to prep for',   icon: Zap },
];

/* ── Card component ─────────────────────────────────────────── */
const VARIANT_COLORS = {
  priority: {
    ring:     'rgba(91,124,250,0.7)',
    bg:       'rgba(91,124,250,0.09)',
    iconBg:   'rgba(91,124,250,0.18)',
    iconCol:  '#5b7cfa',
    checkBg:  'rgba(91,124,250,0.2)',
    checkCol: '#5b7cfa',
  },
  style: {
    ring:     'rgba(255,107,53,0.7)',
    bg:       'rgba(255,107,53,0.08)',
    iconBg:   'rgba(255,107,53,0.18)',
    iconCol:  '#ff6b35',
    checkBg:  'rgba(255,107,53,0.2)',
    checkCol: '#ff6b35',
  },
  avoid: {
    ring:     'rgba(248,113,113,0.7)',
    bg:       'rgba(248,113,113,0.08)',
    iconBg:   'rgba(248,113,113,0.18)',
    iconCol:  '#f87171',
    checkBg:  'rgba(248,113,113,0.2)',
    checkCol: '#f87171',
  },
} as const;

function PrefCard({
  prefKey, label, desc, Icon, checked, onToggle, disabled, variant,
}: {
  prefKey: keyof Preferences;
  label: string;
  desc: string;
  Icon: LucideIcon;
  checked: boolean;
  onToggle: (k: keyof Preferences) => void;
  disabled?: boolean;
  variant: 'priority' | 'style' | 'avoid';
}) {
  const c = useMemo(() => VARIANT_COLORS[variant], [variant]);
  const isClickable = !disabled || checked;

  return (
    <button
      type="button"
      onClick={() => onToggle(prefKey)}
      disabled={disabled && !checked}
      className="relative w-full text-left rounded-2xl border focus:outline-none transition-all duration-200 group"
      style={{
        padding: '14px 16px',
        background:     checked ? c.bg : 'rgba(255,255,255,0.025)',
        borderColor:    checked ? c.ring : 'rgba(255,255,255,0.07)',
        borderWidth:    '1.5px',
        boxShadow:      checked ? `0 0 0 1px ${c.ring}44, 0 8px 24px -12px ${c.ring}88` : 'none',
        opacity:        disabled && !checked ? 0.38 : 1,
        cursor:         isClickable ? 'pointer' : 'not-allowed',
      }}
    >
      {/* Subtle inner glow when checked */}
      {checked && (
        <div
          aria-hidden
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ background: `linear-gradient(135deg, ${c.ring}22 0%, transparent 55%)` }}
        />
      )}

      <div className="relative flex items-center gap-3.5">
        {/* Icon */}
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200"
          style={{
            background: checked ? c.iconBg : 'rgba(255,255,255,0.05)',
            color:      checked ? c.iconCol : 'rgba(136,146,184,0.7)',
          }}
        >
          <Icon className="w-4 h-4" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[13.5px] leading-tight text-[var(--text)]">{label}</div>
          <div className="text-[11.5px] text-[var(--sub)] leading-snug mt-0.5">{desc}</div>
        </div>

        {/* Check badge */}
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.18, ease: 'backOut' }}
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: c.checkBg, color: c.checkCol }}
            >
              <Check className="w-3 h-3" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </button>
  );
}

/* ── Section wrapper ────────────────────────────────────────── */
function Section({
  emoji, title, badge, children,
}: {
  emoji: string;
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-base leading-none">{emoji}</span>
          <h2 className="font-bold text-[15px] text-[var(--text)] tracking-tight">{title}</h2>
        </div>
        {badge}
      </div>
      {children}
    </div>
  );
}

/* ── Priority dots ──────────────────────────────────────────── */
function PriorityDots({ count, max }: { count: number; max: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: max }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            background: i < count ? 'var(--blue)' : 'rgba(255,255,255,0.1)',
            scale:      i < count ? 1.15 : 1,
          }}
          transition={{ duration: 0.2 }}
          className="w-2 h-2 rounded-full"
        />
      ))}
      <span className="ml-1 text-[11px] font-semibold text-[var(--sub)]">
        {count}/{max}
      </span>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────── */
export default function PreferenceForm({ onGenerateSchedule, isLoading, onBack, buttonLabel }: PreferenceFormProps) {
  const [prefs, setPrefs] = useState<Preferences>({
    extraCredit: false, clearGrading: false, goodFeedback: false, caring: false,
    lectureHeavy: false, groupProjects: false,
    avoidTestHeavy: false, avoidHomeworkHeavy: false, avoidStrictAttendance: false, avoidPopQuizzes: false,
  });

  const priorityCount  = PRIORITY_ITEMS.filter(i => prefs[i.key]).length;
  const priorityFull   = priorityCount >= MAX_PRIORITY_PICKS;
  const avoidCount     = AVOID_ITEMS.filter(i => prefs[i.key]).length;

  const togglePriority = (key: keyof Preferences) => {
    if (!prefs[key] && priorityFull) return;
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  };
  const toggle = (key: keyof Preferences) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const canSubmit = priorityCount > 0;

  return (
    <div className="h-full font-body bg-[var(--bg)] text-[var(--text)] relative overflow-hidden flex flex-col">
      <div className="sa-page-bg" aria-hidden />

      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto scrollbar-themed">
        <div className="max-w-[680px] mx-auto px-5 sm:px-8 py-5 pb-10">

          {/* Back */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onBack}
            className="flex items-center gap-2 text-[var(--sub)] hover:text-[var(--text)] transition-colors text-sm font-semibold mb-7"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </motion.button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-5 h-[1.5px] bg-[var(--blue)]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--blue)]">Step 3 of 3</span>
            </div>
            <h1 className="font-heading font-extrabold text-[clamp(28px,4vw,44px)] leading-[1.0] tracking-[-1.5px] mb-2">
              What kind of professor <span className="gradient-text">fits you?</span>
            </h1>
            <p className="text-[var(--sub)] text-[15px] leading-relaxed">
              Pick up to <strong className="text-[var(--text)]">3 priorities</strong> that matter most to you — we'll rank professors around them.
            </p>
          </motion.div>

          {/* Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-8"
          >

            {/* ── 1. Priorities ── */}
            <Section
              emoji="⚡"
              title="What matters most to you?"
              badge={<PriorityDots count={priorityCount} max={MAX_PRIORITY_PICKS} />}
            >
              {priorityFull && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-3 px-3 py-2 rounded-xl text-[12px] font-semibold text-[var(--blue)] overflow-hidden"
                  style={{ background: 'rgba(91,124,250,0.08)', border: '1px solid rgba(91,124,250,0.2)' }}
                >
                  ✓ You've picked your top 3 — looking good!
                </motion.div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRIORITY_ITEMS.map((item, i) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, delay: 0.18 + i * 0.055, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <PrefCard
                      prefKey={item.key}
                      label={item.label}
                      desc={item.desc}
                      Icon={item.icon}
                      checked={prefs[item.key]}
                      onToggle={togglePriority}
                      disabled={priorityFull && !prefs[item.key]}
                      variant="priority"
                    />
                  </motion.div>
                ))}
              </div>
            </Section>

            {/* Divider */}
            <div className="h-px bg-[var(--border)]" />

            {/* ── 2. Teaching style ── */}
            <Section
              emoji="📚"
              title="How do you like to learn?"
              badge={
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full text-[var(--sub)]"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  Optional
                </span>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {STYLE_ITEMS.map((item, i) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, delay: 0.28 + i * 0.055, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <PrefCard
                      prefKey={item.key}
                      label={item.label}
                      desc={item.desc}
                      Icon={item.icon}
                      checked={prefs[item.key]}
                      onToggle={toggle}
                      variant="style"
                    />
                  </motion.div>
                ))}
              </div>
            </Section>

            {/* Divider */}
            <div className="h-px bg-[var(--border)]" />

            {/* ── 3. Dealbreakers ── */}
            <Section
              emoji="🚫"
              title="Anything you'd rather avoid?"
              badge={
                avoidCount > 0
                  ? (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)', color: 'var(--red)' }}>
                      {avoidCount} selected
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full text-[var(--sub)]"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      Optional
                    </span>
                  )
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {AVOID_ITEMS.map((item, i) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, delay: 0.36 + i * 0.055, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <PrefCard
                      prefKey={item.key}
                      label={item.label}
                      desc={item.desc}
                      Icon={item.icon}
                      checked={prefs[item.key]}
                      onToggle={toggle}
                      variant="avoid"
                    />
                  </motion.div>
                ))}
              </div>
            </Section>

            {/* ── Submit ── */}
            <div className="pt-2">
              {!canSubmit && (
                <p className="text-center text-[12px] text-[var(--sub)] mb-3">
                  Pick at least one priority to continue
                </p>
              )}
              <motion.button
                type="button"
                onClick={() => onGenerateSchedule(prefs)}
                disabled={isLoading || !canSubmit}
                whileHover={canSubmit && !isLoading ? { y: -2, scale: 1.01 } : {}}
                whileTap={canSubmit && !isLoading ? { scale: 0.98 } : {}}
                className="relative w-full py-4 rounded-2xl font-heading font-bold text-[15px] tracking-tight text-white flex items-center justify-center gap-2.5 transition-opacity focus:outline-none overflow-hidden"
                style={{
                  background: canSubmit
                    ? 'linear-gradient(135deg, var(--blue) 0%, var(--blue2) 50%, var(--orange2) 100%)'
                    : 'rgba(255,255,255,0.07)',
                  boxShadow: canSubmit
                    ? '0 6px 32px rgba(91,124,250,0.28), 0 2px 12px rgba(255,107,53,0.16)'
                    : 'none',
                  opacity: !canSubmit ? 0.5 : 1,
                  cursor: !canSubmit ? 'not-allowed' : 'pointer',
                }}
              >
                {/* Shine */}
                {canSubmit && (
                  <span
                    aria-hidden
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 55%)' }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {isLoading
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Finding matches…</>
                    : <><Sparkles className="w-5 h-5" /> {buttonLabel || 'Find My Best Professors'}</>
                  }
                </span>
              </motion.button>
            </div>

          </motion.div>
        </div>
      </div>

      <ProcessingOverlay
        isVisible={isLoading}
        title="Finding Your Best Matches"
        steps={['Analyzing your preferences...', 'Scoring professors...', 'Ranking recommendations...']}
        icon="recommend"
      />
    </div>
  );
}

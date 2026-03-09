import React, { useState } from 'react';
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
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// Preferences interface
//  • Positive keys  (extraCredit … groupProjects) → bonus when matched
//  • Avoid keys     (avoidTestHeavy …)             → penalty when matched
//    Selecting "avoid" = "this would genuinely put me off a professor"
// ─────────────────────────────────────────────────────────────────────────────
export interface Preferences {
  // What you actively want (+)
  extraCredit: boolean;
  clearGrading: boolean;
  goodFeedback: boolean;
  caring: boolean;
  lectureHeavy: boolean;
  groupProjects: boolean;
  // What you want to avoid (−)
  avoidTestHeavy: boolean;
  avoidHomeworkHeavy: boolean;
  avoidStrictAttendance: boolean;
  avoidPopQuizzes: boolean;
}

interface PreferenceFormProps {
  onGenerateSchedule: (prefs: Preferences) => void;
  isLoading: boolean;
  onBack: () => void;
}

const MAX_PRIORITY_PICKS = 3;

const PRIORITY_ITEMS = [
  { key: 'extraCredit'  as const, label: 'Extra Credit',         desc: 'Wants to give you ways to improve your grade', icon: <TrendingUp  className="w-4 h-4" /> },
  { key: 'clearGrading' as const, label: 'Clear Grading',        desc: "You always know exactly how you're being marked", icon: <ClipboardCheck className="w-4 h-4" /> },
  { key: 'goodFeedback' as const, label: 'Helpful Feedback',     desc: 'Leaves detailed, useful comments on your work',  icon: <MessageCircle  className="w-4 h-4" /> },
  { key: 'caring'       as const, label: 'Approachable',         desc: 'Easy to reach, genuinely supports students',      icon: <Heart          className="w-4 h-4" /> },
];

const STYLE_ITEMS = [
  { key: 'lectureHeavy'  as const, label: 'Great lectures',  desc: 'Known for clear, engaging in-class delivery', icon: <Mic2  className="w-4 h-4" /> },
  { key: 'groupProjects' as const, label: 'Group projects',  desc: 'Assignments done with teammates',             icon: <Users className="w-4 h-4" /> },
];

const AVOID_ITEMS = [
  { key: 'avoidTestHeavy'         as const, label: 'Exam-heavy grading', desc: 'When nearly all your grade comes from tests',         icon: <FileQuestion   className="w-4 h-4" /> },
  { key: 'avoidHomeworkHeavy'     as const, label: 'Lots of homework',   desc: 'Frequent reading assignments every week',             icon: <NotebookPen    className="w-4 h-4" /> },
  { key: 'avoidStrictAttendance'  as const, label: 'Strict attendance',  desc: 'Missing one class can hurt your grade',               icon: <CalendarClock  className="w-4 h-4" /> },
  { key: 'avoidPopQuizzes'        as const, label: 'Pop quizzes',        desc: "Unannounced quizzes you can't prepare for",           icon: <Zap            className="w-4 h-4" /> },
];

// ─────────────────────────────────────────────────────────────────────────────
// Priority card — blue, limited to MAX_PRIORITY_PICKS
// ─────────────────────────────────────────────────────────────────────────────
function PriorityCard({
  prefKey, label, desc, icon, checked, onToggle, disabled,
}: {
  prefKey: keyof Preferences; label: string; desc: string; icon: React.ReactNode;
  checked: boolean; onToggle: (k: keyof Preferences) => void; disabled: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onToggle(prefKey)}
      whileHover={!disabled || checked ? { scale: 1.02 } : {}}
      whileTap={!disabled || checked ? { scale: 0.97 } : {}}
      className={`
        relative w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 focus:outline-none
        ${checked
          ? 'border-[#0046FF] bg-[#0046FF]/15 shadow-lg shadow-[#0046FF]/20 cursor-pointer'
          : disabled
            ? 'border-white/5 bg-white/[0.02] opacity-40 cursor-not-allowed'
            : 'border-white/10 bg-white/5 hover:border-[#0046FF]/40 hover:bg-[#0046FF]/5 cursor-pointer'
        }
      `}
    >
      <AnimatePresence>
        {checked && (
          <motion.div
            key="check"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-3 right-3 text-[#0046FF]"
          >
            <CheckCircle2 className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl flex-shrink-0 transition-colors duration-200 ${checked ? 'bg-[#0046FF]/30 text-[#0046FF]' : 'bg-white/5 text-white/40'}`}>
          {icon}
        </div>
        <div className="min-w-0 pr-6">
          <span className="font-bold text-white block text-sm leading-tight mb-0.5">{label}</span>
          <span className="text-xs text-white/45 leading-tight">{desc}</span>
        </div>
      </div>
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Style card — orange, no limit
// ─────────────────────────────────────────────────────────────────────────────
function StyleCard({
  prefKey, label, desc, icon, checked, onToggle,
}: {
  prefKey: keyof Preferences; label: string; desc: string; icon: React.ReactNode;
  checked: boolean; onToggle: (k: keyof Preferences) => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onToggle(prefKey)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={`
        relative w-full text-left p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 focus:outline-none
        ${checked
          ? 'border-[#FF8040] bg-[#FF8040]/15 shadow-lg shadow-[#FF8040]/20'
          : 'border-white/10 bg-white/5 hover:border-[#FF8040]/40 hover:bg-[#FF8040]/5'
        }
      `}
    >
      <AnimatePresence>
        {checked && (
          <motion.div
            key="check"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-3 right-3 text-[#FF8040]"
          >
            <CheckCircle2 className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl flex-shrink-0 transition-colors duration-200 ${checked ? 'bg-[#FF8040]/30 text-[#FF8040]' : 'bg-white/5 text-white/40'}`}>
          {icon}
        </div>
        <div className="min-w-0 pr-6">
          <span className="font-bold text-white block text-sm leading-tight mb-0.5">{label}</span>
          <span className="text-xs text-white/45 leading-tight">{desc}</span>
        </div>
      </div>
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Avoid card — red, selecting = "this is a dealbreaker"
// ─────────────────────────────────────────────────────────────────────────────
function AvoidCard({
  prefKey, label, desc, icon, checked, onToggle,
}: {
  prefKey: keyof Preferences; label: string; desc: string; icon: React.ReactNode;
  checked: boolean; onToggle: (k: keyof Preferences) => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onToggle(prefKey)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={`
        relative w-full text-left p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 focus:outline-none
        ${checked
          ? 'border-red-500/70 bg-red-500/10 shadow-lg shadow-red-500/15'
          : 'border-white/10 bg-white/5 hover:border-red-500/30 hover:bg-red-500/5'
        }
      `}
    >
      <AnimatePresence>
        {checked && (
          <motion.div
            key="alert"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-3 right-3 text-red-400"
          >
            <AlertCircle className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl flex-shrink-0 transition-colors duration-200 ${checked ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white/40'}`}>
          {icon}
        </div>
        <div className="min-w-0 pr-6">
          <span className="font-bold text-white block text-sm leading-tight mb-0.5">{label}</span>
          <span className="text-xs text-white/45 leading-tight">{desc}</span>
        </div>
      </div>
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function PreferenceForm({ onGenerateSchedule, isLoading, onBack }: PreferenceFormProps) {
  const [prefs, setPrefs] = useState<Preferences>({
    extraCredit: false,
    clearGrading: false,
    goodFeedback: false,
    caring: false,
    lectureHeavy: false,
    groupProjects: false,
    avoidTestHeavy: false,
    avoidHomeworkHeavy: false,
    avoidStrictAttendance: false,
    avoidPopQuizzes: false,
  });

  const prioritySelectedCount = PRIORITY_ITEMS.filter(i => prefs[i.key]).length;
  const priorityFull = prioritySelectedCount >= MAX_PRIORITY_PICKS;

  const togglePriority = (key: keyof Preferences) => {
    const isSelected = prefs[key];
    // Block picking more when at limit
    if (!isSelected && priorityFull) return;
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggle = (key: keyof Preferences) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const avoidSelectedCount = AVOID_ITEMS.filter(i => prefs[i.key]).length;

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="mb-4 text-white/60 hover:text-white flex items-center gap-2 transition-colors font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
      >
        {/* HEADER */}
        <div className="bg-[#0046FF]/10 p-8 text-center border-b border-white/10">
          <Sparkles className="w-10 h-10 mx-auto mb-3 text-[#FF8040]" />
          <h2 className="text-3xl font-bold tracking-tight text-white">Tell us about your priorities</h2>
          <p className="text-white/50 mt-2 text-sm font-medium">
            This takes 30 seconds. We'll use it to rank professors just for you.
          </p>
        </div>

        <div className="p-8 space-y-10">

          {/* ── SECTION 1: TOP PRIORITIES (max 3) ── */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-white font-bold text-base">
                What matters most to you in a professor?
              </h3>
              {/* Live counter */}
              <motion.span
                key={prioritySelectedCount}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-colors duration-200 ${
                  priorityFull
                    ? 'bg-[#0046FF]/20 border-[#0046FF]/50 text-[#0046FF]'
                    : 'bg-white/5 border-white/10 text-white/50'
                }`}
              >
                {prioritySelectedCount}/{MAX_PRIORITY_PICKS} chosen
              </motion.span>
            </div>
            <p className="text-xs text-white/40 mb-4">
              Pick up to {MAX_PRIORITY_PICKS} — choosing fewer gives us a stronger signal.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {PRIORITY_ITEMS.map(item => (
                <PriorityCard
                  key={item.key}
                  prefKey={item.key}
                  label={item.label}
                  desc={item.desc}
                  icon={item.icon}
                  checked={prefs[item.key]}
                  onToggle={togglePriority}
                  disabled={priorityFull && !prefs[item.key]}
                />
              ))}
            </div>
          </div>

          {/* ── SECTION 2: TEACHING STYLE ── */}
          <div>
            <h3 className="text-white font-bold text-base mb-1">
              Any preference on teaching style?
            </h3>
            <p className="text-xs text-white/40 mb-4">Optional — skip if you don't have a strong preference.</p>
            <div className="grid md:grid-cols-2 gap-3">
              {STYLE_ITEMS.map(item => (
                <StyleCard
                  key={item.key}
                  prefKey={item.key}
                  label={item.label}
                  desc={item.desc}
                  icon={item.icon}
                  checked={prefs[item.key]}
                  onToggle={toggle}
                />
              ))}
            </div>
          </div>

          {/* ── SECTION 3: DEALBREAKERS ── */}
          <div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-white font-bold text-base">
                  What would genuinely put you off?
                </h3>
                {avoidSelectedCount > 0 && (
                  <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
                    {avoidSelectedCount} flagged
                  </span>
                )}
              </div>
              <p className="text-xs text-white/40 mb-4">
                Select only what would genuinely bother you — we'll push those professors down.
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {AVOID_ITEMS.map(item => (
                  <AvoidCard
                    key={item.key}
                    prefKey={item.key}
                    label={item.label}
                    desc={item.desc}
                    icon={item.icon}
                    checked={prefs[item.key]}
                    onToggle={toggle}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── SUBMIT ── */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onGenerateSchedule(prefs)}
            disabled={isLoading}
            className="w-full bg-[#0046FF] hover:bg-[#0036CC] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#0046FF]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
          >
            {isLoading
              ? (<>Finding your matches <Loader2 className="animate-spin w-5 h-5" /></>)
              : (<><Sparkles className="w-5 h-5" /> Find My Best Professors</>)
            }
          </motion.button>

        </div>
      </motion.div>
    </div>
  );
}

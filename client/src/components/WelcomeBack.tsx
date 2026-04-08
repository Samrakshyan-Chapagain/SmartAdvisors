import { GraduationCap, ArrowRight, FileUp, Pencil, Calendar, BookOpen, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDegreeName, getCollegeName } from '../config/colleges';

interface WelcomeBackProps {
  userName: string;
  userPicture?: string;
  plan: {
    plan: { semester: number; label: string; courses: any[]; totalHours: number }[];
    totalSemesters: number;
    totalRemainingHours: number;
    stats?: {
      totalCourses: number;
      totalHours: number;
      completedCourses: number;
      completedHours: number;
    };
  };
  department: string;
  onViewPlan: () => void;
  onEditPlan: () => void;
  onNewTranscript: () => void;
}

// College/degree labels from shared config (client/src/config/colleges.ts)

export default function WelcomeBack({
  userName,
  userPicture,
  plan,
  department,
  onViewPlan,
  onEditPlan,
  onNewTranscript,
}: WelcomeBackProps) {
  const semesters = plan.plan || [];
  const totalCoursesPlanned = semesters.reduce((sum, s) => sum + s.courses.length, 0);
  const firstName = userName.split(' ')[0];
  const progressPercent = plan.stats
    ? Math.round((plan.stats.completedHours / plan.stats.totalHours) * 100)
    : 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Greeting card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
      >
        {/* Header with gradient */}
        <div className="relative px-8 pt-10 pb-8 bg-gradient-to-br from-[#0046FF]/20 via-transparent to-[#FF8040]/10">
          <div className="flex items-center gap-4 mb-6">
            {userPicture ? (
              <img
                src={userPicture}
                alt={userName}
                className="w-16 h-16 rounded-2xl border-2 border-white/20 shadow-lg"
                referrerPolicy="no-referrer"
                onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src = ''; (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#0046FF]/30 border border-white/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{firstName[0]}</span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">
                Welcome back, {firstName}!
              </h1>
              <p className="text-white/50 text-sm mt-0.5">
                {getDegreeName(department)} · {getCollegeName(department)}
              </p>
            </div>
          </div>

          <p className="text-white/60 text-lg leading-relaxed">
            Your degree plan is ready. Pick up right where you left off.
          </p>
        </div>

        {/* Plan summary stats */}
        <div className="px-8 py-6 border-t border-white/5">
          <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">Your Saved Plan</h3>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#0046FF]/10 border border-[#0046FF]/20 rounded-xl p-4 text-center"
            >
              <Calendar className="w-5 h-5 text-[#0046FF] mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{semesters.length}</p>
              <p className="text-white/40 text-xs">Semesters</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-[#FF8040]/10 border border-[#FF8040]/20 rounded-xl p-4 text-center"
            >
              <BookOpen className="w-5 h-5 text-[#FF8040] mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{totalCoursesPlanned}</p>
              <p className="text-white/40 text-xs">Courses</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
            >
              <Clock className="w-5 h-5 text-white/60 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{plan.totalRemainingHours}</p>
              <p className="text-white/40 text-xs">Credit Hrs Left</p>
            </motion.div>
          </div>

          {/* Progress bar */}
          {plan.stats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/50 text-xs font-semibold">Degree Progress</span>
                <span className="text-[#FF8040] text-xs font-bold">{progressPercent}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-[#0046FF] to-[#FF8040]"
                />
              </div>
              <p className="text-white/30 text-xs mt-1.5">
                {plan.stats.completedHours} of {plan.stats.totalHours} credit hours completed
              </p>
            </motion.div>
          )}

          {/* Next semester preview */}
          {semesters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/[0.03] border border-white/5 rounded-xl p-4 mb-6"
            >
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">
                Up Next — {semesters[0].label}
              </p>
              <div className="flex flex-wrap gap-2">
                {semesters[0].courses.slice(0, 5).map((c: any) => (
                  <span
                    key={c.code}
                    className="px-2.5 py-1 rounded-lg bg-[#0046FF]/10 border border-[#0046FF]/20 text-white text-xs font-semibold"
                  >
                    {c.code}
                  </span>
                ))}
                {semesters[0].courses.length > 5 && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/40 text-xs font-semibold">
                    +{semesters[0].courses.length - 5} more
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Action buttons */}
        <div className="px-8 pb-8 space-y-3">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            onClick={onViewPlan}
            className="w-full bg-[#0046FF] hover:bg-[#0036CC] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#0046FF]/30 transition-all flex items-center justify-center gap-3 text-lg group"
          >
            <GraduationCap className="w-5 h-5" />
            View My Degree Plan
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <div className="grid grid-cols-2 gap-3">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={onEditPlan}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-bold py-3 rounded-xl transition-all text-sm"
            >
              <Pencil className="w-4 h-4" /> Edit Plan Settings
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              onClick={onNewTranscript}
              className="flex items-center justify-center gap-2 border border-white/10 hover:border-red-500/40 text-white/40 hover:text-red-400 font-bold py-3 rounded-xl transition-all text-sm"
            >
              <FileUp className="w-4 h-4" /> New Unofficial Transcript
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

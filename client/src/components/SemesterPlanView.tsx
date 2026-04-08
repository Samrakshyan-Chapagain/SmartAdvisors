import { useState } from 'react';
import { ArrowLeft, Calendar, BookOpen, Sparkles, GraduationCap, Clock, Download, Star, ChevronDown, ChevronUp, FileUp, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';

interface Professor {
  name: string;
  rating: number;
  difficulty: string;
  matchScore: number;
  wouldTakeAgain?: string | null;
  tags: string[];
  reviewCount: number;
}

interface PlannedCourse {
  code: string;
  name: string;
  creditHours: number;
  requirement: string;
  professors?: Professor[];
}

interface Semester {
  semester: number;
  label: string;
  courses: PlannedCourse[];
  totalHours: number;
}

interface SemesterPlanViewProps {
  plan: {
    plan: Semester[];
    totalSemesters: number;
    totalRemainingHours: number;
    stats?: {
      totalCourses: number;
      totalHours: number;
      completedCourses: number;
      completedHours: number;
    };
  };
  onBack: () => void;
  onEditPlan: () => void;
  onNewTranscript: () => void;
}

function getDifficultyColor(difficulty: string) {
  const d = difficulty.toLowerCase();
  if (d.includes('easy')) return 'text-emerald-300 bg-emerald-900/40 border-emerald-800';
  if (d.includes('hard')) return 'text-rose-300 bg-rose-900/40 border-rose-800';
  return 'text-amber-300 bg-amber-900/40 border-amber-800';
}

function CourseRow({ course }: { course: PlannedCourse }) {
  const [expanded, setExpanded] = useState(false);
  const hasProfessors = course.professors && course.professors.length > 0;
  const accentColor = course.requirement === 'elective' ? '#FF8040' : '#0046FF';

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors overflow-hidden">
      {/* Course header row — click anywhere to expand professors */}
      <div
        className={`flex items-center justify-between px-3 py-2.5 ${hasProfessors ? 'cursor-pointer' : ''}`}
        onClick={() => hasProfessors && setExpanded(prev => !prev)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
          <div className="min-w-0">
            <span className="text-white font-semibold text-sm">{course.code}</span>
            <p className="text-white/40 text-xs truncate">{course.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className="text-white/30 text-xs font-semibold">{course.creditHours} hrs</span>
          {hasProfessors && (
            <span className="flex items-center gap-0.5 text-white/30">
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </span>
          )}
        </div>
      </div>

      {/* Expandable professor section */}
      {expanded && hasProfessors && (
        <div className="px-3 pb-3 border-t border-white/5 pt-2 space-y-2">
          <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Top Professors</p>
          {course.professors!.map((prof, i) => (
            <div
              key={prof.name}
              className={`rounded-lg px-3 py-2 border ${
                i === 0
                  ? 'bg-[#FF8040]/10 border-[#FF8040]/20'
                  : 'bg-white/[0.03] border-white/5'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-white font-semibold text-xs truncate max-w-[55%]">
                  {i === 0 && <span className="text-[#FF8040] mr-1">★</span>}
                  {prof.name}
                </span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {prof.rating > 0 && (
                    <span className="flex items-center gap-0.5 text-[#FF8040] font-bold text-xs">
                      <Star className="w-2.5 h-2.5 fill-[#FF8040]" />
                      {prof.rating}
                    </span>
                  )}
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getDifficultyColor(prof.difficulty)}`}>
                    {prof.difficulty}
                  </span>
                  {prof.wouldTakeAgain && (
                    <span className="text-emerald-400 font-semibold text-[10px]">{prof.wouldTakeAgain} retake</span>
                  )}
                </div>
              </div>
              {prof.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {prof.tags.slice(0, 2).map((tag, ti) => (
                    <span key={ti} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/40 text-[10px]">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SemesterPlanView({ plan, onBack, onEditPlan, onNewTranscript }: SemesterPlanViewProps) {
  const semesters = plan.plan || [];
  const totalCoursesPlanned = semesters.reduce((sum, s) => sum + s.courses.length, 0);

  const handlePrint = () => window.print();

  return (
    <div className="max-w-6xl mx-auto">

      {/* Print styles */}
      <style>{`
        @media print {
          @page { size: landscape; margin: 10mm; }
          body { background: white !important; color: black !important; }
          button, .no-print { display: none !important; }
          .max-w-6xl { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .semester-grid { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
          .semester-card { background: white !important; border: 2px solid #333 !important; border-radius: 8px !important; break-inside: avoid !important; }
          .semester-card * { color: black !important; background: transparent !important; }
          svg { width: 12px !important; height: 12px !important; stroke: black !important; }
        }
      `}</style>

      {/* Top controls */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3 no-print">
        {/* Left group */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="w-px h-5 bg-white/10" />
          <button
            onClick={onEditPlan}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white px-4 py-2 rounded-xl transition-all font-bold text-sm"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit Plan
          </button>
          <button
            onClick={onNewTranscript}
            className="flex items-center gap-2 border border-white/10 hover:border-red-500/40 text-white/40 hover:text-red-400 px-4 py-2 rounded-xl transition-all font-bold text-sm"
          >
            <FileUp className="w-3.5 h-3.5" /> New Unofficial Transcript
          </button>
        </div>
        {/* Right: Save as PDF */}
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-[#0046FF] hover:bg-[#0036CC] text-white px-4 py-2 rounded-xl shadow-lg transition-all font-bold text-sm"
        >
          <Download className="w-4 h-4" /> Save as PDF
        </button>
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
          Your Degree Plan <GraduationCap className="w-8 h-8 text-[#FF8040]" />
        </h2>
        <p className="text-white/60 text-lg">
          <span className="text-[#FF8040] font-bold">{totalCoursesPlanned} courses</span> across{' '}
          <span className="text-white font-bold">{semesters.length} semesters</span> •{' '}
          <span className="text-white/80">{plan.totalRemainingHours} credit hours remaining</span>
        </p>
      </motion.div>

      {/* Stats bar */}
      {plan.stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-wrap items-center gap-3 mb-8 text-sm"
        >
          <span className="flex items-center gap-1.5 bg-[#0046FF]/10 border border-[#0046FF]/20 text-blue-300 font-semibold px-3 py-1.5 rounded-full">
            <BookOpen className="w-3.5 h-3.5" /> {plan.stats.completedCourses}/{plan.stats.totalCourses} completed
          </span>
          <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/60 font-semibold px-3 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5" /> {plan.stats.completedHours}/{plan.stats.totalHours} credit hours
          </span>
          <span className="flex items-center gap-1.5 bg-[#FF8040]/10 border border-[#FF8040]/20 text-orange-300 font-semibold px-3 py-1.5 rounded-full">
            <Calendar className="w-3.5 h-3.5" /> ~{semesters.length} semesters to go
          </span>
        </motion.div>
      )}

      {/* Semester cards grid */}
      <div className="grid md:grid-cols-2 gap-6 semester-grid">
        {semesters.map((semester, idx) => (
          <motion.div
            key={semester.semester}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="semester-card bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden"
          >
            {/* Semester header */}
            <div className={`px-5 py-4 border-b border-white/10 flex items-center justify-between ${
              idx === 0 ? 'bg-[#FF8040]/10' : 'bg-[#0046FF]/10'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${idx === 0 ? 'bg-[#FF8040]' : 'bg-[#0046FF]'}`}>
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{semester.label}</h3>
                  <p className="text-white/40 text-xs">{semester.courses.length} courses · click ˅ to see professors</p>
                </div>
              </div>
              <span className={`text-sm font-bold px-3 py-1 rounded-full border ${
                idx === 0
                  ? 'text-[#FF8040] bg-[#FF8040]/20 border-[#FF8040]/30'
                  : 'text-[#0046FF] bg-[#0046FF]/20 border-[#0046FF]/30'
              }`}>
                {semester.totalHours} hrs
              </span>
            </div>

            {/* Course list */}
            <div className="p-4 space-y-2">
              {semester.courses.map((course) => (
                <CourseRow key={course.code} course={course} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 text-center no-print"
      >
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-5 py-3">
          <Sparkles className="w-4 h-4 text-[#FF8040]" />
          <p className="text-white/40 text-sm">
            This plan respects prerequisite chains and distributes courses by priority.
            Always verify with your academic advisor.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
